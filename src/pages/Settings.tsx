import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useMoodTheme } from "@/hooks/useMoodTheme";
import { useAnalyticsSettings } from "@/hooks/useAnalyticsSettings";
import { DownloadIcon, UploadIcon, Palette, Shield, Database, BarChart3 } from "lucide-react";

export default function Settings() {
  const { user, signOut } = useAuth();
  const { currentTheme, setTheme, themes } = useMoodTheme();
  const { settings, toggleCard, updateSetting } = useAnalyticsSettings();
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
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
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
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Label>Mood Grid Theme</Label>
                  <InfoTooltip content="Choose how mood colors appear in your calendar grid" />
                </div>
                <Select value={currentTheme.name} onValueChange={setTheme}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {themes.map((theme) => (
                      <SelectItem key={theme.name} value={theme.name}>
                        <div className="flex items-center gap-3">
                          <div className="flex gap-0">
                            {theme.colors.map((color, index) => (
                              <div
                                key={index}
                                className="w-3 h-3 border-0"
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                          <span>{theme.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Preview how different color themes look in your mood calendar
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card className="card-glow">
            <CardHeader>
              <CardTitle>Analytics Dashboard</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-medium mb-4">Visible Cards</h3>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { id: "overview-stats", name: "Overview Statistics" },
                    { id: "progress-over-time", name: "Progress Over Time" },
                    { id: "category-performance", name: "Category Performance" },
                    { id: "habit-streaks", name: "Habit Streaks" },
                    { id: "mood-grid", name: "Mood Calendar Grid" },
                    { id: "mood-trends", name: "Mood Trends Chart" }
                  ].map(card => (
                    <div key={card.id} className="flex items-center justify-between">
                      <Label htmlFor={card.id}>{card.name}</Label>
                      <Switch 
                        id={card.id}
                        checked={settings.visibleCards.includes(card.id as any)}
                        onCheckedChange={() => toggleCard(card.id as any)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="combine-categories">Combine Task Categories</Label>
                    <p className="text-sm text-muted-foreground">Show morning, daily, and evening tasks together</p>
                  </div>
                  <Switch 
                    id="combine-categories"
                    checked={settings.combineTaskCategories}
                    onCheckedChange={(checked) => updateSetting('combineTaskCategories', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="combine-habits">Combine with Habits</Label>
                    <p className="text-sm text-muted-foreground">Show tasks and habits in the same checklist</p>
                  </div>
                  <Switch 
                    id="combine-habits"
                    checked={settings.combineWithHabits}
                    onCheckedChange={(checked) => updateSetting('combineWithHabits', checked)}
                  />
                </div>
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
