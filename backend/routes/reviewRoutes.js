const express = require("express");

const router = express.Router();

const {
    createReview,
    getAllReviews,
    getReviewById,
    respondToReview,
    getReviewsByStaff
} = require("../controllers/reviewController");


// Create review
router.post("/", createReview);


// Get all reviews
router.get("/", getAllReviews);


// Get reviews by staff
router.get("/staff/:staffId", getReviewsByStaff);


// Get review by ID
router.get("/:id", getReviewById);


// Staff response
router.put("/:id/respond", respondToReview);


module.exports = router;