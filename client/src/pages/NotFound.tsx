import { Link } from "wouter";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/states";

export default function NotFound() {
  return (
    <div className="mh-container py-16">
      <EmptyState
        icon={<Compass className="h-6 w-6" />}
        title="Page not found"
        description="The page you're looking for doesn't exist or has moved. Try the storefront instead."
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <Button asChild><Link to="/">Back to home</Link></Button>
            <Button asChild variant="outline"><Link to="/products">Browse products</Link></Button>
          </div>
        }
      />
    </div>
  );
}
