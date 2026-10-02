# Velora Salon & Beauty

Velora Salon & Beauty is a web-based salon appointment booking system developed as a Node.js capstone project.

The main purpose of this project is to make salon appointment management easier for both customers and salon administrators.

## Problem

In a traditional salon, customers may have to call or visit the salon to:

* Check available services
* Ask about staff availability
* Book an appointment
* Check appointment details

For the salon, managing customers, staff, services and appointments manually can also become difficult.

## Solution

Velora provides an online system where customers can create an account, view services, select staff, check availability and book appointments.

The admin can manage users, services, staff, appointments and reviews from the Admin Dashboard.

---

## Features

### Customer

* Register and login
* JWT-based authentication
* View salon services
* View staff
* Check appointment availability
* Book an appointment
* View appointments
* Cancel/manage appointments
* Make payment
* Submit reviews
* Receive appointment reminders
* Update profile

### Admin

* Admin login
* Admin Dashboard
* View dashboard statistics
* Manage users
* Edit users
* Delete users
* Make a customer an admin
* Remove admin access
* Manage services
* Manage staff
* Manage appointments
* Update appointment status
* Manage customer reviews
* Respond to reviews

---

## Important Business Logic

### Appointment Availability

Before creating an appointment, the backend checks:

* Selected service
* Selected staff
* Appointment date
* Appointment time
* Staff availability

This helps prevent invalid bookings.

### Double Booking Prevention

The backend checks whether the selected staff member already has a `BOOKED` or `CONFIRMED` appointment at the requested time.

If a conflicting appointment exists, the new appointment is rejected.

This prevents two customers from booking the same staff member at the same time.

---

## Authentication

The project uses JWT authentication.

During login:

1. User enters email and password.
2. Backend finds the user in MySQL.
3. Password is checked using bcrypt.
4. A JWT token is generated.
5. The token contains the user's ID, email and role.
6. The frontend stores the token.
7. Protected APIs require the token.

The project has two roles:

* `CUSTOMER`
* `ADMIN`

New users registering through the website are created as customers.

An existing customer can be promoted to admin by an authenticated admin from the Admin Dashboard.

---

## Admin Authorization

Admin APIs are protected using middleware.

The backend verifies the JWT and checks the user's role.

Only users with:


role = ADMIN


can access protected admin APIs.

The frontend hides the Admin Dashboard from normal customers, but the main authorization is handled by the backend.

---

## Payment

The project includes Razorpay payment integration.

The payment flow is handled through the backend so that payment-related verification is not trusted only from the frontend.

---

## Appointment Reminder

The project contains a scheduled appointment reminder job.

It checks relevant appointments and sends reminder emails to customers.

A reminder status is maintained so that an appointment is not unnecessarily processed repeatedly.

---

## Technology Used

### Frontend

* HTML
* CSS
* JavaScript

### Backend

* Node.js
* Express.js
* REST APIs
* JWT
* bcryptjs
* CORS
* dotenv

### Database

* MySQL
* mysql2

### Other

* Razorpay
* Gmail/Email service
* Postman
* Git
* GitHub
* AWS EC2
* PM2

---

## Project Structure


salon-appointment-booking-system/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── jobs/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── script.js
│   ├── images/
│   └── index.html
│
├── README.md
└── .gitignore


---

## Database

The application uses MySQL.

The main tables/entities used by the application include:

* Users
* Services
* Staff
* Appointments
* Reviews
* Payments
* Availability

Appointments are connected with the selected service and staff member.

---

## Running the Project Locally

### 1. Clone the repository


git clone YOUR_GITHUB_REPOSITORY_URL


Then:


cd salon-appointment-booking-system


### 2. Backend

Go to the backend folder:


cd backend


Install
