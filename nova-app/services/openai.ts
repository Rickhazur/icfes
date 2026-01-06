// services/openai.ts
// Client-side service to interact with the /api/chat proxy

// Helper for non-streaming calls
async function callChatApi(messages: any[], model: string = "gpt-4o-mini", jsonMode: boolean = false) {
    try {
        const body: any = {
            messages,
            model,
        };

        if (jsonMode) {
            body.response_format = { type: "json_object" };
        }

        const res = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        if (!res.ok) throw new Error(`API Error: ${res.status}`);
        return await res.json();
    } catch (error) {
        console.error("OpenAI Call Failed:", error);
        throw error;
    }
}

// 1. OpenAITutorSession (for Live Classroom)
export class OpenAITutorSession {
    apiKey: string;
    systemPrompt: string;
    messages: any[] = [];
    onMessage: (event: { type: 'text' | 'function_call', text?: string, function?: any }) => void = () => { };

    constructor(apiKey: string, systemPrompt: string) {
        this.apiKey = apiKey;
        this.systemPrompt = systemPrompt;
        this.messages.push({ role: 'system', content: systemPrompt });
    }

    async connect() {
        console.log("OpenAI Session Connected");
        return true;
    }

    async sendMessage(text: string) {
        this.messages.push({ role: 'user', content: text });

        try {
            const body = {
                messages: this.messages,
                model: "gpt-4o-mini",
                tools: [{
                    type: "function",
                    function: {
                        name: "updateWhiteboard",
                        description: "Update the whiteboard with a visual explanation.",
                        parameters: {
                            type: "object",
                            properties: {
                                topic: { type: "string" },
                                svg_code: { type: "string", description: "SVG representation" }
                            },
                            required: ["topic", "svg_code"]
                        }
                    }
                }]
            };

            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });

            const data = await res.json();
            const choice = data.choices?.[0];

            if (choice) {
                const msg = choice.message;
                this.messages.push(msg);

                if (msg.content) {
                    this.onMessage({ type: 'text', text: msg.content });
                }

                if (msg.tool_calls) {
                    for (const toolCall of msg.tool_calls) {
                        if (toolCall.function.name === 'updateWhiteboard') {
                            const args = JSON.parse(toolCall.function.arguments);
                            this.onMessage({
                                type: 'function_call',
                                function: { name: 'updateWhiteboard', args }
                            });
                        }
                    }
                }
            }

        } catch (e) {
            console.error("Tutor Session Error:", e);
        }
    }
}

// 2. Stream Consultation (for AI Consultant)
export async function* streamConsultation(
    history: any[],
    prompt: string,
    image?: string,
    useSearch: boolean = false
) {
    const messages = [...history];
    let content: any = prompt;

    if (image) {
        content = [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: image } }
        ];
    }
    messages.push({ role: 'user', content });

    if (useSearch) {
        messages.push({ role: 'system', content: "[CONTEXT] User requested web search. (Functionality assumed handled by model knowledge for now)." });
    }

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages,
                model: 'gpt-4o-mini',
                stream: true
            })
        });

        if (!response.body) throw new Error('No response body');
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
                if (line.trim().startsWith('data: ')) {
                    const dataStr = line.trim().slice(6);
                    if (dataStr === '[DONE]') return;
                    try {
                        const data = JSON.parse(dataStr);
                        const content = data.choices?.[0]?.delta?.content;
                        if (content) yield { text: content };
                    } catch (e) { }
                }
            }
        }
    } catch (e) {
        console.error("Stream Error:", e);
        yield { text: "\n[Error de conexión]" };
    }
}

// 3. Diagnostic Test Eval
export async function evaluateMathDiagnostic(studentName: string, questions: any[], workImage?: string) {
    const sysPrompt = "Act as a Math Teacher. Evaluate the diagnostic test and handwritten work. Return JSON.";

    const content: any[] = [{ type: "text", text: `Student: ${studentName}. Questions & Answers: ${JSON.stringify(questions)}` }];
    if (workImage) {
        content.push({ type: "image_url", image_url: { url: workImage } });
    }

    const data = await callChatApi(
        [{ role: "system", content: sysPrompt }, { role: "user", content: content }],
        "gpt-4o-mini",
        true
    );

    // Expected structure: { score, feedback, gaps, remedialClasses: [{ title, topic }] }
    return JSON.parse(data.choices[0].message.content);
}

// 5. Remedial Plan
export async function generateRemedialPlan(reportText: string) {
    const sysPrompt = "Act as an Educational Strategist. Create a remedial plan based on the teacher's report. Return JSON matching the Subject interface structure (id, name, tracks[0].modules[0].classes...).";
    const data = await callChatApi(
        [{ role: "system", content: sysPrompt }, { role: "user", content: reportText }],
        "gpt-4o-mini",
        true
    );
    return JSON.parse(data.choices[0].message.content);
}

// 6. Flashcards
export async function generateFlashcards(topic: string) {
    const sysPrompt = "Create 5 educational flashcards. Return JSON: { cards: [{ front, back }] }";
    const data = await callChatApi(
        [{ role: "system", content: sysPrompt }, { role: "user", content: `Topic: ${topic}` }],
        "gpt-4o-mini",
        true
    );
    const json = JSON.parse(data.choices[0].message.content);
    return json.cards || [];
}

