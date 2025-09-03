import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Calendar, Target, TrendingUp, CheckCircle, Brain } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-hero-gradient">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-white mb-6 leading-tight">
            Transform Your Life with
            <span className="text-gradient bg-gradient-to-r from-accent-green to-accent-blue bg-clip-text text-transparent"> Lifeo</span>
          </h1>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Your personal life management companion. Track habits, manage routines, 
            monitor your mood, and achieve your goals with beautiful insights and analytics.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="px-8 py-3 text-lg">
                Get Started
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="px-8 py-3 text-lg bg-white/10 border-white/20 text-white hover:bg-white/20">
              Learn More
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="card-glow border-soft-green/20">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-soft-green/20 flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-accent-green" />
              </div>
              <CardTitle className="text-foreground">Smart Goal Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Set and track your personal goals with intelligent insights and progress visualization.
              </p>
            </CardContent>
          </Card>

          <Card className="card-glow border-soft-green/20">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-soft-green/20 flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-accent-green" />
              </div>
              <CardTitle className="text-foreground">Habit Building</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Build lasting habits with streak tracking, reminders, and motivational insights.
              </p>
            </CardContent>
          </Card>

          <Card className="card-glow border-soft-green/20">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-soft-green/20 flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-accent-green" />
              </div>
              <CardTitle className="text-foreground">Routine Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Organize your daily routines and stay consistent with smart scheduling.
              </p>
            </CardContent>
          </Card>

          <Card className="card-glow border-soft-green/20">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-soft-green/20 flex items-center justify-center mb-4">
                <Brain className="h-6 w-6 text-accent-green" />
              </div>
              <CardTitle className="text-foreground">Mood Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Monitor your emotional wellbeing with beautiful mood grids and trend analysis.
              </p>
            </CardContent>
          </Card>

          <Card className="card-glow border-soft-green/20">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-soft-green/20 flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-accent-green" />
              </div>
              <CardTitle className="text-foreground">Analytics & Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Get detailed analytics and insights to understand your patterns and progress.
              </p>
            </CardContent>
          </Card>

          <Card className="card-glow border-soft-green/20">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-soft-green/20 flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-accent-green" />
              </div>
              <CardTitle className="text-foreground">Progress Visualization</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Beautiful charts and graphs that make your progress visible and motivating.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="card-glow max-w-2xl mx-auto border-soft-green/20">
            <CardContent className="pt-8">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Ready to Transform Your Life?
              </h2>
              <p className="text-muted-foreground mb-6">
                Join thousands of users who have already started their journey to a better, 
                more organized life with Lifeo.
              </p>
              <Link to="/auth">
                <Button size="lg" className="px-12 py-3 text-lg">
                  Start Your Journey
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}