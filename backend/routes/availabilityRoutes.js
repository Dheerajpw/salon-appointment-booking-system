const express = require("express");

const router = express.Router();

const adminMiddleware =
    require("../middleware/adminMiddleware");

const {
    createAvailability,
    getAvailability,
    getAvailabilityById,
    updateAvailability,
    deleteAvailability
} = require("../controllers/availabilityController");


// ==========================================
// PUBLIC ROUTES
// ==========================================

// Get all availability
router.get(
    "/",
    getAvailability
);

// Get availability by ID
router.get(
    "/:id",
    getAvailabilityById
);


// ==========================================
// ADMIN ONLY ROUTES
// ==========================================

// Create availability
router.post(
    "/",
    adminMiddleware,
    createAvailability
);

// Update availability
router.put(
    "/:id",
    adminMiddleware,
    updateAvailability
);

// Delete availability
router.delete(
    "/:id",
    adminMiddleware,
    deleteAvailability
);


module.exports = router;