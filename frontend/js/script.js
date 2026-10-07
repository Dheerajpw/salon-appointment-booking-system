// =====================================================
// VELORA SALON & BEAUTY
// FRONTEND JAVASCRIPT
// =====================================================

// =====================================================
// CONFIGURATION
// =====================================================
const API_URL = "https://velora-salon-api.onrender.com";

const RAZORPAY_KEY_ID = "rzp_test_TdqP8FGS6OOGgV";

let pendingServiceId = null;


// =====================================================
// LOCAL STORAGE HELPERS
// =====================================================

function getToken() {
    return localStorage.getItem("token");
}


function getUser() {

    try {

        return JSON.parse(
            localStorage.getItem("user")
        );

    } catch (error) {

        return null;
    }
}


function getTokenPayload() {

    const token = getToken();

    if (!token) {
        return null;
    }

    try {

        const payload = token.split(".")[1];

        return JSON.parse(
            atob(
                payload
                    .replace(/-/g, "+")
                    .replace(/_/g, "/")
            )
        );

    } catch (error) {

        console.error(
            "Invalid token:",
            error
        );

        return null;
    }
}


// =====================================================
// MOBILE MENU
// =====================================================

function toggleMobileMenu() {

    const navLinks =
        document.querySelector(".nav-links");

    if (navLinks) {

        navLinks.classList.toggle(
            "mobile-open"
        );
    }
}


function closeMobileMenu() {

    const navLinks =
        document.querySelector(".nav-links");

    if (navLinks) {

        navLinks.classList.remove(
            "mobile-open"
        );
    }
}


// =====================================================
// PAGE NAVIGATION
// =====================================================

function showPage(pageId) {

    const pages =
        document.querySelectorAll(".page");

    pages.forEach(page => {

        page.style.display = "none";
    });


    const selectedPage =
        document.getElementById(pageId);


    if (selectedPage) {

        selectedPage.style.display = "block";

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }


    closeMobileMenu();


    // ---------------------------------------------
    // PAGE-SPECIFIC LOADERS
    // ---------------------------------------------

    if (pageId === "services") {
        loadServices();
    }


    if (pageId === "staff") {
        loadStaff();
    }


    if (pageId === "booking") {

        if (!getToken()) {

            showMessage(
                "Please login before booking an appointment.",
                "error"
            );

            showPage("login");

            return;
        }

        loadBookingData();
    }


    if (pageId === "appointments") {

        if (!getToken()) {

            showMessage(
                "Please login first.",
                "error"
            );

            showPage("login");

            return;
        }

        loadAppointments();
    }


    if (pageId === "profile") {

        if (!getToken()) {

            showMessage(
                "Please login first.",
                "error"
            );

            showPage("login");

            return;
        }

        loadProfile();
    }


    if (pageId === "reviews") {

        if (!getToken()) {

            showMessage(
                "Please login first.",
                "error"
            );

            showPage("login");

            return;
        }

        loadMyReviews();
    }


    if (pageId === "admin") {

        if (!getToken()) {

            showMessage(
                "Please login first.",
                "error"
            );

            showPage("login");

            return;
        }

        loadAdminDashboard();
    }
}


// =====================================================
// MESSAGE SYSTEM
// =====================================================

function showMessage(
    message,
    type = "success"
) {

    const messageBox =
        document.getElementById("message");


    if (!messageBox) {

        alert(message);

        return;
    }


    messageBox.textContent = message;

    messageBox.className =
        `message show ${type}`;


    setTimeout(() => {

        messageBox.classList.remove("show");

    }, 4000);
}


// =====================================================
// AUTH HEADERS
// =====================================================

function getAuthHeaders() {

    const token = getToken();


    return {

        "Content-Type":
            "application/json",

        ...(token
            ? {
                "Authorization":
                    `Bearer ${token}`
            }
            : {})
    };
}


// =====================================================
// SERVICE IMAGE MAPPING
// =====================================================

function getServiceImage(serviceName) {

    const name =
        String(serviceName || "").toLowerCase().trim();


    // Hair Cut
    if (
        name.includes("hair") &&
        name.includes("cut")
    ) {

        return "./images/haircut.jpg";
    }


    // Facial / Skin
    if (
        name.includes("facial") ||
        name.includes("skin")
    ) {

        return "./images/facial.jpg";
    }


    // Manicure / Nails
    if (
        name.includes("manicure") ||
        name.includes("nail")
    ) {

        return "./images/manicure.jpg";
    }


    // Pedicure / Feet
    if (
        name.includes("pedicure") ||
        name.includes("foot")
    ) {

        return "./images/pedicure.jpg";
    }


    // Hair Styling / Blow Dry
    if (
        name.includes("hair styling") ||
        name.includes("hair style") ||
        name.includes("styling") ||
        name.includes("blow")
    ) {

        return "./images/hair-styling.jpg";
    }


    // Default image
    return "./images/hero.jpg";
}


// =====================================================
// SERVICES
// =====================================================

