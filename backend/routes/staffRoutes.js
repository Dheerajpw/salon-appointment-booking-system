const express = require("express");

const router = express.Router();

const {
    createStaff,
    getStaff,
    getStaffById,
    updateStaff,
    deleteStaff,
    assignService,
    getStaffServices,
    removeService
} = require("../controllers/staffController");


// Staff CRUD

router.post("/", createStaff);

router.get("/", getStaff);

router.get("/:id", getStaffById);

router.put("/:id", updateStaff);

router.delete("/:id", deleteStaff);


// Staff service assignment

router.post("/:staffId/services", assignService);

router.get("/:staffId/services", getStaffServices);

router.delete(
    "/:staffId/services/:serviceId",
    removeService
);


module.exports = router;