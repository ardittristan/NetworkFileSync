/** .env params */
// OAUTH_CLIENT_ID=
// OAUTH_CLIENT_SECRET=
// IMPORT_FOLDER=
// EXPORT_FOLDER=

require('dotenv').config();

const { existsSync } = require('fs');
const moment = require('moment');
const { google } = require('googleapis');


//* check if there's already a refresh token made
if (!existsSync("./refresh-token.json")) { console.error('Please run "npm run auth"'); process.exit(); }

//* init oauth
const oauth2Client = new google.auth.OAuth2(
    process.env.OAUTH_CLIENT_ID,
    process.env.OAUTH_CLIENT_SECRET,
    'http://localhost:3000/callback'
);

//* add refresh token to oauth
oauth2Client.setCredentials({
    refresh_token: require('./refresh-token.json').token
});

//* init drive api
const drive = google.drive({
    version: 'v3',
    auth: oauth2Client
});

//* function for moving and renaming files from one to another folder
async function SyncFiles() {
    // list files in folder
    drive.files.list({
        q: `'${process.env.IMPORT_FOLDER}' in parents and trashed = false and mimeType = 'text/csv'`, //filter for folder and csv
        fields: 'files(id)'
    }, async function (_, res) {
        if (res.data.files.length != 0) {
            // for each file in folder
            res.data.files.forEach(
                async function (fileIn) {
                    // get file data
                    var fileOut = await drive.files.get({ fileId: fileIn.id, alt: 'media' });
                    // create file
                    drive.files.create({
                        resource: {
                            'name': `NetWorx Report ${moment().format('MMMM DD, YYYY [at] hhmmA')}.csv`, // moment parses name to be same as before
                            parents: [process.env.EXPORT_FOLDER]
                        },
                        media: {
                            mimeType: 'text/csv',
                            body: fileOut.data
                        }
                    });
                    console.log(`Uploaded: NetWorx Report ${moment().format('MMMM DD, YYYY [at] hhmmA')}.csv`)
                    
                    // delete file in import directory
                    drive.files.delete({fileId: fileIn.id})
                    console.log(`Deleted: ${fileIn.id}`)
                }
            );
        }
    });
}

//* interval for function
SyncFiles();
setInterval(SyncFiles, 600000);
