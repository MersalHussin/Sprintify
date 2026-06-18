import { Link } from "react-router";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

function Cta() {
  return (
    <section
      id="cta"
      aria-labelledby="cta-heading"
      className="bg-background text-foreground"
    >
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center px-6 py-20 text-center sm:py-24 lg:py-32">
        <h2
          id="cta-heading"
          className="text-balance font-sans text-5xl leading-none text-foreground sm:text-6xl md:text-7xl"
        >
          Start <span className="font-heading italic text-primary">building</span> with your
          team <span className="font-heading italic text-primary">today</span>
        </h2>

        <Button
          asChild
          variant="outline"
          size="lg"
          className="mt-12 rounded-full sm:mt-14"
        >
          <Link to="/register">
            Get Started
            <ArrowRight data-icon="inline-end" aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </section>
  );
}

export { Cta };
