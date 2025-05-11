import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | SexCityHub",
  description: "SexCityHub Privacy Policy and data protection information",
};

export default function PrivacyPage() {
  const currentYear = new Date().getFullYear();
  
  return (
    <div className="container max-w-4xl py-12">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground mb-8">Last updated: January 1, {currentYear}</p>
      
      <div className="prose prose-sm dark:prose-invert">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
          <p>
            At SexCityHub, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website, mobile application, and services (collectively, the "Service").
          </p>
          <p>
            Please read this Privacy Policy carefully. By using our Service, you consent to the collection, use, and disclosure of your information as described in this Privacy Policy.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
          <p>We may collect several types of information from and about users of our Service, including:</p>
          
          <h3 className="text-xl font-medium mt-4 mb-2">2.1 Personal Information</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Contact information (such as email address, name)</li>
            <li>Account credentials (such as username and password)</li>
            <li>Payment information (such as credit card details, billing address)</li>
            <li>Profile information (such as profile picture, bio)</li>
            <li>Communication data (such as messages, comments)</li>
          </ul>
          
          <h3 className="text-xl font-medium mt-4 mb-2">2.2 Usage Information</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Log data (such as IP address, browser type, operating system)</li>
            <li>Device information (such as device ID, model, operating system)</li>
            <li>Usage patterns (such as pages visited, time spent, clicks)</li>
            <li>Preferences and settings</li>
          </ul>
          
          <h3 className="text-xl font-medium mt-4 mb-2">2.3 Content Information</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Photos and videos you upload</li>
            <li>Comments and descriptions you provide</li>
            <li>Interaction data (such as likes, shares, follows)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. How We Collect Information</h2>
          <p>We collect information through:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Direct interactions when you provide information to us</li>
            <li>Automated technologies such as cookies, local storage, and analytics tools</li>
            <li>Third-party sources such as payment processors and identity verification services</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. How We Use Your Information</h2>
          <p>We may use the information we collect for various purposes, including:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Providing, maintaining, and improving our Service</li>
            <li>Processing transactions and managing subscriptions</li>
            <li>Verifying identity and age for compliance purposes</li>
            <li>Communicating with you about your account and our Service</li>
            <li>Personalizing your experience and content</li>
            <li>Analyzing usage patterns to improve our Service</li>
            <li>Preventing fraud and enforcing our terms and policies</li>
            <li>Complying with legal obligations</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Information Sharing</h2>
          <p>We may share your information with:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Service providers that help us operate our Service (such as payment processors, hosting providers)</li>
            <li>Professional advisors (such as lawyers, accountants, auditors)</li>
            <li>Law enforcement or government authorities when required by law</li>
            <li>Affiliated companies or business partners with your consent</li>
            <li>Other users according to your privacy settings and how you use the Service</li>
          </ul>
          <p className="mt-4">
            We take reasonable measures to ensure that any third party with whom we share your information maintains appropriate security safeguards.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect your information from unauthorized access, loss, or alteration. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
          </p>
          <p className="mt-4">
            Some security measures we employ include:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Encryption of sensitive information</li>
            <li>Regular security assessments</li>
            <li>Access controls and authentication</li>
            <li>Secure hosting environments</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Age Restrictions</h2>
          <p>
            <strong>Our Service is strictly for individuals who are 18 years of age or older.</strong> We do not knowingly collect personal information from anyone under the age of 18. If we discover that we have collected personal information from a person under 18, we will delete that information immediately.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. Your Privacy Rights</h2>
          <p>
            Depending on your location, you may have certain rights regarding your personal information, which may include:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>The right to access your personal information</li>
            <li>The right to correct inaccurate information</li>
            <li>The right to delete your personal information</li>
            <li>The right to restrict or object to processing</li>
            <li>The right to data portability</li>
            <li>The right to withdraw consent</li>
          </ul>
          <p className="mt-4">
            To exercise these rights, please contact us using the information provided in the "Contact Us" section.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">9. Cookies and Tracking Technologies</h2>
          <p>
            We use cookies and similar tracking technologies to collect information about your browsing activities and to personalize your experience on our Service. You can control cookies through your browser settings and other tools, but disabling cookies may limit your ability to use some features of our Service.
          </p>
          <p className="mt-4">
            For more information about our use of cookies, please see our <a href="/cookies" className="text-primary hover:underline">Cookies Policy</a>.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">10. International Data Transfers</h2>
          <p>
            Your information may be transferred to, stored, and processed in countries other than the one in which you reside. By using our Service, you consent to the transfer of your information to countries that may have different data protection laws than your country of residence.
          </p>
          <p className="mt-4">
            We take appropriate safeguards to ensure that your information is adequately protected when transferred internationally.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">11. Policy Updates</h2>
          <p>
            We may update this Privacy Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
          </p>
          <p className="mt-4">
            We encourage you to review this Privacy Policy periodically for any changes.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">12. Contact Us</h2>
          <p>
            If you have any questions or concerns about this Privacy Policy or our privacy practices, please contact us at:
          </p>
          <p>
            Email: privacy@sexcityhub.com
          </p>
        </section>

        <div className="mt-12 pt-6 border-t">
          <p className="text-sm text-muted-foreground">
            By using our Service, you acknowledge that you have read and understood this Privacy Policy and agree to its terms.
          </p>
        </div>
      </div>
    </div>
  );
} 