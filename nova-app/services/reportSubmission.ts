// services/reportSubmission.ts
// Handles PDF generation and Google Classroom submission

import { jsPDF } from 'jspdf';

interface ReportData {
    title: string;
    studentName: string;
    grade: number;
    content: string;
    sources: Array<{ title: string; url: string; author?: string }>;
    language: 'es' | 'en';
    date: Date;
}

/**
 * Generate a professional PDF from the student's report
 */
export async function generateReportPDF(data: ReportData): Promise<Blob> {
    const doc = new jsPDF();

    // Set up fonts and colors
    const primaryColor = [79, 70, 229]; // Indigo
    const textColor = [30, 41, 59]; // Slate-800

    let yPosition = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);

    // Header - School Logo Area
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, pageWidth, 30, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Nova Schola', pageWidth / 2, 15, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(data.language === 'es' ? 'Centro de Investigación' : 'Research Center', pageWidth / 2, 22, { align: 'center' });

    yPosition = 45;

    // Report Title
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    const titleLines = doc.splitTextToSize(data.title || (data.language === 'es' ? 'Reporte de Investigación' : 'Research Report'), contentWidth);
    doc.text(titleLines, margin, yPosition);
    yPosition += titleLines.length * 8 + 5;

    // Student Info
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139); // Slate-500

    const studentInfo = [
        `${data.language === 'es' ? 'Estudiante' : 'Student'}: ${data.studentName}`,
        `${data.language === 'es' ? 'Grado' : 'Grade'}: ${data.grade}°`,
        `${data.language === 'es' ? 'Fecha' : 'Date'}: ${data.date.toLocaleDateString(data.language === 'es' ? 'es-ES' : 'en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })}`
    ];

    studentInfo.forEach(info => {
        doc.text(info, margin, yPosition);
        yPosition += 6;
    });

    yPosition += 10;

    // Divider
    doc.setDrawColor(226, 232, 240); // Slate-200
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 15;

    // Report Content
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');

    const contentLines = doc.splitTextToSize(data.content, contentWidth);

    contentLines.forEach((line: string) => {
        // Check if we need a new page
        if (yPosition > doc.internal.pageSize.getHeight() - 30) {
            doc.addPage();
            yPosition = 20;
        }

        doc.text(line, margin, yPosition);
        yPosition += 6;
    });

    // Sources Section
    if (data.sources && data.sources.length > 0) {
        yPosition += 15;

        // Check if we need a new page for sources
        if (yPosition > doc.internal.pageSize.getHeight() - 60) {
            doc.addPage();
            yPosition = 20;
        }

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(data.language === 'es' ? 'Fuentes Consultadas' : 'Sources Consulted', margin, yPosition);
        yPosition += 10;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        data.sources.forEach((source, index) => {
            if (yPosition > doc.internal.pageSize.getHeight() - 20) {
                doc.addPage();
                yPosition = 20;
            }

            const sourceText = `${index + 1}. ${source.title}${source.author ? ` - ${source.author}` : ''}`;
            const sourceLines = doc.splitTextToSize(sourceText, contentWidth - 10);

            doc.text(sourceLines, margin + 5, yPosition);
            yPosition += sourceLines.length * 5;

            if (source.url) {
                doc.setTextColor(79, 70, 229); // Indigo for links
                doc.textWithLink(source.url, margin + 5, yPosition, { url: source.url });
                doc.setTextColor(textColor[0], textColor[1], textColor[2]);
                yPosition += 5;
            }

            yPosition += 3;
        });
    }

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184); // Slate-400
        doc.text(
            `${data.language === 'es' ? 'Página' : 'Page'} ${i} ${data.language === 'es' ? 'de' : 'of'} ${pageCount}`,
            pageWidth / 2,
            doc.internal.pageSize.getHeight() - 10,
            { align: 'center' }
        );
    }

    return doc.output('blob');
}

/**
 * Submit the report to Google Classroom
 */
export async function submitReportToClassroom(
    accessToken: string,
    courseId: string,
    courseWorkId: string,
    pdfBlob: Blob,
    reportTitle: string
): Promise<boolean> {
    try {
        // Step 1: Upload the PDF to Google Drive
        const formData = new FormData();
        formData.append('metadata', new Blob([JSON.stringify({
            name: `${reportTitle}.pdf`,
            mimeType: 'application/pdf'
        })], { type: 'application/json' }));
        formData.append('file', pdfBlob);

        const uploadResponse = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
            body: formData
        });

        if (!uploadResponse.ok) {
            throw new Error('Failed to upload PDF to Google Drive');
        }

        const uploadData = await uploadResponse.json();
        const fileId = uploadData.id;

        // Step 2: Submit the assignment with the file attachment
        const submissionResponse = await fetch(
            `https://classroom.googleapis.com/v1/courses/${courseId}/courseWork/${courseWorkId}/studentSubmissions/-:turnIn`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    addAttachments: [{
                        driveFile: {
                            id: fileId,
                            title: `${reportTitle}.pdf`
                        }
                    }]
                })
            }
        );

        if (!submissionResponse.ok) {
            throw new Error('Failed to submit to Google Classroom');
        }

        return true;
    } catch (error) {
        console.error('Error submitting report to Classroom:', error);
        return false;
    }
}

/**
 * Get available assignments for submission
 */
export async function getAvailableAssignments(
    accessToken: string,
    userId: string
): Promise<Array<{ courseId: string; courseWorkId: string; title: string; courseName: string }>> {
    try {
        // This would typically fetch from your Supabase database
        // where you've stored the synced Google Classroom assignments
        const { createClient } = await import('@supabase/supabase-js');
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) return [];

        const supabase = createClient(supabaseUrl, supabaseKey);

        const { data, error } = await supabase
            .from('google_classroom_assignments')
            .select(`
        id,
        google_assignment_id,
        title,
        course_id,
        google_classroom_courses (
          name,
          google_course_id
        )
      `)
            .eq('user_id', userId)
            .eq('state', 'ASSIGNED') // Only get assignments that haven't been turned in
            .order('due_date', { ascending: true });

        if (error || !data) return [];

        return data.map((assignment: any) => ({
            courseId: (assignment.google_classroom_courses as any)?.google_course_id || '',
            courseWorkId: assignment.google_assignment_id,
            title: assignment.title,
            courseName: (assignment.google_classroom_courses as any)?.name || 'Unknown Course'
        }));
    } catch (error) {
        console.error('Error fetching assignments:', error);
        return [];
    }
}
