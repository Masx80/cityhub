"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function SettingsPage() {
  const [saving, setSaving] = useState(false)
  
  // General settings
  const [siteName, setSiteName] = useState("SexCity Hub")
  const [siteDescription, setSiteDescription] = useState("The ultimate adult entertainment platform")
  const [contactEmail, setContactEmail] = useState("admin@example.com")
  const [allowSignups, setAllowSignups] = useState(true)
  const [requireEmailVerification, setRequireEmailVerification] = useState(true)
  const [autoApproveContent, setAutoApproveContent] = useState(false)
  
  // Content settings
  const [maxVideoSizeMB, setMaxVideoSizeMB] = useState("500")
  const [maxVideoDurationMin, setMaxVideoDurationMin] = useState("30")
  const [allowedVideoFormats, setAllowedVideoFormats] = useState("mp4,webm")
  const [thumbnailQuality, setThumbnailQuality] = useState("high")
  const [watermarkPosition, setWatermarkPosition] = useState("bottom-right")
  
  // Privacy settings
  const [privacyPolicy, setPrivacyPolicy] = useState("Your privacy is important to us...")
  const [termsOfService, setTermsOfService] = useState("By using this site, you agree to...")
  const [cookiePolicy, setCookiePolicy] = useState("We use cookies to enhance your experience...")
  
  // Email settings
  const [emailProvider, setEmailProvider] = useState("smtp")
  const [smtpHost, setSmtpHost] = useState("smtp.example.com")
  const [smtpPort, setSmtpPort] = useState("587")
  const [smtpUsername, setSmtpUsername] = useState("noreply@example.com")
  const [smtpPassword, setSmtpPassword] = useState("••••••••••••")
  
  // Social settings
  const [twitterUrl, setTwitterUrl] = useState("https://twitter.com/example")
  const [instagramUrl, setInstagramUrl] = useState("https://instagram.com/example")
  const [discordUrl, setDiscordUrl] = useState("https://discord.gg/example")
  
  const saveSettings = (tab: string) => {
    setSaving(true)
    
    setTimeout(() => {
      setSaving(false)
      toast.success(`${tab} settings saved successfully`)
    }, 800)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">System Settings</h1>
        <p className="text-muted-foreground">
          Configure how the platform works and appears to users
        </p>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="grid grid-cols-5 w-full max-w-4xl mb-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="privacy">Legal & Privacy</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="social">Social Media</TabsTrigger>
        </TabsList>
        
        <div className="max-w-4xl">
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                  Basic configuration options for your platform
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="site-name">Site Name</Label>
                    <Input
                      id="site-name"
                      value={siteName}
                      onChange={(e) => setSiteName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="site-description">Site Description</Label>
                    <Textarea
                      id="site-description"
                      value={siteDescription}
                      onChange={(e) => setSiteDescription(e.target.value)}
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label htmlFor="contact-email">Contact Email</Label>
                    <Input
                      id="contact-email"
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                    />
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="allow-signups">Allow New Signups</Label>
                      <p className="text-muted-foreground text-sm">Enable or disable new user registration</p>
                    </div>
                    <Switch
                      id="allow-signups"
                      checked={allowSignups}
                      onCheckedChange={setAllowSignups}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-verification">Require Email Verification</Label>
                      <p className="text-muted-foreground text-sm">New users must verify their email before using the platform</p>
                    </div>
                    <Switch
                      id="email-verification"
                      checked={requireEmailVerification}
                      onCheckedChange={setRequireEmailVerification}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="auto-approve">Auto-Approve Content</Label>
                      <p className="text-muted-foreground text-sm">Skip moderation queue for new uploads</p>
                    </div>
                    <Switch
                      id="auto-approve"
                      checked={autoApproveContent}
                      onCheckedChange={setAutoApproveContent}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button
                  onClick={() => saveSettings("General")}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="content">
            <Card>
              <CardHeader>
                <CardTitle>Content Settings</CardTitle>
                <CardDescription>
                  Configure options for video uploads and processing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="max-video-size">Maximum Video Size (MB)</Label>
                    <Input
                      id="max-video-size"
                      type="number"
                      value={maxVideoSizeMB}
                      onChange={(e) => setMaxVideoSizeMB(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="max-duration">Maximum Duration (minutes)</Label>
                    <Input
                      id="max-duration"
                      type="number"
                      value={maxVideoDurationMin}
                      onChange={(e) => setMaxVideoDurationMin(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="allowed-formats">Allowed Video Formats</Label>
                    <Input
                      id="allowed-formats"
                      placeholder="Comma-separated list (mp4, webm, etc.)"
                      value={allowedVideoFormats}
                      onChange={(e) => setAllowedVideoFormats(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground mt-1">Separate formats with commas</p>
                  </div>
                  <div>
                    <Label htmlFor="thumbnail-quality">Thumbnail Quality</Label>
                    <Select value={thumbnailQuality} onValueChange={setThumbnailQuality}>
                      <SelectTrigger id="thumbnail-quality">
                        <SelectValue placeholder="Select quality" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low (faster)</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High (better quality)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <Label htmlFor="watermark">Watermark Position</Label>
                  <Select value={watermarkPosition} onValueChange={setWatermarkPosition}>
                    <SelectTrigger id="watermark">
                      <SelectValue placeholder="Select position" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="top-left">Top Left</SelectItem>
                      <SelectItem value="top-right">Top Right</SelectItem>
                      <SelectItem value="bottom-left">Bottom Left</SelectItem>
                      <SelectItem value="bottom-right">Bottom Right</SelectItem>
                      <SelectItem value="center">Center</SelectItem>
                      <SelectItem value="none">No Watermark</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                  <p className="text-sm text-amber-800">
                    <strong>Note:</strong> Changing video settings will only affect new uploads and won't retroactively modify existing content.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button
                  onClick={() => saveSettings("Content")}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="privacy">
            <Card>
              <CardHeader>
                <CardTitle>Legal & Privacy Settings</CardTitle>
                <CardDescription>
                  Manage the legal documents for your platform
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="privacy-policy">Privacy Policy</Label>
                    <Badge variant="outline">Last updated: 2 months ago</Badge>
                  </div>
                  <Textarea
                    id="privacy-policy"
                    value={privacyPolicy}
                    onChange={(e) => setPrivacyPolicy(e.target.value)}
                    rows={6}
                  />
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="terms-of-service">Terms of Service</Label>
                    <Badge variant="outline">Last updated: 2 months ago</Badge>
                  </div>
                  <Textarea
                    id="terms-of-service"
                    value={termsOfService}
                    onChange={(e) => setTermsOfService(e.target.value)}
                    rows={6}
                  />
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="cookie-policy">Cookie Policy</Label>
                    <Badge variant="outline">Last updated: 2 months ago</Badge>
                  </div>
                  <Textarea
                    id="cookie-policy"
                    value={cookiePolicy}
                    onChange={(e) => setCookiePolicy(e.target.value)}
                    rows={6}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button
                  onClick={() => saveSettings("Legal & Privacy")}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="email">
            <Card>
              <CardHeader>
                <CardTitle>Email Settings</CardTitle>
                <CardDescription>
                  Configure how emails are sent from your platform
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email-provider">Email Provider</Label>
                    <Select value={emailProvider} onValueChange={setEmailProvider}>
                      <SelectTrigger id="email-provider">
                        <SelectValue placeholder="Select provider" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="smtp">SMTP Server</SelectItem>
                        <SelectItem value="sendgrid">SendGrid</SelectItem>
                        <SelectItem value="mailchimp">Mailchimp</SelectItem>
                        <SelectItem value="mailgun">Mailgun</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {emailProvider === "smtp" && (
                  <div className="space-y-4 pt-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="smtp-host">SMTP Host</Label>
                        <Input
                          id="smtp-host"
                          value={smtpHost}
                          onChange={(e) => setSmtpHost(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="smtp-port">SMTP Port</Label>
                        <Input
                          id="smtp-port"
                          value={smtpPort}
                          onChange={(e) => setSmtpPort(e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="smtp-username">SMTP Username</Label>
                        <Input
                          id="smtp-username"
                          value={smtpUsername}
                          onChange={(e) => setSmtpUsername(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="smtp-password">SMTP Password</Label>
                        <Input
                          id="smtp-password"
                          type="password"
                          value={smtpPassword}
                          onChange={(e) => setSmtpPassword(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                {emailProvider !== "smtp" && (
                  <div className="space-y-4 pt-2">
                    <div>
                      <Label htmlFor="api-key">{emailProvider} API Key</Label>
                      <Input
                        id="api-key"
                        type="password"
                        value="••••••••••••••••••••••••••••••"
                      />
                    </div>
                  </div>
                )}
                
                <div className="p-3 bg-muted rounded-md">
                  <h4 className="font-medium mb-2">Test Email Configuration</h4>
                  <div className="flex gap-2">
                    <Input placeholder="Enter email address" />
                    <Button variant="secondary">Send Test</Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button
                  onClick={() => saveSettings("Email")}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="social">
            <Card>
              <CardHeader>
                <CardTitle>Social Media Links</CardTitle>
                <CardDescription>
                  Connect your platform to social media accounts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="twitter">Twitter URL</Label>
                    <Input
                      id="twitter"
                      value={twitterUrl}
                      onChange={(e) => setTwitterUrl(e.target.value)}
                      placeholder="https://twitter.com/yourusername"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="instagram">Instagram URL</Label>
                    <Input
                      id="instagram"
                      value={instagramUrl}
                      onChange={(e) => setInstagramUrl(e.target.value)}
                      placeholder="https://instagram.com/yourusername"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="discord">Discord Invite URL</Label>
                    <Input
                      id="discord"
                      value={discordUrl}
                      onChange={(e) => setDiscordUrl(e.target.value)}
                      placeholder="https://discord.gg/invite-code"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button
                  onClick={() => saveSettings("Social Media")}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
} 