async function loadServices() {

    try {

        const response =
            await fetch(
                `${API_URL}/api/services`
            );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Failed to load services"
            );
        }


        const services =
            result.data || [];


        const servicesContainer =
            document.getElementById(
                "servicesContainer"
            );


        const serviceSelect =
            document.getElementById(
                "serviceSelect"
            );


        // ---------------------------------------------
        // SERVICES CARDS
        // ---------------------------------------------

        if (servicesContainer) {

            if (services.length === 0) {

                servicesContainer.innerHTML =
                    `
                    <p class="empty-state">
                        No services available.
                    </p>
                    `;

            } else {

                servicesContainer.innerHTML =
                    services.map(service => {

                        const serviceImage =
                            getServiceImage(
                                service.name
                            );


                        return `

                            <div class="card service-card">

                                <div class="service-card-image-wrapper">

                                    <img
                                        src="${serviceImage}"
                                        alt="${escapeHtml(
                                            service.name
                                        )}"
                                        class="service-card-image"
                                        loading="lazy"
                                    >

                                </div>


                                <div class="service-card-content">

                                    <div class="service-icon">
                                        ✨
                                    </div>


                                    <h3>
                                        ${escapeHtml(
                                            service.name
                                        )}
                                    </h3>


                                    <p>
                                        Duration:
                                        ${service.duration}
                                        minutes
                                    </p>


                                    <h4>
                                        ₹${service.price}
                                    </h4>


                                    <button
                                        class="btn btn-primary"
                                        onclick="selectService(${service.id})"
                                    >
                                        Book Now
                                    </button>

                                </div>

                            </div>

                        `;

                    }).join("");
            }
        }


        // ---------------------------------------------
        // SERVICE DROPDOWN
        // ---------------------------------------------

        if (serviceSelect) {

            serviceSelect.innerHTML =
                `
                <option value="">
                    Select Service
                </option>
                `;


            services.forEach(service => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    service.id;


                option.textContent =
                    `${service.name} - ₹${service.price}`;


                serviceSelect.appendChild(
                    option
                );
            });


            if (pendingServiceId) {

                serviceSelect.value =
                    pendingServiceId;

                pendingServiceId = null;
            }
        }

    } catch (error) {

        console.error(
            "Load services error:",
            error
        );


        const container =
            document.getElementById(
                "servicesContainer"
            );


        if (container) {

            container.innerHTML =
                `
                <p class="empty-state">
                    Unable to load services.
                </p>
                `;
        }
    }
}


// =====================================================
// SELECT SERVICE
// =====================================================

function selectService(serviceId) {

    pendingServiceId =
        serviceId;


    const token =
        getToken();


    if (!token) {

        showMessage(
            "Please login before booking an appointment.",
            "error"
        );

        showPage("login");

        return;
    }


    showPage("booking");
}


// =====================================================
// STAFF
// =====================================================

async function loadStaff() {

    try {

        const response =
            await fetch(
                `${API_URL}/api/staff`
            );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Failed to load staff"
            );
        }


        const staff =
            result.data || [];


        const staffContainer =
            document.getElementById(
                "staffContainer"
            );


        const staffSelect =
            document.getElementById(
                "staffSelect"
            );


        // ---------------------------------------------
        // STAFF CARDS
        // ---------------------------------------------

        if (staffContainer) {

            if (staff.length === 0) {

                staffContainer.innerHTML =
                    `
                    <p class="empty-state">
                        No staff available.
                    </p>
                    `;

            } else {

                staffContainer.innerHTML =
                    staff.map(member => `

                        <div class="card staff-card">

                            <div class="staff-avatar">

                                ${escapeHtml(
                                    (
                                        member.name ||
                                        "S"
                                    )
                                        .charAt(0)
                                        .toUpperCase()
                                )}

                            </div>

                            <h3>
                                ${escapeHtml(
                                    member.name
                                )}
                            </h3>

                            <p>
                                ${escapeHtml(
                                    member.specialization ||
                                    member.serviceType ||
                                    "Beauty Specialist"
                                )}
                            </p>

                        </div>

                    `).join("");
            }
        }


        // ---------------------------------------------
        // STAFF DROPDOWN
        // ---------------------------------------------

        if (staffSelect) {

            staffSelect.innerHTML =
                `
                <option value="">
                    Select Staff
                </option>
                `;


            staff.forEach(member => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    member.id;


                option.textContent =
                    member.name;


                staffSelect.appendChild(
                    option
                );
            });
        }

    } catch (error) {

        console.error(
            "Load staff error:",
            error
        );


        const container =
            document.getElementById(
                "staffContainer"
            );


        if (container) {

            container.innerHTML =
                `
                <p class="empty-state">
                    Unable to load staff.
                </p>
                `;
        }
    }
}


// =====================================================
// BOOKING DATA
// =====================================================

async function loadBookingData() {

    await Promise.all([
        loadServices(),
        loadStaff()
    ]);


    const user =
        getUser();


    if (user) {

        const customerName =
            document.getElementById(
                "customerName"
            );


        const customerEmail =
            document.getElementById(
                "customerEmail"
            );


        const customerPhone =
            document.getElementById(
                "customerPhone"
            );


        if (customerName) {

            customerName.value =
                user.name || "";
        }


        if (customerEmail) {

            customerEmail.value =
                user.email || "";
        }


        if (customerPhone) {

            customerPhone.value =
                user.phone || "";
        }
    }


    // ---------------------------------------------
    // MINIMUM DATE = TODAY
    // ---------------------------------------------

    const dateInput =
        document.getElementById(
            "appointmentDate"
        );


    if (dateInput) {

        const today =
            new Date()
                .toISOString()
                .split("T")[0];


        dateInput.min =
            today;
    }
}


// =====================================================
// REGISTER
// =====================================================

async function registerUser(event) {

    if (event) {

        event.preventDefault();
    }


    const name =
        document.getElementById(
            "registerName"
        )?.value.trim();


    const email =
        document.getElementById(
            "registerEmail"
        )?.value.trim();


    const phone =
        document.getElementById(
            "registerPhone"
        )?.value.trim();


    const password =
        document.getElementById(
            "registerPassword"
        )?.value;


    if (
        !name ||
        !email ||
        !password
    ) {

        showMessage(
            "Name, email and password are required.",
            "error"
        );

        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/api/auth/register`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        name,

                        email,

                        phone,

                        password
                    })
                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Registration failed"
            );
        }


        showMessage(
            "Registration successful. Please login.",
            "success"
        );


        const form =
            document.getElementById(
                "registerForm"
            );


        if (form) {

            form.reset();
        }


        setTimeout(() => {

            showPage("login");

        }, 1000);

    } catch (error) {

        console.error(
            "Registration error:",
            error
        );


        showMessage(
            error.message ||
            "Registration failed.",
            "error"
        );
    }
}


// =====================================================
// LOGIN
// =====================================================

async function loginUser(event) {

    if (event) {

        event.preventDefault();
    }


    const email =
        document.getElementById(
            "loginEmail"
        )?.value.trim();


    const password =
        document.getElementById(
            "loginPassword"
        )?.value;


    if (
        !email ||
        !password
    ) {

        showMessage(
            "Email and password are required.",
            "error"
        );

        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/api/auth/login`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        email,

                        password
                    })
                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Login failed"
            );
        }


        const token =
            result.token ||
            result.data?.token;


        const user =
            result.user ||
            result.data;


        if (!token) {

            throw new Error(
                "Login successful but token was not received."
            );
        }


        localStorage.setItem(
            "token",
            token
        );


        if (user) {

            localStorage.setItem(
                "user",
                JSON.stringify(user)
            );
        }


        showMessage(
            "Login successful!",
            "success"
        );


        updateAdminButton();


        const form =
            document.getElementById(
                "loginForm"
            );


        if (form) {

            form.reset();
        }

