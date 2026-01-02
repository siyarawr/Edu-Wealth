import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calculator,
  GraduationCap,
  TrendingUp,
  Award,
  Users,
  BookOpen,
  Briefcase,
  Star,
  Target,
  Sparkles
} from "lucide-react";

interface CalculatorInputs {
  gpa: number;
  satScore: number;
  ecCount: number;
  leadershipRoles: number;
  essayQuality: number;
  recommendations: number;
  targetSchool: string;
}

const schools = [
  { name: "Harvard University", baseRate: 4, weight: 1.0 },
  { name: "Stanford University", baseRate: 4, weight: 1.0 },
  { name: "MIT", baseRate: 4, weight: 1.0 },
  { name: "Yale University", baseRate: 5, weight: 0.95 },
  { name: "Princeton University", baseRate: 6, weight: 0.92 },
  { name: "Columbia University", baseRate: 5, weight: 0.93 },
  { name: "UC Berkeley", baseRate: 15, weight: 0.85 },
  { name: "UCLA", baseRate: 12, weight: 0.87 },
  { name: "University of Michigan", baseRate: 23, weight: 0.80 },
  { name: "NYU", baseRate: 21, weight: 0.82 },
  { name: "Boston University", baseRate: 25, weight: 0.78 },
  { name: "Other Top 50", baseRate: 30, weight: 0.75 },
];

function calculateAcceptanceRate(inputs: CalculatorInputs): number {
  const school = schools.find(s => s.name === inputs.targetSchool) || schools[schools.length - 1];
  
  let baseChance = school.baseRate;
  
  const gpaBonus = Math.max(0, (inputs.gpa - 3.5) * 20);
  const satBonus = Math.max(0, (inputs.satScore - 1400) / 10);
  const ecBonus = Math.min(inputs.ecCount * 2, 15);
  const leadershipBonus = Math.min(inputs.leadershipRoles * 3, 12);
  const essayBonus = (inputs.essayQuality / 10) * 8;
  const recsBonus = (inputs.recommendations / 10) * 5;
  
  const totalBonus = (gpaBonus + satBonus + ecBonus + leadershipBonus + essayBonus + recsBonus) * school.weight;
  
  const finalRate = Math.min(95, baseChance + totalBonus);
  return Math.round(finalRate * 10) / 10;
}

