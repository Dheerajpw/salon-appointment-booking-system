// =====================================================
// ADMIN CONTROLLER
// =====================================================

const db = require("../config/db");


// =====================================================
// 1. ADMIN DASHBOARD STATISTICS
// =====================================================

const getDashboardStats = async (req, res) => {

    try {

        const [[users]] = await db.query(
            "SELECT COUNT(*) AS totalUsers FROM users"
        );

        const [[appointments]] = await db.query(
            "SELECT COUNT(*) AS totalAppointments FROM appointments"
        );

        const [[staff]] = await db.query(
            "SELECT COUNT(*) AS totalStaff FROM staff"
        );

        const [[services]] = await db.query(
            "SELECT COUNT(*) AS totalServices FROM services"
        );

        const [[reviews]] = await db.query(
            "SELECT COUNT(*) AS totalReviews FROM reviews"
        );

        const [[booked]] = await db.query(
            "SELECT COUNT(*) AS count FROM appointments WHERE status = 'BOOKED'"
        );

        const [[confirmed]] = await db.query(
            "SELECT COUNT(*) AS count FROM appointments WHERE status = 'CONFIRMED'"
        );

        const [[completed]] = await db.query(
            "SELECT COUNT(*) AS count FROM appointments WHERE status = 'COMPLETED'"
        );

        const [[cancelled]] = await db.query(
            "SELECT COUNT(*) AS count FROM appointments WHERE status = 'CANCELLED'"
        );


        res.status(200).json({

            success: true,

            data: {

                totalUsers: users.totalUsers,

                totalAppointments:
                    appointments.totalAppointments,

                totalStaff:
                    staff.totalStaff,

                totalServices:
                    services.totalServices,

                totalReviews:
                    reviews.totalReviews,

                appointmentsByStatus: {

                    booked: booked.count,

                    confirmed: confirmed.count,

                    completed: completed.count,

                    cancelled: cancelled.count

                }

            }

        });

    } catch (error) {

        console.error(
            "Dashboard error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch dashboard statistics"
        });

    }

};


// =====================================================
// 2. GET ALL USERS
// =====================================================

const getAllUsers = async (req, res) => {

    try {

        const [users] = await db.query(`
            SELECT
                id,
                name,
                email,
                phone,
                role,
                createdAt,
                updatedAt
            FROM users
            ORDER BY id DESC
        `);

        res.status(200).json({

            success: true,

            count: users.length,

            data: users

        });

    } catch (error) {

        console.error(
            "Get users error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch users"
        });

    }

};


// =====================================================
// 3. GET USER BY ID
// =====================================================

const getUserById = async (req, res) => {

    try {

        const userId = req.params.id;

        const [users] = await db.query(`
            SELECT
                id,
                name,
                email,
                phone,
                role,
                createdAt,
                updatedAt
            FROM users
            WHERE id = ?
        `, [userId]);

        if (users.length === 0) {

            return res.status(404).json({
                success: false,
                message: "User not found"
            });

        }

        res.status(200).json({

            success: true,

            data: users[0]

        });

    } catch (error) {

        console.error(
            "Get user error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch user"
        });

    }

};


// =====================================================
// 4. UPDATE USER
// =====================================================

