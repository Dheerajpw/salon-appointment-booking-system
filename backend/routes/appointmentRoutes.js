const express = require("express");

const router = express.Router();


// ========================================
// Appointment Controller
// ========================================

const {
    createAppointment,
    getAppointments,
    getAppointmentById,
    updateAppointmentStatus,
    cancelAppointment,
    rescheduleAppointment
} = require("../controllers/appointmentController");


// ========================================
// Create Appointment
// ========================================

router.post(
    "/",
    createAppointment
);


// ========================================
// Get All Appointments
// ========================================

router.get(
    "/",
    getAppointments
);


// ========================================
// Get Appointment By ID
// ========================================

router.get(
    "/:id",
    getAppointmentById
);


// ========================================
// Update Status
// ========================================

router.put(
    "/:id/status",
    updateAppointmentStatus
);


// ========================================
// Cancel Appointment
// ========================================

router.put(
    "/:id/cancel",
    cancelAppointment
);


// ========================================
// Reschedule Appointment
// ========================================

router.put(
    "/:id/reschedule",
    rescheduleAppointment
);


module.exports = router;