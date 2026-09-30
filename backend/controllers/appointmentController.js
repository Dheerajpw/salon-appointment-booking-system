const db = require("../config/db");


// ========================================
// Create Appointment
// ========================================

const createAppointment = async (req, res) => {
    try {

        const userId = req.user.id;


        // ========================================
        // Get User From Database
        // ========================================

        const [users] = await db.query(
            `SELECT
                id,
                name,
                email,
                phone
             FROM users
             WHERE id = ?`,
            [userId]
        );


        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }


        const user = users[0];


        // ========================================
        // Get Appointment Data
        // ========================================

        const {
            customerPhone,
            serviceId,
            staffId,
            appointmentDate,
            startTime,
            notes
        } = req.body;


        // ========================================
        // Validate Required Fields
        // ========================================

        if (
            !serviceId ||
            !staffId ||
            !appointmentDate ||
            !startTime
        ) {
            return res.status(400).json({
                success: false,
                message: "Required fields are missing"
            });
        }


        // ========================================
        // Check Service
        // ========================================

        const [services] = await db.query(
            `SELECT *
             FROM services
             WHERE id = ?
             AND isActive = TRUE`,
            [serviceId]
        );


        if (services.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Service not found or inactive"
            });
        }


        const service = services[0];


        // ========================================
        // Calculate End Time
        // Based on Service Duration
        // ========================================

        const timeParts = startTime.split(":");

        const hours = Number(timeParts[0]);
        const minutes = Number(timeParts[1]);
        const seconds = Number(timeParts[2] || 0);


        const startDate = new Date();

        startDate.setHours(
            hours,
            minutes,
            seconds,
            0
        );


        const endDate = new Date(
            startDate.getTime() +
            Number(service.duration) * 60 * 1000
        );


        const endHours = String(
            endDate.getHours()
        ).padStart(2, "0");

        const endMinutes = String(
            endDate.getMinutes()
        ).padStart(2, "0");

        const endSeconds = String(
            endDate.getSeconds()
        ).padStart(2, "0");


        const endTime =
            `${endHours}:${endMinutes}:${endSeconds}`;


        // ========================================
        // Validate Time
        // ========================================

        if (startTime >= endTime) {
            return res.status(400).json({
                success: false,
                message: "Invalid appointment time"
            });
        }


        // ========================================
        // Check Staff
        // ========================================

        const [staff] = await db.query(
            `SELECT *
             FROM staff
             WHERE id = ?
             AND isActive = TRUE`,
            [staffId]
        );


        if (staff.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Staff not found or inactive"
            });
        }


        // ========================================
        // Check Staff-Service Assignment
        // ========================================

        const [staffServices] = await db.query(
            `SELECT *
             FROM staff_services
             WHERE staffId = ?
             AND serviceId = ?`,
            [
                staffId,
                serviceId
            ]
        );


        if (staffServices.length === 0) {
            return res.status(400).json({
                success: false,
                message:
                    "This service is not assigned to the selected staff"
            });
        }


        // ========================================
        // Check Salon Availability
        // ========================================

        const dateObject = new Date(
            `${appointmentDate}T00:00:00`
        );


        if (Number.isNaN(dateObject.getTime())) {
            return res.status(400).json({
                success: false,
                message: "Invalid appointment date"
            });
        }


        const days = [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday"
        ];


        const dayOfWeek =
            days[dateObject.getDay()];


        const [availability] = await db.query(
            `SELECT *
             FROM availability
             WHERE dayOfWeek = ?
             AND isAvailable = TRUE
             AND startTime <= ?
             AND endTime >= ?`,
            [
                dayOfWeek,
                startTime,
                endTime
            ]
        );


        if (availability.length === 0) {
            return res.status(400).json({
                success: false,
                message:
                    `Salon is not available on ${dayOfWeek} at the selected time`
            });
        }


        // ========================================
        // Check Double Booking
        // ========================================

        const [overlappingAppointments] =
            await db.query(
                `SELECT id
                 FROM appointments
                 WHERE staffId = ?
                 AND appointmentDate = ?
                 AND status IN ('BOOKED', 'CONFIRMED')
                 AND startTime < ?
                 AND endTime > ?`,
                [
                    staffId,
                    appointmentDate,
                    endTime,
                    startTime
                ]
            );


        if (overlappingAppointments.length > 0) {
            return res.status(409).json({
                success: false,
                message:
                    "Selected time slot is already booked"
            });
        }


        // ========================================
        // Create Appointment
        // ========================================

        const [result] = await db.query(
            `INSERT INTO appointments
            (
                userId,
                customerName,
                customerEmail,
                customerPhone,
                serviceId,
                staffId,
                appointmentDate,
                startTime,
                endTime,
                status,
                notes,
                reminderSent
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'BOOKED', ?, FALSE)`,
            [
                user.id,
                user.name,
                user.email,
                user.phone || customerPhone || null,
                serviceId,
                staffId,
                appointmentDate,
                startTime,
                endTime,
                notes || null
            ]
        );


        // ========================================
        // Get Created Appointment
        // ========================================

        const [appointment] = await db.query(
            `SELECT
                a.*,
                s.name AS serviceName,
                st.name AS staffName
             FROM appointments a
             JOIN services s
                ON a.serviceId = s.id
             JOIN staff st
                ON a.staffId = st.id
             WHERE a.id = ?`,
            [result.insertId]
        );


        // ========================================
        // Success Response
        // ========================================

        return res.status(201).json({
            success: true,
            message: "Appointment booked successfully",
            data: appointment[0]
        });

    } catch (error) {

        console.error(
            "Create appointment error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to create appointment"
        });
    }
};



