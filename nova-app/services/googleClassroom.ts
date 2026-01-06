// services/googleClassroom.ts
// Google Classroom API integration

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.VITE_GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = import.meta.env.VITE_GOOGLE_REDIRECT_URI;

const SCOPES = [
    'https://www.googleapis.com/auth/classroom.courses.readonly',
    'https://www.googleapis.com/auth/classroom.coursework.students.readonly',
    'https://www.googleapis.com/auth/classroom.rosters.readonly'
].join(' ');

// 1. Generate OAuth URL
export function getGoogleAuthUrl(): string {
    const params = new URLSearchParams({
        client_id: CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        response_type: 'code',
        scope: SCOPES,
        access_type: 'offline',
        prompt: 'consent'
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

// 2. Exchange authorization code for tokens
export async function exchangeCodeForTokens(code: string) {
    const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            code,
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            redirect_uri: REDIRECT_URI,
            grant_type: 'authorization_code'
        })
    });

    if (!response.ok) {
        throw new Error('Failed to exchange code for tokens');
    }

    return await response.json();
}

// 3. Refresh access token
export async function refreshAccessToken(refreshToken: string) {
    const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            refresh_token: refreshToken,
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            grant_type: 'refresh_token'
        })
    });

    if (!response.ok) {
        throw new Error('Failed to refresh access token');
    }

    return await response.json();
}

// 4. Fetch courses
export async function fetchCourses(accessToken: string) {
    const response = await fetch('https://classroom.googleapis.com/v1/courses?courseStates=ACTIVE', {
        headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    if (!response.ok) {
        throw new Error('Failed to fetch courses');
    }

    const data = await response.json();
    return data.courses || [];
}

// 5. Fetch course work (assignments)
export async function fetchCourseWork(accessToken: string, courseId: string) {
    const response = await fetch(
        `https://classroom.googleapis.com/v1/courses/${courseId}/courseWork`,
        { headers: { 'Authorization': `Bearer ${accessToken}` } }
    );

    if (!response.ok) {
        throw new Error('Failed to fetch course work');
    }

    const data = await response.json();
    return data.courseWork || [];
}

// 6. Fetch submissions for a coursework
export async function fetchSubmissions(accessToken: string, courseId: string, courseWorkId: string) {
    const response = await fetch(
        `https://classroom.googleapis.com/v1/courses/${courseId}/courseWork/${courseWorkId}/studentSubmissions?userId=me`,
        { headers: { 'Authorization': `Bearer ${accessToken}` } }
    );

    if (!response.ok) {
        return [];
    }

    const data = await response.json();
    return data.studentSubmissions || [];
}

// 7. Fetch all assignments from all courses with submission status
export async function fetchAllAssignments(accessToken: string) {
    const courses = await fetchCourses(accessToken);
    const allAssignments = [];

    for (const course of courses) {
        try {
            const coursework = await fetchCourseWork(accessToken, course.id);

            // For each coursework, get our submission status
            for (const item of coursework) {
                const submissions = await fetchSubmissions(accessToken, course.id, item.id);
                const mySubmission = submissions[0]; // 'userId=me' returns only ours

                allAssignments.push({
                    ...item,
                    courseName: course.name,
                    courseId: course.id,
                    submissionState: mySubmission?.state || 'NEW'
                });
            }
        } catch (e) {
            console.error(`Failed to fetch assignments for course ${course.id}:`, e);
        }
    }

    return allAssignments;
}
