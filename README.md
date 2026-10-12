# 🏛️ Smart Complaint and Grievance Portal
> **A Java-Based Campus Application** — *“Your Voice Matters…”*  
> **Major Project (3 Credits)** • Full-Stack Architecture

---

## 📁 Project Directory Structure

```text
grievance-portal/
├── backend/                          ← Open in Spring Tools Suite (Eclipse)
│   ├── pom.xml
│   └── src/main/
│       ├── resources/
│       │   └── application.properties
│       └── java/com/campus/grievance/
│           ├── GrievanceApplication.java
│           ├── config/
│           │   ├── SecurityConfig.java
│           │   └── DataSeeder.java
│           ├── model/
│           │   ├── User.java
│           │   ├── Complaint.java
│           │   ├── Role.java
│           │   ├── Category.java
│           │   └── Status.java
│           ├── dto/
│           │   └── Dtos.java
│           ├── repository/
│           │   ├── UserRepository.java
│           │   └── ComplaintRepository.java
│           ├── service/
│           │   ├── CustomUserDetailsService.java
│           │   └── ComplaintService.java
│           ├── controller/
│           │   ├── AuthController.java
│           │   ├── ComplaintController.java
│           │   └── AdminController.java
│           └── exception/
│               └── GlobalExceptionHandler.java
│
└── frontend/                         ← Open in VS Code
    ├── index.html                    (Login, Register & Public Grievance Tracker)
    ├── user-dashboard.html           (Lodge Complaint, Real-Time History & Feedback)
    ├── admin-dashboard.html          (Analytics, Department Dispatch, Status Triage)
    ├── css/
    │   └── style.css
    └── js/
        ├── api.js                    (JWT Client, Fetch wrapper & Toast notifications)
        ├── auth.js                   (Authentication & Role router)
        ├── user.js                   (User complaint actions & Star feedback)
        └── admin.js                  (Admin controls, Filtering & Report printing)
```

---

## ⚡ Quick Start Guide

### 1. Backend Setup in Spring Tool Suite (Eclipse)
1. Open **Spring Tool Suite (STS)** or **Eclipse IDE**.
2. Go to **File** ➡️ **Import...** ➡️ **Maven** ➡️ **Existing Maven Projects**.
3. Browse and select the `grievance-portal/backend` directory.
4. Click **Finish**. Eclipse will automatically resolve dependencies.
5. Right-click on `GrievanceApplication.java` (under `com.campus.grievance`) ➡️ **Run As** ➡️ **Spring Boot App**.
6. The backend server will start on: **`http://localhost:8080`**.
7. *(Optional)* View the in-memory H2 database console at: `http://localhost:8080/h2-console`  
   - JDBC URL: `jdbc:h2:mem:grievancedb`
   - User Name: `sa`
   - Password: *(leave blank)*

---

### 2. Frontend Setup in Visual Studio Code (VS Code)
1. Open **Visual Studio Code**.
2. Go to **File** ➡️ **Open Folder...** ➡️ Select `grievance-portal/frontend`.
3. Open `index.html`.
4. Right-click on `index.html` and select **"Open with Live Server"** (or simply double-click `index.html` in your file explorer).
5. The portal will open in your browser!

---

## 🔑 Pre-Seeded Demo Credentials (Ready for Viva & Demo)

The system automatically seeds demo accounts with sample grievances across all campus categories on startup:

| Role | Email | Password | User Type / Department |
| :--- | :--- | :--- | :--- |
| **System Admin** | `admin@campus.edu` | `admin123` | Dean Administration Office |
| **Student** | `student@campus.edu` | `student123` | B.Tech CSE (3rd Year) |
| **Faculty / Staff** | `staff@campus.edu` | `staff123` | Dept of Mechanical Engineering |

*(Tip: On `index.html`, quick-fill buttons are provided to autofill these credentials with a single click during your demonstration!)*

---

## 🎯 Modules & Features Implemented

### 👤 1. User Module (Students & Staff)
- **Authentication**: Secure registration and login with BCrypt password hashing.
- **Complaint Submission**: Select from 7 campus categories (`Hostel`, `Classroom/Lab`, `Transport`, `Electricity/Water`, `Cleanliness`, `Maintenance`, `Other`), set priority level (`Low`, `Medium`, `High`, `Urgent`), location, and description.
- **Unique Ticket Generation**: Auto-generates standard tracking IDs (e.g., `CMP-2026-10101`).
- **Real-Time Tracking**: Live status pills (`Pending`, `In Progress`, `Resolved`, `Rejected`) with assigned department name.
- **Public Grievance Tracker**: Check complaint progress by ticket ID directly on the homepage without logging in.
- **Resolution Feedback**: Interactive 1–5 star rating system and feedback comments once an issue is marked resolved.

### 🛡️ 2. Admin Module (Administration & Authorities)
- **Central Incident Dashboard**: Real-time KPI statistics (Total, Pending Triage, In Progress, Resolved, and % Resolution Rate).
- **Category Volume Breakdown**: Live counts across all categories to identify recurring campus issues.
- **Department Dispatch**: Assign issues to specialized departments (`Hostel Administration`, `Academic Infrastructure & IT`, `Campus Transport Office`, `Electrical & Plumbing Cell`, `Sanitation & Housekeeping`, `General Maintenance Dept`).
- **Status Updates & Remarks**: Update grievance state and record official progress notes/action details.
- **Search & Multi-Filter**: Filter instantaneously by status, category, complainant name, or ticket ID.
- **Report Printing**: One-click printable grievance summary report for administrative presentations.

---

## 🛠️ Technology Stack
- **Backend Framework**: Spring Boot 3.3.4 (Java 21)
- **Security**: Spring Security 6 with stateless JWT Bearer authentication
- **Persistence**: Spring Data JPA & Hibernate
- **Database**: H2 in-memory (Default zero-config setup) & MySQL ready (`application.properties`)
- **Frontend**: Responsive HTML5, Modern CSS3 (Variables, Flexbox/Grid, Modals, Toasts), Vanilla JavaScript (ES6+ Fetch API)
