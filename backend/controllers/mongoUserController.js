const {
    insertUser,
    findUserbyID
} = require("../models/userModel");


// ========================================
// CREATE USER
// ========================================

const createUser = async (req, res) => {

    try {

        const user = req.body;

        const result = await insertUser(user);

        res.status(201).json({
            success: true,
            message: "User inserted successfully",
            insertedId: result.insertedId
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to insert user",
            error: error.message
        });
    }
};


// ========================================
// FIND USER BY ID
// ========================================

const getUserByID = async (req, res) => {

    try {

        const userId = req.params.userId;

        const user = await findUserbyID(userId);

        if (!user) {

            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "User found successfully",
            data: user
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to find user",
            error: error.message
        });
    }
};


module.exports = {
    createUser,
    getUserByID
};