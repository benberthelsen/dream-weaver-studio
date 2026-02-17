import { SiteLayout } from "@/components/layout/SiteLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Monitor, Ruler, Palette, ShoppingCart, Phone, Mail } from "lucide-react";

const features = [
  { icon: Monitor, title: "3D Room Planner", description: "Drag and drop cabinets into a realistic 3D view of your room." },
  { icon: Ruler, title: "Custom to the Millimetre", description: "Enter your exact measurements and every cabinet is made to fit." },
  { icon: Palette, title: "Choose Your Finishes", description: "Browse materials from leading brands. Mix and match doors and panels." },
  { icon: ShoppingCart, title: "Live Pricing", description: "See itemised pricing update in real time as you design." },
];

const RoomPlannerPage = () => {
  return (
    <SiteLayout>
      <section className="py-20 md:py-28 bg-card border-b border-border">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h1 className="text-4xl md:text-5xl text-foreground mb-6">Design Your Space in 3D</h1>
          <p className="text-lg text-muted-foreground leading-relaxed mb-8">Use our online room planner to design your cabinets and view an instant quote.</p>
          <Button size="lg" className="font-semibold text-base px-8 bg-accent text-accent-foreground hover:bg-accent/90" asChild>
            <a href="https://bower.cabinetry.online/" target="_blank" rel="noopener noreferrer">
              Open Room Planner <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          </Button>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {features.map((f) => (
              <Card key={f.title} className="border-border bg-card">
                <CardContent className="pt-6 pb-6 px-6 space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                    <f.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <div className="aspect-video rounded-lg border border-border bg-card flex items-center justify-center">
            <div className="text-center space-y-2">
              <Monitor className="h-12 w-12 text-muted-foreground mx-auto" />
              <p className="text-muted-foreground text-sm">3D Room Planner Preview</p>
            </div>
          </div>
          <p className="mt-6 text-sm text-muted-foreground">Works on desktop, tablet and mobile. No software to install.</p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 text-center max-w-lg">
          <p className="text-foreground font-semibold mb-3">Need help?</p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="tel:+61437732286" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors">
              <Phone className="h-4 w-4" /> 0437 732 286
            </a>
            <a href="mailto:info@bowerbuilding.net" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors">
              <Mail className="h-4 w-4" /> info@bowerbuilding.net
            </a>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
};

export default RoomPlannerPage;