setTimeout(() => {

    const loggedInUser =
        getUser();

    if (
        loggedInUser &&
        loggedInUser.role === "ADMIN"
    ) {
        showPage("admin");
    } else {
        showPage("home");
    }

}, 700);

    } catch (error) {

        console.error(
            "Login error:",
            error
        );


        showMessage(
            error.message ||
            "Login failed.",
            "error"
        );
    }
}


// =====================================================
// PROFILE
// =====================================================

function loadProfile() {

    const user =
        getUser();


    if (!user) {

        showMessage(
            "Please login first.",
            "error"
        );

        showPage("login");

        return;
    }


    const displayName =
        document.getElementById(
            "profileDisplayName"
        );


    const name =
        document.getElementById(
            "profileName"
        );


    const email =
        document.getElementById(
            "profileEmail"
        );


    const phone =
        document.getElementById(
            "profilePhone"
        );


    if (displayName) {

        displayName.textContent =
            user.name || "User";
    }


    if (name) {

        name.value =
            user.name || "";
    }


    if (email) {

        email.value =
            user.email || "";
    }


    if (phone) {

        phone.value =
            user.phone || "";
    }
}


// =====================================================
// UPDATE PROFILE
// =====================================================

async function updateProfile(event) {

    if (event) {

        event.preventDefault();
    }


    const token =
        getToken();


    if (!token) {

        showMessage(
            "Please login first.",
            "error"
        );

        showPage("login");

        return;
    }


    const name =
        document.getElementById(
            "profileName"
        )?.value.trim();


    const phone =
        document.getElementById(
            "profilePhone"
        )?.value.trim();


    if (!name) {

        showMessage(
            "Name is required.",
            "error"
        );

        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/api/auth/profile`,
                {
                    method: "PUT",

                    headers:
                        getAuthHeaders(),

                    body: JSON.stringify({

                        name,

                        phone
                    })
                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Profile update failed"
            );
        }


        const currentUser =
            getUser() || {};


        const updatedUser = {

            ...currentUser,

            name,

            phone
        };


        localStorage.setItem(
            "user",
            JSON.stringify(updatedUser)
        );


        loadProfile();


        showMessage(
            "Profile updated successfully.",
            "success"
        );

    } catch (error) {

        console.error(
            "Update profile error:",
            error
        );


        showMessage(
            error.message ||
            "Profile update failed.",
            "error"
        );
    }
}


// =====================================================
// CREATE APPOINTMENT
// =====================================================

async function bookAppointment(event) {

    if (event) {

        event.preventDefault();
    }


    const token =
        getToken();


    if (!token) {

        showMessage(
            "Please login first.",
            "error"
        );

        showPage("login");

        return;
    }


    const customerName =
        document.getElementById(
            "customerName"
        )?.value.trim();


    const customerEmail =
        document.getElementById(
            "customerEmail"
        )?.value.trim();


    const customerPhone =
        document.getElementById(
            "customerPhone"
        )?.value.trim();


    const serviceId =
        document.getElementById(
            "serviceSelect"
        )?.value;


    const staffId =
        document.getElementById(
            "staffSelect"
        )?.value;


    const appointmentDate =
        document.getElementById(
            "appointmentDate"
        )?.value;


    const startTime =
        document.getElementById(
            "startTime"
        )?.value;


    const appointmentNotes =
        document.getElementById(
            "appointmentNotes"
        )?.value.trim();


    if (
        !customerName ||
        !customerEmail ||
        !customerPhone ||
        !serviceId ||
        !staffId ||
        !appointmentDate ||
        !startTime
    ) {

        showMessage(
            "Please fill all required booking fields.",
            "error"
        );

        return;
    }


    try {

        // ---------------------------------------------
        // FIND SERVICE DURATION
        // ---------------------------------------------

        const serviceResponse =
            await fetch(
                `${API_URL}/api/services`
            );


        const serviceResult =
            await serviceResponse.json();


        const services =
            serviceResult.data || [];


        const selectedService =
            services.find(
                service =>
                    Number(service.id) ===
                    Number(serviceId)
            );


        if (!selectedService) {

            throw new Error(
                "Selected service not found."
            );
        }


        const duration =
            Number(
                selectedService.duration
            );


        // ---------------------------------------------
        // CALCULATE END TIME
        // ---------------------------------------------

        const [hours, minutes] =
            startTime
                .split(":")
                .map(Number);


        const startDate =
            new Date();


        startDate.setHours(
            hours,
            minutes,
            0,
            0
        );


        const endDate =
            new Date(
                startDate.getTime() +
                duration * 60000
            );


        const endHours =
            String(
                endDate.getHours()
            ).padStart(2, "0");


        const endMinutes =
            String(
                endDate.getMinutes()
            ).padStart(2, "0");


        const endTime =
            `${endHours}:${endMinutes}`;


        // ---------------------------------------------
        // CREATE APPOINTMENT
        // ---------------------------------------------

        const response =
            await fetch(
                `${API_URL}/api/appointments`,
                {
                    method: "POST",

                    headers:
                        getAuthHeaders(),

                    body: JSON.stringify({

                        customerName,

                        customerEmail,

                        customerPhone,

                        serviceId:
                            Number(serviceId),

                        staffId:
                            Number(staffId),

                        appointmentDate,

                        startTime,

                        endTime,

                        notes:
                            appointmentNotes ||
                            null
                    })
                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Booking failed"
            );
        }


        showMessage(
            "Appointment booked successfully!",
            "success"
        );


        const form =
            document.getElementById(
                "bookingForm"
            );


        if (form) {

            form.reset();
        }


        setTimeout(() => {

            showPage("appointments");

        }, 800);

    } catch (error) {

        console.error(
            "Booking error:",
            error
        );


        showMessage(
            error.message ||
            "Unable to book appointment.",
            "error"
        );
    }
}


// =====================================================
// LOAD APPOINTMENTS
// =====================================================

async function loadAppointments() {

    const token =
        getToken();


    if (!token) {

        showMessage(
            "Please login first.",
            "error"
        );

        showPage("login");

        return;
    }


    const container =
        document.getElementById(
            "appointmentsContainer"
        );


    if (!container) {

        return;
    }


    container.innerHTML =
        `
        <div class="loading">
            Loading appointments...
        </div>
        `;


    try {

        const response =
            await fetch(
                `${API_URL}/api/appointments`,
                {
                    headers:
                        getAuthHeaders()
                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Failed to load appointments"
            );
        }


        const appointments =
            result.data || [];


        if (
            appointments.length === 0
        ) {

            container.innerHTML =
                `
                <div class="empty-state">

                    <h3>
                        No appointments yet
                    </h3>

                    <p>
                        Book your first salon appointment.
                    </p>

                </div>
                `;

            return;
        }


        container.innerHTML = "";


        for (
            const appointment
            of appointments
        ) {

            let isPaid = false;


            // -----------------------------------------
            // PAYMENT STATUS
            // -----------------------------------------

            try {

                const paymentResponse =
                    await fetch(
                        `${API_URL}/api/payments/appointment/${appointment.id}`,
                        {
                            headers:
                                getAuthHeaders()
                        }
                    );


                const paymentResult =
                    await paymentResponse.json();


                if (
                    paymentResponse.ok &&
                    paymentResult.data &&
                    paymentResult.data.length > 0
                ) {

                    const payment =
                        paymentResult.data[0];


                    isPaid =
                        payment.status ===
                        "PAID";
                }

            } catch (paymentError) {

                console.error(
                    "Payment status error:",
                    paymentError
                );
            }


            // -----------------------------------------
            // APPOINTMENT CARD
            // -----------------------------------------

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "card appointment-card";


            const statusClass =
                String(
                    appointment.status || ""
                ).toLowerCase();


            let actionButtons =
                "";


            if (
                appointment.status ===
                    "BOOKED" ||
                appointment.status ===
                    "CONFIRMED"
            ) {

                if (!isPaid) {

                    actionButtons += `

                        <button
                            class="btn btn-primary"
                            onclick="startPayment(
                                ${appointment.id},
                                ${appointment.serviceId}
                            )"
                        >
                            Pay Now
                        </button>

                    `;
                }


                actionButtons += `

                    <button
                        class="btn btn-secondary"
                        onclick="openReschedule(
                            ${appointment.id}
                        )"
                    >
                        Reschedule
                    </button>

                    <button
                        class="btn btn-danger"
                        onclick="cancelAppointment(
                            ${appointment.id}
                        )"
                    >
                        Cancel
                    </button>

                `;
            }


            if (
                appointment.status ===
                "COMPLETED"
            ) {

                actionButtons += `

                    <button
                        class="btn btn-primary"
                        onclick="openReviewForAppointment(
                            ${appointment.id},
                            ${appointment.staffId}
                        )"
                    >
                        Leave Review
                    </button>

                `;
            }


            card.innerHTML = `

                <div class="appointment-header">

                    <h3>
                        ${escapeHtml(
                            appointment.serviceName ||
                            "Salon Service"
                        )}
                    </h3>

                    <span
                        class="status-badge status-${statusClass}"
                    >
                        ${escapeHtml(
                            appointment.status ||
                            ""
                        )}
                    </span>

                </div>


                <div class="appointment-details">

                    <p>
                        <strong>
                            Staff:
                        </strong>

                        ${escapeHtml(
                            appointment.staffName ||
                            "Not assigned"
                        )}
                    </p>


                    <p>
                        <strong>
                            Date:
                        </strong>

                        ${formatDate(
                            appointment.appointmentDate
                        )}
                    </p>


                    <p>
                        <strong>
                            Time:
                        </strong>

                        ${escapeHtml(
                            appointment.startTime ||
                            ""
                        )}

                        -

                        ${escapeHtml(
                            appointment.endTime ||
                            ""
                        )}
                    </p>


                    <p>
                        <strong>
                            Payment:
                        </strong>

                        ${
                            isPaid
                                ? "Paid"
                                : "Pending"
                        }

                    </p>

                </div>


                <div class="appointment-actions">

                    ${actionButtons}

                </div>

            `;


            container.appendChild(
                card
            );
        }

    } catch (error) {

        console.error(
            "Load appointments error:",
            error
        );


        container.innerHTML =
            `
            <div class="empty-state">
                Unable to load appointments.
            </div>
            `;
    }
}


// =====================================================
// RESCHEDULE
// =====================================================

function openReschedule(
    appointmentId
) {

    const input =
        document.getElementById(
            "rescheduleAppointmentId"
        );


    if (input) {

        input.value =
            appointmentId;
    }


    showPage(
        "reschedule"
    );
}


async function rescheduleAppointment(
    event
) {

    if (event) {

        event.preventDefault();
    }


    const appointmentId =
        document.getElementById(
            "rescheduleAppointmentId"
        )?.value;


    const appointmentDate =
        document.getElementById(
            "rescheduleDate"
        )?.value;


    const startTime =
        document.getElementById(
            "rescheduleTime"
        )?.value;


    if (
        !appointmentId ||
        !appointmentDate ||
        !startTime
    ) {

        showMessage(
            "Please fill all reschedule fields.",
            "error"
        );

        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/api/appointments/${appointmentId}/reschedule`,
                {
                    method: "PUT",

                    headers:
                        getAuthHeaders(),

                    body: JSON.stringify({

                        appointmentDate,

                        startTime
                    })
                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Reschedule failed"
            );
        }


        showMessage(
            "Appointment rescheduled successfully.",
            "success"
        );


        const form =
            document.getElementById(
                "rescheduleForm"
            );


        if (form) {

            form.reset();
        }


        setTimeout(() => {

            showPage(
                "appointments"
            );

        }, 700);

    } catch (error) {

        console.error(
            "Reschedule error:",
            error
        );


        showMessage(
            error.message ||
            "Unable to reschedule appointment.",
            "error"
        );
    }
}


