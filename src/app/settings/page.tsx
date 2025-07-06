'use client'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export default function SettingsPage() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleThemeChange = (checked: boolean) => {
    setTheme(checked ? 'dark' : 'light')
  }

  if (!isMounted) {
    return null
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">Settings</h1>
        <p className="text-muted-foreground">Manage your account and app settings.</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Update your personal information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" defaultValue="User Name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" defaultValue="user@example.com" />
          </div>
          <Button>Save Changes</Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Manage how you receive notifications.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <Label htmlFor="return-reminders" className="font-medium">Return & Refund Reminders</Label>
              <p className="text-sm text-muted-foreground">Get notified before return windows close.</p>
            </div>
            <Switch id="return-reminders" defaultChecked aria-label="Toggle return and refund reminders"/>
          </div>
          <Separator />
          <div className="flex items-start justify-between">
            <div>
              <Label htmlFor="warranty-updates" className="font-medium">Warranty Updates</Label>
              <p className="text-sm text-muted-foreground">Receive alerts for expiring warranties.</p>
            </div>
            <Switch id="warranty-updates" aria-label="Toggle warranty updates"/>
          </div>
          <Separator />
          <div className="flex items-start justify-between">
            <div>
              <Label htmlFor="spending-insights" className="font-medium">Spending Insights</Label>
              <p className="text-sm text-muted-foreground">Get weekly summaries and saving tips.</p>
            </div>
            <Switch id="spending-insights" defaultChecked aria-label="Toggle spending insights notifications"/>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Customize the look and feel of the app.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label htmlFor="dark-mode" className="font-medium">Dark Mode</Label>
            <Switch 
              id="dark-mode" 
              aria-label="Toggle dark mode"
              checked={resolvedTheme === 'dark'}
              onCheckedChange={handleThemeChange}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
