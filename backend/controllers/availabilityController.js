const db = require("../config/db");

// Create availability
const createAvailability = async (req, res) => {
    try {
        const {
            dayOfWeek,
            startTime,
            endTime,
            isAvailable
        } = req.body;

        if (!dayOfWeek || !startTime || !endTime) {
            return res.status(400).json({
                success: false,
                message: "Day, start time and end time are required"
            });
        }

        if (startTime >= endTime) {
            return res.status(400).json({
                success: false,
                message: "Start time must be before end time"
            });
        }

        const [result] = await db.execute(
            `INSERT INTO availability
            (dayOfWeek, startTime, endTime, isAvailable)
            VALUES (?, ?, ?, ?)`,
            [
                dayOfWeek,
                startTime,
                endTime,
                isAvailable === undefined ? true : isAvailable
            ]
        );

        const [rows] = await db.execute(
            "SELECT * FROM availability WHERE id = ?",
            [result.insertId]
        );

        res.status(201).json({
            success: true,
            message: "Availability created successfully",
            data: rows[0]
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to create availability"
        });
    }
};


// Get all availability
const getAvailability = async (req, res) => {
    try {
        const [rows] = await db.execute(
            `SELECT * FROM availability
             ORDER BY FIELD(
                dayOfWeek,
                'Monday',
                'Tuesday',
                'Wednesday',
                'Thursday',
                'Friday',
                'Saturday',
                'Sunday'
             )`
        );

        res.status(200).json({
            success: true,
            count: rows.length,
            data: rows
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch availability"
        });
    }
};


// Get availability by ID
const getAvailabilityById = async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await db.execute(
            "SELECT * FROM availability WHERE id = ?",
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Availability not found"
            });
        }

        res.status(200).json({
            success: true,
            data: rows[0]
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch availability"
        });
    }
};


// Update availability
const updateAvailability = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            dayOfWeek,
            startTime,
            endTime,
            isAvailable
        } = req.body;

        const [existing] = await db.execute(
            "SELECT * FROM availability WHERE id = ?",
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Availability not found"
            });
        }

        if (startTime >= endTime) {
            return res.status(400).json({
                success: false,
                message: "Start time must be before end time"
            });
        }

        await db.execute(
            `UPDATE availability
             SET dayOfWeek = ?,
                 startTime = ?,
                 endTime = ?,
                 isAvailable = ?
             WHERE id = ?`,
            [
                dayOfWeek,
                startTime,
                endTime,
                isAvailable === undefined ? true : isAvailable,
                id
            ]
        );

        const [rows] = await db.execute(
            "SELECT * FROM availability WHERE id = ?",
            [id]
        );

        res.status(200).json({
            success: true,
            message: "Availability updated successfully",
            data: rows[0]
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to update availability"
        });
    }
};


// Delete availability
const deleteAvailability = async (req, res) => {
    try {
        const { id } = req.params;

        const [existing] = await db.execute(
            "SELECT * FROM availability WHERE id = ?",
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Availability not found"
            });
        }

        await db.execute(
            "DELETE FROM availability WHERE id = ?",
            [id]
        );

        res.status(200).json({
            success: true,
            message: "Availability deleted successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to delete availability"
        });
    }
};


module.exports = {
    createAvailability,
    getAvailability,
    getAvailabilityById,
    updateAvailability,
    deleteAvailability
};