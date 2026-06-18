import { Link } from "react-router";

function TermsText() {
  return (
    <p className="text-pretty text-center font-sans text-base font-normal text-foreground/70">
      By using our platform, you agree to our{" "}
      <Link
        to="/terms"
        className="underline underline-offset-2 hover:text-foreground"
      >
        Terms of Service
      </Link>
    </p>
  );
}

export { TermsText };
