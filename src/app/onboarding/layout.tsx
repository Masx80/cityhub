import { Logo } from "@/components/logo";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="container px-4 py-4">
        <div className="flex justify-center mb-8">
          <Logo />
        </div>
      </div>
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
} 