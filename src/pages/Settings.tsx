import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { DownloadIcon, UploadIcon, Palette, Shield, Database } from "lucide-react";

export default function Settings() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [darkMode, setDarkMode] = useState(false);

  const exportData = async () => {
    toast({ title: "Export started", description: "Your data export will be ready shortly." });
  };

  return (
    <section aria-labelledby="settings-title" className="space-y-6 animate-fade-in">
      <h1 id="settings-title" className="text-3xl font-semibold">Settings</h1>

      <Tabs defaultValue="preferences" className="space-y-6">
        <TabsList>
          <TabsTrigger value="preferences" className="gap-2">
            <Palette className="h-4 w-4" />
            Preferences
          </TabsTrigger>
          <TabsTrigger value="data" className="gap-2">
            <Database className="h-4 w-4" />
            Data
          </TabsTrigger>
          <TabsTrigger value="account" className="gap-2">
            <Shield className="h-4 w-4" />
            Account
          </TabsTrigger>
        </TabsList>

        <TabsContent value="preferences">
          <Card className="card-glow">
            <CardHeader>
              <CardTitle>App Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="dark-mode">Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">Switch between light and dark themes</p>
                </div>
                <Switch id="dark-mode" checked={darkMode} onCheckedChange={setDarkMode} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data">
          <Card className="card-glow">
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-medium mb-2">Export Data</h3>
                <p className="text-sm text-muted-foreground mb-4">Download all your data as JSON.</p>
                <Button onClick={exportData} className="gap-2">
                  <DownloadIcon className="h-4 w-4" />
                  Export All Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account">
          <Card className="card-glow">
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-medium mb-2">Account Information</h3>
                <p className="text-sm"><span className="font-medium">Email:</span> {user?.email}</p>
              </div>
              <div>
                <Button onClick={() => signOut()} variant="outline">Sign Out</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </section>
  );
}
