import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const projectTypes = ["Kitchen", "Laundry", "Bathroom", "Wardrobe", "Other"];

export function FooterCapture() {
  const [sending, setSending] = useState(false);
  const [projectType, setProjectType] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const name = (formData.get("name") as string)?.trim();
    const phone = (formData.get("phone") as string)?.trim();

    if (!name || !phone || !projectType) {
      toast.error("Please fill in all fields.");
      setSending(false);
      return;
    }

    const { error } = await supabase.from("contact_submissions").insert({
      name_first: name,
      name_last: "",
      email: "",
      phone,
      project_type: projectType,
      message: `Footer quick enquiry: ${projectType}`,
      source_page: window.location.pathname,
    });

    if (error) {
      toast.error("Something went wrong. Please call us on 0437 732 286.");
    } else {
      toast.success("Thanks! We'll be in touch shortly.");
      form.reset();
      setProjectType("");
    }
    setSending(false);
  };

  return (
    <div className="border-t border-border pt-8">
      <h4 className="font-semibold text-foreground text-sm uppercase tracking-wider mb-4">Quick Enquiry</h4>
      <form onSubmit={handleSubmit} className="space-y-3">
        <Input name="name" placeholder="Your name" required maxLength={100} className="h-9 text-sm bg-secondary/50" />
        <Input name="phone" type="tel" placeholder="Phone number" required maxLength={20} className="h-9 text-sm bg-secondary/50" />
        <Select value={projectType} onValueChange={setProjectType}>
          <SelectTrigger className="h-9 text-sm bg-secondary/50">
            <SelectValue placeholder="What are you building?" />
          </SelectTrigger>
          <SelectContent>
            {projectTypes.map((t) => (
              <SelectItem key={t} value={t.toLowerCase()}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button type="submit" size="sm" className="w-full font-semibold" disabled={sending}>
          <Send className="mr-2 h-3.5 w-3.5" />
          {sending ? "Sending…" : "Get in Touch"}
        </Button>
      </form>
    </div>
  );
}
