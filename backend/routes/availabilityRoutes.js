const express = require("express");

const router = express.Router();

const {
    createAvailability,
    getAvailability,
    getAvailabilityById,
    updateAvailability,
    deleteAvailability
} = require("../controllers/availabilityController");


router.post("/", createAvailability);

router.get("/", getAvailability);

router.get("/:id", getAvailabilityById);

router.put("/:id", updateAvailability);

router.delete("/:id", deleteAvailability);


module.exports = router;