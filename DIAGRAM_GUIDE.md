# Raseed AI: Use-Case and Process Flow Guide

This document provides the key actors, use-cases, and process flows for the Raseed AI application. You can use this content to create formal UML diagrams like Use-Case Diagrams or Process Flow Diagrams.

---

## 1. Key Actors

*   **User**: The primary actor who interacts with the application.
*   **AI Assistant (Gemini)**: The backend system that processes data and responds to queries.
*   **Firebase**: The backend service for authentication and database storage.
*   **Google Wallet**: The external service where passes are stored.

---

## 2. Core Use-Cases

Here are the primary use-cases for the application.

### Use-Case: User Authentication
*   **Actor**: User
*   **Goal**: To securely log in to the application.
*   **Summary**: The user signs in using their Google account to access their personal dashboard.

### Use-Case: Add a New Receipt via Media
*   **Actors**: User, AI Assistant
*   **Goal**: To upload a receipt (image, video, PDF) or capture one via camera, and have its data extracted and stored automatically.
*   **Summary**: The user provides media containing one or more receipts. The AI Assistant analyzes the media to extract details for each receipt (vendor, category, items, total), which are then saved to the user's account.

### Use-Case: Manage Receipts
*   **Actors**: User
*   **Goal**: To view, read aloud, and delete saved receipts.
*   **Summary**: The user can view a list of all their receipts, have the details of a specific receipt read out loud for accessibility, and delete receipts they no longer need.

### Use-Case: Save Pass to Google Wallet
*   **Actors**: User, Google Wallet
*   **Goal**: To add a digital version of a receipt, warranty, reminder, or shopping list to their Google Wallet.
*   **Summary**: The user clicks an "Add to Wallet" button. The system generates a secure pass, which is then added to the user's Google Wallet via a redirect.

### Use-Case: Automatic Warranty & Reminder Tracking
*   **Actor**: AI Assistant
*   **Goal**: To proactively find warranties and return deadlines from a new receipt.
*   **Summary**: After a receipt is added, the AI Assistant scans it in the background to identify any products with potential warranties or return policies and automatically creates entries in the respective sections of the app.

### Use-Case: Query Spending with AI Assistant
*   **Actors**: User, AI Assistant
*   **Goal**: To ask questions about spending habits in natural language (text or voice) in multiple languages and receive an answer.
*   **Summary**: The user selects a language, then asks a question like "How much did I spend on groceries last month?". The AI Assistant analyzes all stored receipt data to provide a direct answer in the selected language, which can also be spoken back to the user.

### Use-Case: Generate Shopping List
*   **Actors**: User, AI Assistant
*   **Goal**: To create a shopping list from a natural language request and add it to Google Wallet.
*   **Summary**: The user asks the AI Assistant to "create a shopping list for a pasta dinner." The AI generates the list of items and creates a Google Wallet pass for the user to take to the store.

### Use-Case: Manually Add Warranty or Reminder
*   **Actors**: User, AI Assistant (Optional)
*   **Goal**: To manually add a warranty or reminder, with the option to pre-fill the form by analyzing an uploaded image.
*   **Summary**: The user opens a dialog to add a warranty or reminder. They can fill in the form manually or upload an image (like a warranty card) to have the AI extract the information and pre-fill the form for them.

---

## 3. Process Flow Breakdowns

Here are the step-by-step processes for key features, covering the full user journey.

### Flow 1: New Receipt Ingestion and Background Analysis
1.  **User**: Opens the "Add Receipt" dialog.
2.  **User**: Chooses a source: "Upload File" or "Camera".
3.  **Path A: File Upload**
    *   **User**: Selects an image, video, or PDF file.
    *   **Frontend**: Converts the file into a `dataURI`.
    *   **User**: Clicks "Analyze File".
4.  **Path B: Camera Capture**
    *   **Frontend**: Requests camera access and displays the live feed.
    *   **User**: Aims the camera at a receipt and clicks "Capture & Analyze".
    *   **Frontend**: Captures a frame from the video feed and converts it to a `dataURI`.
5.  **AI Analysis (Shared Step)**
    *   **Frontend -> AI**: Calls the `categorizeReceipt` Genkit flow with the `dataURI`.
    *   **AI (Gemini)**: Analyzes the media and returns structured JSON containing an array of one or more receipts found (vendor, total, category, items).
    *   **Frontend**: Displays the analysis results to the user for confirmation.
