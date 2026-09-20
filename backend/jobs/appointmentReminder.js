const cron = require("node-cron");
const fs = require("fs");
const path = require("path");

const db = require("../config/db");

const {
    sendAppointmentReminder
} = require("../services/emailService");


// ========================================
// Check OAuth2 Token
// ========================================

const tokenPath = path.join(
    __dirname,
    "..",
    "token.json"
);


// ========================================
// Appointment Reminder Cron Job
// ========================================

const startAppointmentReminderJob = () => {

    // Runs every minute
    cron.schedule("* * * * *", async () => {

        try {

            console.log(
                "Checking upcoming appointments..."
            );


            // ========================================
            // Get today's appointments
            // ========================================

            const [appointments] = await db.query(
                `SELECT
                    a.*,
                    s.name AS serviceName,
                    st.name AS staffName
                 FROM appointments a
                 JOIN services s
                    ON a.serviceId = s.id
                 JOIN staff st
                    ON a.staffId = st.id
                 WHERE a.appointmentDate = CURDATE()
                 AND a.status IN ('BOOKED', 'CONFIRMED')
                 AND a.reminderSent = FALSE`
            );


            // ========================================
            // No appointments
            // ========================================

            if (appointments.length === 0) {

                console.log(
                    "No pending appointment reminders found."
                );

                return;
            }


            // ========================================
            // Process appointments
            // ========================================

            for (const appointment of appointments) {

                console.log(
                    `Appointment found: ${appointment.customerName}`
                );


                // ========================================
                // Check OAuth2 Configuration
                // ========================================

                if (
                    process.env.EMAIL_USER &&
                    fs.existsSync(tokenPath)
                ) {

                    try {

                        // ========================================
                        // Send Email
                        // ========================================

                        await sendAppointmentReminder(
                            appointment
                        );


                        // ========================================
                        // Mark Reminder as Sent
                        // ========================================

                        await db.query(
                            `UPDATE appointments
                             SET reminderSent = TRUE
                             WHERE id = ?`,
                            [appointment.id]
                        );


                        console.log(
                            `Reminder marked as sent for appointment ID ${appointment.id}`
                        );

                    } catch (emailError) {

                        console.error(
                            "Email sending failed:",
                            emailError.message
                        );
                    }

                } else {

                    console.log(
                        `Email skipped for ${appointment.customerEmail} - OAuth2 configuration not found`
                    );
                }
            }

        } catch (error) {

            console.error(
                "Appointment reminder job error:",
                error.message
            );
        }

    });


    console.log(
        "Appointment reminder cron job started"
    );
};


module.exports = startAppointmentReminderJob;