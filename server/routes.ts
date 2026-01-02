import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // ============ EXPENSES ============
  app.get("/api/expenses", async (req, res) => {
    try {
      const userId = (req.query.userId as string) || "default-user";
      const expenses = await storage.getExpenses(userId);
      res.json(expenses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch expenses" });
    }
  });

  app.post("/api/expenses", async (req, res) => {
    try {
      const expense = await storage.createExpense({
        ...req.body,
        userId: req.body.userId || "default-user",
      });
      res.status(201).json(expense);
    } catch (error) {
      res.status(500).json({ error: "Failed to create expense" });
    }
  });

  app.delete("/api/expenses/:id", async (req, res) => {
    try {
      await storage.deleteExpense(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete expense" });
    }
  });

  // ============ BUDGETS ============
  app.get("/api/budgets", async (req, res) => {
    try {
      const userId = (req.query.userId as string) || "default-user";
      const month = (req.query.month as string) || new Date().toISOString().slice(0, 7);
      const budgets = await storage.getBudgets(userId, month);
      res.json(budgets);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch budgets" });
    }
  });

  app.post("/api/budgets", async (req, res) => {
    try {
      const budget = await storage.createBudget({
        ...req.body,
        userId: req.body.userId || "default-user",
      });
      res.status(201).json(budget);
    } catch (error) {
      res.status(500).json({ error: "Failed to create budget" });
    }
  });

  app.patch("/api/budgets/:id", async (req, res) => {
    try {
      const budget = await storage.updateBudget(
        parseInt(req.params.id),
        req.body.spent
      );
      if (!budget) {
        return res.status(404).json({ error: "Budget not found" });
      }
      res.json(budget);
    } catch (error) {
      res.status(500).json({ error: "Failed to update budget" });
    }
  });

  // ============ INTERNSHIPS ============
  app.get("/api/internships", async (req, res) => {
    try {
      const internships = await storage.getInternships();
      res.json(internships);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch internships" });
    }
  });

  app.get("/api/internships/:id", async (req, res) => {
    try {
      const internship = await storage.getInternship(parseInt(req.params.id));
      if (!internship) {
        return res.status(404).json({ error: "Internship not found" });
      }
      res.json(internship);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch internship" });
    }
  });

  // ============ SCHOLARSHIPS ============
  app.get("/api/scholarships", async (req, res) => {
    try {
      const country = req.query.country as string | undefined;
      const scholarships = await storage.getScholarships(country);
      res.json(scholarships);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch scholarships" });
    }
  });

  app.get("/api/scholarships/:id", async (req, res) => {
    try {
      const scholarship = await storage.getScholarship(parseInt(req.params.id));
      if (!scholarship) {
        return res.status(404).json({ error: "Scholarship not found" });
      }
      res.json(scholarship);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch scholarship" });
    }
  });

  // ============ SEMINARS ============
  app.get("/api/seminars", async (req, res) => {
    try {
      const seminars = await storage.getSeminars();
      res.json(seminars);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch seminars" });
    }
  });

  app.get("/api/seminars/:id", async (req, res) => {
    try {
      const seminar = await storage.getSeminar(parseInt(req.params.id));
      if (!seminar) {
        return res.status(404).json({ error: "Seminar not found" });
      }
      res.json(seminar);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch seminar" });
    }
  });

  // ============ SEMINAR NOTES ============
  app.get("/api/notes", async (req, res) => {
    try {
      const userId = (req.query.userId as string) || "default-user";
      const notes = await storage.getSeminarNotes(userId);
      res.json(notes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch notes" });
    }
  });

  app.post("/api/notes", async (req, res) => {
    try {
      const note = await storage.createSeminarNote({
        ...req.body,
        userId: req.body.userId || "default-user",
      });
      res.status(201).json(note);
    } catch (error) {
      res.status(500).json({ error: "Failed to create note" });
    }
  });

  app.delete("/api/notes/:id", async (req, res) => {
    try {
      await storage.deleteSeminarNote(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete note" });
    }
  });

  // ============ AI NOTE GENERATION ============
  app.post("/api/notes/generate", async (req, res) => {
    try {
      const { transcript, seminarId } = req.body;

      if (!transcript) {
        return res.status(400).json({ error: "Transcript is required" });
      }

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an expert note-taker. Given a seminar transcript or notes, extract:
1. A concise summary (2-3 sentences)
2. Key points (bullet points of main takeaways)
3. Action items (tasks the attendee should complete)

Format your response as JSON with this structure:
{
  "summary": "...",
  "keyPoints": ["point1", "point2", ...],
  "actionItems": ["action1", "action2", ...]
}`
          },
          {
            role: "user",
            content: transcript
          }
        ],
        response_format: { type: "json_object" },
        max_completion_tokens: 1024,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        return res.status(500).json({ error: "Failed to generate notes" });
      }

      const parsed = JSON.parse(content);
      
      const note = await storage.createSeminarNote({
        seminarId: seminarId || 0,
        userId: req.body.userId || "default-user",
        content: parsed.summary,
        keyPoints: JSON.stringify(parsed.keyPoints),
        actionItems: JSON.stringify(parsed.actionItems),
      });

      res.status(201).json({
        ...note,
        keyPoints: parsed.keyPoints,
        actionItems: parsed.actionItems,
      });
    } catch (error) {
      console.error("Error generating notes:", error);
      res.status(500).json({ error: "Failed to generate notes" });
    }
  });

  // ============ ENTREPRENEUR CONTENT ============
  app.get("/api/entrepreneur-content", async (req, res) => {
    try {
      const type = req.query.type as string | undefined;
      const content = await storage.getEntrepreneurContent(type);
      res.json(content);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch content" });
    }
  });

  // ============ ACCEPTANCE RATE CALCULATOR ============
  app.post("/api/calculate-acceptance", async (req, res) => {
    try {
      const { gpa, satScore, ecCount, leadershipRoles, essayQuality, recommendations, targetSchool } = req.body;

      const schoolRates: Record<string, { baseRate: number; weight: number }> = {
        "Harvard University": { baseRate: 4, weight: 1.0 },
        "Stanford University": { baseRate: 4, weight: 1.0 },
        "MIT": { baseRate: 4, weight: 1.0 },
        "Yale University": { baseRate: 5, weight: 0.95 },
        "Princeton University": { baseRate: 6, weight: 0.92 },
        "Columbia University": { baseRate: 5, weight: 0.93 },
        "UC Berkeley": { baseRate: 15, weight: 0.85 },
        "UCLA": { baseRate: 12, weight: 0.87 },
        "University of Michigan": { baseRate: 23, weight: 0.80 },
        "NYU": { baseRate: 21, weight: 0.82 },
        "Boston University": { baseRate: 25, weight: 0.78 },
        "Other Top 50": { baseRate: 30, weight: 0.75 },
      };

      const school = schoolRates[targetSchool] || schoolRates["Other Top 50"];
      let baseChance = school.baseRate;

      const gpaBonus = Math.max(0, (gpa - 3.5) * 20);
      const satBonus = Math.max(0, (satScore - 1400) / 10);
      const ecBonus = Math.min(ecCount * 2, 15);
      const leadershipBonus = Math.min(leadershipRoles * 3, 12);
      const essayBonus = (essayQuality / 10) * 8;
      const recsBonus = (recommendations / 10) * 5;

      const totalBonus = (gpaBonus + satBonus + ecBonus + leadershipBonus + essayBonus + recsBonus) * school.weight;
      const finalRate = Math.min(95, baseChance + totalBonus);

      res.json({
        rate: Math.round(finalRate * 10) / 10,
        breakdown: {
          baseRate: baseChance,
          gpaBonus: Math.round(gpaBonus * 10) / 10,
          satBonus: Math.round(satBonus * 10) / 10,
          ecBonus: Math.round(ecBonus * 10) / 10,
          leadershipBonus: Math.round(leadershipBonus * 10) / 10,
          essayBonus: Math.round(essayBonus * 10) / 10,
          recsBonus: Math.round(recsBonus * 10) / 10,
        },
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to calculate acceptance rate" });
    }
  });

  // ============ DASHBOARD STATS ============
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const userId = (req.query.userId as string) || "default-user";
      const expenses = await storage.getExpenses(userId);
      const seminars = await storage.getSeminars();
      const internships = await storage.getInternships();
      const scholarships = await storage.getScholarships();

      const now = new Date();
      const thisMonth = expenses.filter((e) => {
        const expDate = new Date(e.date);
        return expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear();
      });

      const totalSpent = thisMonth.reduce((sum, e) => sum + e.amount, 0);
      const upcomingSeminars = seminars.filter((s) => new Date(s.date) > now).slice(0, 5);

      res.json({
        totalSpent,
        expenseCount: thisMonth.length,
        upcomingSeminarsCount: upcomingSeminars.length,
        internshipCount: internships.length,
        scholarshipCount: scholarships.length,
        upcomingSeminars,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  });

  return httpServer;
}
