const fs = require("fs");
const path = require("path");
const { authenticate } = require("@google-cloud/local-auth");

const SCOPES = [
    "https://www.googleapis.com/auth/gmail.send"
];

async function main() {

    try {

        console.log("Starting Gmail OAuth2...");

        const auth = await authenticate({
            keyfilePath: path.join(
                __dirname,
                "client_secret.json"
            ),
            scopes: SCOPES
        });

        const credentials = auth.credentials;

        console.log("\nGmail authorization successful!");

        if (!credentials.refresh_token) {

            console.log(
                "\nRefresh token was not received."
            );

            return;
        }

        const tokenData = {
            refresh_token: credentials.refresh_token
        };

        fs.writeFileSync(
            path.join(__dirname, "token.json"),
            JSON.stringify(tokenData, null, 2)
        );

        console.log(
            "\nRefresh token saved successfully in token.json"
        );

    } catch (error) {

        console.error(
            "\nOAuth2 Error:",
            error.message
        );
    }
}

main();