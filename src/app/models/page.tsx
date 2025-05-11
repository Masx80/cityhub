import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, DollarSign, Shield, Star, Unlock, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "Become a Model | SexCityHub",
  description: "Join SexCityHub as a content creator and earn money sharing your adult content",
};

const benefits = [
  {
    title: "Earn More",
    description: "Earn up to 80% of revenue from your content subscriptions and tips",
    icon: <DollarSign className="h-6 w-6 text-primary" />,
  },
  {
    title: "Global Audience",
    description: "Reach millions of viewers worldwide with our established platform",
    icon: <Users className="h-6 w-6 text-primary" />,
  },
  {
    title: "Content Freedom",
    description: "Create the content you want with our flexible publishing policies",
    icon: <Unlock className="h-6 w-6 text-primary" />,
  },
  {
    title: "Security & Privacy",
    description: "Advanced security measures to protect your content and personal information",
    icon: <Shield className="h-6 w-6 text-primary" />,
  },
  {
    title: "Premium Features",
    description: "Access to professional tools for content creation, analytics, and marketing",
    icon: <Star className="h-6 w-6 text-primary" />,
  },
];

export default function ModelsPage() {
  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Become a SexCityHub Model</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Join our platform and start earning money by sharing your content with millions of viewers
          </p>
          <Button
            size="lg"
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            Apply Now
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Why Join SexCityHub?</h2>
            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex gap-4 items-start">
                  <div className="mt-1">{benefit.icon}</div>
                  <div>
                    <h3 className="font-medium text-lg">{benefit.title}</h3>
                    <p className="text-muted-foreground">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-muted/30 p-6 rounded-lg border">
            <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
            <ol className="space-y-4 list-decimal list-inside text-muted-foreground">
              <li className="pl-2">
                <span className="font-medium text-foreground">Apply</span> - Fill out our application form with your details
              </li>
              <li className="pl-2">
                <span className="font-medium text-foreground">Verify</span> - Complete our verification process to confirm your identity and age
              </li>
              <li className="pl-2">
                <span className="font-medium text-foreground">Setup</span> - Create your profile and customize your channel
              </li>
              <li className="pl-2">
                <span className="font-medium text-foreground">Upload</span> - Start uploading your content and set your pricing
              </li>
              <li className="pl-2">
                <span className="font-medium text-foreground">Earn</span> - Get paid regularly for your content views, subscriptions, and tips
              </li>
            </ol>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader>
              <CardTitle>Beginner</CardTitle>
              <CardDescription>For new models just starting out</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>70% revenue share</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Basic analytics</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Standard support</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">Apply Now</Button>
            </CardFooter>
          </Card>

          <Card className="border-primary">
            <CardHeader>
              <CardTitle>Professional</CardTitle>
              <CardDescription>For established content creators</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>75% revenue share</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Advanced analytics</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Priority support</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Promotional opportunities</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">Apply Now</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>VIP</CardTitle>
              <CardDescription>For top-tier creators</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>80% revenue share</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Premium analytics</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>24/7 dedicated support</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Featured placement</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">Apply Now</Button>
            </CardFooter>
          </Card>
        </div>

        <div className="bg-muted/30 p-6 rounded-lg border text-center">
          <h2 className="text-xl font-semibold mb-2">Ready to start earning?</h2>
          <p className="text-muted-foreground mb-6">
            Join thousands of successful models already earning on SexCityHub
          </p>
          <Button
            size="lg"
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            Apply Now
          </Button>
        </div>
      </div>
    </div>
  );
} 