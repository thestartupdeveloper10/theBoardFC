import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, MapPin, Phone } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "", subject: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    
    try {
      // Insert form data into the contact table
      const { error: supabaseError } = await supabase
        .from('contact')
        .insert([
          { 
            name: form.name,
            email: form.email,
            message: form.message,
            subject: form.subject || 'Website Contact Form',
            created_at: new Date().toISOString(),
            status: 'unread'
          }
        ]);
      
      if (supabaseError) throw supabaseError;
      
      setSubmitted(true);
      setForm({ name: "", email: "", message: "", subject: "" });
    } catch (err: any) {
      console.error('Error submitting contact form:', err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl">
      <h1 className="text-3xl md:text-4xl font-bold mb-2 text-center">Contact Us</h1>
      <p className="text-muted-foreground text-center mb-8 max-w-2xl mx-auto">
        Have a question, feedback, or want to get in touch with Board FC? Fill out the form below or use the contact details provided. We look forward to hearing from you!
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Contact Info & Map */}
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <MapPin className="text-primary" />
              <span>
                <strong>Stadium:</strong> Kenya School of Law<br />
                Karen, Nairobi
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="text-primary" />
              <span>
                <a href="mailto:theboard@gmail.com" className="hover:underline">
                theboard@gmail.com
                </a>
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="text-primary" />
              <span>
                <a href="tel:+254713672018" className="hover:underline">
                  +254 713 672018
                </a>
              </span>
            </div>
          </div>
          <div className="rounded-lg overflow-hidden shadow border border-border">
            <iframe
              title="Board FC Stadium Map"
              src="https://www.google.com/maps/place/Kenya+School+Of+Law/@-1.359012,36.750671,17z/data=!3m1!4b1!4m6!3m5!1s0x182f0517ec74610b:0x4b3bb1970771ad43!8m2!3d-1.359012!4d36.750671!16s%2Fm%2F04lh2t4?entry=ttu&g_ep=EgoyMDI1MDQyOS4wIKXMDSoASAFQAw%3D%3D"
              width="100%"
              height="220"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <div className="text-sm text-muted-foreground">
            <strong>About Board FC:</strong> <br />
            Board FC is dedicated to football excellence, community engagement, and inspiring the next generation of players and fans.
          </div>
        </div>

        {/* Contact Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-background/80 rounded-lg shadow p-6 border border-border space-y-5"
        >
          <h2 className="text-xl font-semibold mb-2">Send Us a Message</h2>
          {submitted && (
            <Alert>
              <AlertDescription>
                Thank you for reaching out! We'll get back to you soon.
              </AlertDescription>
            </Alert>
          )}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
              placeholder="Your name"
              disabled={submitting || submitted}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              required
              placeholder="you@email.com"
              disabled={submitting || submitted}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={form.subject}
              onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
              placeholder="What is this regarding?"
              disabled={submitting || submitted}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={form.message}
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
              required
              rows={5}
              placeholder="Type your message here..."
              disabled={submitting || submitted}
            />
          </div>
          <Button 
            type="submit" 
            className="w-full" 
            disabled={submitting || submitted}
          >
            {submitting ? "Sending..." : submitted ? "Message Sent" : "Send Message"}
          </Button>
          {submitted && (
            <Button 
              type="button" 
              variant="outline" 
              className="w-full" 
              onClick={() => {
                setSubmitted(false);
                setForm({ name: "", email: "", message: "", subject: "" });
              }}
            >
              Send Another Message
            </Button>
          )}
        </form>
      </div>
    </div>
  );
} 