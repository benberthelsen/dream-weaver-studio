import { SiteLayout } from "@/components/layout/SiteLayout";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const faqSections = [
  {
    title: "Ordering",
    items: [
      { q: "How do I place an order?", a: "Use the room planner/portal to design your cabinets and receive a quote, then submit your order online. Our team reviews every design for accuracy before manufacturing begins." },
      { q: "What's the minimum order?", a: "No minimum order. Whether you need a single cabinet or a full kitchen, we're happy to help." },
      { q: "Can I change my order after submitting?", a: "Contact us as soon as possible if you need to make changes. We'll do our best to accommodate requests before manufacturing begins." },
    ],
  },
  {
    title: "Materials & Quality",
    items: [
      { q: "What materials do you use?", a: "We use premium HMR (High Moisture Resistant) board for carcasses and offer doors in a wide range of finishes. All hardware is from Blum or Hettich." },
      { q: "Can I see samples?", a: "You can browse our material library online. If you'd like physical samples, contact us and we'll arrange them where operationally supported." },
      { q: "What edge banding do you use?", a: "We use 2mm ABS or matching PVC edge banding applied with industrial hot-melt adhesive for a durable, seamless finish." },
    ],
  },
  {
    title: "Delivery & Assembly",
    items: [
      { q: "How long does delivery take?", a: "Approximately 3 weeks once processed (project dependent). You'll receive a timeline at order confirmation." },
      { q: "Where do you deliver?", a: "We currently deliver within our service area. Contact us if you're unsure whether we cover your location." },
      { q: "How hard is it to assemble?", a: "Minimal tools required — just a cordless drill, a spirit level and a tape measure. We provide step-by-step instructions and video guides." },
      { q: "Can you recommend an installer?", a: "Yes — if you'd prefer professional installation, we can connect you with trusted local tradespeople in your area." },
    ],
  },
  {
    title: "Pricing",
    items: [
      { q: "Are there hidden costs?", a: "No. The portal quote is itemised — you receive instant cost estimates as you design. Every panel, hinge, and edge finish is included." },
      { q: "How does your pricing compare to big-box stores?", a: "Our custom-to-spec cabinets are competitively priced against modular big-box alternatives, with the advantage of exact sizing and trade-quality components. See our pricing page for detailed examples." },
    ],
  },
];

const FAQPage = () => {
  return (
    <SiteLayout>
      <section className="py-20 md:py-28 bg-card border-b border-border">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h1 className="text-4xl md:text-5xl text-foreground mb-6">Frequently Asked Questions</h1>
          <p className="text-lg text-muted-foreground">Everything you need to know about ordering custom flat-pack cabinetry.</p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-3xl space-y-10">
          {faqSections.map((section) => (
            <div key={section.title}>
              <h2 className="text-xl font-bold text-foreground mb-4">{section.title}</h2>
              <Accordion type="single" collapsible className="space-y-2">
                {section.items.map((item, i) => (
                  <AccordionItem key={i} value={`${section.title}-${i}`} className="border border-border rounded-lg bg-card px-4">
                    <AccordionTrigger className="text-sm font-semibold text-foreground hover:no-underline">{item.q}</AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground leading-relaxed">{item.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}

          <div className="text-center mt-16">
            <p className="text-muted-foreground mb-4">Still have questions?</p>
            <Link to="/contact">
              <Button className="font-semibold bg-accent text-accent-foreground hover:bg-accent/90">Get in Touch</Button>
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
};

export default FAQPage;