// =====================================================
// CANCEL APPOINTMENT
// =====================================================

async function cancelAppointment(
    appointmentId
) {

    if (
        !confirm(
            "Are you sure you want to cancel this appointment?"
        )
    ) {

        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/api/appointments/${appointmentId}/cancel`,
                {
                    method: "PUT",

                    headers:
                        getAuthHeaders()
                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Cancellation failed"
            );
        }


        showMessage(
            "Appointment cancelled successfully.",
            "success"
        );


        loadAppointments();

    } catch (error) {

        console.error(
            "Cancel appointment error:",
            error
        );


        showMessage(
            error.message ||
            "Unable to cancel appointment.",
            "error"
        );
    }
}


// =====================================================
// PAYMENT
// =====================================================

async function startPayment(
    appointmentId,
    serviceId
) {

    const token =
        getToken();


    if (!token) {

        showMessage(
            "Please login first.",
            "error"
        );

        showPage("login");

        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/api/payments/create-order`,
                {
                    method: "POST",

                    headers:
                        getAuthHeaders(),

                    body: JSON.stringify({

                        appointmentId
                    })
                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Unable to create payment order."
            );
        }


        const order =
            result.data;


        if (!order) {

            throw new Error(
                "Payment order was not received."
            );
        }


        const options = {

            key:
                RAZORPAY_KEY_ID,


            amount:
                order.amount,


            currency:
                order.currency ||
                "INR",


            name:
                "VELORA SALON & BEAUTY",


            description:
                "Salon Appointment Payment",


            order_id:
                order.razorpayOrderId,


            handler:
                async function(
                    paymentResponse
                ) {

                    await verifyPayment(
                        appointmentId,
                        paymentResponse
                    );
                },


            prefill: {

                name:
                    getUser()?.name ||
                    "",


                email:
                    getUser()?.email ||
                    "",


                contact:
                    getUser()?.phone ||
                    ""
            },


            theme: {

                color:
                    "#b8894a"
            }
        };


        const razorpay =
            new Razorpay(
                options
            );


        razorpay.open();

    } catch (error) {

        console.error(
            "Payment error:",
            error
        );


        showMessage(
            error.message ||
            "Unable to start payment.",
            "error"
        );
    }
}


