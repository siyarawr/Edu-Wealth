import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
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
  languageTest: "ielts" | "toefl";
  languageScore: number;
  academicTest: "sat" | "gre" | "gmat";
  academicScore: number;
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
  
  let languageBonus = 0;
  if (inputs.languageTest === "ielts") {
    languageBonus = Math.max(0, (inputs.languageScore - 6.5) * 5);
  } else {
    languageBonus = Math.max(0, (inputs.languageScore - 90) / 5);
  }
  
  let academicBonus = 0;
  if (inputs.academicTest === "sat") {
    academicBonus = Math.max(0, (inputs.academicScore - 1400) / 10);
  } else if (inputs.academicTest === "gre") {
    academicBonus = Math.max(0, (inputs.academicScore - 315) / 2);
  } else {
    academicBonus = Math.max(0, (inputs.academicScore - 650) / 10);
  }
  
  const ecBonus = Math.min(inputs.ecCount * 2, 15);
  const leadershipBonus = Math.min(inputs.leadershipRoles * 3, 12);
  const essayBonus = (inputs.essayQuality / 10) * 8;
  const recsBonus = (inputs.recommendations / 10) * 5;
  
  const totalBonus = (gpaBonus + languageBonus + academicBonus + ecBonus + leadershipBonus + essayBonus + recsBonus) * school.weight;
  
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
    languageTest: "ielts",
    languageScore: 7.0,
    academicTest: "sat",
    academicScore: 1450,
  });

  const [showResult, setShowResult] = useState(false);
  const [calculatedRate, setCalculatedRate] = useState(0);

  const handleCalculate = () => {
    const rate = calculateAcceptanceRate(inputs);
    setCalculatedRate(rate);
    setShowResult(true);
  };

  return (
    <div className="p-8 space-y-6 max-w-4xl mx-auto">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Acceptance Calculator</h1>
        <p className="text-muted-foreground mt-1">Estimate your chances based on your profile</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-xl bg-card">
          <div className="flex items-center gap-2 mb-6">
            <Calculator className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Your Profile</h2>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm">
                <GraduationCap className="h-4 w-4" />
                Target School
              </Label>
              <Select
                value={inputs.targetSchool}
                onValueChange={(value) => setInputs({ ...inputs, targetSchool: value })}
              >
                <SelectTrigger className="bg-muted/50 border-0" data-testid="select-target-school">
                  <SelectValue placeholder="Select a school" />
                </SelectTrigger>
                <SelectContent>
                  {schools.map((school) => (
                    <SelectItem key={school.name} value={school.name}>
                      {school.name} ({school.baseRate}% base)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2 text-sm">
                  <BookOpen className="h-4 w-4" />
                  GPA (4.0 scale)
                </Label>
                <span className="text-sm font-mono font-medium text-primary">{inputs.gpa.toFixed(2)}</span>
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

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2 text-sm">
                  <Award className="h-4 w-4" />
                  Language Test
                </Label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Select
                  value={inputs.languageTest}
                  onValueChange={(value: "ielts" | "toefl") => setInputs({ ...inputs, languageTest: value })}
                >
                  <SelectTrigger data-testid="select-language-test">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ielts">IELTS</SelectItem>
                    <SelectItem value="toefl">TOEFL</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2">
                  <Slider
                    value={[inputs.languageScore]}
                    onValueChange={([value]) => setInputs({ ...inputs, languageScore: value })}
                    min={inputs.languageTest === "ielts" ? 4 : 60}
                    max={inputs.languageTest === "ielts" ? 9 : 120}
                    step={inputs.languageTest === "ielts" ? 0.5 : 1}
                    data-testid="slider-language-score"
                    className="flex-1"
                  />
                  <span className="text-sm font-mono font-medium text-primary w-12 text-right">
                    {inputs.languageScore}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4" />
                  Academic Test
                </Label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Select
                  value={inputs.academicTest}
                  onValueChange={(value: "sat" | "gre" | "gmat") => {
                    let score = inputs.academicScore;
                    if (value === "sat") score = 1450;
                    else if (value === "gre") score = 320;
                    else score = 700;
                    setInputs({ ...inputs, academicTest: value, academicScore: score });
                  }}
                >
                  <SelectTrigger data-testid="select-academic-test">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sat">SAT</SelectItem>
                    <SelectItem value="gre">GRE</SelectItem>
                    <SelectItem value="gmat">GMAT</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2">
                  <Slider
                    value={[inputs.academicScore]}
                    onValueChange={([value]) => setInputs({ ...inputs, academicScore: value })}
                    min={inputs.academicTest === "sat" ? 1000 : inputs.academicTest === "gre" ? 260 : 400}
                    max={inputs.academicTest === "sat" ? 1600 : inputs.academicTest === "gre" ? 340 : 800}
                    step={inputs.academicTest === "sat" ? 10 : inputs.academicTest === "gre" ? 1 : 10}
                    data-testid="slider-academic-score"
                    className="flex-1"
                  />
                  <span className="text-sm font-mono font-medium text-primary w-12 text-right">
                    {inputs.academicScore}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4" />
                  Number of Extracurriculars
                </Label>
                <span className="text-sm font-mono font-medium text-primary">{inputs.ecCount}</span>
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

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2 text-sm">
                  <Briefcase className="h-4 w-4" />
                  Leadership Positions
                </Label>
                <span className="text-sm font-mono font-medium text-primary">{inputs.leadershipRoles}</span>
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

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2 text-sm">
                  <Star className="h-4 w-4" />
                  Essay Quality (1-10)
                </Label>
                <span className="text-sm font-mono font-medium text-primary">{inputs.essayQuality}</span>
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

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4" />
                  Recommendation Strength (1-10)
                </Label>
                <span className="text-sm font-mono font-medium text-primary">{inputs.recommendations}</span>
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
          </div>
        </div>

        <div className="p-6 rounded-xl bg-card">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Your Estimate</h2>
          </div>

          {showResult ? (
            <div className="space-y-6">
              <div className="text-center py-4">
                <div className="text-5xl font-bold font-mono text-primary" data-testid="text-calculated-rate">
                  {calculatedRate}%
                </div>
                <p className="text-sm text-muted-foreground mt-2">Estimated acceptance rate</p>
              </div>
              <Progress value={calculatedRate} className="h-2" />
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between py-1.5 border-b border-border/50">
                  <span className="text-muted-foreground">Target School</span>
                  <span className="font-medium text-xs truncate max-w-[140px]">{inputs.targetSchool}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-border/50">
                  <span className="text-muted-foreground">Your GPA</span>
                  <span className="font-mono">{inputs.gpa.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-border/50">
                  <span className="text-muted-foreground">{inputs.languageTest.toUpperCase()}</span>
                  <span className="font-mono">{inputs.languageScore}</span>
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-muted-foreground">{inputs.academicTest.toUpperCase()}</span>
                  <span className="font-mono">{inputs.academicScore}</span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground">
                This is an estimate based on general admission statistics. Actual decisions depend on many factors.
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">
                Fill in your profile and click calculate to see your estimated rate
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="p-6 rounded-xl bg-card">
        <h2 className="text-lg font-semibold mb-4">Tips to Improve Your Chances</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-muted/50 space-y-2">
            <BookOpen className="h-5 w-5 text-chart-1" />
            <h4 className="font-medium">Academic Excellence</h4>
            <p className="text-sm text-muted-foreground">
              Take challenging courses and maintain a strong GPA throughout high school.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50 space-y-2">
            <Users className="h-5 w-5 text-chart-2" />
            <h4 className="font-medium">Meaningful Activities</h4>
            <p className="text-sm text-muted-foreground">
              Focus on depth over breadth. Show commitment and impact in a few activities.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50 space-y-2">
            <Star className="h-5 w-5 text-chart-3" />
            <h4 className="font-medium">Compelling Essays</h4>
            <p className="text-sm text-muted-foreground">
              Share authentic stories that reveal your personality and values.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
