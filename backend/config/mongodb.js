const { MongoClient } = require("mongodb");

const client = new MongoClient(process.env.MONGO_URI);

let db;

const connectMongoDB = async () => {
    try {
        await client.connect();

        db = client.db("salon_booking");

        console.log("MongoDB connected successfully");

        return db;
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        throw error;
    }
};

const getDB = () => {
    return db;
};

module.exports = {
    connectMongoDB,
    getDB
};