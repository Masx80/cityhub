"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function AgeVerification() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const ageVerified = localStorage.getItem("age-verified");
    const lastVerified = localStorage.getItem("last-verified");
    const verificationExpiry = 30 * 24 * 60 * 60 * 1000; // 30 days
    const now = Date.now();

    if (ageVerified === "true" && lastVerified) {
      const timeSinceVerification = now - parseInt(lastVerified, 10);
      if (timeSinceVerification < verificationExpiry) {
        setIsVerified(true);
        return;
      }
    }

    setIsOpen(true); // Show modal immediately if not verified or expired
  }, []);

  const handleVerify = () => {
    setIsOpen(false);
    setIsVerified(true);
    localStorage.setItem("age-verified", "true");
    localStorage.setItem("last-verified", Date.now().toString());
  };

  const handleCancel = () => {
    window.location.href = "https://www.google.com"; // Redirect if underage
  };

  if (isVerified) {
    return null; // Don't render anything if already verified
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-filter backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={handleCancel}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="bg-card border rounded-xl shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center text-center mb-6">
              <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-3 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-white"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v.01" />
                  <path d="M12 8v4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mt-4">Are You 18 or Older?</h3>
              <p className="text-muted-foreground mt-2">
                This content is restricted to users aged 18 and above. Please
                confirm your age to proceed.
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={handleCancel}>
                No, I'm under 18
              </Button>
              <Button
                size="sm"
                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                onClick={handleVerify}
              >
                Yes, I am 18+
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
