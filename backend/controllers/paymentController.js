const Razorpay = require("razorpay");
const crypto = require("crypto");

const db = require("../config/db");

const {
    generateInvoice
} = require("../services/invoiceService");


// ========================================
// Razorpay Configuration
// ========================================

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});


// ========================================
// Helper: Check Appointment Ownership
// ========================================

const getAppointmentForUser = async (
    appointmentId,
    userId,
    userRole
) => {

    let query = `
        SELECT
            a.*,
            s.name AS serviceName,
            s.price AS servicePrice
        FROM appointments a
        JOIN services s
            ON a.serviceId = s.id
        WHERE a.id = ?
    `;

    const params = [appointmentId];

    // Customer can access only own appointment.
    // Admin can access any appointment.
    if (userRole !== "ADMIN") {

        query += `
            AND a.userId = ?
        `;

        params.push(userId);
    }

    const [rows] = await db.query(
        query,
        params
    );

    if (rows.length === 0) {
        return null;
    }

    return rows[0];
};


// ========================================
// Create Payment Order
// ========================================

const createPaymentOrder = async (req, res) => {

    try {

        const { appointmentId } = req.body;

        const userId = req.user.id;
        const userRole = req.user.role;


        // ========================================
        // Validate Appointment ID
        // ========================================

        if (!appointmentId) {

            return res.status(400).json({
                success: false,
                message: "appointmentId is required"
            });

        }


        // ========================================
        // Find Appointment + Check Ownership
        // ========================================

        const appointment =
            await getAppointmentForUser(
                appointmentId,
                userId,
                userRole
            );


        if (!appointment) {

            return res.status(404).json({
                success: false,
                message: "Appointment not found"
            });

        }


        // ========================================
        // Check Appointment Status
        // ========================================

        if (
            appointment.status === "CANCELLED"
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Payment cannot be created for cancelled appointment"
            });

        }


        // ========================================
        // Get Current Service Price
        // ========================================

        const amount = Number(
            appointment.servicePrice
        );


        if (
            !Number.isFinite(amount) ||
            amount <= 0
        ) {

            return res.status(400).json({
                success: false,
                message: "Invalid payment amount"
            });

        }


        // ========================================
        // Check Already PAID
        // ========================================

        const [paidPayments] = await db.query(
            `SELECT
                id,
                appointmentId,
                amount,
                currency,
                razorpayOrderId,
                razorpayPaymentId,
                status
             FROM payments
             WHERE appointmentId = ?
             AND status = 'PAID'
             ORDER BY id DESC
             LIMIT 1`,
            [appointmentId]
        );


        if (paidPayments.length > 0) {

            return res.status(409).json({
                success: false,
                message:
                    "Payment already completed for this appointment",
                data: paidPayments[0]
            });

        }


        // ========================================
        // Check Existing CREATED Payment
        // ========================================

        const [existingPayments] = await db.query(
            `SELECT
                id,
                appointmentId,
                amount,
                currency,
                razorpayOrderId,
                status
             FROM payments
             WHERE appointmentId = ?
             AND status = 'CREATED'
             ORDER BY id DESC
             LIMIT 1`,
            [appointmentId]
        );


        // ========================================
        // Reuse Existing Payment Order
        // ========================================

        if (existingPayments.length > 0) {

            const existingPayment =
                existingPayments[0];


            return res.status(200).json({

                success: true,

                message:
                    "Existing payment order found",

                data: {

                    paymentId:
                        existingPayment.id,

                    appointmentId:
                        appointmentId,

                    serviceName:
                        appointment.serviceName,

                    amount:
                        Number(existingPayment.amount),

                    currency:
                        existingPayment.currency,

                    razorpayOrderId:
                        existingPayment.razorpayOrderId,

                    razorpayKeyId:
                        process.env.RAZORPAY_KEY_ID

                }

            });

        }


        // ========================================
        // Create New Razorpay Order
        // ========================================

        const options = {

            amount:
                Math.round(amount * 100),

            currency:
                "INR",

            receipt:
                `appointment_${appointmentId}`

        };


        const order =
            await razorpay.orders.create(
                options
            );


        console.log(
            "Razorpay order created:",
            order.id
        );


        // ========================================
        // Save Payment
        // ========================================

        const [paymentResult] =
            await db.query(
                `INSERT INTO payments
                (
                    appointmentId,
                    amount,
                    currency,
                    razorpayOrderId,
                    status
                )
                VALUES (?, ?, ?, ?, 'CREATED')`,
                [
                    appointmentId,
                    amount,
                    "INR",
                    order.id
                ]
            );


        // ========================================
        // Response
        // ========================================

        return res.status(201).json({

            success: true,

            message:
                "Payment order created successfully",

            data: {

                paymentId:
                    paymentResult.insertId,

                appointmentId:
                    appointmentId,

                serviceName:
                    appointment.serviceName,

                amount:
                    amount,

                currency:
                    "INR",

                razorpayOrderId:
                    order.id,

                razorpayKeyId:
                    process.env.RAZORPAY_KEY_ID

            }

        });

    } catch (error) {

        console.error(
            "Create payment order error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to create payment order"

        });

    }

};