// ========================================
// Get My Appointments
// ========================================

const getAppointments = async (req, res) => {
    try {

        const userId = req.user.id;


        const [appointments] = await db.query(
            `SELECT
                a.*,
                s.name AS serviceName,
                st.name AS staffName
             FROM appointments a
             JOIN services s
                ON a.serviceId = s.id
             JOIN staff st
                ON a.staffId = st.id
             WHERE a.userId = ?
             ORDER BY
                a.appointmentDate ASC,
                a.startTime ASC`,
            [userId]
        );


        return res.status(200).json({
            success: true,
            count: appointments.length,
            data: appointments
        });

    } catch (error) {

        console.error(
            "Get appointments error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to get appointments"
        });
    }
};



// ========================================
// Get Appointment By ID
// ========================================

const getAppointmentById = async (req, res) => {
    try {

        const appointmentId = req.params.id;
        const userId = req.user.id;


        const [appointments] = await db.query(
            `SELECT
                a.*,
                s.name AS serviceName,
                st.name AS staffName
             FROM appointments a
             JOIN services s
                ON a.serviceId = s.id
             JOIN staff st
                ON a.staffId = st.id
             WHERE a.id = ?
             AND a.userId = ?`,
            [
                appointmentId,
                userId
            ]
        );


        if (appointments.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found"
            });
        }


        return res.status(200).json({
            success: true,
            data: appointments[0]
        });

    } catch (error) {

        console.error(
            "Get appointment error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to get appointment"
        });
    }
};



// ========================================
// Update Appointment Status
// ADMIN ONLY
// ========================================

const updateAppointmentStatus = async (req, res) => {
    try {

        // ========================================
        // Check Admin Role
        // ========================================

        if (req.user.role !== "ADMIN") {
            return res.status(403).json({
                success: false,
                message: "Admin access required"
            });
        }


        const appointmentId = req.params.id;

        const {
            status
        } = req.body;


        const allowedStatuses = [
            "BOOKED",
            "CONFIRMED",
            "CANCELLED",
            "COMPLETED"
        ];


        // ========================================
        // Validate Status
        // ========================================

        if (!status) {
            return res.status(400).json({
                success: false,
                message: "Status is required"
            });
        }


        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid appointment status"
            });
        }


        // ========================================
        // Update Status
        // ========================================

        const [result] = await db.query(
            `UPDATE appointments
             SET status = ?
             WHERE id = ?`,
            [
                status,
                appointmentId
            ]
        );


        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found"
            });
        }


        return res.status(200).json({
            success: true,
            message:
                "Appointment status updated successfully"
        });

    } catch (error) {

        console.error(
            "Update appointment status error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to update appointment status"
        });
    }
};



