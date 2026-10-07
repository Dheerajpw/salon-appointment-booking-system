
const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "salon_booking",
    port: Number(process.env.DB_PORT) || 3306,

    // Aiven MySQL requires SSL
    ssl: process.env.DB_SSL === "true"
        ? {
            rejectUnauthorized: false
        }
        : undefined,

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const testConnection = async () => {

    try {

        const connection = await pool.getConnection();

        console.log("MySQL database connected successfully");

        connection.release();

    } catch (error) {

        console.error(
            "Database connection failed:",
            error.message
        );

    }
};

testConnection();

module.exports = pool;
