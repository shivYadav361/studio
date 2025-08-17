
# Firestore Database Seeding Script

This script populates your Firestore database with the mock data defined in `src/lib/mock-data.ts`. This is essential for running the app with pre-filled data for doctors, patients, and appointments.

## ⚠️ Important Prerequisites

Before you can run the script, you need to authenticate with Firebase using a **Service Account**.

### Step 1: Generate a Service Account Key

1.  **Open the Firebase Console:** Go to [https://console.firebase.google.com/](https://console.firebase.google.com/) and select your project (`medipoint-akoz6`).
2.  **Go to Project Settings:** Click the gear icon next to "Project Overview" in the top-left, and select **Project settings**.
3.  **Go to Service Accounts:** In the settings page, click on the **Service Accounts** tab.
4.  **Generate New Private Key:** Click the **"Generate new private key"** button. A confirmation dialog will appear.
5.  **Confirm and Download:** Click **"Generate key"**. A JSON file will be downloaded to your computer.

### Step 2: Add the Key to Your Project

1.  **Rename the File:** Rename the downloaded JSON file to `service-account-key.json`.
2.  **Move the File:** Move this `service-account-key.json` file into the **root directory** of your project (the same level as `package.json`).
3.  **Git Ignore (Crucial!):** Your `.gitignore` file should already be configured to ignore `*.json` files in the root to prevent you from accidentally committing this secret key. **Never commit your service account key to a public repository.**

## Step 3: Run the Seeding Script

Once the `service-account-key.json` file is in place, open your terminal and run the following command:

```bash
npm run db:seed
```

This will execute the `scripts/seed.ts` file, which will:
1.  Connect to your Firestore database.
2.  Clear any existing data in the `doctors`, `patients`, and `appointments` collections.
3.  Upload all the mock data into the appropriate collections.

You should see log messages in your terminal indicating the progress. Once it's done, you can refresh the Firestore page in the Firebase Console to see your new collections and documents!
