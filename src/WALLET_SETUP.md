# Google Wallet Integration Setup

To enable the "Add to Google Wallet" feature in this application, you need to provide credentials from your Google Cloud project and Google Wallet account. The application code is already set up to use these credentials once you add them to your environment.

Follow these steps to get your credentials and configure the project.

## Step 1: Create a Google Wallet Issuer Account

1.  Go to the [Google Wallet Business Console](https://pay.google.com/business/console/).
2.  Sign in with your Google account.
3.  Click on **"Get Started"** or **"Create Issuer"** and fill out your business information.
4.  Once created, you will be assigned a **Google Wallet Issuer ID**. Copy this ID.

## Step 2: Create a Service Account in Google Cloud

A service account is a special type of Google account intended to represent a non-human user that needs to authenticate and be authorized to access data in Google APIs.

1.  Go to the [Google Cloud Console - Service Accounts page](https://console.cloud.google.com/iam-admin/serviceaccounts).
2.  Select the same Google Cloud project that is associated with your Firebase project.
3.  Click **"+ CREATE SERVICE ACCOUNT"** at the top.
4.  Give the service account a name (e.g., "Wallet Pass Generator") and an optional description. The Service account ID will be generated for you. Click **"CREATE AND CONTINUE"**.
5.  In the "Grant this service account access to project" step, you do not need to grant any roles. Click **"CONTINUE"**.
6.  In the "Grant users access to this service account" step, you can leave it blank. Click **"DONE"**.

## Step 3: Create and Download a Service Account Key

1.  Find the service account you just created in the list.
2.  Click on the three-dot menu (Actions) on the right and select **"Manage keys"**.
3.  Click **"ADD KEY"** -> **"Create new key"**.
4.  Choose **JSON** as the key type and click **"CREATE"**. A JSON file will be downloaded to your computer. **This file contains your private key. Keep it secure and do not share it.**

## Step 4: Link Your Service Account to Your Google Wallet Issuer

1.  Go back to the [Google Wallet Business Console](https://pay.google.com/business/console/).
2.  Select your issuer account.
3.  In the left menu, go to **"Account management"**.
4.  In the "Service Account" section, click **"Link service account"**.
5.  Open the JSON key file you downloaded in the previous step. Find the value for `client_email` (it will look like `...gserviceaccount.com`).
6.  Paste this email into the "Service Account" field in the Wallet Console and click **"Link"**.

## Step 5: Create Pass Classes in the Google Wallet Console

You need to create a "class" for each type of pass you want to generate (Receipt, Warranty, Reminder, Shopping List).

1.  In the [Google Wallet Business Console](https://pay.google.com/business/console/), go to **"Pass classes"** in the left menu.
2.  Click **"Create class"**.
3.  Choose the **"Generic"** pass type.
4.  For the **"Class ID"**, enter one of the following names. You must create a class for each one:
    *   `receipt`
    *   `warranty`
    *   `reminder`
    *   `shopping-list`
5.  Fill in any other required details (like issuer name) and click **"Create class"**.
6.  Repeat this process for all four Class IDs listed above.

## Step 6: Add Credentials to your `.env` File

Now, add the credentials you've gathered to the `.env` file in your project.

1.  Open the `.env` file.
2.  Open the JSON key file you downloaded.
3.  Fill in the following variables:

    ```bash
    # From Step 1
    GOOGLE_WALLET_ISSUER_ID="YOUR_ISSUER_ID"

    # From the downloaded JSON key file (Step 3)
    GOOGLE_SERVICE_ACCOUNT_EMAIL="value_of_client_email"
    GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="value_of_private_key"

    # The URL of your deployed application
    # Example: https://your-project-id.apphosting.dev
    NEXT_PUBLIC_APP_URL="YOUR_PUBLISHED_APP_URL"
    ```

    **IMPORTANT:** For the `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`, you must copy the entire key string, including the `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` lines. Make sure it is enclosed in double quotes (`"`) as shown. The `\n` characters within the key are important and must be preserved.

Once you have added these credentials, the "Add to Wallet" feature will be fully functional.