// ========================================
// Verify Payment
// ========================================

const verifyPayment = async (req, res) => {

    try {

        console.log(
            "VERIFY BODY:",
            req.body
        );


        const {
            appointmentId,
            razorpayOrderId,
            razorpayPaymentId,
            razorpaySignature
        } = req.body;


        const userId = req.user.id;
        const userRole = req.user.role;


        // ========================================
        // Validate Request
        // ========================================

        if (
            !appointmentId ||
            !razorpayOrderId ||
            !razorpayPaymentId ||
            !razorpaySignature
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Payment verification fields are required"

            });

        }


        // ========================================
        // Check Appointment Ownership
        // ========================================

        const appointment =
            await getAppointmentForUser(
                appointmentId,
                userId,
                userRole
            );


        if (!appointment) {

            return res.status(404).json({

                success: false,

                message:
                    "Appointment not found"

            });

        }


        // ========================================
        // Find Payment Record
        // ========================================

        const [payments] =
            await db.query(
                `SELECT *
                 FROM payments
                 WHERE appointmentId = ?
                 AND razorpayOrderId = ?
                 LIMIT 1`,
                [
                    appointmentId,
                    razorpayOrderId
                ]
            );


        if (payments.length === 0) {

            return res.status(404).json({

                success: false,

                message:
                    "Payment order not found"

            });

        }


        const payment =
            payments[0];


        // ========================================
        // Check Already PAID
        // ========================================

        if (payment.status === "PAID") {

            return res.status(409).json({

                success: false,

                message:
                    "Payment has already been verified"

            });

        }


        // ========================================
        // Verify Payment Amount
        // ========================================

        const expectedAmount =
            Number(
                appointment.servicePrice
            );

        const paymentAmount =
            Number(
                payment.amount
            );


        if (
            expectedAmount !==
            paymentAmount
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Payment amount mismatch"

            });

        }


        // ========================================
        // Generate Razorpay Signature
        // ========================================

        const generatedSignature =
            crypto
                .createHmac(
                    "sha256",
                    process.env.RAZORPAY_KEY_SECRET
                )
                .update(
                    `${razorpayOrderId}|${razorpayPaymentId}`
                )
                .digest("hex");


        // ========================================
        // Compare Signature Securely
        // ========================================

        const generatedBuffer =
            Buffer.from(
                generatedSignature,
                "utf8"
            );

        const receivedBuffer =
            Buffer.from(
                razorpaySignature,
                "utf8"
            );


        const signatureValid =
            generatedBuffer.length ===
            receivedBuffer.length &&
            crypto.timingSafeEqual(
                generatedBuffer,
                receivedBuffer
            );


        if (!signatureValid) {

            await db.query(
                `UPDATE payments
                 SET status = 'FAILED'
                 WHERE id = ?
                 AND status = 'CREATED'`,
                [payment.id]
            );


            return res.status(400).json({

                success: false,

                message:
                    "Payment verification failed"

            });

        }


        // ========================================
        // Update Payment To PAID
        // ========================================

        const [updateResult] =
            await db.query(
                `UPDATE payments
                 SET
                    razorpayPaymentId = ?,
                    razorpaySignature = ?,
                    status = 'PAID'
                 WHERE id = ?
                 AND appointmentId = ?
                 AND razorpayOrderId = ?
                 AND status = 'CREATED'`,
                [
                    razorpayPaymentId,
                    razorpaySignature,
                    payment.id,
                    appointmentId,
                    razorpayOrderId
                ]
            );


        if (
            updateResult.affectedRows === 0
        ) {

            return res.status(409).json({

                success: false,

                message:
                    "Payment could not be completed or was already processed"

            });

        }


        // ========================================
        // Get Invoice Details
        // ========================================

        const [invoiceRows] =
            await db.query(
                `SELECT
                    a.id AS appointmentId,
                    a.customerName,
                    a.customerEmail,
                    a.appointmentDate,
                    a.startTime,
                    a.endTime,

                    s.name AS serviceName,

                    st.name AS staffName,

                    p.amount,
                    p.status AS paymentStatus,
                    p.razorpayPaymentId

                 FROM appointments a

                 JOIN services s
                    ON a.serviceId = s.id

                 JOIN staff st
                    ON a.staffId = st.id

                 JOIN payments p
                    ON p.appointmentId = a.id

                 WHERE a.id = ?
                 AND p.id = ?
                 AND p.status = 'PAID'

                 LIMIT 1`,
                [
                    appointmentId,
                    payment.id
                ]
            );


        if (
            invoiceRows.length === 0
        ) {

            return res.status(404).json({

                success: false,

                message:
                    "Payment verified but invoice details not found"

            });

        }


        const invoiceData =
            invoiceRows[0];


        // ========================================
        // Generate PDF Invoice
        // ========================================

        const invoice =
            await generateInvoice(
                invoiceData
            );


        console.log(
            "Invoice generated:",
            invoice.fileName
        );


        // ========================================
        // Final Response
        // ========================================

        return res.status(200).json({

            success: true,

            message:
                "Payment verified successfully and invoice generated",

            data: {

                appointmentId:
                    appointmentId,

                razorpayOrderId:
                    razorpayOrderId,

                razorpayPaymentId:
                    razorpayPaymentId,

                status:
                    "PAID",

                invoiceNumber:
                    invoice.invoiceNumber,

                invoiceFile:
                    invoice.fileName

            }

        });

    } catch (error) {

        console.error(
            "Verify payment error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Payment verification failed"

        });

    }

};


// ========================================
// Get Payment By Appointment
// ========================================

const getPaymentByAppointment =
    async (req, res) => {

        try {

            const {
                appointmentId
            } = req.params;

            const userId =
                req.user.id;

            const userRole =
                req.user.role;


            // ========================================
            // Check Appointment Ownership
            // ========================================

            const appointment =
                await getAppointmentForUser(
                    appointmentId,
                    userId,
                    userRole
                );


            if (!appointment) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Appointment not found"

                });

            }


            // ========================================
            // Get Payments
            // ========================================

            const [payments] =
                await db.query(
                    `SELECT
                        id,
                        appointmentId,
                        amount,
                        currency,
                        razorpayOrderId,
                        razorpayPaymentId,
                        status,
                        createdAt,
                        updatedAt
                     FROM payments
                     WHERE appointmentId = ?
                     ORDER BY id DESC`,
                    [appointmentId]
                );


            return res.status(200).json({

                success: true,

                count:
                    payments.length,

                data:
                    payments

            });

        } catch (error) {

            console.error(
                "Get payment error:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Failed to get payment details"

            });

        }

    };


// ========================================
// Export
// ========================================

module.exports = {

    createPaymentOrder,

    verifyPayment,

    getPaymentByAppointment

};