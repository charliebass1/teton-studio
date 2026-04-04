import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { getDeal } from "@/api";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BrandStudio } from "@/components/studio/BrandStudio";
import { PositioningCanvas } from "@/components/studio/PositioningCanvas";
import { GtmSprinter } from "@/components/studio/GtmSprinter";
import type { Deal } from "@/types";

export default function DealDetail() {
  const { id } = useParams<{ id: string }>();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getDeal(id)
      .then(setDeal)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!deal) {
    return <p className="text-[var(--muted-foreground)]">Deal not found.</p>;
  }

  return (
    <div>
      <Link
        to="/deals"
        className="inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Deals
      </Link>

      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold tracking-tight">
            {deal.company_name}
          </h1>
          <Badge variant="secondary">{deal.sector}</Badge>
          <Badge variant="outline">{deal.stage}</Badge>
        </div>
        <p className="text-[var(--muted-foreground)]">{deal.description}</p>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="brand">Brand Studio</TabsTrigger>
          <TabsTrigger value="positioning">Positioning</TabsTrigger>
          <TabsTrigger value="gtm">GTM Sprinter</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Deal Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="text-sm font-medium">Target Market: </span>
                <span className="text-sm text-[var(--muted-foreground)]">
                  {deal.target_market}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium">Competitors: </span>
                <span className="text-sm text-[var(--muted-foreground)]">
                  {deal.competitors}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium">Product Capabilities: </span>
                <span className="text-sm text-[var(--muted-foreground)]">
                  {deal.product_capabilities}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium">Status: </span>
                <Badge
                  variant={deal.status === "active" ? "default" : "secondary"}
                >
                  {deal.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="brand">
          <BrandStudio deal={deal} />
        </TabsContent>

        <TabsContent value="positioning">
          <PositioningCanvas deal={deal} />
        </TabsContent>

        <TabsContent value="gtm">
          <GtmSprinter deal={deal} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
