import { useState, useCallback, useEffect, useRef } from "react";
import { Send, X, Mail, User, MessageSquare } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useContactModal } from "@/context/contact-modal-context";

/**
 * Global Contact-Us modal.
 *
 * Reads its open/close state from `ContactModalContext`, so any component
 * anywhere in the tree can trigger it via `useContactModal().open()`.
 *
 * Render this component **once** near the app root (e.g. in the home page).
 */
function ContactModal() {
  const { isOpen: open, close: onClose } = useContactModal();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const backdropRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  /* Close on Escape */
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  /* Focus first input on open */
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => firstInputRef.current?.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, [open]);

  /* Lock body scroll */
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setName("");
        setEmail("");
        setMessage("");
        onClose();
      }, 2000);
    },
    [onClose],
  );

  if (!open) return null;

  return (
    <div
      ref={backdropRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="contact-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === backdropRef.current) onClose();
      }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-foreground/60 backdrop-blur-sm animate-in fade-in duration-200"
        aria-hidden="true"
      />

      {/* Modal panel */}
      <div
        className={cn(
          "relative z-10 w-full max-w-lg rounded-2xl border border-border bg-background p-6 shadow-2xl sm:p-8",
          "animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300",
        )}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close contact form"
          className="absolute end-4 top-4 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="size-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="mb-3 flex size-12 items-center justify-center rounded-xl bg-primary/10">
            <Mail className="size-6 text-primary" />
          </div>
          <h3
            id="contact-modal-title"
            className="font-heading text-2xl italic text-foreground"
          >
            Contact Us
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            We'd love to hear from you. Send us a message and we'll get back to
            you as soon as possible.
          </p>
        </div>

        {/* Form */}
        {submitted ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center animate-in fade-in zoom-in-95 duration-300">
            <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
              <Send className="size-7 text-primary" />
            </div>
            <p className="text-lg font-medium text-foreground">
              Message Sent!
            </p>
            <p className="text-sm text-muted-foreground">
              Thank you for reaching out. We'll respond soon.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Name field */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="contact-name">
                <User className="size-3.5 text-muted-foreground" />
                Name
              </Label>
              <Input
                ref={firstInputRef}
                id="contact-name"
                type="text"
                placeholder="Your name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Email field */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="contact-email">
                <Mail className="size-3.5 text-muted-foreground" />
                Email
              </Label>
              <Input
                id="contact-email"
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Message field */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="contact-message">
                <MessageSquare className="size-3.5 text-muted-foreground" />
                Message
              </Label>
              <Textarea
                id="contact-message"
                placeholder="How can we help you?"
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="resize-none"
              />
            </div>

            <Button type="submit" size="lg" className="mt-1 rounded-full">
              Send Message
              <Send data-icon="inline-end" aria-hidden="true" />
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

export { ContactModal };
