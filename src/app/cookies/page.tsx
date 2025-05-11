import { Metadata } from "next";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Cookies Policy | SexCityHub",
  description: "Information about how SexCityHub uses cookies and other tracking technologies",
};

export default function CookiesPage() {
  const currentYear = new Date().getFullYear();
  
  return (
    <div className="container max-w-4xl py-12">
      <h1 className="text-3xl font-bold mb-6">Cookies Policy</h1>
      <p className="text-sm text-muted-foreground mb-8">Last updated: January 1, {currentYear}</p>
      
      <div className="prose prose-sm dark:prose-invert">
        <section className="mb-8">
          <p>
            This Cookies Policy explains how SexCityHub ("we", "us", or "our") uses cookies and similar tracking technologies on our website. This policy should be read alongside our Privacy Policy, which explains how we use personal information.
          </p>
          <p className="mt-4">
            By continuing to browse or use our website, you agree to our use of cookies as described in this policy.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">What are Cookies?</h2>
          <p>
            Cookies are small text files that are placed on your device when you visit a website. They are widely used to make websites work more efficiently and provide information to the website owners.
          </p>
          <p className="mt-4">
            Cookies can be "persistent" or "session" cookies. Persistent cookies remain on your device when you go offline, while session cookies are deleted as soon as you close your web browser.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">How We Use Cookies</h2>
          <p>
            We use cookies for the following purposes:
          </p>
          
          <div className="mt-4 space-y-6">
            <div>
              <h3 className="text-xl font-medium mb-2">Essential Cookies</h3>
              <p>
                These cookies are necessary for the website to function properly. They enable core functionality such as security, account management, and remembering your preferences. You cannot opt out of these cookies.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-medium mb-2">Performance and Analytics Cookies</h3>
              <p>
                These cookies collect information about how visitors use our website, such as which pages they visit most often and if they receive error messages. All information collected by these cookies is aggregated and anonymous.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-medium mb-2">Functionality Cookies</h3>
              <p>
                These cookies allow the website to remember choices you make (such as your username, language, or the region you are in) and provide enhanced, more personal features.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-medium mb-2">Targeting or Advertising Cookies</h3>
              <p>
                These cookies are used to deliver advertisements more relevant to you and your interests. They are also used to limit the number of times you see an advertisement as well as help measure the effectiveness of the advertising campaign.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-medium mb-2">Social Media Cookies</h3>
              <p>
                These cookies are set by a range of social media services that we have added to the site to enable you to share our content with your networks and friends. They are capable of tracking your browser across other sites and building up a profile of your interests.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Specific Cookies We Use</h2>
          
          <div className="overflow-x-auto mt-4">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="py-3 px-4 text-left">Name</th>
                  <th className="py-3 px-4 text-left">Purpose</th>
                  <th className="py-3 px-4 text-left">Duration</th>
                  <th className="py-3 px-4 text-left">Type</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4">_session</td>
                  <td className="py-3 px-4">Maintains user session state</td>
                  <td className="py-3 px-4">Session</td>
                  <td className="py-3 px-4">Essential</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">auth_token</td>
                  <td className="py-3 px-4">Authentication</td>
                  <td className="py-3 px-4">30 days</td>
                  <td className="py-3 px-4">Essential</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">_ga</td>
                  <td className="py-3 px-4">Google Analytics</td>
                  <td className="py-3 px-4">2 years</td>
                  <td className="py-3 px-4">Analytics</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">_gid</td>
                  <td className="py-3 px-4">Google Analytics</td>
                  <td className="py-3 px-4">24 hours</td>
                  <td className="py-3 px-4">Analytics</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">_fbp</td>
                  <td className="py-3 px-4">Facebook Pixel</td>
                  <td className="py-3 px-4">3 months</td>
                  <td className="py-3 px-4">Marketing</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">user_preferences</td>
                  <td className="py-3 px-4">Remembers user settings</td>
                  <td className="py-3 px-4">1 year</td>
                  <td className="py-3 px-4">Functionality</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">recently_viewed</td>
                  <td className="py-3 px-4">Tracks recently viewed content</td>
                  <td className="py-3 px-4">30 days</td>
                  <td className="py-3 px-4">Functionality</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Third-Party Cookies</h2>
          <p>
            Some cookies are placed by third parties on our website. These third parties may include:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li>Analytics providers (like Google)</li>
            <li>Advertising networks</li>
            <li>Social media platforms</li>
            <li>Video content providers</li>
            <li>Payment processors</li>
          </ul>
          <p className="mt-4">
            These third parties may use cookies, web beacons, and similar technologies to collect information about your use of our website and other websites. This information may be used to provide measurements of traffic and usage, target advertisements, and personalize content.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Managing Cookies</h2>
          <p>
            Most web browsers allow you to manage your cookie preferences. You can:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li>Delete cookies from your device</li>
            <li>Block cookies by activating the setting on your browser that allows you to refuse all or some cookies</li>
            <li>Set your browser to notify you when you receive a cookie</li>
          </ul>
          <p className="mt-4">
            Please note that if you choose to block or delete cookies, you may not be able to access certain areas or features of our website, and some services may not function properly.
          </p>
          <p className="mt-4">
            To find out more about cookies, including how to see what cookies have been set and how to manage and delete them, visit <a href="https://www.allaboutcookies.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.allaboutcookies.org</a>.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Cookie Preferences</h2>
          <p>
            You can change your cookie preferences at any time by clicking on the "Cookie Settings" button below.
          </p>
          <div className="mt-6">
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
              Cookie Settings
            </Button>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Changes to This Policy</h2>
          <p>
            We may update this Cookies Policy from time to time to reflect changes in technology, regulation, or our business practices. Any changes will be posted on this page with an updated "Last updated" date.
          </p>
          <p className="mt-4">
            We encourage you to check this page periodically for any changes.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
          <p>
            If you have any questions or concerns about our use of cookies or this Cookies Policy, please contact us at:
          </p>
          <p className="mt-4">
            Email: privacy@sexcityhub.com
          </p>
        </section>

        <div className="mt-12 pt-6 border-t">
          <p className="text-sm text-muted-foreground">
            By using our website, you acknowledge that you have read and understood this Cookies Policy.
          </p>
        </div>
      </div>
    </div>
  );
} 