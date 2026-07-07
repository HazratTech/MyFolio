import { OAuth2Client } from 'google-auth-library';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/admin/oauth2callback';

function getOAuth2Client(redirectUri?: string) {
    const finalRedirectUri = redirectUri || process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/admin/oauth2callback';
    return new OAuth2Client(
        CLIENT_ID,
        CLIENT_SECRET,
        finalRedirectUri
    );
}

export async function generateAuthUrl(origin?: string) {
    const redirectUri = origin ? `${origin}/admin/oauth2callback` : undefined;
    const client = getOAuth2Client(redirectUri);
    return client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile'],
    });
}

export async function verifyGoogleToken(code: string, origin?: string) {
    const redirectUri = origin ? `${origin}/admin/oauth2callback` : undefined;
    const client = getOAuth2Client(redirectUri);
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);

    const ticket = await client.verifyIdToken({
        idToken: tokens.id_token!,
        audience: CLIENT_ID,
    });

    return ticket.getPayload();
}
