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
// ROUTES
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

const startAppointmentReminderJob =
    require("./jobs/appointmentReminder");

startAppointmentReminderJob();


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

app.listen(PORT, () => {

    console.log(
        `Server is running on http://localhost:${PORT}`
    );

});