const express = require("express");

const router = express.Router();

const adminMiddleware =
    require("../middleware/adminMiddleware");

const {
    createStaff,
    getStaff,
    getStaffById,
    updateStaff,
    deleteStaff
} = require("../controllers/staffController");

// ==========================================
// PUBLIC ROUTES
// ==========================================

// Get all staff
router.get(
    "/",
    getStaff
);

// Get staff by ID
router.get(
    "/:id",
    getStaffById
);


// ==========================================
// ADMIN ONLY ROUTES
// ==========================================

// Create staff
router.post(
    "/",
    adminMiddleware,
    createStaff
);

// Update staff
router.put(
    "/:id",
    adminMiddleware,
    updateStaff
);

// Delete staff
router.delete(
    "/:id",
    adminMiddleware,
    deleteStaff
);

module.exports = router;