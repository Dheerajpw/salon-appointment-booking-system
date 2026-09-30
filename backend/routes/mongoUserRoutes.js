const express = require("express");

const router = express.Router();

const {
    createUser,
    getUserByID
} = require("../controllers/mongoUserController");


// ========================================
// CREATE USER
// ========================================

router.post("/user", createUser);


// ========================================
// FIND USER BY ID
// ========================================

router.get("/user/:userId", getUserByID);


module.exports = router;