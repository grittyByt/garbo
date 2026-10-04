import "dotenv/config";

import {
    sendVerificationEmail
} from "./lib/mailer.js";

async function testEmail(): Promise<void> {

    try {

        console.log(
            "Attempting to send Garbo test email..."
        );

        await sendVerificationEmail(
            "terrell_whiting@yahoo.com",
            "789012"
        );

        console.log(
            "SUCCESS: Garbo test email sent."
        );

    } catch (error) {

        console.error(
            "FAILED: Garbo could not send the test email."
        );

        console.error(error);

        process.exitCode = 1;
    }
}

testEmail();