# Project Raseed: Wireframe & Mockup Guide

This document provides a breakdown of the key screens and components to be designed for the Project Raseed application. Use this as a guide for creating low-fidelity wireframes and high-fidelity mockups.

---

## 1. Core UI/UX Principles

*   **Clarity & Simplicity**: The design should be clean and uncluttered. Use a card-based layout to organize information logically.
*   **Efficiency**: The most common user actions (e.g., "Add Receipt") should be prominent and easily accessible from relevant screens.
*   **Accessibility**: Ensure sufficient color contrast, legible typography (Inter), and consider screen reader compatibility for all interactive elements.
*   **Consistency**: Maintain a consistent visual language across all screens by reusing components (buttons, cards, dialogs) and adhering to the defined style guide.
*   **Branding**: Consistently use the app logo and the specified color palette (#5DADE2, #EBF4FA, #488AC2).

---

## 2. Key Screens & Components to Wireframe

### Screen 1: Login Page (`/login`)
*   **Goal**: Provide a simple and secure entry point for the user.
*   **Key Elements**:
    *   App Logo (`WalletLogoIcon`)
    *   App Name ("Project Raseed")
    *   Tagline ("Sign in to continue to your dashboard")
    *   Primary Call-to-Action: "Sign in with Google" Button (must include the Google icon).

### Screen 2: Dashboard (`/`)
*   **Goal**: Give the user an immediate, at-a-glance overview of their financial status for the current month.
*   **Layout**: A main content area featuring a grid of summary cards and charts.
*   **Key Elements**:
    *   **Header**: Page Title ("Dashboard"), primary "Add Receipt" Button.
    *   **Summary Cards (3-column grid)**:
        *   Card 1: **Total Spending (This Month)** - Displays a large, bold currency value (e.g., ₹12,345.67).
        *   Card 2: **Top Category (This Month)** - Displays the category name as a badge and the associated amount.
        *   Card 3: **Savings Goal** - Displays progress (e.g., "₹5,000 / ₹15,000") and a visual progress bar.
    *   **Spending Overview Chart (Large Card)**:
        *   A bar chart visualizing spending over the last 6 months.
        *   Must include X-axis (Months) and Y-axis (Amount).
        *   Should show a tooltip with the exact amount when a user hovers over a bar.
    *   **Recent Transactions List (Card)**:
        *   A simple table or list showing the 5 most recent transactions.
        *   Each item should display: Vendor, Category, and Amount.

### Screen 3: Receipts Page (`/receipts`)
*   **Goal**: Enable users to view, manage, and interact with all their saved receipts.
*   **Layout**: A full-width table to display receipt data clearly.
*   **Key Elements**:
    *   **Header**: Page Title ("Receipts"), "Add Receipt" Button.
    *   **Receipts Table**:
        *   Columns: Vendor, Category, Date, Items (count), Total, and an Actions column.
        *   **Actions Menu (dropdown per row)**: This is critical for interactivity. It should contain options for:
            *   View Details
            *   Read Aloud (with a `Volume2` icon)
            *   Add to Google Wallet (with a `Wallet` icon)
            *   Delete (with a `Trash2` icon, should trigger a confirmation).
    *   **Empty State**: A message ("No receipts found.") should be displayed in the table body if there is no data.

### Screen 4: AI Analysis Page (`/analysis`)
*   **Goal**: Provide a conversational interface for users to ask questions about their spending.
*   **Layout**: A familiar chat interface (like a messaging app).
*   **Key Elements**:
    *   **Header**: Page Title ("Spending Analysis").
    *   **Chat Window**: A scrollable area displaying a sequence of messages.
        *   User messages aligned to the right.
        *   AI (bot) messages aligned to the left, accompanied by an "AI" avatar.
        *   **Special AI Response Card**: For shopping lists, the AI response should be a card containing the store, a list of items, and an "Add to Google Wallet" button.
    *   **Input Area (at the bottom)**:
        *   Text input field with placeholder text.
        *   Microphone button for voice input.
        *   Send button.

### Screen 5 & 6: Warranty (`/warranty`) & Reminders (`/reminders`) Pages
*   **Goal**: Allow users to track warranties and return deadlines.
*   **Layout**: Both pages use a similar table-based layout.
*   **Key Elements**:
    *   **Header**: Page Title (e.g., "Warranty Tracker"), an icon (`ShieldCheck` or `BellRing`), and an "Add" button ("Add Warranty" or "Add Reminder").
    *   **Data Table**:
        *   **Warranty Columns**: Product, Purchase Date, Warranty Ends, Status.
        *   **Reminder Columns**: Product, Purchase Date, Return By, Days Left.
        *   **Status/Days Left**: These should be visually distinct (e.g., using badges or color-coding) to draw attention to items that are expiring or overdue.
        *   **Actions Menu (dropdown per row)**: Must include "Add to Wallet" and "Delete".
    *   **Empty State**: A helpful message when the table is empty.

### Screen 7: Settings Page (`/settings`)
*   **Goal**: Allow the user to configure their account and application preferences.
*   **Layout**: A single column of cards, each dedicated to a settings category.
*   **Key Elements**:
    *   **Profile Card**: Displays the user's name and email (read-only).
    *   **Notifications Card**: Contains labeled toggle switches for different notification types (e.g., "Return Reminders," "Warranty Updates").
    *   **Appearance Card**: A single toggle switch for "Dark Mode".
    *   **Account Card**: A "Sign Out" button.

### Component: Add Receipt/Warranty/Reminder Dialogs (Modals)
*   **Goal**: Provide a user-friendly way to add new data, either manually or with AI assistance.
*   **Key Elements**:
    *   **AI-Assisted (Add Receipt)**:
        1.  **Upload State**: A clear drag-and-drop area or file input.
        2.  **Preview State**: Shows a thumbnail of the uploaded image.
        3.  **Analyzing State**: A loading indicator to show that the AI is working.
        4.  **Result State**: Displays the data extracted by the AI for user confirmation.
    *   **Manual/AI-Assisted (Add Warranty/Reminder)**:
        *   A form with clear labels and appropriate inputs (text field for name, date pickers for dates).
        *   An optional file upload area to let the AI pre-fill the form.
        *   A primary "Save" button and a secondary "Cancel" button.
