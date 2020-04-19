require('dotenv').config();
const { writeFileSync } = require('fs');
const GoogleTokens = require('google-tokens');

const tokens = new GoogleTokens({ client_id: process.env.OAUTH_CLIENT_ID, client_secret: process.env.OAUTH_CLIENT_SECRET });
const scope = ['https://www.googleapis.com/auth/drive'];


tokens.authPrompt({ scope })
    .then(tokens => {
        writeFileSync('refresh-token.json', JSON.stringify({ token: tokens.credentials.refresh_token }));
    });