const updateUser = async (req, res) => {

    try {

        const userId = req.params.id;

        const {
            name,
            email,
            phone,
            role
        } = req.body;


        const [existingUsers] = await db.query(
            "SELECT * FROM users WHERE id = ?",
            [userId]
        );

        if (existingUsers.length === 0) {

            return res.status(404).json({
                success: false,
                message: "User not found"
            });

        }


        if (
            role &&
            !["CUSTOMER", "ADMIN"].includes(role)
        ) {

            return res.status(400).json({
                success: false,
                message: "Role must be CUSTOMER or ADMIN"
            });

        }


        const currentUser = existingUsers[0];

        const updatedName =
            name !== undefined
                ? name
                : currentUser.name;

        const updatedEmail =
            email !== undefined
                ? email
                : currentUser.email;

        const updatedPhone =
            phone !== undefined
                ? phone
                : currentUser.phone;

        const updatedRole =
            role !== undefined
                ? role
                : currentUser.role;


        await db.query(`
            UPDATE users
            SET
                name = ?,
                email = ?,
                phone = ?,
                role = ?
            WHERE id = ?
        `, [
            updatedName,
            updatedEmail,
            updatedPhone,
            updatedRole,
            userId
        ]);


        const [updatedUsers] = await db.query(`
            SELECT
                id,
                name,
                email,
                phone,
                role,
                createdAt,
                updatedAt
            FROM users
            WHERE id = ?
        `, [userId]);


        res.status(200).json({

            success: true,

            message: "User updated successfully",

            data: updatedUsers[0]

        });

    } catch (error) {

        console.error(
            "Update user error:",
            error.message
        );

        if (error.code === "ER_DUP_ENTRY") {

            return res.status(409).json({
                success: false,
                message: "Email or phone already exists"
            });

        }

        res.status(500).json({
            success: false,
            message: "Failed to update user"
        });

    }

};


// =====================================================
// 5. DELETE USER
// =====================================================

const deleteUser = async (req, res) => {

    try {

        const userId = req.params.id;


        if (Number(userId) === Number(req.user.id)) {

            return res.status(400).json({
                success: false,
                message: "Admin cannot delete their own account"
            });

        }


        const [users] = await db.query(
            "SELECT id FROM users WHERE id = ?",
            [userId]
        );

        if (users.length === 0) {

            return res.status(404).json({
                success: false,
                message: "User not found"
            });

        }


        await db.query(
            "DELETE FROM users WHERE id = ?",
            [userId]
        );


        res.status(200).json({

            success: true,

            message: "User deleted successfully"

        });

    } catch (error) {

        console.error(
            "Delete user error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Failed to delete user"
        });

    }

};


// =====================================================
// 6. GET ALL APPOINTMENTS
// =====================================================

const getAllAppointments = async (req, res) => {

    try {

        const [appointments] = await db.query(`
            SELECT
                a.id,
                a.customerName,
                a.customerEmail,
                a.customerPhone,
                a.appointmentDate,
                a.startTime,
                a.endTime,
                a.status,
                a.notes,
                a.createdAt,

                s.name AS serviceName,
                s.duration AS serviceDuration,
                s.price AS servicePrice,

                st.name AS staffName,
                st.specialization AS staffSpecialization

            FROM appointments a

            LEFT JOIN services s
                ON a.serviceId = s.id

            LEFT JOIN staff st
                ON a.staffId = st.id

            ORDER BY
                a.appointmentDate DESC,
                a.startTime DESC
        `);


        res.status(200).json({

            success: true,

            count: appointments.length,

            data: appointments

        });

    } catch (error) {

        console.error(
            "Get appointments error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch appointments"
        });

    }

};


// =====================================================
// 7. UPDATE APPOINTMENT STATUS
// =====================================================

const updateAppointmentStatus = async (req, res) => {

    try {

        const appointmentId = req.params.id;

        const { status } = req.body;


        const allowedStatuses = [
            "BOOKED",
            "CONFIRMED",
            "CANCELLED",
            "COMPLETED"
        ];


        if (!allowedStatuses.includes(status)) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid status. Use BOOKED, CONFIRMED, CANCELLED or COMPLETED"

            });

        }


        const [appointments] = await db.query(
            "SELECT id FROM appointments WHERE id = ?",
            [appointmentId]
        );


        if (appointments.length === 0) {

            return res.status(404).json({

                success: false,

                message: "Appointment not found"

            });

        }


        await db.query(`
            UPDATE appointments
            SET status = ?
            WHERE id = ?
        `, [
            status,
            appointmentId
        ]);


        res.status(200).json({

            success: true,

            message:
                "Appointment status updated successfully",

            data: {
                appointmentId: Number(appointmentId),
                status
            }

        });

    } catch (error) {

        console.error(
            "Update appointment status error:",
            error.message
        );

        res.status(500).json({

            success: false,

            message:
                "Failed to update appointment status"

        });

    }

};


