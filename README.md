# Raseed AI

![Raseed AI Logo](public/logo.png)

**Your intelligent financial companion for managing receipts, warranties, and spending.**

Raseed AI is a modern web application designed to help you effortlessly track your expenses and manage important documents. By leveraging the power of Generative AI, Raseed AI can automatically extract information from your receipts, track warranties, set return reminders, and provide insightful analysis of your spending habits through a conversational interface.

---

## ✨ Key Features

*   **Intelligent Receipt Scanning**: Upload images, PDFs, or even use your camera to scan receipts. The AI extracts the vendor, items, category, and total automatically.
*   **Multi-Language AI Assistant**: Ask questions about your spending in English, Tamil, Hindi, Telugu, or Malayalam. Get answers in text and voice.
*   **Automatic Warranty & Reminder Tracking**: The AI proactively scans new receipts for products with warranties or return deadlines and creates entries for you.
*   **Google Wallet Integration**: Save your receipts, warranties, reminders, and even AI-generated shopping lists directly to your Google Wallet for easy access.
*   **Spending Dashboard**: Get an at-a-glance overview of your monthly spending, top categories, and trends over time with interactive charts.
*   **Secure & Personal**: All your data is stored securely in your own private Firebase/Firestore database, linked to your Google account.
*   **Light & Dark Mode**: A beautiful and responsive interface that adapts to your system's theme.

---

## 🚀 Tech Stack

*   **Framework**: [Next.js](https://nextjs.org/) (App Router) & [React](https://reactjs.org/)
*   **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **AI Orchestration**: [Genkit](https://firebase.google.com/docs/genkit)
*   **AI Models**: [Google AI (Gemini Pro Vision & TTS)](https://ai.google/gemini/)
*   **Authentication**: [Firebase Authentication](https://firebase.google.com/docs/auth)
*   **Database**: [Cloud Firestore](https://firebase.google.com/docs/firestore)
*   **Wallet Integration**: [Google Wallet API](https://developers.google.com/wallet)
*   **Language**: [TypeScript](https://www.typescriptlang.org/)

---

## 🛠️ Getting Started

To run this project locally, you will need to configure your environment with the necessary API keys and credentials.

### 1. Firebase Setup

The application requires a Firebase project to handle authentication and database storage.

1.  Create a Firebase project in the [Firebase Console](https://console.firebase.google.com/).
2.  Create a new Web App within your project settings.
3.  Find your `firebaseConfig` keys in the project settings.
4.  Copy these keys into the `.env` file at the root of this project. The required keys are listed in the file.

### 2. Google AI API Key

You need an API key to use the Gemini models.

1.  Generate an API key from the [Google AI Studio](https://aistudio.google.com/app/apikey).
2.  Add this key to your `.env` file as `GEMINI_API_KEY`.

### 3. Google Wallet Setup

To enable the "Add to Google Wallet" feature, you need to set up a Google Wallet Issuer account and a service account.

*   Follow the detailed instructions in the **`WALLET_SETUP.md`** file in this project to create the necessary credentials and add them to your `.env` file.

### 4. Running the Application

Once your `.env` file is fully configured, you can start the application.

1.  **Install dependencies**:
    ```bash
    npm install
    ```
2.  **Run the development server**:
    ```bash
    npm run dev
    ```

The application will now be running on `http://localhost:9002`.