// 7. Parent Email Report
export async function generateParentEmailReport(studentName: string, data: any) {
    const sysPrompt = "Write a polite email to parents summarizing the student's progress.";
    const userPrompt = `Student: ${studentName}. Data: ${JSON.stringify(data)}`;

    const completion = await callChatApi(
        [{ role: "system", content: sysPrompt }, { role: "user", content: userPrompt }],
        "gpt-4o"
    );
    return completion.choices[0].message.content;
}

// 8. Math Problem Extractor (Semantic Parsing)
export async function extractProblemData(text: string, language: 'es' | 'en', interests?: string[], animals?: string[]) {
    const sysPrompt = `You are a math parser for elementary students. Extract structured data AND generate a personalized metaphor.
    
    If interests or favorite animals are provided, use them to create a brief "metaphor" or "story twist" that makes the math problem more engaging for the student.
    
    Schema:
    {
      "type": "addition" | "subtraction" | "multiplication" | "division" | "fractions" | "geometry" | "word_problem", 
      "subject": "Main person/entity name",
      "object": "Item being counted/measured",
      "numbers": [numbers found],
      "question": "The actual question",
      "personalized_metaphor": "A 1-sentence funny or engaging connection to their interests (e.g., 'This is like choosing which dinosaur to feed' if interest is dinosaurs)."
    }`;

    const context = `Language: ${language}. Interests: ${interests?.join(', ') || 'none'}. Animals: ${animals?.join(', ') || 'none'}.`;

    try {
        const data = await callChatApi(
            [
                { role: "system", content: sysPrompt + " " + context },
                { role: "user", content: text }
            ],
            "gpt-4o-mini",
            true
        );
        return JSON.parse(data.choices[0].message.content);
    } catch (e) {
        console.error("Extraction failed", e);
        return null;
    }
}

// 9. Math Topic Verifier (Safety Shield)
export async function verifyMathTopic(text: string, language: 'es' | 'en', interests?: string[]) {
    const sysPrompt = `You are Nova, a kind Math Tutor.
    Analyze if the user input is related to MATH, LEARNING, or ACADEMIC CURIOSITY.
    - If YES: Return JSON { "is_math": true }.
    - If NO: Return JSON { "is_math": false, "message": "Polite deflection in student language" }.
    
    Nova's Tone: Encouraging, uses metaphors related to student interests (${interests?.join(', ') || 'general wonder'}) when deflecting.
    
    Return strict JSON.`;

    try {
        const data = await callChatApi(
            [
                { role: "system", content: sysPrompt },
                { role: "user", content: `Context Language: ${language}. Input: "${text}"` }
            ],
            "gpt-4o-mini",
            true
        );
        return JSON.parse(data.choices[0].message.content);
    } catch (e) {
        console.error("Verification failed", e);
        return { is_math: true };
    }
}

// 10. Curriculum Topic Extractor (OCR + Semantic Analysis)
export async function extractCurriculumTopics(fileUrl: string, language: 'es' | 'en') {
    const sysPrompt = `You are an expert educational curriculum analyzer. Extract the weekly/monthly topics from the school curriculum document.
    
    Return strict JSON array:
    [
      {
        "week_number": 1,
        "topic_name": "Original topic name from document",
        "mapped_internal_topic": "division" | "multiplication" | "addition" | "subtraction" | "fractions" | "geometry" | "word_problem",
        "description": "Brief description of what will be taught",
        "estimated_start_date": "YYYY-MM-DD" (if visible, otherwise null)
      }
    ]
    
    Map topics intelligently:
    - "Repartición", "División" → "division"
    - "Suma", "Adición" → "addition"
    - "Geometría", "Figuras" → "geometry"
    - "Fracciones", "Partes" → "fractions"
    - Any word problem → "word_problem"
    `;

    try {
        const data = await callChatApi(
            [
                { role: "system", content: sysPrompt },
                {
                    role: "user",
                    content: [
                        { type: "text", text: `Language: ${language}. Extract all topics from this curriculum:` },
                        { type: "image_url", image_url: { url: fileUrl } }
                    ]
                }
            ],
            "gpt-4o",
            true
        );

        const topics = JSON.parse(data.choices[0].message.content);
        return Array.isArray(topics) ? topics : [];
    } catch (e) {
        console.error("Curriculum extraction failed", e);
        return [];
    }
}

// Legacy export if needed, but discouraged
// Legacy export if needed, but discouraged
export async function callApi(endpoint: string, body: any) {
    // Maps legacy calls to new structure if possible, or just passes through
    // For now, simpler to just error or try to handle if we missed something.
    console.warn("Legacy callApi used for:", endpoint);
    return {};
}

// 11. Image Generation (Magic Stickers) - HYBRID MODE
export async function generateImage(prompt: string, style: 'vivid' | 'natural' = 'vivid') {
    // OPTION A: Pollinations.ai (FREE, Unlimited) via URL
    // Great for stickers, no API key needed.
    // We append random seed to ensure new images each time.

    try {
        const seed = Math.floor(Math.random() * 10000);
        // Prompt engineering for "Sticker" look
        const encodedPrompt = encodeURIComponent(`sticker, vector art, ${prompt}, white background, flat style, cute`);
        const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=512&height=512&seed=${seed}&nologo=true`;

        // Improve reliability: Check if image is reachable (fetch head)
        const check = await fetch(url, { method: 'HEAD' });
        if (check.ok) {
            return url;
        } else {
            throw new Error("Free generator busy");
        }
    } catch (e) {
        console.warn("Free layer failed, falling back to OpenAI (if configured)... or just erroring for now to save $", e);
        // Fallback to DALL-E if you really want, but user asked for FREE.
        return null;
    }
}