// =====================================================
// VERIFY PAYMENT
// =====================================================

async function verifyPayment(
    appointmentId,
    paymentResponse
) {

    try {

        const response =
            await fetch(
                `${API_URL}/api/payments/verify`,
                {
                    method: "POST",

                    headers:
                        getAuthHeaders(),

                    body: JSON.stringify({

                        appointmentId,

                        razorpayOrderId:
                            paymentResponse
                                .razorpay_order_id,

                        razorpayPaymentId:
                            paymentResponse
                                .razorpay_payment_id,

                        razorpaySignature:
                            paymentResponse
                                .razorpay_signature
                    })
                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Payment verification failed."
            );
        }


        showMessage(
            "Payment successful!",
            "success"
        );


        loadAppointments();

    } catch (error) {

        console.error(
            "Payment verification error:",
            error
        );


        showMessage(
            error.message ||
            "Payment verification failed.",
            "error"
        );
    }
}


// =====================================================
// REVIEWS
// =====================================================

function openReviewForAppointment(
    appointmentId,
    staffId
) {

    const appointmentInput =
        document.getElementById(
            "reviewAppointmentId"
        );


    const staffInput =
        document.getElementById(
            "reviewStaffId"
        );


    if (appointmentInput) {

        appointmentInput.value =
            appointmentId;
    }


    if (staffInput) {

        staffInput.value =
            staffId;
    }


    showPage(
        "reviews"
    );
}


async function submitReview(
    event
) {

    if (event) {

        event.preventDefault();
    }


    const appointmentId =
        document.getElementById(
            "reviewAppointmentId"
        )?.value;


    const staffId =
        document.getElementById(
            "reviewStaffId"
        )?.value;


    const rating =
        document.getElementById(
            "reviewRating"
        )?.value;


    const comment =
        document.getElementById(
            "reviewComment"
        )?.value.trim();


    if (
        !appointmentId ||
        !staffId ||
        !rating
    ) {

        showMessage(
            "Appointment ID, Staff ID and rating are required.",
            "error"
        );

        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/api/reviews`,
                {
                    method: "POST",

                    headers:
                        getAuthHeaders(),

                    body: JSON.stringify({

                        appointmentId:
                            Number(
                                appointmentId
                            ),

                        staffId:
                            Number(
                                staffId
                            ),

                        rating:
                            Number(
                                rating
                            ),

                        comment:
                            comment ||
                            null
                    })
                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Review submission failed."
            );
        }


        showMessage(
            "Review submitted successfully!",
            "success"
        );


        const form =
            document.getElementById(
                "reviewForm"
            );


        if (form) {

            form.reset();
        }


        loadMyReviews();

    } catch (error) {

        console.error(
            "Review error:",
            error
        );


        showMessage(
            error.message ||
            "Unable to submit review.",
            "error"
        );
    }
}


// =====================================================
// LOAD MY REVIEWS
// =====================================================

async function loadMyReviews() {

    const container =
        document.getElementById(
            "myReviewsContainer"
        );


    if (!container) {

        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/api/reviews`
            );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Failed to load reviews"
            );
        }


        const reviews =
            result.data || [];


        const user =
            getUser();


        if (!user) {

            container.innerHTML =
                `
                <div class="empty-state">
                    Please login to view your reviews.
                </div>
                `;

            return;
        }


        const myReviews =
            reviews.filter(
                review =>

                    String(
                        review.customerName ||
                        ""
                    ).toLowerCase() ===
                    String(
                        user.name ||
                        ""
                    ).toLowerCase()
            );


        if (
            myReviews.length === 0
        ) {

            container.innerHTML =
                `
                <div class="empty-state">
                    You have not submitted any reviews yet.
                </div>
                `;

            return;
        }


        container.innerHTML =
            myReviews.map(
                review => `

                <div class="card review-card">

                    <div class="review-header">

                        <h3>
                            ${escapeHtml(
                                review.serviceName ||
                                "Salon Service"
                            )}
                        </h3>

                        <span>
                            ${"★".repeat(
                                Number(
                                    review.rating
                                )
                            )}
                        </span>

                    </div>


                    <p>
                        ${escapeHtml(
                            review.comment ||
                            "No comment"
                        )}
                    </p>


                    ${
                        review.staffResponse
                            ? `

                            <div class="staff-response">

                                <strong>
                                    Salon Response:
                                </strong>

                                <p>
                                    ${escapeHtml(
                                        review.staffResponse
                                    )}
                                </p>

                            </div>

                            `
                            : ""
                    }

                </div>

            `
            ).join("");

    } catch (error) {

        console.error(
            "Load reviews error:",
            error
        );


        container.innerHTML =
            `
            <div class="empty-state">
                Unable to load reviews.
            </div>
            `;
    }
}


