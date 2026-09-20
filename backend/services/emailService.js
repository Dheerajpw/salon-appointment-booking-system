const fs = require("fs");
const path = require("path");
const { google } = require("googleapis");

require("dotenv").config();


// ========================================
// Read Google OAuth Client
// ========================================

const credentials = JSON.parse(
    fs.readFileSync(
        path.join(__dirname, "..", "client_secret.json"),
        "utf8"
    )
);

const { client_id, client_secret } = credentials.installed;


// ========================================
// Read Refresh Token
// ========================================

const tokenData = JSON.parse(
    fs.readFileSync(
        path.join(__dirname, "..", "token.json"),
        "utf8"
    )
);


// ========================================
// Create OAuth2 Client
// ========================================

const oauth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    "http://localhost"
);

oauth2Client.setCredentials({
    refresh_token: tokenData.refresh_token
});


// ========================================
// Gmail API
// ========================================

const gmail = google.gmail({
    version: "v1",
    auth: oauth2Client
});


// ========================================
// Create Gmail Message
// ========================================

const createMessage = ({
    from,
    to,
    subject,
    text
}) => {

    const message = [
        `From: ${from}`,
        `To: ${to}`,
        `Subject: ${subject}`,
        "Content-Type: text/plain; charset=utf-8",
        "",
        text
    ].join("\r\n");

    return Buffer
        .from(message)
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
};


// ========================================
// Send Appointment Reminder
// ========================================

const sendAppointmentReminder = async (appointment) => {

    try {

        const message = createMessage({

            from: process.env.EMAIL_USER,

            to: appointment.customerEmail,

            subject: "Salon Appointment Reminder",

            text: `
Hello ${appointment.customerName},

This is a reminder for your salon appointment.

Service: ${appointment.serviceName}
Staff: ${appointment.staffName}
Date: ${appointment.appointmentDate}
Time: ${appointment.startTime} - ${appointment.endTime}

Thank you for choosing our salon.
            `
        });


        // ========================================
        // Send through Gmail API
        // ========================================

        await gmail.users.messages.send({

            userId: "me",

            requestBody: {
                raw: message
            }

        });


        console.log(
            `Reminder email sent to ${appointment.customerEmail}`
        );

    } catch (error) {

        console.error(
            "Gmail API email error:",
            error.message
        );

        throw error;
    }
};


module.exports = {
    sendAppointmentReminder
};