// ========================================
// Cancel Appointment
// CUSTOMER OWN APPOINTMENT ONLY
// ========================================

const cancelAppointment = async (req, res) => {
    try {

        const appointmentId = req.params.id;
        const userId = req.user.id;


        // ========================================
        // Get ONLY User's Appointment
        // ========================================

        const [appointments] = await db.query(
            `SELECT *
             FROM appointments
             WHERE id = ?
             AND userId = ?`,
            [
                appointmentId,
                userId
            ]
        );


        if (appointments.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found"
            });
        }


        const appointment = appointments[0];


        // ========================================
        // Check Status
        // ========================================

        if (appointment.status === "CANCELLED") {
            return res.status(400).json({
                success: false,
                message: "Appointment is already cancelled"
            });
        }


        if (appointment.status === "COMPLETED") {
            return res.status(400).json({
                success: false,
                message:
                    "Completed appointment cannot be cancelled"
            });
        }


        // ========================================
        // Cancel Appointment
        // ========================================

        await db.query(
            `UPDATE appointments
             SET status = 'CANCELLED'
             WHERE id = ?
             AND userId = ?`,
            [
                appointmentId,
                userId
            ]
        );


        return res.status(200).json({
            success: true,
            message:
                "Appointment cancelled successfully"
        });

    } catch (error) {

        console.error(
            "Cancel appointment error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to cancel appointment"
        });
    }
};



// ========================================
// Reschedule Appointment
// CUSTOMER OWN APPOINTMENT ONLY
// END TIME CALCULATED FROM SERVICE DURATION
// ========================================