// =====================================================
// ADMIN BUTTON
// =====================================================

function updateAdminButton() {

    const adminNav =
        document.getElementById(
            "adminNav"
        );


    if (!adminNav) {

        return;
    }


    const payload =
        getTokenPayload();


    if (
        payload &&
        payload.role === "ADMIN"
    ) {

        adminNav.style.display =
            "block";

    } else {

        adminNav.style.display =
            "none";
    }
}


// =====================================================
// OPEN ADMIN DASHBOARD
// =====================================================

function openAdminDashboard() {

    const payload =
        getTokenPayload();


    if (
        !payload ||
        payload.role !== "ADMIN"
    ) {

        showMessage(
            "Admin access required.",
            "error"
        );

        return;
    }


    showPage(
        "admin"
    );
}


// =====================================================
// ADMIN HEADERS
// =====================================================

function getAdminHeaders() {

    const token =
        getToken();


    return {

        "Content-Type":
            "application/json",

        "Authorization":
            `Bearer ${token}`
    };
}


// =====================================================
// ADMIN DASHBOARD
// =====================================================

async function loadAdminDashboard() {

    const payload =
        getTokenPayload();


    if (
        !payload ||
        payload.role !== "ADMIN"
    ) {

        showMessage(
            "Admin access required.",
            "error"
        );

        showPage("home");

        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/api/admin/dashboard`,
                {
                    headers:
                        getAdminHeaders()
                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Failed to load dashboard"
            );
        }


        const stats =
            result.data || {};


        const adminStats =
            document.getElementById(
                "adminStats"
            );


        if (adminStats) {

            adminStats.innerHTML = `

                <div class="stat-card">

                    <h3>
                        ${stats.totalUsers || 0}
                    </h3>

                    <p>
                        Total Users
                    </p>

                </div>


                <div class="stat-card">

                    <h3>
                        ${stats.totalAppointments || 0}
                    </h3>

                    <p>
                        Appointments
                    </p>

                </div>


                <div class="stat-card">

                    <h3>
                        ${stats.totalStaff || 0}
                    </h3>

                    <p>
                        Staff
                    </p>

                </div>


                <div class="stat-card">

                    <h3>
                        ${stats.totalServices || 0}
                    </h3>

                    <p>
                        Services
                    </p>

                </div>


                <div class="stat-card">

                    <h3>
                        ${stats.totalReviews || 0}
                    </h3>

                    <p>
                        Reviews
                    </p>

                </div>

            `;
        }


        await Promise.all([

            loadAdminUsers(),

            loadAdminAppointments(),

            loadAdminStaff(),

            loadAdminServices(),

            loadAdminReviews()

        ]);

    } catch (error) {

        console.error(
            "Admin dashboard error:",
            error
        );


        showMessage(
            error.message ||
            "Unable to load admin dashboard.",
            "error"
        );
    }
}


// =====================================================
// ADMIN USERS
// =====================================================
async function loadAdminUsers() {

    try {

        const response =
            await fetch(
                `${API_URL}/api/admin/users`,
                {
                    headers:
                        getAdminHeaders()
                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Failed to load users"
            );
        }


        const users =
            result.data || [];


        const container =
            document.getElementById(
                "adminUsersTable"
            );


        if (!container) {

            return;
        }


        if (
            users.length === 0
        ) {

            container.innerHTML =
                `
                <tr>
                    <td colspan="5">
                        No users found.
                    </td>
                </tr>
                `;

            return;
        }


        // IMPORTANT:
        // index.html already contains
        // <table> and <tbody>
        // So only table rows are inserted here.

        container.innerHTML =

            users.map(
                user => `

                <tr>

                    <td>
                        ${user.id}
                    </td>

                    <td>
                        ${escapeHtml(
                            user.name || ""
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            user.email || ""
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            user.role || ""
                        )}
                    </td>

                    <td>

                        <button
                            class="btn btn-secondary btn-small"
                            onclick="editAdminUser(
                                ${user.id},
                                '${escapeJs(
                                    user.name || ""
                                )}',
                                '${escapeJs(
                                    user.email || ""
                                )}',
                                '${escapeJs(
                                    user.role ||
                                    "CUSTOMER"
                                )}'
                            )"
                        >
                            Edit
                        </button>


                        <button
                            class="btn btn-danger btn-small"
                            onclick="deleteAdminUser(
                                ${user.id}
                            )"
                        >
                            Delete
                        </button>


                        ${
                            user.role === "CUSTOMER"

                            ?

                            `
                            <button
                                class="btn btn-primary btn-small"
                                onclick="makeUserAdmin(
                                    ${user.id}
                                )"
                            >
                                Make Admin
                            </button>
                            `

                            :

                            `
                            <button
                                class="btn btn-secondary btn-small"
                                onclick="removeUserAdmin(
                                    ${user.id}
                                )"
                            >
                                Remove Admin
                            </button>
                            `
                        }

                    </td>

                </tr>

            `
            ).join("");

    } catch (error) {

        console.error(
            "Admin users error:",
            error
        );
    }
}
async function makeUserAdmin(userId) {

    const confirmed =
        confirm(
            "Are you sure you want to make this user an ADMIN?"
        );

    if (!confirmed) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/api/admin/users/${userId}`,
                {
                    method: "PUT",
                    headers: getAdminHeaders(),
                    body: JSON.stringify({
                        role: "ADMIN"
                    })
                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Failed to make user admin"
            );
        }


        showMessage(
            "User is now an ADMIN.",
            "success"
        );


        await loadAdminUsers();

    } catch (error) {

        console.error(
            "Make admin error:",
            error
        );


        showMessage(
            error.message ||
            "Failed to make user admin.",
            "error"
        );
    }
}


