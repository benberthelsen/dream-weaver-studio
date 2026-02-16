import { SiteLayout } from "@/components/layout/SiteLayout";

const PrivacyPage = () => {
  return (
    <SiteLayout>
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">
              Legal
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Privacy Policy
            </h1>
            <p className="text-sm text-muted-foreground">
              Last updated: February 2026
            </p>
          </div>

          <div className="prose prose-invert max-w-none space-y-8 text-muted-foreground text-sm leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground">1. Information We Collect</h2>
              <p>
                When you use our website, submit a contact form, or interact with our room planner,
                we may collect the following information:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Name, email address, phone number</li>
                <li>Project type and message content from enquiry forms</li>
                <li>Technical data such as browser type, IP address, and pages visited</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground">2. How We Use Your Information</h2>
              <p>We use the information we collect to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Respond to your enquiries within one business day</li>
                <li>Process and fulfil cabinetry orders</li>
                <li>Improve our website and services</li>
                <li>Send relevant communications about your project (with your consent)</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground">3. Data Storage & Security</h2>
              <p>
                Your personal information is stored securely using industry-standard encryption
                and access controls. We do not sell or share your personal information with
                third parties for marketing purposes.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground">4. Third-Party Services</h2>
              <p>
                We may use third-party services for website hosting, analytics, and our online
                room planner. These services have their own privacy policies governing the use
                of your information.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground">5. Your Rights</h2>
              <p>
                You have the right to access, correct, or delete your personal information.
                To make a request, contact us at{" "}
                <a href="mailto:info@bowerbuilding.net" className="text-primary hover:underline">
                  info@bowerbuilding.net
                </a>.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground">6. Contact</h2>
              <p>
                Bower Building<br />
                2/50 Owen St, Craglie 4877, QLD, Australia<br />
                Phone: <a href="tel:+61437732286" className="text-primary hover:underline">0437 732 286</a><br />
                Email: <a href="mailto:info@bowerbuilding.net" className="text-primary hover:underline">info@bowerbuilding.net</a>
              </p>
            </section>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
};

export default PrivacyPage;
