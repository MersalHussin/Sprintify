import { useState, useCallback } from "react";
import { MessageSquare } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useContactModal } from "@/context/contact-modal-context";

/* ────────────────────────────── Newsletter Section ────────────────────────── */

function Newsletter() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const { open: openContact } = useContactModal();

  const handleSubscribe = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!email) return;
      // كمل بقى ياحُحسيني
    },
    [email],
  );

  return (
    <section
      id="contact"
      aria-labelledby="newsletter-heading"
      className="relative overflow-hidden bg-foreground text-background"
    >
      {/* Subtle gradient overlay */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--primary)_0%,_transparent_70%)] opacity-[0.07]"
        aria-hidden="true"
      />

      <div className="relative mx-auto flex w-full max-w-4xl flex-col items-center gap-8 px-6 py-20 text-center sm:py-24 lg:py-28">
        {/* Heading */}
        <h2
          id="newsletter-heading"
          className="text-balance font-heading text-3xl italic leading-tight sm:text-4xl"
        >
          Subscribe to our Newsletter
        </h2>

        {/* Newsletter form */}
        <form
          onSubmit={handleSubscribe}
          className="flex w-full max-w-xl items-center gap-0 rounded-full bg-background/10 p-1.5 ring-1 ring-background/20 backdrop-blur-sm transition-all duration-300 focus-within:ring-2 focus-within:ring-primary/60"
        >
          <Input
            type="email"
            placeholder="Your email address"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11 flex-1 rounded-full border-0 bg-transparent px-5 text-background placeholder:text-background/50 focus-visible:border-0 focus-visible:ring-0 focus-visible:ring-transparent"
          />
          <Button
            type="submit"
            size="default"
            disabled={subscribed}
            className="h-11 shrink-0 rounded-full px-6"
          >
            {subscribed ? "Subscribed ✓" : "Subscribe"}
          </Button>
        </form>

        {/* Mission text */}
        <p className="max-w-md text-pretty text-sm text-background/60 sm:text-base">
          Our mission is to empower every team to ship faster and collaborate
          smarter.
        </p>

        {/* Divider */}
        <div className="flex w-full max-w-xs items-center gap-4">
          <span className="h-px flex-1 bg-background/15" />
          <span className="text-xs font-medium uppercase tracking-wider text-background/40">
            or
          </span>
          <span className="h-px flex-1 bg-background/15" />
        </div>

        {/* Contact Us button */}
        <Button
          variant="outline"
          size="lg"
          className="rounded-full cursor-pointer border-background/30 bg-transparent text-background hover:bg-background/10 hover:text-background"
          onClick={openContact}
        >
          Contact Us
          <MessageSquare data-icon="inline-end" aria-hidden="true" />
        </Button>
      </div>
    </section>
  );
}

export { Newsletter };
