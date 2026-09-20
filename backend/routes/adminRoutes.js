const express = require("express");

const router = express.Router();

const adminMiddleware =
    require("../middleware/adminMiddleware");

const {
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
} = require("../controllers/adminController");


// =====================================================
// ADMIN AUTHENTICATION
// =====================================================

router.use(adminMiddleware);


// =====================================================
// DASHBOARD
// =====================================================

router.get(
    "/dashboard",
    getDashboardStats
);


// =====================================================
// USERS
// =====================================================

router.get(
    "/users",
    getAllUsers
);

router.get(
    "/users/:id",
    getUserById
);

router.put(
    "/users/:id",
    updateUser
);

router.delete(
    "/users/:id",
    deleteUser
);


// =====================================================
// APPOINTMENTS
// =====================================================

router.get(
    "/appointments",
    getAllAppointments
);

router.put(
    "/appointments/:id/status",
    updateAppointmentStatus
);


// =====================================================
// STAFF
// =====================================================

router.get(
    "/staff",
    getAllStaff
);


// =====================================================
// SERVICES
// =====================================================

router.get(
    "/services",
    getAllServices
);


// =====================================================
// REVIEWS
// =====================================================

router.get(
    "/reviews",
    getAllReviews
);


// =====================================================
// STAFF RESPONSE
// =====================================================

router.put(
    "/reviews/:id/response",
    updateStaffResponse
);


module.exports = router;