export default function AcceptanceCalculator() {
  const [inputs, setInputs] = useState<CalculatorInputs>({
    gpa: 3.7,
    satScore: 1450,
    ecCount: 5,
    leadershipRoles: 2,
    essayQuality: 7,
    recommendations: 8,
    targetSchool: "Other Top 50",
  });

  const [showResult, setShowResult] = useState(false);
  const [calculatedRate, setCalculatedRate] = useState(0);

  const handleCalculate = () => {
    const rate = calculateAcceptanceRate(inputs);
    setCalculatedRate(rate);
    setShowResult(true);
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-semibold">Acceptance Rate Calculator</h1>
        <p className="text-muted-foreground">Estimate your chances based on your profile</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calculator Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Your Profile
            </CardTitle>
            <CardDescription>
              Enter your academic and extracurricular information for an estimate
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Target School */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Target School
              </Label>
              <Select
                value={inputs.targetSchool}
                onValueChange={(value) => setInputs({ ...inputs, targetSchool: value })}
              >
                <SelectTrigger data-testid="select-target-school">
                  <SelectValue placeholder="Select a school" />
                </SelectTrigger>
                <SelectContent>
                  {schools.map((school) => (
                    <SelectItem key={school.name} value={school.name}>
                      {school.name} (Base rate: {school.baseRate}%)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* GPA */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  GPA (4.0 scale)
                </Label>
                <span className="text-sm font-mono font-medium">{inputs.gpa.toFixed(2)}</span>
              </div>
              <Slider
                value={[inputs.gpa]}
                onValueChange={([value]) => setInputs({ ...inputs, gpa: value })}
                min={2.0}
                max={4.0}
                step={0.05}
                data-testid="slider-gpa"
              />
            </div>

            {/* SAT Score */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  SAT Score
                </Label>
                <span className="text-sm font-mono font-medium">{inputs.satScore}</span>
              </div>
              <Slider
                value={[inputs.satScore]}
                onValueChange={([value]) => setInputs({ ...inputs, satScore: value })}
                min={1000}
                max={1600}
                step={10}
                data-testid="slider-sat"
              />
            </div>

            {/* Extracurriculars */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Number of Extracurriculars
                </Label>
                <span className="text-sm font-mono font-medium">{inputs.ecCount}</span>
              </div>
              <Slider
                value={[inputs.ecCount]}
                onValueChange={([value]) => setInputs({ ...inputs, ecCount: value })}
                min={0}
                max={10}
                step={1}
                data-testid="slider-ec"
              />
            </div>

            {/* Leadership Roles */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Leadership Positions
                </Label>
                <span className="text-sm font-mono font-medium">{inputs.leadershipRoles}</span>
              </div>
              <Slider
                value={[inputs.leadershipRoles]}
                onValueChange={([value]) => setInputs({ ...inputs, leadershipRoles: value })}
                min={0}
                max={5}
                step={1}
                data-testid="slider-leadership"
              />
            </div>

            {/* Essay Quality */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Essay Quality (1-10)
                </Label>
                <span className="text-sm font-mono font-medium">{inputs.essayQuality}</span>
              </div>
              <Slider
                value={[inputs.essayQuality]}
                onValueChange={([value]) => setInputs({ ...inputs, essayQuality: value })}
                min={1}
                max={10}
                step={1}
                data-testid="slider-essay"
              />
            </div>

            {/* Recommendations */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Recommendation Strength (1-10)
                </Label>
                <span className="text-sm font-mono font-medium">{inputs.recommendations}</span>
              </div>
              <Slider
                value={[inputs.recommendations]}
                onValueChange={([value]) => setInputs({ ...inputs, recommendations: value })}
                min={1}
                max={10}
                step={1}
                data-testid="slider-recs"
              />
            </div>

            <Button onClick={handleCalculate} className="w-full" data-testid="button-calculate">
              <Target className="h-4 w-4 mr-2" />
              Calculate My Chances
            </Button>
          </CardContent>
        </Card>

        {/* Result Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Your Estimate
            </CardTitle>
          </CardHeader>
          <CardContent>
            {showResult ? (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-5xl font-bold font-mono text-primary" data-testid="text-calculated-rate">
                    {calculatedRate}%
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Estimated acceptance rate
                  </p>
                </div>
                <Progress value={calculatedRate} className="h-3" />
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Target School</span>
                    <span className="font-medium">{inputs.targetSchool}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Your GPA</span>
                    <span className="font-mono">{inputs.gpa.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">SAT Score</span>
                    <span className="font-mono">{inputs.satScore}</span>
                  </div>
                </div>
                <div className="p-3 rounded-md bg-muted/50 text-sm">
                  <p className="text-muted-foreground">
                    This is an estimate based on general admission statistics. 
                    Actual decisions depend on many factors including essays, 
                    interviews, and institutional needs.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Fill in your profile and click calculate to see your estimated acceptance rate
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tips Card */}
      <Card>
        <CardHeader>
          <CardTitle>Tips to Improve Your Chances</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 rounded-md bg-muted/50 space-y-2">
              <BookOpen className="h-5 w-5 text-chart-1" />
              <h4 className="font-medium">Academic Excellence</h4>
              <p className="text-sm text-muted-foreground">
                Take challenging courses and maintain a strong GPA throughout high school.
              </p>
            </div>
            <div className="p-4 rounded-md bg-muted/50 space-y-2">
              <Users className="h-5 w-5 text-chart-2" />
              <h4 className="font-medium">Meaningful Activities</h4>
              <p className="text-sm text-muted-foreground">
                Focus on depth over breadth. Show commitment and impact in a few activities.
              </p>
            </div>
            <div className="p-4 rounded-md bg-muted/50 space-y-2">
              <Star className="h-5 w-5 text-chart-3" />
              <h4 className="font-medium">Compelling Essays</h4>
              <p className="text-sm text-muted-foreground">
                Share authentic stories that reveal your personality and values.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
