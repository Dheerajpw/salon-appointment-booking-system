const db = require("../config/db");

// Create staff
const createStaff = async (req, res) => {
    try {
        const {
            name,
            email,
            phone,
            specialization,
            bio
        } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Staff name is required"
            });
        }

        const [result] = await db.execute(
            `INSERT INTO staff
            (name, email, phone, specialization, bio)
            VALUES (?, ?, ?, ?, ?)`,
            [
                name,
                email || null,
                phone || null,
                specialization || null,
                bio || null
            ]
        );

        const [rows] = await db.execute(
            "SELECT * FROM staff WHERE id = ?",
            [result.insertId]
        );

        res.status(201).json({
            success: true,
            message: "Staff created successfully",
            data: rows[0]
        });

    } catch (error) {
        console.error(error);

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                success: false,
                message: "Email already exists"
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to create staff"
        });
    }
};


// Get all staff
const getStaff = async (req, res) => {
    try {
        const [rows] = await db.execute(
            "SELECT * FROM staff ORDER BY id DESC"
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
            message: "Failed to fetch staff"
        });
    }
};


// Get staff by ID
const getStaffById = async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await db.execute(
            "SELECT * FROM staff WHERE id = ?",
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Staff not found"
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
            message: "Failed to fetch staff"
        });
    }
};


// Update staff
const updateStaff = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            name,
            email,
            phone,
            specialization,
            bio,
            isActive
        } = req.body;

        const [existing] = await db.execute(
            "SELECT * FROM staff WHERE id = ?",
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Staff not found"
            });
        }

        await db.execute(
            `UPDATE staff
             SET name = ?,
                 email = ?,
                 phone = ?,
                 specialization = ?,
                 bio = ?,
                 isActive = ?
             WHERE id = ?`,
            [
                name,
                email || null,
                phone || null,
                specialization || null,
                bio || null,
                isActive === undefined ? true : isActive,
                id
            ]
        );

        const [rows] = await db.execute(
            "SELECT * FROM staff WHERE id = ?",
            [id]
        );

        res.status(200).json({
            success: true,
            message: "Staff updated successfully",
            data: rows[0]
        });

    } catch (error) {
        console.error(error);

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                success: false,
                message: "Email already exists"
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to update staff"
        });
    }
};


// Delete staff
const deleteStaff = async (req, res) => {
    try {
        const { id } = req.params;

        const [existing] = await db.execute(
            "SELECT * FROM staff WHERE id = ?",
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Staff not found"
            });
        }

        await db.execute(
            "DELETE FROM staff WHERE id = ?",
            [id]
        );

        res.status(200).json({
            success: true,
            message: "Staff deleted successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to delete staff"
        });
    }
};


// Assign service to staff
const assignService = async (req, res) => {
    try {
        const { staffId } = req.params;
        const { serviceId } = req.body;

        if (!serviceId) {
            return res.status(400).json({
                success: false,
                message: "serviceId is required"
            });
        }

        // Check staff
        const [staff] = await db.execute(
            "SELECT id FROM staff WHERE id = ?",
            [staffId]
        );

        if (staff.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Staff not found"
            });
        }

        // Check service
        const [service] = await db.execute(
            "SELECT id FROM services WHERE id = ?",
            [serviceId]
        );

        if (service.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Service not found"
            });
        }

        await db.execute(
            `INSERT INTO staff_services
            (staffId, serviceId)
            VALUES (?, ?)`,
            [staffId, serviceId]
        );

        res.status(201).json({
            success: true,
            message: "Service assigned to staff successfully"
        });

    } catch (error) {
        console.error(error);

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                success: false,
                message: "Service already assigned to this staff"
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to assign service"
        });
    }
};


// Get services assigned to staff
const getStaffServices = async (req, res) => {
    try {
        const { staffId } = req.params;

        const [rows] = await db.execute(
            `SELECT
                s.id,
                s.name,
                s.description,
                s.duration,
                s.price,
                s.isActive
             FROM staff_services ss
             INNER JOIN services s
                ON ss.serviceId = s.id
             WHERE ss.staffId = ?
             ORDER BY s.id`,
            [staffId]
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
            message: "Failed to fetch staff services"
        });
    }
};


// Remove service from staff
const removeService = async (req, res) => {
    try {
        const { staffId, serviceId } = req.params;

        const [result] = await db.execute(
            `DELETE FROM staff_services
             WHERE staffId = ? AND serviceId = ?`,
            [staffId, serviceId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Service assignment not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Service removed from staff successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to remove service"
        });
    }
};


module.exports = {
    createStaff,
    getStaff,
    getStaffById,
    updateStaff,
    deleteStaff,
    assignService,
    getStaffServices,
    removeService
};