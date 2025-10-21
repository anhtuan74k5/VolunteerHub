# VolunteerHub - INT3306 Course Project
## Web Application Development - Fall 2025

**"Fueling the passion of volunteers."**

**VolunteerHub** is a Single Page Application (SPA) built to connect, organize, and manage volunteering activities. The system is designed to serve three primary user roles: Volunteers, Event Managers, and Administrators, with clearly defined business logic and permissions.

## 🚀 Key Features

The system is divided into three distinct workflows based on user roles:

### 1. Volunteer
* **Event Discovery:** View, search, and filter the list of available events (by time, category).
* **Event Interaction:** Register for an event and cancel a registration (before the event starts).
* **Personal Tracking:** View a personal history of participated events and their completion status.
* **Community Channel:** Post, comment, and like on a dedicated "wall" for each event (after registration is approved).
* **Notifications:** Receive real-time notifications about registration status (using Web Push API).
* **Dashboard:** Get a quick overview of new events, events with new interactions, and "hot" or trending events.

### 2. Event Manager
* **Event Management (CRUD):** Create, read, update, and delete events managed by them (with input validation using Joi/Yup).
* **Volunteer Management:** Approve or reject volunteer registration requests.
* **Completion Tracking:** Mark a volunteer's participation as "completed" after the event.
* **Reporting:** View a list and details of all participants for a specific event.
* **Community Interaction:** Same permissions as a volunteer on the event's "wall".
* **Dashboard:** See a summary of all events under their management.

### 3. Admin
* **Content Moderation:** Approve or delete events created by Event Managers.
* **User Management:** View all users and lock or unlock their accounts (for both Volunteers and Managers).
* **Data Export:** Export event or volunteer lists to CSV/JSON files.
* **System Dashboard:** View high-level statistics and activity across the entire platform.

## 🛠️ Technology Stack

This project is built as an SPA with a clear separation between the frontend and backend.

* **Frontend:** **React.js**
    * *State Management:* Provider Pattern (Context API)
* **Backend:** **Node.js** & **Express.js**
    * *Design Pattern:* MVC (Model-View-Controller)
* **Database:** **MongoDB**
* **Architecture:** **Single Page Application (SPA)**

## 📦 Getting Started & Setup

The project is split into two main directories: `frontend` and `backend`.

### Backend Setup
1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Install the required dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the `backend` root directory and add the necessary environment variables:
    ```env
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_strong_jwt_secret
    PORT=5000
    
    ## Required for email OTP functionality
    # SMTP_EMAIL=...
    # SMTP_PASS=...
    ```
4.  Start the backend server:
    ```bash
    npm start
    ```

### Frontend Setup
1.  Open a separate terminal and navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2.  Install the required dependencies:
    ```bash
    npm install
    ```
3.  Start the React application:
    ```bash
    npm start
    ```
The application will be available at `http://localhost:3000`, which will connect to the backend server at `http://localhost:5000`.

## 👥 Team Members
* [Nguyễn Trường Nam] - [23021644]
* [Nguyễn Đăng Đạo] - [23021516]
* [Nguyễn Lê Anh Tuấn] - [23021708]
