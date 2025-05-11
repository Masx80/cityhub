import { Metadata } from "next";

export const metadata: Metadata = {
  title: "2257 Statement | SexCityHub",
  description: "18 U.S.C. § 2257 Record-Keeping Requirements Compliance Statement",
};

export default function Statement2257Page() {
  const currentYear = new Date().getFullYear();
  
  return (
    <div className="container max-w-4xl py-12">
      <h1 className="text-3xl font-bold mb-6">18 U.S.C. § 2257 Statement</h1>
      <p className="text-sm text-muted-foreground mb-8">Last updated: January 1, {currentYear}</p>
      
      <div className="prose prose-sm dark:prose-invert">
        <section className="mb-8">
          <p>
            This statement is in compliance with United States Code Title 18, Section 2257 (18 U.S.C. 2257) and related regulations concerning the maintenance of records pertaining to the depiction of actual sexually explicit conduct.
          </p>
          
          <p className="mt-4">
            All models, actors, actresses and other persons who appear in any visual depiction of actual sexually explicit conduct appearing on or otherwise contained in this website were over the age of eighteen (18) years at the time of the creation of such depictions.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Records Required</h2>
          <p>
            The original records required pursuant to 18 U.S.C. § 2257 and 28 C.F.R. 75 for materials contained in this website are kept by the following Custodian of Records:
          </p>
          
          <div className="bg-muted/30 p-6 rounded-lg border mt-4">
            <h3 className="font-medium mb-2">Custodian of Records</h3>
            <p className="mb-1">SexCityHub, LLC</p>
            <p className="mb-1">1234 Record Keeping Street, Suite 500</p>
            <p className="mb-1">Los Angeles, CA 90001</p>
            <p>United States</p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Content Produced by Third Parties</h2>
          <p>
            For content produced by third parties and contained in this website, the records required pursuant to 18 U.S.C. § 2257 and 28 C.F.R. 75 are kept by the respective producers of that content.
          </p>
          <p className="mt-4">
            SexCityHub requires all content partners and third-party content providers to comply with 18 U.S.C. § 2257 and related regulations. We take our compliance responsibilities seriously and require strict adherence to these requirements from all content creators.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Exemption Statement</h2>
          <p>
            The activities, materials, and content provided on this website may be exempt from the provisions of 18 U.S.C. § 2257 and 28 C.F.R. 75 for one or more of the following reasons:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li>Created before July 3, 1995</li>
            <li>Do not portray actual sexually explicit conduct as defined in 18 U.S.C. § 2256</li>
            <li>Consist entirely of visual depictions of simulated sexually explicit activity</li>
            <li>Were created outside the United States and the producers did not intend them for importation into the United States</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Age Verification</h2>
          <p>
            SexCityHub takes the issue of child safety seriously and accordingly:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li>We have a zero-tolerance policy against child pornography or minors on our site</li>
            <li>We employ multiple layers of manual and automated systems to detect and remove illegal content</li>
            <li>All models and performers must provide government-issued photo identification proving they are over 18 prior to appearing in any visual content</li>
            <li>We promptly report any child exploitation or child pornography to appropriate law enforcement agencies</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Reporting Violations</h2>
          <p>
            If you become aware of any content that you believe may depict minors, please report it immediately to:
          </p>
          <p className="mt-4">
            Email: report@sexcityhub.com<br />
            Subject: 2257 Violation Report
          </p>
          <p className="mt-4">
            All reports will be investigated thoroughly, and appropriate action will be taken.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Inspection of Records</h2>
          <p>
            The records required by the Act are available for inspection by the Attorney General of the United States or his designee during regular business hours at the address listed above by appointment only.
          </p>
          <p className="mt-4">
            To schedule an inspection, please contact the Custodian of Records at least 24 hours in advance.
          </p>
        </section>

        <div className="mt-12 pt-6 border-t">
          <p className="text-sm text-muted-foreground">
            This 2257 Statement is subject to change without notice. It is your responsibility to review it periodically for updates.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            This statement is not intended as, and does not constitute, legal advice. If you have questions about compliance with 18 U.S.C. § 2257, please consult with your legal counsel.
          </p>
        </div>
      </div>
    </div>
  );
} 