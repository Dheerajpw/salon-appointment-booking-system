const express = require("express");

const router = express.Router();

const adminMiddleware =
    require("../middleware/adminMiddleware");

const {
    createService,
    getServices,
    getServiceById,
    updateService,
    deleteService
} = require("../controllers/serviceController");

// ==========================================
// PUBLIC ROUTES
// ==========================================

// Get all active services
router.get(
    "/",
    getServices
);

// Get service by ID
router.get(
    "/:id",
    getServiceById
);


// ==========================================
// ADMIN ONLY ROUTES
// ==========================================

// Create service
router.post(
    "/",
    adminMiddleware,
    createService
);

// Update service
router.put(
    "/:id",
    adminMiddleware,
    updateService
);

// Delete service
router.delete(
    "/:id",
    adminMiddleware,
    deleteService
);

module.exports = router;