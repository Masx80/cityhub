import { Metadata } from "next";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Premium Membership | SexCityHub",
  description: "Upgrade your experience with a SexCityHub Premium Membership",
};

const plans = [
  {
    name: "Monthly",
    price: "$19.99",
    description: "Billed monthly",
    features: [
      "Unlimited HD streaming",
      "No ads",
      "Full-length exclusive videos",
      "Priority support",
      "Download up to 30 videos per month",
    ],
    popular: false,
    period: "month",
  },
  {
    name: "Annual",
    price: "$99.99",
    description: "Billed annually (Save 58%)",
    features: [
      "Unlimited HD streaming",
      "No ads",
      "Full-length exclusive videos",
      "Priority support",
      "Download unlimited videos",
      "Early access to new content",
      "VIP model interactions",
    ],
    popular: true,
    period: "year",
  },
  {
    name: "Quarterly",
    price: "$49.99",
    description: "Billed every 3 months",
    features: [
      "Unlimited HD streaming",
      "No ads",
      "Full-length exclusive videos",
      "Priority support",
      "Download up to 90 videos per quarter",
    ],
    popular: false,
    period: "quarter",
  },
];

export default function PremiumPage() {
  return (
    <div className="container py-12">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <h1 className="text-3xl font-bold mb-4">Premium Membership</h1>
        <p className="text-xl text-muted-foreground">
          Unlock the full potential of SexCityHub with our premium membership options
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={
              plan.popular
                ? "border-primary shadow-lg shadow-primary/10 relative"
                : ""
            }
          >
            {plan.popular && (
              <div className="absolute -top-4 left-0 right-0 flex justify-center">
                <div className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </div>
              </div>
            )}

            <CardHeader>
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <div className="mt-2">
                <span className="text-3xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground">/{plan.period}</span>
              </div>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>

            <CardContent>
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>

            <CardFooter>
              <Button
                className={
                  plan.popular
                    ? "w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    : "w-full"
                }
                size="lg"
              >
                Subscribe Now
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="max-w-3xl mx-auto mt-16 bg-muted/30 p-6 rounded-lg border">
        <h2 className="text-2xl font-semibold mb-4">Why Go Premium?</h2>
        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-lg mb-2">High-Quality Content</h3>
            <p className="text-muted-foreground">
              Access our complete library of full-length, high-definition videos without any quality restrictions.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-lg mb-2">No Ads or Interruptions</h3>
            <p className="text-muted-foreground">
              Enjoy an ad-free experience with no popups, banners, or interruptions during your viewing.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-lg mb-2">Exclusive Content</h3>
            <p className="text-muted-foreground">
              Access premium videos and content that are only available to our paying members.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-lg mb-2">Download Videos</h3>
            <p className="text-muted-foreground">
              Download your favorite videos to watch offline, anytime and anywhere.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t">
          <h3 className="font-medium text-lg mb-2">Secure Payment</h3>
          <p className="text-muted-foreground">
            All transactions are secure and discreet. "SexCityHub" will never appear on your bank statement.
          </p>
        </div>
      </div>
    </div>
  );
} 