6.  **User**: Clicks "Save Receipt(s)".
7.  **Save to Database**
    *   **Frontend -> Firebase**: For each receipt found, saves the structured JSON data as a new document in the user's `receipts` sub-collection in Firestore.
    *   **Frontend**: Shows a "Saved" confirmation toast.
8.  **Trigger Background Tasks**
    *   **Frontend -> AI**: Immediately after saving, calls two additional flows in the background, `trackWarranty` and `setReturnReminder`, passing the same `dataURI`.
    *   **AI (Background)**: Each flow analyzes the receipt for relevant information (e.g., warranty periods, return deadlines).
    *   **AI -> Firebase**: If information is found, the flows trigger the creation of new documents in the user's `warranties` or `reminders` sub-collections in Firestore.
    *   **Frontend**: Shows a toast notification if new warranties or reminders were found and created.

### Flow 2: AI Analysis Chat (Full Interaction)
1.  **User**: Navigates to the "Analysis" page.
2.  **User (Optional)**: Clicks the three-dot menu and selects a language (e.g., Tamil).
3.  **User**: Submits a query via text input or by clicking the microphone button.
4.  **Path A: Text Input**
    *   **User**: Types a query (e.g., "shopping list for biryani") and clicks "Send".
5.  **Path B: Voice Input**
    *   **User**: Clicks the microphone icon.
    *   **Frontend (Browser API)**: The `SpeechRecognition` API activates, listening in the selected language.
    *   **User**: Speaks a query.
    *   **Frontend**: The API transcribes the speech to text.
6.  **Frontend Processing (Shared Step)**
    *   **Frontend**: Adds the user's query text to the chat interface.
    *   **Frontend**: Checks if the query contains keywords like "shopping list".
7.  **AI Response Path A: Standard Query**
    *   **Frontend -> AI**: Calls the `analyzeSpending` Genkit flow, sending the query text, all user receipt data (as JSON), and the selected language.
    *   **AI (Gemini)**: Analyzes the question and data, then formulates an answer in the requested language and script.
    *   **AI -> Frontend**: Returns the text answer.
8.  **AI Response Path B: Shopping List Query**
    *   **Frontend -> AI**: Calls the `generateShoppingListPass` Genkit flow with the query text.
    *   **AI (Gemini)**: Extracts items and a plausible store, then constructs and signs a Google Wallet pass JWT.
    *   **AI -> Frontend**: Returns the JWT, the list of items, and the store name.
9.  **Display Response**
    *   **Frontend**: Adds the AI's response to the chat interface.
    *   **If Shopping List**: Displays a special card with the items, store, and an "Add to Google Wallet" button.
10. **Text-to-Speech (for Voice Input)**
    *   **Frontend -> AI**: If the query came from voice, sends the AI's text response to the `textToSpeech` Genkit flow.
    *   **AI (TTS)**: Converts the text into an audio file and returns it as a `dataURI`.
    *   **Frontend**: Plays the returned audio `dataURI` through a hidden `<audio>` element.

### Flow 3: Adding a Pass to Google Wallet (Generic)
This flow applies when the user clicks "Add to Wallet" on a receipt, warranty, reminder, or a generated shopping list.
1.  **User**: Clicks the "Add to Wallet" button on an item.
2.  **Frontend**: Retrieves the data for that specific item from its state (which is synced with Firestore).
3.  **Frontend -> AI**: Calls the appropriate Genkit flow (`generateWalletPass`, `generateWarrantyPass`, etc.) with the item's data.
4.  **AI (Genkit Flow)**:
    *   Constructs the specific JSON object for the Google Wallet pass.
    *   Retrieves service account credentials from environment variables.
    *   Signs the pass object into a secure JSON Web Token (JWT).
    *   Returns the signed JWT to the frontend.
5.  **Frontend**:
    *   Receives the JWT.
    *   Constructs a special URL: `https://pay.google.com/gp/v/save/{jwt}`.
    *   Opens this URL in a new browser tab.
6.  **User -> Google Wallet**: The user is now on the Google Wallet website and can save the pass to their account. The pass itself contains a link back to the app.
