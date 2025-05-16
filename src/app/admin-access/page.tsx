"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminAccess() {
  const router = useRouter();
  const { user } = useUser();
  const [secretKey, setSecretKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      if (!user?.id) {
        setError("You must be logged in");
        return;
      }
      
      const response = await fetch("/api/admin/make-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clerkId: user.id,
          secretKey,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setError(data.error || "Something went wrong");
      } else {
        setSuccess("Admin access granted! Redirecting to admin panel...");
        setTimeout(() => {
          router.push("/admin");
        }, 2000);
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  const checkAccess = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/admin/check-access", {
        method: "GET",
      });
      
      if (response.ok) {
        setSuccess("You have admin access! Redirecting...");
        setTimeout(() => {
          router.push("/admin");
        }, 1000);
      } else {
        setError("You don't have admin access yet");
      }
    } catch (err) {
      setError("An error occurred checking your access");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Admin Access Required</CardTitle>
          <CardDescription>
            You need admin privileges to access the admin area
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              If you've been provided with an admin key, enter it below to gain admin access.
            </p>
            
            {error && (
              <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
                {error}
              </div>
            )}
            
            {success && (
              <div className="bg-green-500/10 text-green-500 p-3 rounded-md text-sm">
                {success}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="secretKey" className="text-sm font-medium">
                  Admin Secret Key
                </label>
                <Input
                  id="secretKey"
                  type="password"
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  placeholder="Enter your admin secret key"
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Processing..." : "Submit"}
              </Button>
            </form>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.push("/")}>
            Return to Home
          </Button>
          <Button variant="ghost" onClick={checkAccess} disabled={loading}>
            Check Access
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 