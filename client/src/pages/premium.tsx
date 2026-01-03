import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Crown, Check, Sparkles, FileText, BookOpen, Loader2 } from "lucide-react";
import type { User } from "@shared/schema";
import { useLocation } from "wouter";

export default function Premium() {
  const [location] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isVerifying, setIsVerifying] = useState(false);

  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/user/profile"],
  });

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/stripe/create-checkout");
      return await res.json();
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to start checkout. Please try again.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'true') {
      setIsVerifying(true);
      apiRequest("POST", "/api/stripe/verify-payment")
        .then(res => res.json())
        .then(data => {
          if (data.isPremium) {
            queryClient.invalidateQueries({ queryKey: ["/api/user/profile"] });
            toast({
              title: "Welcome to Premium!",
              description: "You now have access to all premium features.",
            });
          }
          setIsVerifying(false);
          window.history.replaceState({}, '', '/premium');
        })
        .catch(() => {
          setIsVerifying(false);
        });
    } else if (params.get('canceled') === 'true') {
      toast({
        title: "Checkout canceled",
        description: "You can upgrade anytime.",
      });
      window.history.replaceState({}, '', '/premium');
    }
  }, []);

  if (isLoading || isVerifying) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const isPremium = user?.isPremium;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 mb-4">
          <Crown className="h-8 w-8 text-amber-500" />
          <h1 className="text-4xl font-bold">Premium</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Unlock powerful features to supercharge your academic journey
        </p>
      </div>

      {isPremium ? (
        <Card className="mb-8 border-amber-500/50 bg-gradient-to-br from-amber-500/10 to-transparent">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center">
              <Crown className="h-8 w-8 text-amber-500" />
            </div>
            <CardTitle className="text-2xl">You're Premium!</CardTitle>
            <CardDescription>
              Thank you for supporting Edu Wealth. Enjoy all premium features.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Check className="h-5 w-5 text-chart-2" />
                <span>AI-Powered Note Generation</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Check className="h-5 w-5 text-chart-2" />
                <span>Priority Support</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Check className="h-5 w-5 text-chart-2" />
                <span>Early Access to New Features</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>Free</span>
                <Badge variant="secondary">Current</Badge>
              </CardTitle>
              <CardDescription>Basic features for students</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Check className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Expense tracking</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Calendar management</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Meeting notes</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Seminar browsing</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" disabled>
                Current Plan
              </Button>
            </CardFooter>
          </Card>

          <Card className="border-primary/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-medium rounded-bl-lg">
              Recommended
            </div>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-amber-500" />
                <span>Premium</span>
              </CardTitle>
              <CardDescription>
                <span className="text-3xl font-bold">$9.99</span>
                <span className="text-muted-foreground"> one-time</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Check className="h-4 w-4 text-chart-2" />
                <span className="text-sm">Everything in Free</span>
              </div>
              <div className="flex items-center gap-3">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">AI-Powered Note Generation</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="h-4 w-4 text-chart-2" />
                <span className="text-sm">Priority support</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="h-4 w-4 text-chart-2" />
                <span className="text-sm">Early access to new features</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={() => checkoutMutation.mutate()}
                disabled={checkoutMutation.isPending}
                data-testid="button-upgrade-premium"
              >
                {checkoutMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Crown className="h-4 w-4 mr-2" />
                    Upgrade to Premium
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      <div className="text-center text-sm text-muted-foreground">
        <p>Secure payment powered by Stripe. Cancel anytime.</p>
      </div>
    </div>
  );
}
