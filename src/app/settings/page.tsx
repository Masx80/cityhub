"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { 
  User, Bell, Lock, Monitor, 
  Shield, Download, Trash2, 
  ArrowLeft, Save, Loader2, 
  Moon, Sun, ChevronRight
} from "lucide-react"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import PageTransition from "@/components/page-transition"
import ThemeToggle from "@/components/theme-toggle"
import Link from "next/link"

export default function SettingsPage() {
  const router = useRouter()
  const { user, isLoaded, isSignedIn } = useUser()
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // User profile data
  const [userData, setUserData] = useState({
    displayName: "",
    email: "",
    bio: "",
    channelName: "",
    channelHandle: "",
  })
  
  // Notification preferences
  const [notificationPrefs, setNotificationPrefs] = useState({
    emailNotifications: true,
    newSubscribers: true, 
    newComments: true,
    videoUploads: true,
    channelMentions: true
  })
  
  // Privacy settings
  const [privacySettings, setPrivacySettings] = useState({
    privateAccount: false,
    showWatchHistory: true,
    personalized: true,
    dataCollection: true
  })

  // Appearance settings
  const [appearance, setAppearance] = useState({
    theme: "system",
    reducedMotion: false,
    highContrast: false
  })

  // Fetch user data when component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      if (!isLoaded || !isSignedIn) return
      
      try {
        setIsLoading(true)
        // Get user channel data
        const channelResponse = await fetch("/api/user/channel/me")
        
        if (!channelResponse.ok) {
          throw new Error("Failed to fetch channel data")
        }
        
        const channelData = await channelResponse.json()
        
        // Get user preferences (mock this for now)
        // In a real implementation, we would fetch from an API
        const mockPreferences = {
          emailNotifications: true,
          newSubscribers: true,
          newComments: true,
          videoUploads: true,
          channelMentions: true,
          privateAccount: false,
          showWatchHistory: true,
          personalized: true,
          dataCollection: true,
          theme: "system",
          reducedMotion: false,
          highContrast: false
        }
        
        // Set user data
        setUserData({
          displayName: user?.fullName || "",
          email: user?.primaryEmailAddress?.emailAddress || "",
          bio: channelData.channelDescription || "",
          channelName: channelData.channelName || "",
          channelHandle: (channelData.channelHandle || "").replace(/^@/, ""),
        })
        
        // Set preferences
        setNotificationPrefs({
          emailNotifications: mockPreferences.emailNotifications,
          newSubscribers: mockPreferences.newSubscribers,
          newComments: mockPreferences.newComments,
          videoUploads: mockPreferences.videoUploads,
          channelMentions: mockPreferences.channelMentions
        })
        
        setPrivacySettings({
          privateAccount: mockPreferences.privateAccount,
          showWatchHistory: mockPreferences.showWatchHistory,
          personalized: mockPreferences.personalized,
          dataCollection: mockPreferences.dataCollection
        })
        
        setAppearance({
          theme: mockPreferences.theme,
          reducedMotion: mockPreferences.reducedMotion,
          highContrast: mockPreferences.highContrast
        })
        
      } catch (error) {
        console.error("Error fetching user data:", error)
        toast.error("Failed to load user information")
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchUserData()
  }, [isLoaded, isSignedIn, user])
  
  // Redirect to sign-in if not logged in
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in")
    }
  }, [isLoaded, isSignedIn, router])

  // Save changes
  const handleSaveProfile = async () => {
    setIsSaving(true)
    
    try {
      // API call to save profile data would go here
      // await fetch('/api/user/profile', { method: 'PUT', body: JSON.stringify(userData) })
      
      toast.success("Profile information saved")
      setHasChanges(false)
    } catch (error) {
      console.error("Error saving profile:", error)
      toast.error("Failed to save profile information")
    } finally {
      setIsSaving(false)
    }
  }
  
  // Save notification preferences
  const handleSaveNotifications = async () => {
    setIsSaving(true)
    
    try {
      // API call to save notification preferences would go here
      // await fetch('/api/user/notifications', { method: 'PUT', body: JSON.stringify(notificationPrefs) })
      
      toast.success("Notification preferences saved")
    } catch (error) {
      console.error("Error saving notification preferences:", error)
      toast.error("Failed to save notification preferences")
    } finally {
      setIsSaving(false)
    }
  }
  
  // Save privacy settings
  const handleSavePrivacy = async () => {
    setIsSaving(true)
    
    try {
      // API call to save privacy settings would go here
      // await fetch('/api/user/privacy', { method: 'PUT', body: JSON.stringify(privacySettings) })
      
      toast.success("Privacy settings saved")
    } catch (error) {
      console.error("Error saving privacy settings:", error)
      toast.error("Failed to save privacy settings")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <PageTransition>
      <div className="container py-8 max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => router.back()}
              className="rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Settings</h1>
          </div>
          
          {hasChanges && (
            <Button 
              onClick={handleSaveProfile}
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Tabs defaultValue="account" className="mb-6">
            <TabsList className="grid grid-cols-4 mb-8 w-full max-w-3xl">
              <TabsTrigger value="account">
                <User className="h-4 w-4 mr-2" />
                Account
              </TabsTrigger>
              <TabsTrigger value="notifications">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="privacy">
                <Lock className="h-4 w-4 mr-2" />
                Privacy
              </TabsTrigger>
              <TabsTrigger value="appearance">
                <Monitor className="h-4 w-4 mr-2" />
                Appearance
              </TabsTrigger>
            </TabsList>

            {/* Account Tab */}
            <TabsContent value="account" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your personal information and public profile.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    <Avatar className="h-20 w-20 border">
                      <AvatarImage src={user?.imageUrl} alt={user?.fullName || "User"} />
                      <AvatarFallback className="bg-gradient-to-br from-orange-400 to-amber-600 text-white text-xl">
                        {user?.fullName?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>

                    <div>
                      <Button variant="outline" className="mb-2">
                        Change Profile Picture
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        Recommended: Square JPG, PNG, or GIF, at least 500x500px.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-3">
                    <Label htmlFor="display-name">Display Name</Label>
                    <Input 
                      id="display-name" 
                      value={userData.displayName}
                      onChange={(e) => {
                        setUserData({ ...userData, displayName: e.target.value });
                        setHasChanges(true);
                      }}
                    />
                  </div>

                  <div className="grid gap-3">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email"
                      value={userData.email}
                      readOnly
                      className="text-muted-foreground"
                    />
                    <p className="text-xs text-muted-foreground">
                      Your email is managed through your authentication provider.
                    </p>
                  </div>

                  <Separator className="my-4" />
                  
                  <div className="grid gap-3">
                    <Label htmlFor="channel-name">Channel Name</Label>
                    <Input 
                      id="channel-name" 
                      value={userData.channelName}
                      onChange={(e) => {
                        setUserData({ ...userData, channelName: e.target.value });
                        setHasChanges(true);
                      }}
                    />
                  </div>

                  <div className="grid gap-3">
                    <Label htmlFor="channel-handle" className="flex items-center gap-1">
                      Channel Handle
                      <span className="text-muted-foreground text-xs font-normal">
                        (unique username for your channel)
                      </span>
                    </Label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        @
                      </div>
                      <Input 
                        id="channel-handle" 
                        value={userData.channelHandle}
                        onChange={(e) => {
                          setUserData({ ...userData, channelHandle: e.target.value });
                          setHasChanges(true);
                        }}
                        className="pl-8"
                      />
                    </div>
                  </div>

                  <div className="grid gap-3">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      placeholder="Tell viewers about your channel"
                      className="min-h-[120px]"
                      value={userData.bio}
                      onChange={(e) => {
                        setUserData({ ...userData, bio: e.target.value });
                        setHasChanges(true);
                      }}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Link href="/settings/channel">
                    <Button variant="outline">
                      Advanced Channel Settings
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  
                  <Button 
                    onClick={handleSaveProfile}
                    className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                    disabled={isSaving || !hasChanges}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-destructive">Danger Zone</CardTitle>
                  <CardDescription>
                    Irreversible account actions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-medium">Download Your Data</h3>
                      <p className="text-sm text-muted-foreground">
                        Get a copy of your data including videos, comments, and account information
                      </p>
                    </div>
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Request Data
                    </Button>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-medium">Delete Account</h3>
                      <p className="text-sm text-muted-foreground">
                        Permanently delete your account and all of your content
                      </p>
                    </div>
                    <Button variant="destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Account
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Choose which notifications you want to receive
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Email Notifications</h3>
                      <p className="text-sm text-muted-foreground">
                        Receive email notifications about activity on your account
                      </p>
                    </div>
                    <Switch 
                      checked={notificationPrefs.emailNotifications}
                      onCheckedChange={(checked) => {
                        setNotificationPrefs({ ...notificationPrefs, emailNotifications: checked });
                      }}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">New Subscriber Notifications</h3>
                      <p className="text-sm text-muted-foreground">
                        Get notified when someone subscribes to your channel
                      </p>
                    </div>
                    <Switch 
                      checked={notificationPrefs.newSubscribers}
                      onCheckedChange={(checked) => {
                        setNotificationPrefs({ ...notificationPrefs, newSubscribers: checked });
                      }}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Comment Notifications</h3>
                      <p className="text-sm text-muted-foreground">
                        Get notified when someone comments on your videos
                      </p>
                    </div>
                    <Switch 
                      checked={notificationPrefs.newComments}
                      onCheckedChange={(checked) => {
                        setNotificationPrefs({ ...notificationPrefs, newComments: checked });
                      }}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Video Upload Notifications</h3>
                      <p className="text-sm text-muted-foreground">
                        Get notified when channels you subscribe to upload new videos
                      </p>
                    </div>
                    <Switch 
                      checked={notificationPrefs.videoUploads}
                      onCheckedChange={(checked) => {
                        setNotificationPrefs({ ...notificationPrefs, videoUploads: checked });
                      }}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Channel Mention Notifications</h3>
                      <p className="text-sm text-muted-foreground">
                        Get notified when someone mentions your channel in a comment or video
                      </p>
                    </div>
                    <Switch 
                      checked={notificationPrefs.channelMentions}
                      onCheckedChange={(checked) => {
                        setNotificationPrefs({ ...notificationPrefs, channelMentions: checked });
                      }}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button 
                    onClick={handleSaveNotifications}
                    className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                  >
                    Save Preferences
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Privacy Tab */}
            <TabsContent value="privacy" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Privacy Settings</CardTitle>
                  <CardDescription>
                    Manage your data and visibility preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Private Account</h3>
                      <p className="text-sm text-muted-foreground">
                        Make your account private so only approved followers can see your content
                      </p>
                    </div>
                    <Switch 
                      checked={privacySettings.privateAccount}
                      onCheckedChange={(checked) => {
                        setPrivacySettings({ ...privacySettings, privateAccount: checked });
                      }}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Show Watch History</h3>
                      <p className="text-sm text-muted-foreground">
                        Allow others to see videos you've watched recently
                      </p>
                    </div>
                    <Switch 
                      checked={privacySettings.showWatchHistory}
                      onCheckedChange={(checked) => {
                        setPrivacySettings({ ...privacySettings, showWatchHistory: checked });
                      }}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Personalized Recommendations</h3>
                      <p className="text-sm text-muted-foreground">
                        Allow us to use your watch history to recommend videos
                      </p>
                    </div>
                    <Switch 
                      checked={privacySettings.personalized}
                      onCheckedChange={(checked) => {
                        setPrivacySettings({ ...privacySettings, personalized: checked });
                      }}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Data Collection</h3>
                      <p className="text-sm text-muted-foreground">
                        Allow us to collect usage data to improve our services
                      </p>
                    </div>
                    <Switch 
                      checked={privacySettings.dataCollection}
                      onCheckedChange={(checked) => {
                        setPrivacySettings({ ...privacySettings, dataCollection: checked });
                      }}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button 
                    onClick={handleSavePrivacy}
                    className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                  >
                    Save Privacy Settings
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Appearance Tab */}
            <TabsContent value="appearance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Appearance Settings</CardTitle>
                  <CardDescription>
                    Customize how the application looks and behaves
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-3">Theme</h3>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button 
                        variant={appearance.theme === "light" ? "default" : "outline"} 
                        className="flex-1 justify-start"
                        onClick={() => setAppearance({ ...appearance, theme: "light" })}
                      >
                        <Sun className="h-4 w-4 mr-2" />
                        Light
                      </Button>
                      <Button 
                        variant={appearance.theme === "dark" ? "default" : "outline"} 
                        className="flex-1 justify-start"
                        onClick={() => setAppearance({ ...appearance, theme: "dark" })}
                      >
                        <Moon className="h-4 w-4 mr-2" />
                        Dark
                      </Button>
                      <Button 
                        variant={appearance.theme === "system" ? "default" : "outline"} 
                        className="flex-1 justify-start"
                        onClick={() => setAppearance({ ...appearance, theme: "system" })}
                      >
                        <Monitor className="h-4 w-4 mr-2" />
                        System
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      You can also toggle the theme from the site header.
                    </p>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Reduced Motion</h3>
                      <p className="text-sm text-muted-foreground">
                        Reduce the amount of animations in the user interface
                      </p>
                    </div>
                    <Switch 
                      checked={appearance.reducedMotion}
                      onCheckedChange={(checked) => {
                        setAppearance({ ...appearance, reducedMotion: checked });
                      }}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">High Contrast Mode</h3>
                      <p className="text-sm text-muted-foreground">
                        Increase contrast for better readability
                      </p>
                    </div>
                    <Switch 
                      checked={appearance.highContrast}
                      onCheckedChange={(checked) => {
                        setAppearance({ ...appearance, highContrast: checked });
                      }}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <ThemeToggle />
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </PageTransition>
  )
}
