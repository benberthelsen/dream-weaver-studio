import { SiteLayout } from "@/components/layout/SiteLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Phone, Mail, MapPin } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const projectTypes = ["Kitchen", "Laundry", "Bathroom", "Wardrobe", "Other"];

const ContactPage = () => {
  const [sending, setSending] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);
    // Placeholder — will be wired to Supabase later
    setTimeout(() => {
      toast.success("Thanks! We'll be in touch within 1 business day.");
      setSending(false);
      (e.target as HTMLFormElement).reset();
    }, 800);
  };

  return (
    <SiteLayout>
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14 max-w-2xl mx-auto">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">
              Contact
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Let's Talk Cabinets
            </h1>
            <p className="text-lg text-muted-foreground">
              Have a question or ready to get started? Fill in the form below and we'll get back to you within one business day.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Contact form */}
            <Card className="lg:col-span-2 border-border bg-card">
              <CardContent className="p-6 md:p-8">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input id="name" required placeholder="Your name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input id="email" type="email" required placeholder="you@example.com" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" type="tel" placeholder="04XX XXX XXX" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="project-type">Project Type</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {projectTypes.map((t) => (
                            <SelectItem key={t} value={t.toLowerCase()}>{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea id="message" rows={5} placeholder="Tell us about your project…" />
                  </div>
                  <Button type="submit" className="w-full font-semibold" disabled={sending}>
                    {sending ? "Sending…" : "Send Enquiry"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact info sidebar */}
            <div className="space-y-6">
              <Card className="border-border bg-card">
                <CardContent className="p-6 space-y-5">
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">Phone</p>
                      <a href="tel:0400000000" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                        0400 000 000
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">Email</p>
                      <a href="mailto:info@bowerbuilding.net" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                        info@bowerbuilding.net
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">Location</p>
                      <p className="text-sm text-muted-foreground">Queensland, Australia</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border bg-card">
                <CardContent className="p-6">
                  <p className="text-sm font-semibold text-foreground mb-2">Response Time</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    We aim to respond to every enquiry within one business day by phone or email.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
};

export default ContactPage;
