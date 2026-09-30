const express = require("express");

const router = express.Router();

const authMiddleware =
    require("../middleware/authMiddleware");

const {
    createPaymentOrder,
    verifyPayment,
    getPaymentByAppointment
} = require("../controllers/paymentController");


// ==========================================
// CREATE PAYMENT ORDER
// Authenticated user only
// ==========================================

router.post(
    "/create-order",
    authMiddleware,
    createPaymentOrder
);


// ==========================================
// VERIFY PAYMENT
// Authenticated user only
// ==========================================

router.post(
    "/verify",
    authMiddleware,
    verifyPayment
);


// ==========================================
// GET PAYMENT DETAILS
// Authenticated user only
// ==========================================

router.get(
    "/appointment/:appointmentId",
    authMiddleware,
    getPaymentByAppointment
);


module.exports = router;