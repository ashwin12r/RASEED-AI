
# Raseed AI: Application Architecture

This document provides a high-level overview of the architecture for the Raseed AI application.

## 1. Core Technologies

- **Frontend**: [Next.js](https://nextjs.org/) (with App Router) & [React](https://reactjs.org/)
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/) & [Tailwind CSS](https://tailwindcss.com/)
- **AI Orchestration**: [Genkit](https://firebase.google.com/docs/genkit)
- **AI Models**: [Google AI (Gemini)](https://ai.google/gemini/)
- **Backend Services**: [Firebase](https://firebase.google.com/) (Authentication, Firestore, App Hosting)
- **Third-Party Integration**: [Google Wallet API](https://developers.google.com/wallet)

---

## 2. Frontend Architecture (Next.js)

The frontend is built using Next.js with the App Router, which leverages React Server Components by default for better performance and reduced client-side JavaScript.

### Key Directories & Files:

-   **`src/app/`**: Contains all the pages and routes of the application.
    -   `(pages)`: Each directory like `/dashboard`, `/receipts`, `/analysis` corresponds to a route.
    -   `layout.tsx`: The root layout that includes providers for theming, authentication, and state management.
    -   `globals.css`: Defines the application's theme using CSS variables for ShadCN and Tailwind.
-   **`src/components/`**: Contains reusable React components.
    -   `ui/`: Holds the core ShadCN UI components (Button, Card, etc.).
    -   `dashboard-layout.tsx`: The main authenticated layout wrapper, including the sidebar and header.
    -   `add-receipt-dialog.tsx`: A key component that handles file upload and triggers the AI analysis flows.
-   **`src/hooks/`**: Custom React hooks for managing application state.
    -   `use-auth.ts`: Manages user authentication state with Firebase Auth.
    -   `use-receipts.ts`, `use-warranties.ts`, `use-reminders.ts`: Each hook manages CRUD (Create, Read, Update, Delete) operations for its specific data type, interacting with Firestore and providing state to the components.
-   **`public/`**: Stores static assets, most importantly the `logo.png` file.

### State Management:

The application uses **React Context** for global state management. `AuthProvider`, `ReceiptsProvider`, `WarrantiesProvider`, and `RemindersProvider` wrap the application in `src/app/layout.tsx`, making user data and other collections available throughout the component tree.

---

## 3. Backend & AI Architecture (Firebase & Genkit)

The backend logic, especially the AI-powered features, is handled by server-side Genkit flows.

### Key Directories & Files:

-   **`src/ai/flows/`**: This is the heart of the application's intelligence. Each file defines a specific server-side AI task.
    -   **Multimodal Ingestion**: `categorize-receipt.ts` and `ingest-and-analyze-receipt.ts` take an image (as a dataURI) and use the Gemini vision model to extract structured JSON data.
    -   **Natural Language Query**: `spending-analysis.ts` and `local-language-query.ts` take user questions and receipt data to provide conversational answers.
    -   **Google Wallet Integration**: `generate-wallet-pass.ts`, `generate-warranty-pass.ts`, etc., are flows that take structured data (like a receipt or warranty), create a JSON object for a Google Wallet Pass, and sign it into a JWT that the user can use to save the pass.
    -   **Background Intelligence**: `warranty-tracker.ts` and `return-reminder.ts` are flows designed to run after a receipt is added to proactively find and create warranties and reminders.
    -   **Voice**: `text-to-speech.ts` converts text responses into audio for the voice assistant feature.
-   **`src/lib/firebase.ts`**: Initializes and configures the Firebase SDK for connecting to auth and Firestore.
-   **`.env`**: Stores all secret keys and environment variables, including Firebase credentials, Google Wallet service account details, and the Gemini API key.

### Database (Firestore):

The application uses a **NoSQL Firestore database** with a user-centric data structure:

```
/users/{userId}/
    ├── receipts/{receiptId}
    ├── warranties/{warrantyId}
    └── reminders/{reminderId}
```

This structure ensures that each user's data is securely stored and isolated under their unique user ID (`userId`).

---

## 4. Overall Data Flow (Example: Adding a New Receipt)

1.  **Upload**: The user uploads a receipt image via the `AddReceiptDialog` component. The browser converts this image into a `dataURI` string.
2.  **AI Analysis**: The `dataURI` is sent to the `categorizeReceipt` Genkit flow.
3.  **Gemini Vision**: Inside the flow, Genkit calls the Gemini Pro Vision model, which analyzes the image and extracts the vendor, items, total amount, and category, returning it as structured JSON.
4.  **Save to Firestore**: The frontend receives the JSON data. The `useReceipts` hook is called to save this data as a new document in the user's `receipts` sub-collection in Firestore.
5.  **Background Tasks**: After saving, the frontend triggers two additional flows in the background: `trackWarranty` and `setReturnReminder`, passing the same `dataURI`.
6.  **Proactive Assistance**: These flows analyze the receipt for warranty or return information. If found, they use the `useWarranties` and `useReminders` hooks to save new documents to the appropriate Firestore collections.
7.  **Add to Wallet (User Action)**: If the user later clicks "Add to Wallet" on a receipt, the frontend calls the `generateWalletPass` flow with the receipt's data from Firestore. The flow creates a signed JWT and returns it.
8.  **Redirection**: The frontend uses this JWT to construct a `https://pay.google.com/gp/v/save/...` URL and opens it in a new tab, allowing the user to save the pass to their Google Wallet. The pass itself contains a link back to the application, configured via the `NEXT_PUBLIC_APP_URL` environment variable.
