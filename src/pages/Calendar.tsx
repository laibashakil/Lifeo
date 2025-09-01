import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { DownloadIcon, UploadIcon } from "lucide-react";
import Analytics from "@/components/Analytics";
import { useAuth } from "@/hooks/useAuth";

export default function CalendarPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("analytics");

  const exportData = async () => {
    toast({ title: "Export feature coming soon", description: "Data export will be available in a future update." });
  };

  const importData = async () => {
    toast({ title: "Import feature coming soon", description: "Data import will be available in a future update." });
  };

  return (
    <section aria-labelledby="calendar-title" className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 id="calendar-title" className="text-3xl font-semibold">Calendar & Analytics</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-6">
          <Analytics />
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6">
          <Card className="card-glow">
            <CardHeader>
              <CardTitle>Monthly Calendar View</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">Interactive calendar view coming soon!</p>
                <p className="text-sm text-muted-foreground">This will show completion rates, mood trends, and streaks.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </section>
  );
}