async function removeUserAdmin(userId) {

    const confirmed =
        confirm(
            "Are you sure you want to remove ADMIN access from this user?"
        );

    if (!confirmed) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/api/admin/users/${userId}`,
                {
                    method: "PUT",
                    headers: getAdminHeaders(),
                    body: JSON.stringify({
                        role: "CUSTOMER"
                    })
                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Failed to remove admin access"
            );
        }


        showMessage(
            "Admin access removed.",
            "success"
        );


        await loadAdminUsers();

    } catch (error) {

        console.error(
            "Remove admin error:",
            error
        );


        showMessage(
            error.message ||
            "Failed to remove admin access.",
            "error"
        );
    }
}



// =====================================================
// EDIT ADMIN USER
// =====================================================

function editAdminUser(
    id,
    name,
    email,
    role
) {

    const newName =
        prompt(
            "Enter user name:",
            name
        );


    if (
        newName === null
    ) {

        return;
    }


    const newEmail =
        prompt(
            "Enter user email:",
            email
        );


    if (
        newEmail === null
    ) {

        return;
    }


    const newRole =
        prompt(
            "Enter role (CUSTOMER or ADMIN):",
            role
        );


    if (
        newRole === null
    ) {

        return;
    }


    updateAdminUser(
        id,
        newName.trim(),
        newEmail.trim(),
        newRole.trim()
    );
}


// =====================================================
// UPDATE ADMIN USER
// =====================================================

async function updateAdminUser(
    id,
    name,
    email,
    role
) {

    try {

        const response =
            await fetch(
                `${API_URL}/api/admin/users/${id}`,
                {
                    method: "PUT",

                    headers:
                        getAdminHeaders(),

                    body: JSON.stringify({

                        name,

                        email,

                        role:
                            role.toUpperCase()
                    })
                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.message ||
                "User update failed"
            );
        }


        showMessage(
            "User updated successfully.",
            "success"
        );


        loadAdminUsers();

    } catch (error) {

        console.error(
            "Update admin user error:",
            error
        );


        showMessage(
            error.message ||
            "Unable to update user.",
            "error"
        );
    }
}


// =====================================================
// DELETE ADMIN USER
// =====================================================

async function deleteAdminUser(
    id
) {

    if (
        !confirm(
            "Are you sure you want to delete this user?"
        )
    ) {

        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/api/admin/users/${id}`,
                {
                    method: "DELETE",

                    headers:
                        getAdminHeaders()
                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.message ||
                "User deletion failed"
            );
        }


        showMessage(
            "User deleted successfully.",
            "success"
        );


        loadAdminUsers();

    } catch (error) {

        console.error(
            "Delete user error:",
            error
        );


        showMessage(
            error.message ||
            "Unable to delete user.",
            "error"
        );
    }
}


// =====================================================
// ADMIN APPOINTMENTS
// =====================================================

async function loadAdminAppointments() {

    try {

        const response =
            await fetch(
                `${API_URL}/api/admin/appointments`,
                {
                    headers:
                        getAdminHeaders()
                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Failed to load appointments"
            );
        }


        const appointments =
            result.data || [];


        const container =
            document.getElementById(
                "adminAppointmentsTable"
            );


        if (!container) {

            return;
        }


        if (
            appointments.length === 0
        ) {

            container.innerHTML =
                `
                <tr>
                    <td colspan="8">
                        No appointments found.
                    </td>
                </tr>
                `;

            return;
        }


        container.innerHTML =

            appointments.map(
                appointment => `

                <tr>

                    <td>
                        ${appointment.id}
                    </td>

                    <td>
                        ${escapeHtml(
                            appointment.customerName ||
                            ""
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            appointment.serviceName ||
                            ""
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            appointment.staffName ||
                            ""
                        )}
                    </td>

                    <td>
                        ${formatDate(
                            appointment.appointmentDate
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            appointment.startTime ||
                            ""
                        )}
                        -
                        ${escapeHtml(
                            appointment.endTime ||
                            ""
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            appointment.status ||
                            ""
                        )}
                    </td>

                    <td>

                        <select
                            onchange="updateAdminAppointmentStatus(
                                ${appointment.id},
                                this.value
                            )"
                        >

                            <option value="">
                                Change
                            </option>

                            <option value="BOOKED">
                                BOOKED
                            </option>

                            <option value="CONFIRMED">
                                CONFIRMED
                            </option>

                            <option value="COMPLETED">
                                COMPLETED
                            </option>

                            <option value="CANCELLED">
                                CANCELLED
                            </option>

                        </select>

                    </td>

                </tr>

            `
            ).join("");

    } catch (error) {

        console.error(
            "Admin appointments error:",
            error
        );
    }
}


// =====================================================
// ADMIN APPOINTMENT STATUS
// =====================================================

