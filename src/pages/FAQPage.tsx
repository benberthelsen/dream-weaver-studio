import { SiteLayout } from "@/components/layout/SiteLayout";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const faqSections = [
  {
    title: "Ordering",
    items: [
      {
        q: "How do I place an order?",
        a: "Sign up for a free account, design your cabinets in our 3D room planner, and submit your order online. Our team reviews every design for accuracy before manufacturing begins.",
      },
      {
        q: "Can I modify my order after placing it?",
        a: "You can make changes within 24 hours of placing your order. After that, manufacturing may have already started. Contact us as soon as possible if you need to make changes.",
      },
      {
        q: "Is there a minimum order?",
        a: "No minimum order. Whether you need a single cabinet or a full kitchen, we're happy to help.",
      },
    ],
  },
  {
    title: "Materials & Quality",
    items: [
      {
        q: "What materials do you use?",
        a: "We use premium HMR (High Moisture Resistant) board for carcasses and offer doors in a wide range of finishes from brands like Laminex and Polytec. All hardware is from Blum or Hettich.",
      },
      {
        q: "Are the cabinets moisture resistant?",
        a: "Yes. Our standard carcass material is HMR board which is specifically designed for wet areas like kitchens, laundries and bathrooms.",
      },
      {
        q: "What edge banding do you use?",
        a: "We use 2mm ABS or matching PVC edge banding applied with industrial hot-melt adhesive for a durable, seamless finish.",
      },
    ],
  },
  {
    title: "Delivery",
    items: [
      {
        q: "Where do you deliver?",
        a: "We currently deliver throughout South East Queensland. If you're outside this area, contact us and we'll see what we can arrange.",
      },
      {
        q: "How long does delivery take?",
        a: "Typical turnaround is 10–15 business days from order confirmation. Larger or complex orders may take longer. You'll receive a timeline at checkout.",
      },
      {
        q: "How is the order packaged?",
        a: "All panels are carefully wrapped and stacked on a pallet. Smaller orders may be boxed. Hardware is packed separately with clear labelling.",
      },
    ],
  },
  {
    title: "Assembly & Support",
    items: [
      {
        q: "Do I need special tools to assemble?",
        a: "No. A cordless drill, a spirit level and a tape measure are all you need. We provide step-by-step instructions and video guides.",
      },
      {
        q: "Can you recommend an installer?",
        a: "Yes — if you'd prefer professional installation, we can connect you with trusted local tradespeople in your area.",
      },
      {
        q: "What if something doesn't fit?",
        a: "Every panel is CNC-cut to within 0.1mm tolerance. If there's ever an issue, contact us and we'll sort it out — we stand behind our work.",
      },
    ],
  },
];

const FAQPage = () => {
  return (
    <SiteLayout>
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">
              FAQ
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Frequently Asked Questions
            </h1>
            <p className="text-lg text-muted-foreground">
              Everything you need to know about ordering custom flat-pack cabinetry.
            </p>
          </div>

          <div className="space-y-10">
            {faqSections.map((section) => (
              <div key={section.title}>
                <h2 className="text-xl font-bold text-foreground mb-4">{section.title}</h2>
                <Accordion type="single" collapsible className="space-y-2">
                  {section.items.map((item, i) => (
                    <AccordionItem key={i} value={`${section.title}-${i}`} className="border border-border rounded-lg bg-card px-4">
                      <AccordionTrigger className="text-sm font-semibold text-foreground hover:no-underline">
                        {item.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                        {item.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>

          <div className="text-center mt-16">
            <p className="text-muted-foreground mb-4">Still have questions?</p>
            <Link to="/contact">
              <Button className="font-semibold">Get in Touch</Button>
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
};

export default FAQPage;
