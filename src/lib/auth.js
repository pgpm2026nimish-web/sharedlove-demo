// Demo-only admin gate. This is a client-side password check with no
// backend — anyone who reads the JS bundle can see it. It exists to stop a
// booth visitor from casually tapping into grading settings, not to provide
// real security. Change this before sharing the source publicly.
export const ADMIN_PASSWORD = 'admin'
