import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, Wallet, Calendar, MessageCircle, ArrowRight, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import ewIconPath from "@assets/image_1767372559290.png";

type AuthMode = "login" | "signup";

export default function Landing() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/signup";
      const body = mode === "login" 
        ? { email, password } 
        : { email, password, fullName };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: "Error",
          description: data.error || "Something went wrong",
          variant: "destructive",
        });
        return;
      }

      // Invalidate the auth query to trigger a refetch and redirect
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      // Force refetch to update isAuthenticated state
      await queryClient.refetchQueries({ queryKey: ["/api/auth/user"] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to connect to server",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <img src={ewIconPath} alt="EduWealth" className="h-10 w-10 rounded-full object-contain" />
            <h1 className="text-lg font-semibold">Edu Wealth</h1>
          </div>
          <Button 
            variant="ghost" 
            onClick={() => {
              const authSection = document.getElementById("auth-section");
              authSection?.scrollIntoView({ behavior: "smooth" });
            }}
            data-testid="button-header-login"
          >
            Sign In
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
            <Button 
              size="lg" 
              onClick={() => {
                const authSection = document.getElementById("auth-section");
                authSection?.scrollIntoView({ behavior: "smooth" });
              }}
              data-testid="button-get-started"
            >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
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

        <section id="auth-section" className="bg-muted py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-md mx-auto">
              <Card>
                <CardHeader className="text-center">
                  <CardTitle>{mode === "login" ? "Welcome Back" : "Create Account"}</CardTitle>
                  <CardDescription>
                    {mode === "login" 
                      ? "Sign in to access your dashboard" 
                      : "Start your journey to success"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {mode === "signup" && (
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                          id="fullName"
                          type="text"
                          placeholder="Enter your full name"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          data-testid="input-fullname"
                        />
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        data-testid="input-email"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder={mode === "signup" ? "Create a password (min 6 characters)" : "Enter your password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        data-testid="input-password"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isLoading}
                      data-testid="button-submit-auth"
                    >
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {mode === "login" ? "Sign In" : "Create Account"}
                    </Button>
                  </form>
                  <div className="mt-4 text-center text-sm text-muted-foreground">
                    {mode === "login" ? (
                      <>
                        Don't have an account?{" "}
                        <button
                          type="button"
                          onClick={() => setMode("signup")}
                          className="text-primary hover:underline"
                          data-testid="link-switch-to-signup"
                        >
                          Sign up
                        </button>
                      </>
                    ) : (
                      <>
                        Already have an account?{" "}
                        <button
                          type="button"
                          onClick={() => setMode("login")}
                          className="text-primary hover:underline"
                          data-testid="link-switch-to-login"
                        >
                          Sign in
                        </button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
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
