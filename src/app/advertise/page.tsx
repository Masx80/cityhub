import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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

export const metadata: Metadata = {
  title: "Advertise | SexCityHub",
  description: "Advertise your product or service on SexCityHub and reach millions of adult content viewers",
};

export default function AdvertisePage() {
  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Advertise on SexCityHub</h1>
          <p className="text-xl text-muted-foreground">
            Reach millions of adult content viewers with targeted advertising
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Why Advertise With Us?</h2>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded-full flex-shrink-0 mt-0.5 text-primary">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-lg">High-Converting Traffic</h3>
                  <p className="text-muted-foreground">
                    Our users are highly engaged and willing to spend, with conversion rates 3x higher than regular advertising platforms.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded-full flex-shrink-0 mt-0.5 text-primary">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-lg">Massive Audience</h3>
                  <p className="text-muted-foreground">
                    Reach over 50 million monthly visitors from around the globe interested in adult content.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded-full flex-shrink-0 mt-0.5 text-primary">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-lg">Precise Targeting</h3>
                  <p className="text-muted-foreground">
                    Target by demographics, interests, geography, and content preferences for maximum ROI.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded-full flex-shrink-0 mt-0.5 text-primary">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-lg">Detailed Analytics</h3>
                  <p className="text-muted-foreground">
                    Access comprehensive reports on your campaign performance with real-time data.
                  </p>
                </div>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">Ad Formats</h2>
            <div className="space-y-4">
              <Card>
                <CardHeader className="py-4">
                  <CardTitle className="text-lg">Banner Ads</CardTitle>
                </CardHeader>
                <CardContent className="py-2">
                  <p className="text-sm text-muted-foreground">
                    Standard banner positions with high visibility available in various sizes
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="py-4">
                  <CardTitle className="text-lg">Video Pre-roll</CardTitle>
                </CardHeader>
                <CardContent className="py-2">
                  <p className="text-sm text-muted-foreground">
                    5-15 second video ads that play before selected content
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="py-4">
                  <CardTitle className="text-lg">Native Ads</CardTitle>
                </CardHeader>
                <CardContent className="py-2">
                  <p className="text-sm text-muted-foreground">
                    Seamlessly integrated ads that match the look and feel of our platform
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="py-4">
                  <CardTitle className="text-lg">Premium Sponsorships</CardTitle>
                </CardHeader>
                <CardContent className="py-2">
                  <p className="text-sm text-muted-foreground">
                    Category takeovers and featured placements for maximum exposure
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-6 bg-muted/30 mb-12">
          <h2 className="text-2xl font-semibold mb-4">Advertising Inquiry</h2>
          <form className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="Your name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" placeholder="your.email@example.com" type="email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input id="company" placeholder="Your company name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="budget">Monthly Budget</Label>
                <Select>
                  <SelectTrigger id="budget">
                    <SelectValue placeholder="Select budget range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1000-5000">$1,000 - $5,000</SelectItem>
                    <SelectItem value="5000-10000">$5,000 - $10,000</SelectItem>
                    <SelectItem value="10000-25000">$10,000 - $25,000</SelectItem>
                    <SelectItem value="25000+">$25,000+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea id="message" placeholder="Tell us about your advertising needs..." className="min-h-24" />
            </div>
            <Button 
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              size="lg"
            >
              Submit Inquiry
            </Button>
          </form>
        </div>

        <div className="text-center bg-card p-6 rounded-lg border">
          <h2 className="text-2xl font-semibold mb-2">Ready to boost your ROI?</h2>
          <p className="text-muted-foreground mb-6">
            Our advertising team is ready to help create a customized campaign for your needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" size="lg">
              Download Media Kit
            </Button>
            <Button 
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              size="lg"
            >
              Contact Sales Team
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 