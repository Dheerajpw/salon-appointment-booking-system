const express = require("express");

const router = express.Router();


// ==========================================
// MIDDLEWARE
// ==========================================

const authMiddleware =
    require("../middleware/authMiddleware");

const adminMiddleware =
    require("../middleware/adminMiddleware");


// ==========================================
// CONTROLLERS
// ==========================================

const {
    createReview,
    getAllReviews,
    getReviewById,
    respondToReview,
    getReviewsByStaff
} = require("../controllers/reviewController");


// ==========================================
// PUBLIC ROUTES
// ==========================================

// Get all reviews
router.get(
    "/",
    getAllReviews
);


// Get reviews by staff
router.get(
    "/staff/:staffId",
    getReviewsByStaff
);


// Get review by ID
router.get(
    "/:id",
    getReviewById
);


// ==========================================
// CUSTOMER ROUTES
// ==========================================

// Create review
// User must be logged in
// Controller checks appointment ownership
router.post(
    "/",
    authMiddleware,
    createReview
);


// ==========================================
// ADMIN ROUTES
// ==========================================

// Respond to review
router.put(
    "/:id/respond",
    adminMiddleware,
    respondToReview
);


module.exports = router;