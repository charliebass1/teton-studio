import { Link } from "react-router-dom";
import { Briefcase, Sparkles } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function Dashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight mb-6">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        <Link to="/deals">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Briefcase className="h-6 w-6 text-[var(--muted-foreground)]" />
                <div>
                  <CardTitle className="text-lg">Deals</CardTitle>
                  <CardDescription>
                    Track and manage your deal pipeline
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </Link>
        <Link to="/studio">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Sparkles className="h-6 w-6 text-[var(--muted-foreground)]" />
                <div>
                  <CardTitle className="text-lg">Studio</CardTitle>
                  <CardDescription>
                    Brand, positioning, and GTM tools for portfolio companies
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  );
}