async function updateAdminAppointmentStatus(
    id,
    status
) {

    if (!status) {

        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/api/admin/appointments/${id}/status`,
                {
                    method: "PUT",

                    headers:
                        getAdminHeaders(),

                    body: JSON.stringify({

                        status
                    })
                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Status update failed"
            );
        }


        showMessage(
            "Appointment status updated.",
            "success"
        );


        loadAdminAppointments();

    } catch (error) {

        console.error(
            "Admin status error:",
            error
        );


        showMessage(
            error.message ||
            "Unable to update appointment status.",
            "error"
        );
    }
}


// =====================================================
// ADMIN STAFF
// =====================================================

async function loadAdminStaff() {

    try {

        const response =
            await fetch(
                `${API_URL}/api/admin/staff`,
                {
                    headers:
                        getAdminHeaders()
                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Failed to load staff"
            );
        }


        const staff =
            result.data || [];


        const container =
            document.getElementById(
                "adminStaffTable"
            );


        if (!container) {

            return;
        }


        if (
            staff.length === 0
        ) {

            container.innerHTML =
                `
                <tr>
                    <td colspan="4">
                        No staff found.
                    </td>
                </tr>
                `;

            return;
        }


        container.innerHTML =

            staff.map(
                member => `

                <tr>

                    <td>
                        ${member.id}
                    </td>

                    <td>
                        ${escapeHtml(
                            member.name || ""
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            member.specialization ||
                            member.serviceType ||
                            ""
                        )}
                    </td>

                    <td>

                        ${
                            Number(
                                member.isActive
                            ) === 1
                                ? "Active"
                                : "Inactive"
                        }

                    </td>

                </tr>

            `
            ).join("");

    } catch (error) {

        console.error(
            "Admin staff error:",
            error
        );
    }
}


// =====================================================
// ADMIN SERVICES
// =====================================================

async function loadAdminServices() {

    try {

        const response =
            await fetch(
                `${API_URL}/api/admin/services`,
                {
                    headers:
                        getAdminHeaders()
                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Failed to load services"
            );
        }


        const services =
            result.data || [];


        const container =
            document.getElementById(
                "adminServicesTable"
            );


        if (!container) {

            return;
        }


        if (
            services.length === 0
        ) {

            container.innerHTML =
                `
                <tr>
                    <td colspan="5">
                        No services found.
                    </td>
                </tr>
                `;

            return;
        }


        container.innerHTML =

            services.map(
                service => `

                <tr>

                    <td>
                        ${service.id}
                    </td>

                    <td>
                        ${escapeHtml(
                            service.name || ""
                        )}
                    </td>

                    <td>
                        ${service.duration}
                        min
                    </td>

                    <td>
                        ₹${service.price}
                    </td>

                    <td>

                        ${
                            Number(
                                service.isActive
                            ) === 1
                                ? "Active"
                                : "Inactive"
                        }

                    </td>

                </tr>

            `
            ).join("");

    } catch (error) {

        console.error(
            "Admin services error:",
            error
        );
    }
}


// =====================================================
// ADMIN REVIEWS
// =====================================================

async function loadAdminReviews() {

    try {

        const response =
            await fetch(
                `${API_URL}/api/admin/reviews`,
                {
                    headers:
                        getAdminHeaders()
                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Failed to load reviews"
            );
        }


        const reviews =
            result.data || [];


        const container =
            document.getElementById(
                "adminReviewsTable"
            );


        if (!container) {

            return;
        }


        if (
            reviews.length === 0
        ) {

            container.innerHTML =
                `
                <tr>
                    <td colspan="7">
                        No reviews found.
                    </td>
                </tr>
                `;

            return;
        }


        container.innerHTML =

            reviews.map(
                review => `

                <tr>

                    <td>
                        ${review.id}
                    </td>

                    <td>
                        ${escapeHtml(
                            review.customerName ||
                            ""
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            review.serviceName ||
                            ""
                        )}
                    </td>

                    <td>
                        ${review.rating}/5
                    </td>

                    <td>
                        ${escapeHtml(
                            review.comment ||
                            ""
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            review.staffResponse ||
                            "No response"
                        )}
                    </td>

                    <td>

                        <button
                            class="btn btn-secondary btn-small"
                            onclick="respondToAdminReview(
                                ${review.id}
                            )"
                        >
                            Respond
                        </button>

                    </td>

                </tr>

            `
            ).join("");

    } catch (error) {

        console.error(
            "Admin reviews error:",
            error
        );
    }
}


// =====================================================
// ADMIN REVIEW RESPONSE
// =====================================================

async function respondToAdminReview(
    reviewId
) {

    const responseText =
        prompt(
            "Enter response:"
        );


    if (
        responseText === null ||
        !responseText.trim()
    ) {

        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/api/admin/reviews/${reviewId}/response`,
                {
                    method: "PUT",

                    headers:
                        getAdminHeaders(),

                    body: JSON.stringify({

                        staffResponse:
                            responseText.trim()
                    })
                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Response update failed"
            );
        }


        showMessage(
            "Review response updated.",
            "success"
        );


        loadAdminReviews();

    } catch (error) {

        console.error(
            "Review response error:",
            error
        );


        showMessage(
            error.message ||
            "Unable to respond to review.",
            "error"
        );
    }
}


// =====================================================
// LOGOUT
// =====================================================

function logout() {

    localStorage.removeItem(
        "token"
    );


    localStorage.removeItem(
        "user"
    );


    updateAdminButton();


    showMessage(
        "Logged out successfully.",
        "success"
    );


    setTimeout(() => {

        showPage("home");

    }, 500);
}


// =====================================================
// FORMAT DATE
// =====================================================

function formatDate(
    dateValue
) {

    if (!dateValue) {

        return "";
    }


    const date =
        new Date(dateValue);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return dateValue;
    }


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",

            month: "short",

            year: "numeric"
        }
    );
}


// =====================================================
// HTML ESCAPE
// =====================================================

function escapeHtml(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";
    }


    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );
}


// =====================================================
// JAVASCRIPT STRING ESCAPE
// =====================================================

function escapeJs(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";
    }


    return String(value)

        .replace(
            /\\/g,
            "\\\\"
        )

        .replace(
            /'/g,
            "\\'"
        )

        .replace(
            /"/g,
            '\\"'
        )

        .replace(
            /\r?\n/g,
            "\\n"
        );
}


// =====================================================
// INITIAL PAGE LOAD
// =====================================================

window.addEventListener(
    "DOMContentLoaded",
    () => {

        updateAdminButton();

        loadServices();

        loadStaff();

        showPage("home");
    }
);