import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | SexCityHub",
  description: "SexCityHub Terms of Service and User Agreement",
};

export default function TermsPage() {
  const currentYear = new Date().getFullYear();
  
  return (
    <div className="container max-w-4xl py-12">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      <p className="text-sm text-muted-foreground mb-8">Last updated: January 1, {currentYear}</p>
      
      <div className="prose prose-sm dark:prose-invert">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
          <p>
            Welcome to SexCityHub. These Terms of Service ("Terms") govern your access to and use of the SexCityHub website, services, and applications (collectively, the "Services"). By accessing or using our Services, you agree to be bound by these Terms.
          </p>
          <p>
            Please read these Terms carefully before using our Services. If you do not agree to these Terms, you may not access or use the Services.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Age Restrictions and Eligibility</h2>
          <p>
            <strong>You must be at least 18 years old to access or use our Services.</strong> By accessing or using our Services, you represent and warrant that you are at least 18 years old and have the legal capacity to enter into these Terms.
          </p>
          <p>
            We reserve the right to request proof of age at any time, and to suspend or terminate your access to our Services if we have reason to believe you do not meet our age requirements.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. Account Registration</h2>
          <p>
            To access certain features of our Services, you may need to register for an account. When you register, you agree to provide accurate, current, and complete information and to update such information to keep it accurate, current, and complete.
          </p>
          <p>
            You are solely responsible for maintaining the confidentiality of your account and password and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account or any other breach of security.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Content Standards</h2>
          <p>
            By using our Services, you agree not to upload, post, or otherwise transmit any content that:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Involves or depicts individuals under the age of 18 in any manner</li>
            <li>Depicts non-consensual sexual acts or violence</li>
            <li>Depicts bestiality, necrophilia, or other illegal sexual content</li>
            <li>Violates the rights of any third party, including copyright, trademark, privacy, or publicity rights</li>
            <li>Is illegal, harmful, threatening, abusive, harassing, defamatory, or otherwise objectionable</li>
            <li>Impersonates any person or entity or misrepresents your affiliation with any person or entity</li>
          </ul>
          <p>
            We reserve the right to remove any content that violates these standards and to terminate accounts of users who violate these standards.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Content Ownership and Licensing</h2>
          <p>
            All content on our Services, including text, graphics, logos, icons, images, audio clips, and software, is owned by SexCityHub or its content providers and is protected by copyright, trademark, and other intellectual property laws.
          </p>
          <p>
            By submitting, posting, or displaying content on or through our Services, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, adapt, publish, translate, distribute, and display such content in connection with providing our Services.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Content Responsibility</h2>
          <p>
            If you share content on our platform, you agree to:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Verify and ensure all individuals appearing in your content are of legal age</li>
            <li>Obtain and maintain all necessary consents from individuals appearing in your content</li>
            <li>Not infringe on the intellectual property rights of others</li>
            <li>Adhere to our content standards and policies</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Payment Terms</h2>
          <p>
            You agree to pay all fees or charges to your account based on the fees, charges, and billing terms in effect at the time a fee or charge is due and payable. The payment provider you use (such as your credit card issuer) may also have terms and conditions that you must follow.
          </p>
          <p>
            By providing a payment method, you authorize us to charge you for all fees associated with your use of the Services. We reserve the right to change our pricing at any time.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. Cancellation and Refunds</h2>
          <p>
            You may cancel your subscription at any time through your account settings. Upon cancellation, your subscription will remain active until the end of your current billing cycle, at which point it will not renew.
          </p>
          <p>
            Due to the nature of our Services, we generally do not provide refunds unless required by law or at our sole discretion. For specific refund inquiries, please contact our customer support.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">9. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, SexCityHub, its affiliates, and their respective officers, directors, employees, and agents will not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, or goodwill, arising out of or in connection with these Terms or your use of the Services.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">10. Governing Law</h2>
          <p>
            These Terms and any action related thereto will be governed by applicable laws, without regard to conflict of law provisions.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">11. Changes to Terms</h2>
          <p>
            We reserve the right to modify these Terms at any time. We will provide notice of any material changes by posting the new Terms on the Services and updating the "Last updated" date at the top of these Terms.
          </p>
          <p>
            Your continued use of the Services after such changes constitutes your acceptance of the new Terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">12. Contact Information</h2>
          <p>
            If you have any questions about these Terms, please contact us at:
          </p>
          <p>
            Email: legal@sexcityhub.com
          </p>
        </section>

        <div className="mt-12 pt-6 border-t">
          <p className="text-sm text-muted-foreground">
            By using our Services, you acknowledge that you have read and understood these Terms and agree to be bound by them.
          </p>
        </div>
      </div>
    </div>
  );
} 