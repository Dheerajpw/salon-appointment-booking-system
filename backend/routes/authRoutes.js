
const express = require("express");

const router = express.Router();


// ===============================
// Controllers
// ===============================

const {
    registerUser,
    loginUser,
    getProfile,
    updateProfile
} = require("../controllers/authController");


// ===============================
// Authentication Middleware
// ===============================

const authMiddleware =
    require("../middleware/authMiddleware");


// ===============================
// Validation Middleware
// ===============================

const {
    validateRequiredFields,
    validateEmail,
    validatePassword
} = require("../middleware/validationMiddleware");


// ===============================
// REGISTER
// ===============================

router.post(
    "/register",

    validateRequiredFields([
        "name",
        "email",
        "password"
    ]),

    validateEmail,

    validatePassword,

    registerUser
);


// ===============================
// LOGIN
// ===============================

router.post(
    "/login",

    validateRequiredFields([
        "email",
        "password"
    ]),

    validateEmail,

    loginUser
);


// ===============================
// PROFILE
// ===============================

router.get(
    "/profile",
    authMiddleware,
    getProfile
);


// ===============================
// UPDATE PROFILE
// ===============================

router.put(
    "/profile",
    authMiddleware,
    updateProfile
);


module.exports = router;
