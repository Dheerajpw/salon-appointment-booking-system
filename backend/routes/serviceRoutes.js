const express = require("express");

const router = express.Router();

const {
    createService,
    getServices,
    getServiceById,
    updateService,
    deleteService
} = require("../controllers/serviceController");

// Create service
router.post("/", createService);

// Get all services
router.get("/", getServices);

// Get service by ID
router.get("/:id", getServiceById);

// Update service
router.put("/:id", updateService);

// Delete service
router.delete("/:id", deleteService);

module.exports = router;