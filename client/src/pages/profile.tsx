import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  User,
  MapPin,
  GraduationCap,
  DollarSign,
  Briefcase,
  Heart,
  Save,
  CheckCircle,
  Mail,
  Linkedin
} from "lucide-react";
import type { User as UserType } from "@shared/schema";

const interestOptions = [
  "Technology", "Business", "Science", "Arts", "Healthcare",
  "Education", "Finance", "Engineering", "Law", "Social Sciences"
];

const countries = [
  "United States", "Canada", "United Kingdom", "Australia", "Germany",
  "France", "Netherlands", "Switzerland", "Singapore", "Japan", "Other"
];

export default function Profile() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    linkedinUrl: "",
    country: "",
    state: "",
    city: "",
    university: "",
    major: "",
    gpa: 3.0,
    satScore: 1200,
    monthlyIncome: 0,
    monthlyBudget: 0,
    interests: [] as string[],
    extracurriculars: "",
  });

  const { data: user, isLoading } = useQuery<UserType>({
    queryKey: ["/api/user/profile"],
  });

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        email: user.email || "",
        linkedinUrl: user.linkedinUrl || "",
        country: user.country || "",
        state: user.state || "",
        city: user.city || "",
        university: user.university || "",
        major: user.major || "",
        gpa: user.gpa || 3.0,
        satScore: user.satScore || 1200,
        monthlyIncome: user.monthlyIncome || 0,
        monthlyBudget: user.monthlyBudget || 0,
        interests: user.interests ? user.interests.split(",") : [],
        extracurriculars: user.extracurriculars || "",
      });
    }
  }, [user]);

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest("PATCH", "/api/user/profile", {
        ...data,
        interests: data.interests.join(","),
        isOnboardingComplete: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/profile"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Profile saved",
        description: "Your profile has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const toggleInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="p-8 max-w-3xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-10 w-48 bg-muted rounded" />
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-20 bg-muted rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">My Profile</h1>
          <p className="text-muted-foreground mt-1">Set up your profile to get personalized recommendations</p>
        </div>
        {user?.isOnboardingComplete && (
          <Badge variant="secondary" className="gap-1">
            <CheckCircle className="h-3 w-3" />
            Profile Complete
          </Badge>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="p-6 rounded-xl bg-card space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <User className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Personal Information</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="e.g., John Doe"
                className="bg-muted/50 border-0"
                data-testid="input-fullname"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g., john@email.com"
                  className="bg-muted/50 border-0 pl-10"
                  data-testid="input-email"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>LinkedIn Profile</Label>
              <div className="relative">
                <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={formData.linkedinUrl}
                  onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                  placeholder="e.g., linkedin.com/in/johndoe"
                  className="bg-muted/50 border-0 pl-10"
                  data-testid="input-linkedin"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-xl bg-card space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Location</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Country</Label>
              <Select
                value={formData.country}
                onValueChange={(value) => setFormData({ ...formData, country: value })}
              >
                <SelectTrigger className="bg-muted/50 border-0" data-testid="select-country">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country} value={country}>{country}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>State/Province</Label>
              <Input
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                placeholder="e.g., California"
                className="bg-muted/50 border-0"
                data-testid="input-state"
              />
            </div>
            <div className="space-y-2">
              <Label>City</Label>
              <Input
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="e.g., San Francisco"
                className="bg-muted/50 border-0"
                data-testid="input-city"
              />
            </div>
          </div>
        </div>

        <div className="p-6 rounded-xl bg-card space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Academics</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>University</Label>
              <Input
                value={formData.university}
                onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                placeholder="e.g., Stanford University"
                className="bg-muted/50 border-0"
                data-testid="input-university"
              />
            </div>
            <div className="space-y-2">
              <Label>Major/Field of Study</Label>
              <Input
                value={formData.major}
                onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                placeholder="e.g., Computer Science"
                className="bg-muted/50 border-0"
                data-testid="input-major"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>GPA (4.0 scale)</Label>
                <span className="text-sm font-mono font-medium text-primary">{formData.gpa.toFixed(2)}</span>
              </div>
              <Slider
                value={[formData.gpa]}
                onValueChange={([value]) => setFormData({ ...formData, gpa: value })}
                min={0}
                max={4.0}
                step={0.05}
                data-testid="slider-gpa"
              />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>SAT Score</Label>
                <span className="text-sm font-mono font-medium text-primary">{formData.satScore}</span>
              </div>
              <Slider
                value={[formData.satScore]}
                onValueChange={([value]) => setFormData({ ...formData, satScore: value })}
                min={400}
                max={1600}
                step={10}
                data-testid="slider-sat"
              />
            </div>
          </div>
        </div>

        <div className="p-6 rounded-xl bg-card space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Finances</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Monthly Income ($)</Label>
              <Input
                type="number"
                value={formData.monthlyIncome || ""}
                onChange={(e) => setFormData({ ...formData, monthlyIncome: parseFloat(e.target.value) || 0 })}
                placeholder="e.g., 2000"
                className="bg-muted/50 border-0"
                data-testid="input-income"
              />
            </div>
            <div className="space-y-2">
              <Label>Monthly Budget ($)</Label>
              <Input
                type="number"
                value={formData.monthlyBudget || ""}
                onChange={(e) => setFormData({ ...formData, monthlyBudget: parseFloat(e.target.value) || 0 })}
                placeholder="e.g., 1500"
                className="bg-muted/50 border-0"
                data-testid="input-budget"
              />
            </div>
          </div>
        </div>

        <div className="p-6 rounded-xl bg-card space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Briefcase className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Extracurriculars</h2>
          </div>
          <div className="space-y-2">
            <Label>Activities & Leadership Roles</Label>
            <Input
              value={formData.extracurriculars}
              onChange={(e) => setFormData({ ...formData, extracurriculars: e.target.value })}
              placeholder="e.g., Student Government President, Debate Team, Volunteer at Food Bank"
              className="bg-muted/50 border-0"
              data-testid="input-extracurriculars"
            />
            <p className="text-xs text-muted-foreground">Separate multiple activities with commas</p>
          </div>
        </div>

        <div className="p-6 rounded-xl bg-card space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Interests</h2>
          </div>
          <p className="text-sm text-muted-foreground">Select your areas of interest for personalized recommendations</p>
          <div className="flex flex-wrap gap-2">
            {interestOptions.map((interest) => (
              <Badge
                key={interest}
                variant={formData.interests.includes(interest) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleInterest(interest)}
                data-testid={`badge-interest-${interest.toLowerCase().replace(/\s+/g, "-")}`}
              >
                {interest}
              </Badge>
            ))}
          </div>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={updateMutation.isPending}
          data-testid="button-save-profile"
        >
          <Save className="h-4 w-4 mr-2" />
          {updateMutation.isPending ? "Saving..." : "Save Profile"}
        </Button>
      </form>
    </div>
  );
}