const rescheduleAppointment = async (req, res) => {
    try {

        const appointmentId = req.params.id;
        const userId = req.user.id;


        const {
            appointmentDate,
            startTime
        } = req.body;


        // ========================================
        // Validate Required Fields
        // ========================================

        if (
            !appointmentDate ||
            !startTime
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Appointment date and start time are required"
            });
        }


        // ========================================
        // Get ONLY User's Appointment
        // Also Get Service Duration
        // ========================================

        const [appointments] = await db.query(
            `SELECT
                a.*,
                s.duration AS serviceDuration,
                s.name AS serviceName
             FROM appointments a
             JOIN services s
                ON a.serviceId = s.id
             WHERE a.id = ?
             AND a.userId = ?`,
            [
                appointmentId,
                userId
            ]
        );


        if (appointments.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found"
            });
        }


        const appointment = appointments[0];


        // ========================================
        // Check Appointment Status
        // ========================================

        if (
            appointment.status === "CANCELLED" ||
            appointment.status === "COMPLETED"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Cancelled or completed appointment cannot be rescheduled"
            });
        }


        // ========================================
        // Validate Start Time Format
        // ========================================

        const timeParts = startTime.split(":");

        if (
            timeParts.length < 2 ||
            Number.isNaN(Number(timeParts[0])) ||
            Number.isNaN(Number(timeParts[1]))
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid start time"
            });
        }


        const hours = Number(timeParts[0]);
        const minutes = Number(timeParts[1]);
        const seconds = Number(timeParts[2] || 0);


        if (
            hours < 0 ||
            hours > 23 ||
            minutes < 0 ||
            minutes > 59 ||
            seconds < 0 ||
            seconds > 59
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid start time"
            });
        }


        // ========================================
        // Calculate End Time
        // FROM SERVICE DURATION
        // ========================================

        const startDate = new Date();

        startDate.setHours(
            hours,
            minutes,
            seconds,
            0
        );


        const endDate = new Date(
            startDate.getTime() +
            Number(appointment.serviceDuration) *
            60 *
            1000
        );


        // ========================================
        // Prevent Crossing Midnight
        // ========================================

        if (
            endDate.getDate() !==
            startDate.getDate()
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Appointment cannot extend to the next day"
            });
        }


        const endHours = String(
            endDate.getHours()
        ).padStart(2, "0");

        const endMinutes = String(
            endDate.getMinutes()
        ).padStart(2, "0");

        const endSeconds = String(
            endDate.getSeconds()
        ).padStart(2, "0");


        const endTime =
            `${endHours}:${endMinutes}:${endSeconds}`;


        // ========================================
        // Validate Appointment Date
        // ========================================

        const dateObject = new Date(
            `${appointmentDate}T00:00:00`
        );


        if (Number.isNaN(dateObject.getTime())) {
            return res.status(400).json({
                success: false,
                message: "Invalid appointment date"
            });
        }


        // ========================================
        // Get Day Of Week
        // ========================================

        const days = [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday"
        ];


        const dayOfWeek =
            days[dateObject.getDay()];


        // ========================================
        // Check Salon Availability
        // ========================================

        const [availability] = await db.query(
            `SELECT *
             FROM availability
             WHERE dayOfWeek = ?
             AND isAvailable = TRUE
             AND startTime <= ?
             AND endTime >= ?`,
            [
                dayOfWeek,
                startTime,
                endTime
            ]
        );


        if (availability.length === 0) {
            return res.status(400).json({
                success: false,
                message:
                    `Salon is not available on ${dayOfWeek} at the selected time`
            });
        }


        // ========================================
        // Check Double Booking
        // ========================================

        const [overlappingAppointments] =
            await db.query(
                `SELECT id
                 FROM appointments
                 WHERE staffId = ?
                 AND appointmentDate = ?
                 AND id != ?
                 AND status IN ('BOOKED', 'CONFIRMED')
                 AND startTime < ?
                 AND endTime > ?`,
                [
                    appointment.staffId,
                    appointmentDate,
                    appointmentId,
                    endTime,
                    startTime
                ]
            );


        if (overlappingAppointments.length > 0) {
            return res.status(409).json({
                success: false,
                message:
                    "Selected time slot is already booked"
            });
        }


        // ========================================
        // Update Appointment
        // ========================================

        const [result] = await db.query(
            `UPDATE appointments
             SET
                appointmentDate = ?,
                startTime = ?,
                endTime = ?,
                reminderSent = FALSE
             WHERE id = ?
             AND userId = ?`,
            [
                appointmentDate,
                startTime,
                endTime,
                appointmentId,
                userId
            ]
        );


        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message:
                    "Appointment could not be updated"
            });
        }


        // ========================================
        // Get Updated Appointment
        // ========================================

        const [updatedAppointment] =
            await db.query(
                `SELECT
                    a.*,
                    s.name AS serviceName,
                    st.name AS staffName
                 FROM appointments a
                 JOIN services s
                    ON a.serviceId = s.id
                 JOIN staff st
                    ON a.staffId = st.id
                 WHERE a.id = ?
                 AND a.userId = ?`,
                [
                    appointmentId,
                    userId
                ]
            );


        // ========================================
        // Success Response
        // ========================================

        return res.status(200).json({
            success: true,
            message:
                "Appointment rescheduled successfully",
            data: updatedAppointment[0]
        });

    } catch (error) {

        console.error(
            "Reschedule appointment error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to reschedule appointment"
        });
    }
};



// ========================================
// EXPORT
// ========================================

module.exports = {
    createAppointment,
    getAppointments,
    getAppointmentById,
    updateAppointmentStatus,
    cancelAppointment,
    rescheduleAppointment
};