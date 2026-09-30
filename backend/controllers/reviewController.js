const db = require("../config/db");


// ==========================================
// CREATE REVIEW
// ==========================================

const createReview = async (req, res) => {
    try {

        const {
            appointmentId,
            rating,
            comment
        } = req.body;

        const userId = req.user.id;


        // ==========================================
        // VALIDATE REQUIRED FIELDS
        // ==========================================

        if (
            !appointmentId ||
            rating === undefined ||
            rating === null
        ) {
            return res.status(400).json({
                success: false,
                message: "Appointment ID and rating are required"
            });
        }


        // ==========================================
        // VALIDATE RATING
        // ==========================================

        const numericRating = Number(rating);

        if (
            !Number.isInteger(numericRating) ||
            numericRating < 1 ||
            numericRating > 5
        ) {
            return res.status(400).json({
                success: false,
                message: "Rating must be an integer between 1 and 5"
            });
        }


        // ==========================================
        // FIND APPOINTMENT
        // ONLY OWNER CAN REVIEW
        // ==========================================

        const [appointments] = await db.query(
            `SELECT
                a.*,
                st.name AS staffName
             FROM appointments a
             JOIN staff st
                ON a.staffId = st.id
             WHERE a.id = ?
             AND a.userId = ?`,
            [
                appointmentId,
                userId
            ]
        );


        // ==========================================
        // APPOINTMENT NOT FOUND / NOT OWNED
        // ==========================================

        if (appointments.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found"
            });
        }


        const appointment = appointments[0];


        // ==========================================
        // ONLY COMPLETED APPOINTMENTS CAN BE REVIEWED
        // ==========================================

        if (appointment.status !== "COMPLETED") {
            return res.status(400).json({
                success: false,
                message: "Only completed appointments can be reviewed"
            });
        }


        // ==========================================
        // CHECK DUPLICATE REVIEW
        // ==========================================

        const [existingReviews] = await db.query(
            `SELECT id
             FROM reviews
             WHERE appointmentId = ?`,
            [appointmentId]
        );


        if (existingReviews.length > 0) {
            return res.status(409).json({
                success: false,
                message: "This appointment has already been reviewed"
            });
        }


        // ==========================================
        // CREATE REVIEW
        // ==========================================

        const [result] = await db.query(
            `INSERT INTO reviews
            (
                appointmentId,
                customerName,
                customerEmail,
                serviceId,
                staffId,
                rating,
                comment
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                appointmentId,
                appointment.customerName,
                appointment.customerEmail,
                appointment.serviceId,
                appointment.staffId,
                numericRating,
                comment || null
            ]
        );


        // ==========================================
        // GET CREATED REVIEW
        // ==========================================

        const [reviews] = await db.query(
            `SELECT
                r.*,
                st.name AS staffName
             FROM reviews r
             JOIN staff st
                ON r.staffId = st.id
             WHERE r.id = ?`,
            [result.insertId]
        );


        // ==========================================
        // SUCCESS RESPONSE
        // ==========================================

        return res.status(201).json({
            success: true,
            message: "Review submitted successfully",
            data: reviews[0]
        });


    } catch (error) {

        console.error(
            "Create review error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message: "Failed to create review"
        });
    }
};



// ==========================================
// GET ALL REVIEWS
// ==========================================

const getAllReviews = async (req, res) => {
    try {

        const [reviews] = await db.query(
            `SELECT
                r.*,
                st.name AS staffName
             FROM reviews r
             JOIN staff st
                ON r.staffId = st.id
             ORDER BY r.createdAt DESC`
        );


        return res.status(200).json({
            success: true,
            count: reviews.length,
            data: reviews
        });


    } catch (error) {

        console.error(
            "Get reviews error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message: "Failed to get reviews"
        });
    }
};



// ==========================================
// GET REVIEW BY ID
// ==========================================

const getReviewById = async (req, res) => {
    try {

        const reviewId = req.params.id;


        const [reviews] = await db.query(
            `SELECT
                r.*,
                st.name AS staffName
             FROM reviews r
             JOIN staff st
                ON r.staffId = st.id
             WHERE r.id = ?`,
            [reviewId]
        );


        if (reviews.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Review not found"
            });
        }


        return res.status(200).json({
            success: true,
            data: reviews[0]
        });


    } catch (error) {

        console.error(
            "Get review error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message: "Failed to get review"
        });
    }
};



// ==========================================
// ADMIN RESPONSE TO REVIEW
// ==========================================

const respondToReview = async (req, res) => {
    try {

        const reviewId = req.params.id;

        const {
            staffResponse
        } = req.body;


        // ==========================================
        // VALIDATE RESPONSE
        // ==========================================

        if (
            !staffResponse ||
            !String(staffResponse).trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Staff response is required"
            });
        }


        // ==========================================
        // CHECK REVIEW
        // ==========================================

        const [reviews] = await db.query(
            `SELECT *
             FROM reviews
             WHERE id = ?`,
            [reviewId]
        );


        if (reviews.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Review not found"
            });
        }


        // ==========================================
        // UPDATE RESPONSE
        // ==========================================

        await db.query(
            `UPDATE reviews
             SET staffResponse = ?
             WHERE id = ?`,
            [
                String(staffResponse).trim(),
                reviewId
            ]
        );


        // ==========================================
        // GET UPDATED REVIEW
        // ==========================================

        const [updatedReview] = await db.query(
            `SELECT
                r.*,
                st.name AS staffName
             FROM reviews r
             JOIN staff st
                ON r.staffId = st.id
             WHERE r.id = ?`,
            [reviewId]
        );


        return res.status(200).json({
            success: true,
            message: "Staff response added successfully",
            data: updatedReview[0]
        });


    } catch (error) {

        console.error(
            "Staff response error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message: "Failed to add staff response"
        });
    }
};



// ==========================================
// GET REVIEWS BY STAFF
// ==========================================

const getReviewsByStaff = async (req, res) => {
    try {

        const staffId = req.params.staffId;


        const [reviews] = await db.query(
            `SELECT
                r.*,
                st.name AS staffName
             FROM reviews r
             JOIN staff st
                ON r.staffId = st.id
             WHERE r.staffId = ?
             ORDER BY r.createdAt DESC`,
            [staffId]
        );


        return res.status(200).json({
            success: true,
            count: reviews.length,
            data: reviews
        });


    } catch (error) {

        console.error(
            "Get staff reviews error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message: "Failed to get staff reviews"
        });
    }
};



// ==========================================
// EXPORT
// ==========================================

module.exports = {
    createReview,
    getAllReviews,
    getReviewById,
    respondToReview,
    getReviewsByStaff
};