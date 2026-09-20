const db = require("../config/db");

// Create service
const createService = async (req, res) => {
    try {
        const { name, description, duration, price } = req.body;

        if (!name || !duration || price === undefined) {
            return res.status(400).json({
                success: false,
                message: "Name, duration and price are required"
            });
        }

        const [result] = await db.execute(
            `INSERT INTO services 
            (name, description, duration, price)
            VALUES (?, ?, ?, ?)`,
            [name, description || null, duration, price]
        );

        const [rows] = await db.execute(
            "SELECT * FROM services WHERE id = ?",
            [result.insertId]
        );

        res.status(201).json({
            success: true,
            message: "Service created successfully",
            data: rows[0]
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to create service"
        });
    }
};


// Get all services
const getServices = async (req, res) => {
    try {
        const [rows] = await db.execute(
            "SELECT * FROM services ORDER BY id DESC"
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
            message: "Failed to fetch services"
        });
    }
};


// Get service by ID
const getServiceById = async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await db.execute(
            "SELECT * FROM services WHERE id = ?",
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Service not found"
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
            message: "Failed to fetch service"
        });
    }
};


// Update service
const updateService = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, duration, price, isActive } = req.body;

        const [existing] = await db.execute(
            "SELECT * FROM services WHERE id = ?",
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Service not found"
            });
        }

        await db.execute(
            `UPDATE services
             SET name = ?,
                 description = ?,
                 duration = ?,
                 price = ?,
                 isActive = ?
             WHERE id = ?`,
            [
                name,
                description || null,
                duration,
                price,
                isActive === undefined ? true : isActive,
                id
            ]
        );

        const [rows] = await db.execute(
            "SELECT * FROM services WHERE id = ?",
            [id]
        );

        res.status(200).json({
            success: true,
            message: "Service updated successfully",
            data: rows[0]
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to update service"
        });
    }
};


// Delete service
const deleteService = async (req, res) => {
    try {
        const { id } = req.params;

        const [existing] = await db.execute(
            "SELECT * FROM services WHERE id = ?",
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Service not found"
            });
        }

        await db.execute(
            "DELETE FROM services WHERE id = ?",
            [id]
        );

        res.status(200).json({
            success: true,
            message: "Service deleted successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to delete service"
        });
    }
};


module.exports = {
    createService,
    getServices,
    getServiceById,
    updateService,
    deleteService
};