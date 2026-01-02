import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import OpenAI from "openai";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup authentication (BEFORE other routes)
  await setupAuth(app);
  registerAuthRoutes(app);
  // ============ USER PROFILE ============
  app.get("/api/user/profile", async (req, res) => {
    try {
      const userId = (req.query.userId as string) || "default-user";
      let user = await storage.getUser(userId);
      if (!user) {
        user = await storage.createUser({ username: userId, password: "temp" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  });

  app.patch("/api/user/profile", async (req, res) => {
    try {
      const userId = (req.query.userId as string) || "default-user";
      let user = await storage.getUser(userId);
      if (!user) {
        user = await storage.createUser({ username: userId, password: "temp" });
      }
      const updated = await storage.updateUserProfile(user.id, req.body);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

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

  app.patch("/api/expenses/:id", async (req, res) => {
    try {
      const expense = await storage.updateExpense(parseInt(req.params.id), req.body);
      if (!expense) {
        return res.status(404).json({ error: "Expense not found" });
      }
      res.json(expense);
    } catch (error) {
      res.status(500).json({ error: "Failed to update expense" });
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
      const isOnline = req.query.online === "true" ? true : req.query.online === "false" ? false : undefined;
      const seminars = await storage.getSeminars(isOnline);
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

  app.patch("/api/notes/:id", async (req, res) => {
    try {
      const note = await storage.updateSeminarNote(parseInt(req.params.id), req.body);
      if (!note) {
        return res.status(404).json({ error: "Note not found" });
      }
      res.json(note);
    } catch (error) {
      res.status(500).json({ error: "Failed to update note" });
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
      const { transcript, seminarId, title, category } = req.body;

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
        seminarId: seminarId || null,
        userId: req.body.userId || "default-user",
        title: title || "Untitled Note",
        category: category || "General",
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

  // ============ CALENDAR EVENTS ============
  app.get("/api/calendar", async (req, res) => {
    try {
      const userId = (req.query.userId as string) || "default-user";
      const startDate = req.query.start ? new Date(req.query.start as string) : undefined;
      const endDate = req.query.end ? new Date(req.query.end as string) : undefined;
      const events = await storage.getCalendarEvents(userId, startDate, endDate);
      res.json(events);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch calendar events" });
    }
  });

  app.post("/api/calendar", async (req, res) => {
    try {
      const event = await storage.createCalendarEvent({
        ...req.body,
        userId: req.body.userId || "default-user",
      });
      res.status(201).json(event);
    } catch (error) {
      res.status(500).json({ error: "Failed to create calendar event" });
    }
  });

  app.patch("/api/calendar/:id", async (req, res) => {
    try {
      const event = await storage.updateCalendarEvent(parseInt(req.params.id), req.body);
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }
      res.json(event);
    } catch (error) {
      res.status(500).json({ error: "Failed to update calendar event" });
    }
  });

  app.delete("/api/calendar/:id", async (req, res) => {
    try {
      await storage.deleteCalendarEvent(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete calendar event" });
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

  // ============ SEARCH ============
  app.get("/api/search", async (req, res) => {
    try {
      const query = (req.query.q as string) || "";
      if (!query || query.length < 2) {
        return res.json({
          seminars: [],
          seminarNotes: [],
          meetingNotes: [],
          scholarships: [],
          internships: [],
        });
      }

      const searchLower = query.toLowerCase();

      const seminars = await storage.getSeminars();
      const matchedSeminars = seminars.filter(s => 
        s.title.toLowerCase().includes(searchLower) ||
        s.description?.toLowerCase().includes(searchLower) ||
        s.speaker?.toLowerCase().includes(searchLower)
      ).slice(0, 10);

      const userId = (req.query.userId as string) || "default-user";
      
      const meetingNotes = await storage.getMeetingNotes(userId);
      const matchedMeetingNotes = meetingNotes.filter(n =>
        n.title.toLowerCase().includes(searchLower) ||
        n.summary?.toLowerCase().includes(searchLower) ||
        n.notes?.toLowerCase().includes(searchLower)
      ).slice(0, 10);

      const scholarships = await storage.getScholarships();
      const matchedScholarships = scholarships.filter(s =>
        s.name.toLowerCase().includes(searchLower) ||
        s.description?.toLowerCase().includes(searchLower)
      ).slice(0, 10);

      const internships = await storage.getInternships();
      const matchedInternships = internships.filter(i =>
        i.title.toLowerCase().includes(searchLower) ||
        i.company.toLowerCase().includes(searchLower) ||
        i.description?.toLowerCase().includes(searchLower)
      ).slice(0, 10);

      const allNotes = await storage.getSeminarNotes(userId);
      const matchedSeminarNotes = allNotes.filter(n =>
        n.content?.toLowerCase().includes(searchLower)
      ).slice(0, 10);

      res.json({
        seminars: matchedSeminars,
        seminarNotes: matchedSeminarNotes,
        meetingNotes: matchedMeetingNotes,
        scholarships: matchedScholarships,
        internships: matchedInternships,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to search" });
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
      const user = await storage.getUser(userId);

      const now = new Date();
      const thisMonth = expenses.filter((e) => {
        const expDate = new Date(e.date);
        return expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear();
      });

      const totalSpent = thisMonth.reduce((sum, e) => sum + e.amount, 0);
      const upcomingSeminars = seminars.filter((s) => new Date(s.date) > now).slice(0, 5);
      
      const monthlyBudget = user?.monthlyBudget || 0;
      const monthlyIncome = user?.monthlyIncome || 0;
      const remaining = monthlyBudget - totalSpent;
      const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - totalSpent) / monthlyIncome) * 100 : 0;

      res.json({
        totalSpent,
        expenseCount: thisMonth.length,
        upcomingSeminarsCount: upcomingSeminars.length,
        internshipCount: internships.length,
        scholarshipCount: scholarships.length,
        upcomingSeminars,
        monthlyBudget,
        monthlyIncome,
        remaining,
        savingsRate: Math.round(savingsRate * 10) / 10,
        hasProfile: user?.isOnboardingComplete || false,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  });

  // ============ MEETING NOTES ============
  app.get("/api/meeting-notes", async (req, res) => {
    try {
      const userId = (req.query.userId as string) || "default-user";
      const notes = await storage.getMeetingNotes(userId);
      res.json(notes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch meeting notes" });
    }
  });

  app.get("/api/meeting-notes/:id", async (req, res) => {
    try {
      const note = await storage.getMeetingNote(parseInt(req.params.id));
      if (!note) {
        return res.status(404).json({ error: "Meeting note not found" });
      }
      const shares = await storage.getMeetingNoteShares(note.id);
      res.json({ ...note, shares });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch meeting note" });
    }
  });

  app.post("/api/meeting-notes", async (req, res) => {
    try {
      const note = await storage.createMeetingNote({
        ...req.body,
        userId: req.body.userId || "default-user",
      });
      res.status(201).json(note);
    } catch (error) {
      res.status(500).json({ error: "Failed to create meeting note" });
    }
  });

  app.patch("/api/meeting-notes/:id", async (req, res) => {
    try {
      const note = await storage.updateMeetingNote(parseInt(req.params.id), req.body);
      if (!note) {
        return res.status(404).json({ error: "Meeting note not found" });
      }
      res.json(note);
    } catch (error) {
      res.status(500).json({ error: "Failed to update meeting note" });
    }
  });

  app.delete("/api/meeting-notes/:id", async (req, res) => {
    try {
      await storage.deleteMeetingNote(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete meeting note" });
    }
  });

  // Meeting note sharing
  app.post("/api/meeting-notes/:id/share", async (req, res) => {
    try {
      const noteId = parseInt(req.params.id);
      const { email, permission, invitedBy } = req.body;
      const share = await storage.createMeetingNoteShare({
        noteId,
        email,
        permission,
        invitedBy: invitedBy || "default-user",
      });
      res.status(201).json(share);
    } catch (error) {
      res.status(500).json({ error: "Failed to share meeting note" });
    }
  });

  app.delete("/api/meeting-notes/:noteId/share/:shareId", async (req, res) => {
    try {
      await storage.deleteMeetingNoteShare(parseInt(req.params.shareId));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to remove share" });
    }
  });

  // ============ CHAT / CONVERSATIONS ============
  app.get("/api/conversations", async (req, res) => {
    try {
      const userId = (req.query.userId as string) || "default-user";
      const convos = await storage.getConversations(userId);
      const result = await Promise.all(convos.map(async (c) => {
        const participants = await storage.getConversationParticipants(c.id);
        return { ...c, participants };
      }));
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  app.get("/api/conversations/:id", async (req, res) => {
    try {
      const conv = await storage.getConversation(parseInt(req.params.id));
      if (!conv) {
        return res.status(404).json({ error: "Conversation not found" });
      }
      const participants = await storage.getConversationParticipants(conv.id);
      const msgs = await storage.getMessages(conv.id);
      const messagesWithReactions = await Promise.all(msgs.map(async (m) => {
        const reactions = await storage.getMessageReactions(m.id);
        return { ...m, reactions };
      }));
      res.json({ ...conv, participants, messages: messagesWithReactions });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch conversation" });
    }
  });

  app.post("/api/conversations", async (req, res) => {
    try {
      const userId = req.body.userId || "default-user";
      const conv = await storage.createConversation({ createdBy: userId });
      
      // Add creator as participant
      await storage.addConversationParticipant({
        conversationId: conv.id,
        userId,
        email: req.body.email || "",
        joinedAt: new Date(),
      });

      res.status(201).json(conv);
    } catch (error) {
      res.status(500).json({ error: "Failed to create conversation" });
    }
  });

  app.post("/api/conversations/:id/invite", async (req, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      const { email, invitedBy } = req.body;
      
      // Generate invite token
      const inviteToken = Math.random().toString(36).substring(2, 15);
      
      const participant = await storage.addConversationParticipant({
        conversationId,
        email,
        inviteToken,
        userId: null,
      });
      
      res.status(201).json({ participant, inviteToken });
    } catch (error) {
      res.status(500).json({ error: "Failed to invite participant" });
    }
  });

  app.post("/api/conversations/:id/messages", async (req, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      const message = await storage.createMessage({
        conversationId,
        senderId: req.body.senderId || "default-user",
        senderName: req.body.senderName,
        content: req.body.content,
        replyToId: req.body.replyToId || null,
      });
      res.status(201).json(message);
    } catch (error) {
      res.status(500).json({ error: "Failed to send message" });
    }
  });

  app.patch("/api/messages/:id", async (req, res) => {
    try {
      const message = await storage.updateMessage(parseInt(req.params.id), req.body.content);
      if (!message) {
        return res.status(404).json({ error: "Message not found" });
      }
      res.json(message);
    } catch (error) {
      res.status(500).json({ error: "Failed to update message" });
    }
  });

  // Toggle reaction (add if not exists, remove if exists)
  app.post("/api/messages/:id/reactions/toggle", async (req, res) => {
    try {
      const messageId = parseInt(req.params.id);
      const userId = req.body.userId || "default-user";
      const reactionType = req.body.reaction;
      
      const existingReaction = await storage.findUserReaction(messageId, userId, reactionType);
      
      if (existingReaction) {
        await storage.removeMessageReaction(existingReaction.id);
        res.json({ action: "removed", reactionId: existingReaction.id });
      } else {
        const reaction = await storage.addMessageReaction({
          messageId,
          userId,
          reaction: reactionType,
        });
        res.status(201).json({ action: "added", reaction });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to toggle reaction" });
    }
  });

  app.post("/api/messages/:id/reactions", async (req, res) => {
    try {
      const messageId = parseInt(req.params.id);
      const reaction = await storage.addMessageReaction({
        messageId,
        userId: req.body.userId || "default-user",
        reaction: req.body.reaction,
      });
      res.status(201).json(reaction);
    } catch (error) {
      res.status(500).json({ error: "Failed to add reaction" });
    }
  });

  app.delete("/api/messages/:messageId/reactions/:reactionId", async (req, res) => {
    try {
      await storage.removeMessageReaction(parseInt(req.params.reactionId));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to remove reaction" });
    }
  });

  app.delete("/api/conversations/:id", async (req, res) => {
    try {
      await storage.deleteConversation(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete conversation" });
    }
  });

  return httpServer;
}
