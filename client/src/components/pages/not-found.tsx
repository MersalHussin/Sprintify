import { Link } from "react-router";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-background text-foreground text-center px-4">
      <h1 className="font-heading italic text-6xl text-primary">404</h1>
      <h2 className="mt-4 font-sans text-2xl font-medium">Page not found</h2>
      <p className="mt-2 text-muted-foreground text-base max-w-sm">
        Sorry, we couldn't find the page you're looking for.
      </p>
      <Button asChild className="mt-8 rounded-full" size="lg">
        <Link to="/">Back to Home</Link>
      </Button>
    </div>
  );
};

export default NotFound;