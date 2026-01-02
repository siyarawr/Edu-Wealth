import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Wallet, Calendar, MessageCircle, ArrowRight } from "lucide-react";
import ewIconPath from "@assets/image_1767372559290.png";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <img src={ewIconPath} alt="EduWealth" className="h-10 w-10 rounded-full object-contain" />
            <h1 className="text-lg font-semibold">Edu Wealth</h1>
          </div>
          <Button asChild data-testid="button-header-login">
            <a href="/api/login">Sign In</a>
          </Button>
        </div>
      </header>

      <main>
        <section className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-4xl font-bold tracking-tight mb-4">
            Your Complete Student Success Platform
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Manage your finances, discover opportunities, plan your academic journey, and connect with peers - all in one place.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Button size="lg" asChild data-testid="button-get-started">
              <a href="/api/login">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild data-testid="button-learn-more">
              <a href="#features">Learn More</a>
            </Button>
          </div>
        </section>

        <section id="features" className="container mx-auto px-4 py-16">
          <h3 className="text-2xl font-bold text-center mb-12">Everything You Need to Succeed</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <Wallet className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Financial Management</CardTitle>
                <CardDescription>
                  Track expenses, set budgets, and manage your student finances with ease.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <GraduationCap className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Opportunity Discovery</CardTitle>
                <CardDescription>
                  Find internships, scholarships, and calculate your university acceptance rates.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Calendar className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Academic Planning</CardTitle>
                <CardDescription>
                  Organize seminars, manage meeting notes, and stay on top of your schedule.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <MessageCircle className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Secure Communication</CardTitle>
                <CardDescription>
                  Connect with classmates and mentors through secure 1-on-1 messaging.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        <section className="bg-muted py-16">
          <div className="container mx-auto px-4 text-center">
            <h3 className="text-2xl font-bold mb-4">Ready to Start Your Journey?</h3>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Join thousands of students who are taking control of their academic and financial future.
            </p>
            <Button size="lg" asChild data-testid="button-signup-cta">
              <a href="/api/login">
                Sign Up with Google or Email
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Edu Wealth - Empowering Students for Success</p>
        </div>
      </footer>
    </div>
  );
}
