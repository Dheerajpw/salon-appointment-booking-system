
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
// Create Payment Order
// ========================================

const createPaymentOrder = async (req, res) => {

    try {

        const { appointmentId } = req.body;

        console.log(
            "Creating payment order for appointment:",
            appointmentId
        );

        if (!appointmentId) {

            return res.status(400).json({
                success: false,
                message: "appointmentId is required"
            });

        }


        // ========================================
        // Find Appointment
        // ========================================

        const [appointments] = await db.query(
            `SELECT
                a.*,
                s.name AS serviceName
             FROM appointments a
             JOIN services s
                ON a.serviceId = s.id
             WHERE a.id = ?`,
            [appointmentId]
        );


        if (appointments.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Appointment not found"
            });

        }


        const appointment = appointments[0];


        // ========================================
        // Check Appointment Status
        // ========================================

        if (appointment.status === "CANCELLED") {

            return res.status(400).json({
                success: false,
                message:
                    "Payment cannot be created for cancelled appointment"
            });

        }


        // ========================================
        // Get Service Price
        // ========================================

        const [services] = await db.query(
            `SELECT price
             FROM services
             WHERE id = ?`,
            [appointment.serviceId]
        );


        if (services.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Service not found"
            });

        }


        const amount = Number(
            services[0].price
        );


        if (!amount || amount <= 0) {

            return res.status(400).json({
                success: false,
                message: "Invalid payment amount"
            });

        }


        // ========================================
        // Razorpay Order
        // Amount must be in paise
        // ========================================

        const options = {

            amount: Math.round(amount * 100),

            currency: "INR",

            receipt:
                `appointment_${appointmentId}`

        };


        const order =
            await razorpay.orders.create(options);


        console.log(
            "Razorpay order created:",
            order.id
        );


        // ========================================
        // Save Payment
        // ========================================

        const [paymentResult] = await db.query(
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
                "Failed to create payment order",

            error:
                error.message

        });

    }

};


// ========================================
// Verify Payment
// ========================================

const verifyPayment = async (req, res) => {

    try {

         console.log("VERIFY BODY:", req.body);

        const {
            appointmentId,
            razorpayOrderId,
            razorpayPaymentId,
            razorpaySignature
        } = req.body;


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
        // Generate Signature
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
        // Compare Signature
        // ========================================

        if (
            generatedSignature !==
            razorpaySignature
        ) {

            await db.query(
                `UPDATE payments
                 SET status = 'FAILED'
                 WHERE appointmentId = ?
                 AND razorpayOrderId = ?`,
                [
                    appointmentId,
                    razorpayOrderId
                ]
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

        await db.query(
            `UPDATE payments
             SET
                razorpayPaymentId = ?,
                razorpaySignature = ?,
                status = 'PAID'
             WHERE appointmentId = ?
             AND razorpayOrderId = ?`,
            [
                razorpayPaymentId,
                razorpaySignature,
                appointmentId,
                razorpayOrderId
            ]
        );


        // ========================================
        // Get Complete Invoice Details
        // ========================================

        const [invoiceRows] = await db.query(
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
             AND p.razorpayOrderId = ?
             AND p.status = 'PAID'

             LIMIT 1`,
            [
                appointmentId,
                razorpayOrderId
            ]
        );


        if (invoiceRows.length === 0) {

            return res.status(404).json({

                success: false,

                message:
                    "Payment verified but invoice details not found"

            });

        }


        const invoiceData = invoiceRows[0];


        // ========================================
        // Generate PDF Invoice
        // ========================================

        const invoice =
            await generateInvoice(invoiceData);


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
                "Payment verification failed",

            error:
                error.message

        });

    }

};


// ========================================
// Get Payment By Appointment
// ========================================

const getPaymentByAppointment = async (req, res) => {

    try {

        const { appointmentId } =
            req.params;


        const [payments] = await db.query(
            `SELECT *
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
