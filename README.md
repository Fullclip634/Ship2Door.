# Ship2Door - Logistics Management System

This is the official repository for the **Ship2Door** thesis project. It consists of three main components: a Node.js Backend, a React Admin Panel, and a React Native (Expo) Mobile App.

---

## 🚀 Getting Started

To run the system locally, follow these steps in order.

### 1. Backend Setup (`/ship2door-backend`)
1.  **Dependencies**: Run `npm install`.
2.  **Database**: Install MySQL and create a database named `ship2door`.

3.  **Run**: `npm run dev`.

### 2. Admin Panel Setup (`/ship2door-admin`)
1.  **Dependencies**: Run `npm install`.
2.  **Run**: `npm run dev`.
3.  **Access**: Default local URL is `http://localhost:5173`.

### 3. Mobile App Setup (`/ship2door-mobile`)
1.  **Dependencies**: Run `npm install`.
2.  **Expo Account**: 
    -   You need to be logged into Expo (`npx eas login`).
    -   To test push notifications, the owner of the Expo project must invite you to the organization.
3.  **Run**: `npx expo start`.
4.  **Physical Device**: Use a physical Android/iOS device with the development build installed for full feature support (Push & Google Auth).

---

## 🔔 Push Notifications
The system uses **Expo Push Service** with **FCM (Firebase Cloud Messaging)**.
-   **Server-side**: Handled in `services/notificationService.js`.
-   **Client-side**: Built with `expo-notifications`.
-   **Note**: Push notifications require a physical device and proper credentials in the Expo Dashboard.

---

## 🛠 Features
-   **Admin Dashboard**: Premium Slate UI for tracking trips and bookings.
-   **Google Authentication**: Integrated for seamless customer login.
-   **Real-time Alerts**: Automated push notifications for shipment status updates.
-   **Cargo Tracking**: Real-time status history for every booking.

---
