import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | SexCityHub",
  description: "Learn more about SexCityHub, the premium adult entertainment platform",
};

export default function AboutPage() {
  return (
    <div className="container max-w-4xl py-12">
      <h1 className="text-3xl font-bold mb-6">About SexCityHub</h1>
      
      <div className="prose prose-lg dark:prose-invert">
        <p className="text-muted-foreground mb-6">
          Founded in 2023, SexCityHub is a premier adult entertainment platform dedicated to providing high-quality adult content in a safe, secure, and user-friendly environment.
        </p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">Our Mission</h2>
        <p className="text-muted-foreground mb-6">
          At SexCityHub, our mission is to create a platform where adult content creators can share their work with a global audience while ensuring all content adheres to strict ethical standards. We are committed to providing a respectful environment for both creators and viewers.
        </p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">Our Values</h2>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-6">
          <li><strong>Consent</strong> - All content on our platform involves consenting adults over the age of 18.</li>
          <li><strong>Safety</strong> - We implement strict verification processes to ensure all performers are of legal age.</li>
          <li><strong>Privacy</strong> - We respect the privacy of our users and implement robust data protection measures.</li>
          <li><strong>Quality</strong> - We focus on high-quality content and a seamless viewing experience.</li>
          <li><strong>Inclusivity</strong> - We welcome diversity in content and performers.</li>
        </ul>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">Content Guidelines</h2>
        <p className="text-muted-foreground mb-6">
          All content on SexCityHub adheres to strict guidelines to ensure legal compliance and ethical standards. We prohibit any content that:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-6">
          <li>Involves individuals under the age of 18</li>
          <li>Depicts non-consensual activities</li>
          <li>Contains illegal activities</li>
          <li>Promotes violence or discrimination</li>
        </ul>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">Legal Compliance</h2>
        <p className="text-muted-foreground mb-6">
          SexCityHub is committed to providing adult content in an ethical and responsible way. Our platform:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-6">
          <li>Verifies all content creators are adults</li>
          <li>Respects privacy and protects user data</li>
          <li>Honors copyright and intellectual property</li>
        </ul>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">Contact Us</h2>
        <p className="text-muted-foreground">
          If you have any questions or concerns about SexCityHub, please visit our <a href="/contact" className="text-primary hover:underline">Contact page</a>.
        </p>
      </div>
    </div>
  );
} 