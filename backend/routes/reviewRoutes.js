const express = require("express");

const router = express.Router();

const {
    createReview,
    getAllReviews,
    getReviewById,
    respondToReview,
    getReviewsByStaff
} = require("../controllers/reviewController");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");


// =====================================================
// 1. GET ALL REVIEWS
// Public
// =====================================================

router.get(
    "/",
    getAllReviews
);


// =====================================================
// 2. CREATE REVIEW
// Login required
// =====================================================

router.post(
    "/",
    authMiddleware,
    createReview
);


// =====================================================
// 3. GET REVIEW BY ID
// Public
// =====================================================

router.get(
    "/:id",
    getReviewById
);


// =====================================================
// 4. GET REVIEWS BY STAFF
// Public
// =====================================================

router.get(
    "/staff/:staffId",
    getReviewsByStaff
);


// =====================================================
// 5. ADMIN RESPOND TO REVIEW
// Admin token required
// =====================================================

router.put(
    "/:id/respond",
    adminMiddleware,
    respondToReview
);


module.exports = router;