# Velora Salon & Beauty

Velora Salon & Beauty is a full-stack salon appointment booking system that allows customers to explore salon services, check staff availability, book appointments, make online payments, and manage their bookings.

The project also includes an admin dashboard for managing users, services, staff, appointments, and reviews.

## Live Project

🌐 **Live Website:**
https://velora-salon-mgin.onrender.com

🎥 **Demo Video:**
https://youtu.be/BAQYdAtBE8w

💻 **GitHub Repository:**
https://github.com/Dheerajpw/salon-appointment-booking-system

**Backend API:**
https://velora-salon-api.onrender.com

---

## Problem

Managing salon appointments manually can lead to problems such as:

* Double booking
* Difficulty managing staff availability
* Manual appointment tracking
* No centralized customer information
* Difficulty managing salon services and staff

## Solution

Velora Salon & Beauty provides an online system where customers can:

* View salon services
* View available staff
* Register and login
* Book appointments
* Make online payments
* View their appointments
* Manage their bookings

Admins can manage the salon through a separate admin dashboard.

---

## Features

### Customer Features

* User registration and login
* JWT-based authentication
* Browse salon services
* View staff members
* Book appointments
* Check available time slots
* Prevent double booking
* View appointment history
* Cancel appointments
* Online payment integration
* Appointment status tracking
* Appointment reminder emails
* Customer reviews

### Admin Features

* Admin authentication and authorization
* Admin dashboard
* View dashboard statistics
* Manage users
* Manage customer roles
* Manage services
* Manage staff
* Manage appointments
* View reviews
* Monitor booking activity



## Appointment Booking Logic

The appointment booking system performs several validations before creating a booking.

The backend checks:

1. Whether the selected service exists and is active.
2. Whether the selected staff member exists and is active.
3. Whether the staff member provides the selected service.
4. Whether the staff member is available on the selected day.
5. Whether the selected time falls within the staff availability.
6. Whether another booking already exists for the same staff member, date, and time.

This helps prevent duplicate or overlapping appointments.

---

## Authentication

The application uses JWT-based authentication.

During login:

1. User credentials are verified.
2. Passwords are checked using bcrypt.
3. A JWT token is generated.
4. The token contains the user's ID, email, and role.
5. Protected routes verify the token before allowing access.

Passwords are not stored as plain text.


## Role-Based Authorization

The application supports different user roles.

### CUSTOMER

Customers can:

* Manage their account
* Book appointments
* View appointments
* Make payments
* Submit reviews

### ADMIN

Admins can access administrative functionality such as:

* User management
* Service management
* Staff management
* Appointment management
* Dashboard statistics

Admin routes are protected using role-based middleware.

---

## Payment Integration

The project includes online payment integration for appointment payments.

The payment flow is:

```text
Customer
   ↓
Create Appointment
   ↓
Create Payment Order
   ↓
Open Payment Gateway
   ↓
Complete Payment
   ↓
Verify Payment
   ↓
Update Payment Status
```

Payment verification is handled on the backend before updating the payment status.

---

## Appointment Reminder System

The backend includes an automated appointment reminder system.

A scheduled cron job checks for upcoming appointments and sends reminder emails to customers.

The system also tracks whether a reminder has already been sent to avoid sending duplicate reminders.

---

## Technology Used

### Frontend

* HTML5
* CSS3
* JavaScript
* Responsive Design

### Backend

* Node.js
* Express.js
* REST APIs
* JWT
* bcrypt
* Cron Jobs

### Database

* MySQL

### Payment

* Online Payment Gateway Integration

### Email

* Gmail API
* Appointment Reminder Emails

### Deployment

* AWS EC2
* PM2
* Netlify

### Development Tools

* VS Code
* Postman
* Git
* GitHub

---

## Project Structure

```text
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
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── css/
│   │   └── style.css
│   │
│   ├── images/
│   │   ├── hero.jpg
│   │   ├── haircut.jpg
│   │   ├── facial.jpg
│   │   ├── manicure.jpg
│   │   ├── pedicure.jpg
│   │   └── hair-styling.jpg
│   │
│   ├── js/
│   │   └── script.js
│   │
│   └── index.html
│
├── .gitignore
└── README.md
```

---

## Database

The application uses MySQL as the primary database.

The database contains data related to:

* Users
* Services
* Staff
* Staff services
* Appointments
* Reviews
* Availability
* Payments

Relationships between tables are used to connect customers, appointments, services, and staff members.

---

## API Modules

The backend is organized into separate route modules for different features.

Main API modules include:

* Authentication
* Services
* Staff
* Availability
* Appointments
* Payments
* Reviews
* Admin

The backend follows a controller and route based structure to keep the application organized.

---

## Running the Project Locally

### 1. Clone the repository

```bash
git clone https://github.com/Dheerajpw/salon-appointment-booking-system.git
```

### 2. Go to the project

```bash
cd salon-appointment-booking-system
```

### 3. Install backend dependencies

```bash
cd backend
npm install
```

### 4. Configure environment variables

Create a `.env` file inside the backend folder.

Example:

```env
PORT=5000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=salon_booking
DB_PORT=3306

JWT_SECRET=your_jwt_secret

RAZORPAY_KEY_ID=your_key
RAZORPAY_KEY_SECRET=your_secret
```

Use your own credentials for local development.

### 5. Start the backend

```bash
node server.js
```

The backend will run on:

```text
http://localhost:5000
```

### 6. Run the frontend

Open:

```text
frontend/index.html
```

in a browser, or use a local development server such as VS Code Live Server.

---

## Live Backend

The backend is deployed on an AWS EC2 instance.

Live API:

```text
http://51.20.70.161:5000
```

The root endpoint returns:

```json
{
  "success": true,
  "message": "Salon Appointment Booking API is running"
}
```

---

## Deployment

The backend is deployed on an AWS EC2 instance and managed using PM2.

The frontend is deployed using Netlify.

```text
Frontend
    ↓
Netlify
    ↓
Node.js / Express Backend
    ↓
AWS EC2
    ↓
MySQL Database
```

---

## Limitations

Some features depend on external services and environment configuration.

For example:

* Payment gateway credentials are required for payment processing.
* Gmail API credentials are required for reminder emails.
* MySQL configuration is required for local backend setup.
* Environment variables must be configured before running the backend locally.

---

## Possible Future Improvements

Some improvements that can be added in the future include:

* Salon owner notifications
* WhatsApp appointment notifications
* Advanced appointment calendar
* Multiple salon branches
* Staff leave management
* Customer profile management
* Better analytics and reporting
* Automated deployment using CI/CD
* More advanced search and filtering

---

## What I Learned

While building this project, I worked with:

* Node.js and Express.js
* REST API development
* MySQL database design
* Authentication using JWT
* Password hashing using bcrypt
* Middleware and role-based authorization
* Appointment availability logic
* Payment integration
* Email automation
* Cron jobs
* AWS EC2 deployment
* PM2 process management
* Git and GitHub
* Frontend and backend integration

This project helped me understand how different parts of a full-stack application work together to solve a real-world problem.

---

## Author

**Dheeraj Kumar**

GitHub:
https://github.com/Dheerajpw

LinkedIn:
https://linkedin.com/in/dheeraj-kumar-8104342bb

---

## Project Links

🌐 **Live Website:**
https://timely-starship-a0cc85.netlify.app/

🎥 **Demo Video:**
https://youtu.be/BAQYdAtBE8w

💻 **GitHub Repository:**
https://github.com/Dheerajpw/salon-appointment-booking-system
