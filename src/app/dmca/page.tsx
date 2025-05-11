import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export const metadata: Metadata = {
  title: "DMCA Policy | SexCityHub",
  description: "SexCityHub DMCA Policy and copyright infringement reporting procedures",
};

export default function DMCAPage() {
  const currentYear = new Date().getFullYear();
  
  return (
    <div className="container max-w-4xl py-12">
      <h1 className="text-3xl font-bold mb-6">DMCA Policy</h1>
      <p className="text-sm text-muted-foreground mb-8">Last updated: January 1, {currentYear}</p>
      
      <div className="prose prose-sm dark:prose-invert">
        <section className="mb-8">
          <p>
            SexCityHub respects the intellectual property rights of others and expects its users to do the same. In accordance with the Digital Millennium Copyright Act of 1998 ("DMCA"), we will respond expeditiously to claims of copyright infringement that are reported to our designated copyright agent.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Copyright Infringement Notice</h2>
          <p>
            If you believe that your copyrighted work has been copied in a way that constitutes copyright infringement and is accessible on our site, you may notify our copyright agent as set forth in the DMCA. For your complaint to be valid under the DMCA, you must provide the following information in writing:
          </p>
          
          <ol className="list-decimal pl-6 space-y-2 mt-4">
            <li>
              A physical or electronic signature of a person authorized to act on behalf of the owner of an exclusive right that is allegedly infringed.
            </li>
            <li>
              Identification of the copyrighted work claimed to have been infringed, or, if multiple copyrighted works are covered by a single notification, a representative list of such works.
            </li>
            <li>
              Identification of the material that is claimed to be infringing or to be the subject of infringing activity and that is to be removed or access to which is to be disabled, and information reasonably sufficient to permit us to locate the material (providing URLs in the body of an email is the best way to help us locate content quickly).
            </li>
            <li>
              Information reasonably sufficient to permit us to contact you, such as an address, telephone number, and, if available, an email address.
            </li>
            <li>
              A statement that you have a good faith belief that use of the material in the manner complained of is not authorized by the copyright owner, its agent, or the law.
            </li>
            <li>
              A statement that the information in the notification is accurate, and under penalty of perjury, that you are authorized to act on behalf of the owner of an exclusive right that is allegedly infringed.
            </li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">DMCA Agent Contact Information</h2>
          <p>
            The designated agent to receive notification of claimed infringement can be reached at:
          </p>
          
          <div className="bg-muted/30 p-6 rounded-lg border mt-4">
            <h3 className="font-medium mb-2">DMCA Agent</h3>
            <p className="mb-1">SexCityHub, LLC</p>
            <p className="mb-1">Legal Department - DMCA</p>
            <p className="mb-1">1234 Copyright Street, Suite 500</p>
            <p className="mb-1">Los Angeles, CA 90001</p>
            <p className="mb-1">United States</p>
            <p className="mb-1">Email: dmca@sexcityhub.com</p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Counter-Notification</h2>
          <p>
            If you believe that your content that was removed (or to which access was disabled) is not infringing, or that you have the authorization from the copyright owner, the copyright owner's agent, or pursuant to the law, to post and use the material in your content, you may send a counter-notification to our DMCA Agent containing the following information:
          </p>
          
          <ol className="list-decimal pl-6 space-y-2 mt-4">
            <li>
              Your physical or electronic signature.
            </li>
            <li>
              Identification of the content that has been removed or to which access has been disabled and the location at which the content appeared before it was removed or disabled.
            </li>
            <li>
              A statement that you have a good faith belief that the content was removed or disabled as a result of mistake or a misidentification of the content.
            </li>
            <li>
              Your name, address, telephone number, and email address.
            </li>
            <li>
              A statement that you consent to the jurisdiction of the federal court in the district where you reside and that you will accept service of process from the person who provided notification of the alleged infringement.
            </li>
          </ol>
          
          <p className="mt-4">
            If our DMCA Agent receives a counter-notification, we may send a copy of the counter-notification to the original complaining party informing them that we may replace the removed content or cease disabling it in 10 business days. Unless the copyright owner files an action seeking a court order against the content provider, member or user, the removed content may be replaced, or access to it restored, in 10 to 14 business days or more after receipt of the counter-notification, at our sole discretion.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Repeat Infringer Policy</h2>
          <p>
            In accordance with the DMCA and other applicable law, we have adopted a policy of terminating, in appropriate circumstances and at our sole discretion, users who are deemed to be repeat infringers. We may also at our sole discretion limit access to our website and/or terminate the accounts of any users who infringe any intellectual property rights of others, whether or not there is any repeat infringement.
          </p>
        </section>
      </div>
      
      <div className="mt-12">
        <Card>
          <CardHeader>
            <CardTitle>Submit a DMCA Takedown Request</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" placeholder="Your full name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" placeholder="your.email@example.com" type="email" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="company">Company Name (if applicable)</Label>
                <Input id="company" placeholder="Company name" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="content-urls">URL(s) of Infringing Content</Label>
                <Textarea 
                  id="content-urls" 
                  placeholder="Please provide the specific URL(s) of the content you believe infringes your copyright" 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="original-work">Description of Original Work</Label>
                <Textarea 
                  id="original-work" 
                  placeholder="Please describe the original copyrighted work" 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="original-urls">URL(s) to Original Work (if available)</Label>
                <Textarea 
                  id="original-urls" 
                  placeholder="Please provide URL(s) where the original work can be found" 
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="good-faith" 
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="good-faith" className="text-sm">
                    I have a good faith belief that use of the material in the manner complained of is not authorized by the copyright owner, its agent, or the law.
                  </label>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="accurate" 
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="accurate" className="text-sm">
                    I swear, under penalty of perjury, that the information in this notification is accurate and that I am the copyright owner, or am authorized to act on behalf of the owner, of an exclusive right that is allegedly infringed.
                  </label>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="electronic-signature" 
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="electronic-signature" className="text-sm">
                    By submitting this form, I agree that this constitutes my electronic signature.
                  </label>
                </div>
              </div>
              
              <Button 
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 w-full sm:w-auto"
              >
                Submit DMCA Request
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 