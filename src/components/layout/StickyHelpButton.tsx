import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageCircle, X, Send } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const projectTypes = ["Kitchen", "Laundry", "Bathroom", "Wardrobe", "Other"];

export function StickyHelpButton() {
  const [open, setOpen] = useState(false);
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
      message: `Quick help request: ${projectType}`,
      source_page: window.location.pathname,
    });

    if (error) {
      toast.error("Something went wrong. Please call us on 0437 732 286.");
    } else {
      toast.success("Thanks! We'll call you back shortly.");
      form.reset();
      setProjectType("");
      setOpen(false);
    }
    setSending(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open && (
        <div className="mb-3 w-72 rounded-xl border border-border bg-card p-5 shadow-xl animate-in slide-in-from-bottom-3">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold text-foreground">Need help measuring?</p>
            <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <Input name="name" placeholder="Your name" required maxLength={100} className="h-9 text-sm" />
            <Input name="phone" type="tel" placeholder="Phone number" required maxLength={20} className="h-9 text-sm" />
            <Select value={projectType} onValueChange={setProjectType}>
              <SelectTrigger className="h-9 text-sm">
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
              {sending ? "Sending…" : "Call Me Back"}
            </Button>
          </form>
        </div>
      )}
      <Button
        onClick={() => setOpen(!open)}
        size="lg"
        className="rounded-full shadow-lg h-14 w-14 p-0"
      >
        {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
      </Button>
    </div>
  );
}
