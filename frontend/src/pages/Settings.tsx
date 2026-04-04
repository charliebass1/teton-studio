import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function Settings() {
  const [supabaseUrl, setSupabaseUrl] = useState(
    localStorage.getItem("supabase_url") || ""
  );
  const [supabaseKey, setSupabaseKey] = useState(
    localStorage.getItem("supabase_anon_key") || ""
  );

  function handleSave() {
    localStorage.setItem("supabase_url", supabaseUrl);
    localStorage.setItem("supabase_anon_key", supabaseKey);
    toast.success("Settings saved. Reload to apply.");
  }

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight mb-6">Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Supabase Connection</CardTitle>
          <CardDescription>
            Configure your Supabase project URL and anon key. Leave blank to use
            demo mode with sample data.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">Supabase URL</Label>
            <Input
              id="url"
              placeholder="https://your-project.supabase.co"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="key">Supabase Anon Key</Label>
            <Input
              id="key"
              type="password"
              placeholder="eyJ..."
              value={supabaseKey}
              onChange={(e) => setSupabaseKey(e.target.value)}
            />
          </div>
          <Button onClick={handleSave}>Save</Button>
        </CardContent>
      </Card>
    </div>
  );
}
