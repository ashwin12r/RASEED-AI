
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, Cog } from 'lucide-react'

export function FirebaseConfigError() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-destructive/10">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
            <div>
              <CardTitle className="text-2xl">Firebase Not Configured</CardTitle>
              <CardDescription>
                The app needs to be connected to your Firebase project to work correctly.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 text-sm">
          <p>
            This is a required step that only you can do, as it involves your secret project keys.
            Please follow these steps:
          </p>
          <div className="space-y-4 rounded-lg border p-4">
            <h3 className="font-semibold">Step 1: Find your Firebase Config Keys</h3>
            <ol className="list-decimal list-inside space-y-2 pl-2">
              <li>
                Open the Firebase Console and go to your <span className="font-semibold">Raseed AI</span> project.
              </li>
              <li>
                Click the <Cog className="inline-block w-4 h-4 mx-1" /> gear icon next to "Project Overview", then select
                <span className="font-semibold"> Project settings</span>.
              </li>
              <li>
                In the "General" tab, scroll down to the "Your apps" section and find your web app.
              </li>
              <li>
                Select the "Config" option to see your <span className="font-semibold">`firebaseConfig`</span> object.
              </li>
            </ol>
          </div>
          <div className="space-y-4 rounded-lg border p-4">
            <h3 className="font-semibold">Step 2: Add the Keys to the `.env` File</h3>
            <p>
              Copy the values from your `firebaseConfig` object into the `.env` file in the project's file explorer.
            </p>
            <pre className="p-4 rounded-md bg-muted overflow-x-auto text-xs">
              <code>
{`NEXT_PUBLIC_FIREBASE_API_KEY="YOUR_API_KEY"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="YOUR_AUTH_DOMAIN"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="YOUR_PROJECT_ID"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="YOUR_STORAGE_BUCKET"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="YOUR_SENDER_ID"
NEXT_PUBLIC_FIREBASE_APP_ID="YOUR_APP_ID"`}
              </code>
            </pre>
          </div>
          <p className="text-center text-muted-foreground">
            Once you have added the keys, the app will automatically reload.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
