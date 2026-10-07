const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 5000;


// ==========================================
// MIDDLEWARE
// ==========================================

app.use(cors());

app.use(express.json());

app.use(
    express.urlencoded({
        extended: true
    })
);


// ==========================================
// ROUTES IMPORT
// ==========================================

const authRoutes =
    require("./routes/authRoutes");

const serviceRoutes =
    require("./routes/serviceRoutes");

const availabilityRoutes =
    require("./routes/availabilityRoutes");

const staffRoutes =
    require("./routes/staffRoutes");

const appointmentRoutes =
    require("./routes/appointmentRoutes");

const paymentRoutes =
    require("./routes/paymentRoutes");

const reviewRoutes =
    require("./routes/reviewRoutes");

const adminRoutes =
    require("./routes/adminRoutes");


// ==========================================
// ROOT ROUTE
// ==========================================

app.get("/", (req, res) => {

    res.json({
        success: true,
        message: "Salon Appointment Booking API is running"
    });

});


// ==========================================
// API ROUTES
// ==========================================

app.use(
    "/api/auth",
    authRoutes
);

app.use(
    "/api/services",
    serviceRoutes
);

app.use(
    "/api/availability",
    availabilityRoutes
);

app.use(
    "/api/staff",
    staffRoutes
);

app.use(
    "/api/appointments",
    appointmentRoutes
);

app.use(
    "/api/payments",
    paymentRoutes
);

app.use(
    "/api/reviews",
    reviewRoutes
);


// ==========================================
// ADMIN ROUTES
// ==========================================

app.use(
    "/api/admin",
    adminRoutes
);


// ==========================================
// APPOINTMENT REMINDER CRON JOB
// ==========================================

// Reminder job is enabled only when
// ENABLE_REMINDER_JOB=true.
//
// This prevents Render from trying to load
// Gmail client_secret.json when the reminder
// system is disabled in production.

let startAppointmentReminderJob = null;

if (
    process.env.ENABLE_REMINDER_JOB === "true"
) {

    startAppointmentReminderJob =
        require("./jobs/appointmentReminder");

}


// ==========================================
// 404 ROUTE
// ==========================================

app.use((req, res) => {

    res.status(404).json({
        success: false,
        message: "Route not found"
    });

});


// ==========================================
// START SERVER
// ==========================================

const startServer = async () => {

    try {

        // ======================================
        // START APPOINTMENT REMINDER JOB
        // ======================================

        if (
            startAppointmentReminderJob
        ) {

            startAppointmentReminderJob();

            console.log(
                "Appointment reminder cron job started"
            );

        } else {

            console.log(
                "Appointment reminder cron job disabled"
            );

        }


        // ======================================
        // START EXPRESS SERVER
        // ======================================

        app.listen(PORT, () => {

            console.log(
                `Server is running on http://localhost:${PORT}`
            );

        });

    } catch (error) {

        console.error(
            "Failed to start server:",
            error.message
        );

    }

};


startServer();