// =====================================================
// 8. GET ALL STAFF
// =====================================================

const getAllStaff = async (req, res) => {

    try {

        const [staff] = await db.query(`
            SELECT
                id,
                name,
                email,
                phone,
                specialization,
                bio,
                isActive,
                createdAt,
                updatedAt
            FROM staff
            ORDER BY id DESC
        `);


        res.status(200).json({

            success: true,

            count: staff.length,

            data: staff

        });

    } catch (error) {

        console.error(
            "Get staff error:",
            error.message
        );

        res.status(500).json({

            success: false,

            message: "Failed to fetch staff"

        });

    }

};


// =====================================================
// 9. GET ALL SERVICES
// =====================================================

const getAllServices = async (req, res) => {

    try {

        const [services] = await db.query(`
            SELECT
                id,
                name,
                description,
                duration,
                price,
                isActive,
                createdAt,
                updatedAt
            FROM services
            ORDER BY id DESC
        `);


        res.status(200).json({

            success: true,

            count: services.length,

            data: services

        });

    } catch (error) {

        console.error(
            "Get services error:",
            error.message
        );

        res.status(500).json({

            success: false,

            message: "Failed to fetch services"

        });

    }

};


// =====================================================
// 10. GET ALL REVIEWS
// =====================================================

const getAllReviews = async (req, res) => {

    try {

        const [reviews] = await db.query(`
            SELECT
                r.id,
                r.appointmentId,
                r.customerName,
                r.staffId,
                r.rating,
                r.comment,
                r.staffResponse,
                r.createdAt,
                r.updatedAt,

                st.name AS staffName

            FROM reviews r

            LEFT JOIN staff st
                ON r.staffId = st.id

            ORDER BY r.createdAt DESC
        `);


        res.status(200).json({

            success: true,

            count: reviews.length,

            data: reviews

        });

    } catch (error) {

        console.error(
            "Get reviews error:",
            error.message
        );

        res.status(500).json({

            success: false,

            message: "Failed to fetch reviews"

        });

    }

};


// =====================================================
// 11. UPDATE STAFF RESPONSE
// =====================================================

const updateStaffResponse = async (req, res) => {

    try {

        const reviewId = Number(req.params.id);

        const {
            staffResponse
        } = req.body;


        // Validate review ID

        if (!reviewId) {

            return res.status(400).json({

                success: false,

                message: "Invalid review ID"

            });

        }


        // Validate response

        if (
            !staffResponse ||
            !staffResponse.trim()
        ) {

            return res.status(400).json({

                success: false,

                message: "Staff response is required"

            });

        }


        // Check review exists

        const [reviews] = await db.query(
            `
            SELECT
                id
            FROM reviews
            WHERE id = ?
            `,
            [reviewId]
        );


        if (reviews.length === 0) {

            return res.status(404).json({

                success: false,

                message: "Review not found"

            });

        }


        // Update staff response

        await db.query(
            `
            UPDATE reviews
            SET
                staffResponse = ?
            WHERE id = ?
            `,
            [
                staffResponse.trim(),
                reviewId
            ]
        );


        // Get updated review

        const [updatedReviews] = await db.query(
            `
            SELECT
                r.id,
                r.appointmentId,
                r.customerName,
                r.staffId,
                r.rating,
                r.comment,
                r.staffResponse,
                r.createdAt,
                r.updatedAt,

                st.name AS staffName

            FROM reviews r

            LEFT JOIN staff st
                ON r.staffId = st.id

            WHERE r.id = ?
            `,
            [reviewId]
        );


        return res.status(200).json({

            success: true,

            message:
                "Staff response saved successfully",

            data: updatedReviews[0]

        });

    } catch (error) {

        console.error(
            "Update staff response error:",
            error.message
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to save staff response"

        });

    }

};


// =====================================================
// EXPORTS
// =====================================================

module.exports = {

    getDashboardStats,

    getAllUsers,

    getUserById,

    updateUser,

    deleteUser,

    getAllAppointments,

    updateAppointmentStatus,

    getAllStaff,

    getAllServices,

    getAllReviews,

    updateStaffResponse

};