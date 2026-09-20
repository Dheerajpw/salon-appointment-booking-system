
const express = require("express");

const router = express.Router();

const {
    createPaymentOrder,
    verifyPayment,
    getPaymentByAppointment
} = require("../controllers/paymentController");


// Create Razorpay Order
router.post(
    "/create-order",
    createPaymentOrder
);


// Verify Razorpay Payment
router.post(
    "/verify",
    verifyPayment
);


// Get Payment Details
router.get(
    "/appointment/:appointmentId",
    getPaymentByAppointment
);


module.exports = router;
