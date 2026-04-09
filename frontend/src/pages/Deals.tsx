import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { listDeals } from "@/api";
import type { Deal } from "@/types";

export default function Deals() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listDeals()
      .then(setDeals)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight mb-6">Deals</h1>
      {loading && (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      )}
      {!loading && deals.length === 0 && (
        <p className="text-[var(--muted-foreground)]">No deals found.</p>
      )}
      <div className="space-y-3">
        {deals.map((deal) => (
          <Link key={deal.id} to={`/deals/${deal.id}`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer mb-3">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{deal.company_name}</CardTitle>
                    <CardDescription className="mt-1">
                      {deal.description.slice(0, 150)}
                      {deal.description.length > 150 ? "..." : ""}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="secondary">{deal.sector}</Badge>
                    <Badge variant="outline">{deal.stage}</Badge>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
