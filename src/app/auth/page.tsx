"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useSignIn, useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { useTheme } from "next-themes";

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useSignIn();
  const { signUp } = useSignUp();
  const router = useRouter();
  const { isLoaded, isSignedIn } = useUser();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Once the component is mounted, we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect logged-in users (client-side protection in addition to middleware)
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      console.log("User already signed in on auth page. Redirecting to home.");
      router.push("/");
    }
  }, [isLoaded, isSignedIn, router]);

  const handleGoogleSignIn = async () => {
    if (!signIn && !signUp) return;

    setIsLoading(true);

    try {
      // Try to sign in with Google
      await signIn?.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/",
      });
      
      // Note: The code will not reach here because authenticateWithRedirect
      // will redirect the user away from this page
    } catch (error) {
      // This catch block will handle any errors that occur before the redirect
      console.error("Error during authentication:", error);
      setIsLoading(false);
    }
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return null;
  }

  return (
    <div className="flex h-screen">
      {/* Left side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('/auth.png')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/30"></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-md text-center"
          >
            <h1 className="text-4xl font-bold mb-4">
              Join us and become a creator
            </h1>
            <p className="text-lg mb-6">
              Share your voice, build your audience, and connect with a global
              community.
            </p>
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-white/20 backdrop-blur-md p-4 rounded-lg shadow-xl hover:bg-white/30 transition-all">
                <h3 className="font-bold text-xl mb-1">Create</h3>
                <p className="text-sm">Upload videos and express yourself</p>
              </div>
              <div className="bg-white/20 backdrop-blur-md p-4 rounded-lg shadow-xl hover:bg-white/30 transition-all">
                <h3 className="font-bold text-xl mb-1">Grow</h3>
                <p className="text-sm">Build your community and brand</p>
              </div>
              <div className="bg-white/20 backdrop-blur-md p-4 rounded-lg shadow-xl hover:bg-white/30 transition-all">
                <h3 className="font-bold text-xl mb-1">Connect</h3>
                <p className="text-sm">Collaborate with other creators</p>
              </div>
              <div className="bg-white/20 backdrop-blur-md p-4 rounded-lg shadow-xl hover:bg-white/30 transition-all">
                <h3 className="font-bold text-xl mb-1">Inspire</h3>
                <p className="text-sm">Reach and impact millions worldwide</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gradient-to-b from-background to-muted/50 dark:from-background dark:to-background/80">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-8">
            <Link href="/" className="inline-block">
              <div className="flex items-center justify-center mb-6">
                <span className="text-3xl font-bold">
                  <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">Sex</span>
                  <span className="text-foreground">City</span>
                  <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent"> Hub</span>
                </span>
              </div>
            </Link>
            <h2 className="text-2xl font-bold mb-2 text-foreground">
              Welcome Back
            </h2>
            <p className="text-muted-foreground">
              Sign in or create your account to continue
            </p>
          </div>

          <div className="space-y-6">
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="p-6 bg-card rounded-xl shadow-lg border border-border"
            >
              <Button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                variant="outline"
                className="w-full flex items-center justify-center gap-3 bg-background hover:bg-accent text-foreground border hover:border-input hover:text-accent-foreground transition-all py-6 font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-label="Google logo"
                >
                  <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                    <path
                      fill="#4285F4"
                      d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"
                    />
                    <path
                      fill="#34A853"
                      d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"
                    />
                    <path
                      fill="#EA4335"
                      d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"
                    />
                  </g>
                </svg>
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <motion.div
                      className="w-5 h-5 border-2 border-t-transparent border-current rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    />
                    Signing in...
                  </div>
                ) : (
                  "Continue with Google"
                )}
              </Button>
            </motion.div>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                By signing in, you agree to our{" "}
                <Link href="/terms" className="text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300 font-medium hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300 font-medium hover:underline">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link href="/" className="text-sm text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300 font-medium hover:underline flex items-center justify-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6"/>
              </svg>
              Back to home
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
