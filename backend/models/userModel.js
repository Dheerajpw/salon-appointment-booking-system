const { ObjectId } = require("mongodb");
const { getDB } = require("../config/mongodb");


// ========================================
// INSERT USER
// ========================================

const insertUser = async (user) => {

    const db = getDB();

    const result = await db
        .collection("users")
        .insertOne(user);

    return result;
};


// ========================================
// FIND USER BY ID
// ========================================

const findUserbyID = async (userId) => {

    const db = getDB();

    const user = await db
        .collection("users")
        .findOne({
            _id: new ObjectId(userId)
        });

    return user;
};


module.exports = {
    insertUser,
    findUserbyID
};