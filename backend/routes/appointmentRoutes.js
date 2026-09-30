const express = require("express");

const router = express.Router();

// ==========================================
// MIDDLEWARE
// ==========================================

const authMiddleware =
    require("../middleware/authMiddleware");

// ==========================================
// CONTROLLER
// ==========================================

const {
    createAppointment,
    getAppointments,
    getAppointmentById,
    updateAppointmentStatus,
    cancelAppointment,
    rescheduleAppointment
} = require("../controllers/appointmentController");

// ==========================================
// CREATE APPOINTMENT
// ==========================================

router.post(
    "/",
    authMiddleware,
    createAppointment
);

// ==========================================
// GET MY APPOINTMENTS
// ==========================================

router.get(
    "/",
    authMiddleware,
    getAppointments
);

// ==========================================
// GET APPOINTMENT BY ID
// ==========================================

router.get(
    "/:id",
    authMiddleware,
    getAppointmentById
);

// ==========================================
// UPDATE APPOINTMENT STATUS
// ==========================================

router.put(
    "/:id/status",
    authMiddleware,
    updateAppointmentStatus
);

// ==========================================
// CANCEL APPOINTMENT
// ==========================================

router.put(
    "/:id/cancel",
    authMiddleware,
    cancelAppointment
);

// ==========================================
// RESCHEDULE APPOINTMENT
// ==========================================

router.put(
    "/:id/reschedule",
    authMiddleware,
    rescheduleAppointment
);

// ==========================================
// EXPORT ROUTER
// ==========================================

module.exports = router;