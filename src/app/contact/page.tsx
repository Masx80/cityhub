import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, MessageSquare, ShieldCheck, User } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us | SexCityHub",
  description: "Get in touch with the SexCityHub team for support, questions, or business inquiries",
};

export default function ContactPage() {
  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">Contact Us</h1>
          <p className="text-xl text-muted-foreground">
            Have questions or feedback? We'd love to hear from you.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Send us a message</CardTitle>
                <CardDescription>
                  Fill out the form below and we'll get back to you as soon as possible.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" placeholder="Your name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" placeholder="your.email@example.com" type="email" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Select>
                      <SelectTrigger id="subject">
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Inquiry</SelectItem>
                        <SelectItem value="support">Technical Support</SelectItem>
                        <SelectItem value="billing">Billing Question</SelectItem>
                        <SelectItem value="content">Content Request</SelectItem>
                        <SelectItem value="advertise">Advertising</SelectItem>
                        <SelectItem value="model">Become a Model</SelectItem>
                        <SelectItem value="dmca">DMCA Takedown</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea 
                      id="message" 
                      placeholder="Please provide details about your inquiry..." 
                      className="min-h-32"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="terms" 
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor="terms" className="text-sm text-muted-foreground">
                      I confirm I am over 18 years of age and agree to the <a href="/terms" className="text-primary hover:underline">Terms of Service</a> and <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>.
                    </label>
                  </div>
                  
                  <Button 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 w-full sm:w-auto"
                    size="lg"
                  >
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Contact Information</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-medium">Email</h3>
                    <p className="text-muted-foreground">support@sexcityhub.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MessageSquare className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-medium">Live Chat</h3>
                    <p className="text-muted-foreground">Available 24/7 for premium members</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="border-t pt-6 space-y-4">
              <h2 className="text-xl font-semibold">Frequently Asked</h2>
              <div className="space-y-3">
                <div>
                  <h3 className="font-medium">How do I reset my password?</h3>
                  <p className="text-sm text-muted-foreground">Visit the login page and click "Forgot Password"</p>
                </div>
                <div>
                  <h3 className="font-medium">How do I cancel my subscription?</h3>
                  <p className="text-sm text-muted-foreground">You can cancel anytime in your account settings</p>
                </div>
                <div>
                  <h3 className="font-medium">Do you offer refunds?</h3>
                  <p className="text-sm text-muted-foreground">See our <a href="/terms" className="text-primary hover:underline">refund policy</a> for details</p>
                </div>
              </div>
            </div>
            
            <div className="border-t pt-6">
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Content Compliance</h3>
                    <p className="text-sm text-muted-foreground">For DMCA takedown requests or content concerns, please use the form with "DMCA" as subject or email legal@sexcityhub.com</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 