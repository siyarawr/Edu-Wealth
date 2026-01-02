import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, real, timestamp, boolean, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users with full profile
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  // Profile info
  country: text("country"),
  state: text("state"),
  city: text("city"),
  university: text("university"),
  major: text("major"),
  gpa: real("gpa"),
  satScore: integer("sat_score"),
  monthlyIncome: real("monthly_income"),
  monthlyBudget: real("monthly_budget"),
  // Arrays stored as comma-separated text
  interests: text("interests"),
  extracurriculars: text("extracurriculars"),
  // Preferences
  isOnboardingComplete: boolean("is_onboarding_complete").default(false),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const updateUserProfileSchema = createInsertSchema(users).omit({
  id: true,
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpdateUserProfile = z.infer<typeof updateUserProfileSchema>;
export type User = typeof users.$inferSelect;

// Expenses
export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  category: text("category").notNull(),
  amount: real("amount").notNull(),
  description: text("description"),
  date: timestamp("date").defaultNow().notNull(),
  isRecurring: boolean("is_recurring").default(false),
});

export const insertExpenseSchema = createInsertSchema(expenses).omit({
  id: true,
});

export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type Expense = typeof expenses.$inferSelect;

// Budgets
export const budgets = pgTable("budgets", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  category: text("category").notNull(),
  limit: real("limit").notNull(),
  spent: real("spent").default(0).notNull(),
  month: text("month").notNull(),
});

export const insertBudgetSchema = createInsertSchema(budgets).omit({
  id: true,
});

export type InsertBudget = z.infer<typeof insertBudgetSchema>;
export type Budget = typeof budgets.$inferSelect;

// Internships
export const internships = pgTable("internships", {
  id: serial("id").primaryKey(),
  company: text("company").notNull(),
  title: text("title").notNull(),
  location: text("location").notNull(),
  type: text("type").notNull(),
  description: text("description").notNull(),
  requirements: text("requirements").notNull(),
  deadline: timestamp("deadline"),
  salary: text("salary"),
  applyUrl: text("apply_url"),
  isRemote: boolean("is_remote").default(false),
});

export const insertInternshipSchema = createInsertSchema(internships).omit({
  id: true,
});

export type InsertInternship = z.infer<typeof insertInternshipSchema>;
export type Internship = typeof internships.$inferSelect;

// Scholarships - Real scholarships with verified URLs
export const scholarships = pgTable("scholarships", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  organization: text("organization").notNull(),
  amount: text("amount").notNull(),
  country: text("country").notNull(),
  deadline: timestamp("deadline"),
  requirements: text("requirements").notNull(),
  description: text("description").notNull(),
  applyUrl: text("apply_url"),
  eligibility: text("eligibility"),
  // Matching criteria
  minGpa: real("min_gpa"),
  maxIncome: real("max_income"),
  fieldOfStudy: text("field_of_study"),
  isNeedBased: boolean("is_need_based").default(false),
  isVerified: boolean("is_verified").default(true),
});

export const insertScholarshipSchema = createInsertSchema(scholarships).omit({
  id: true,
});

export type InsertScholarship = z.infer<typeof insertScholarshipSchema>;
export type Scholarship = typeof scholarships.$inferSelect;

// Seminars - Real events with verified sources
export const seminars = pgTable("seminars", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  speaker: text("speaker").notNull(),
  speakerBio: text("speaker_bio"),
  category: text("category").notNull(),
  date: timestamp("date").notNull(),
  duration: integer("duration").notNull(),
  location: text("location"),
  signupUrl: text("signup_url"),
  university: text("university"),
  isVirtual: boolean("is_virtual").default(false),
  isOnline: boolean("is_online").default(true),
  source: text("source"),
  eventbriteId: text("eventbrite_id"),
  isVerified: boolean("is_verified").default(true),
});

export const insertSeminarSchema = createInsertSchema(seminars).omit({
  id: true,
});

export type InsertSeminar = z.infer<typeof insertSeminarSchema>;
export type Seminar = typeof seminars.$inferSelect;

// Seminar Notes (AI-generated) with categories
export const seminarNotes = pgTable("seminar_notes", {
  id: serial("id").primaryKey(),
  seminarId: integer("seminar_id"),
  userId: varchar("user_id").notNull(),
  title: text("title").notNull(),
  category: text("category"),
  content: text("content").notNull(),
  keyPoints: text("key_points"),
  actionItems: text("action_items"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSeminarNoteSchema = createInsertSchema(seminarNotes).omit({
  id: true,
  createdAt: true,
});

export type InsertSeminarNote = z.infer<typeof insertSeminarNoteSchema>;
export type SeminarNote = typeof seminarNotes.$inferSelect;

// Calendar Events (tasks, seminars, reminders)
export const calendarEvents = pgTable("calendar_events", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  type: text("type").notNull(),
  date: timestamp("date").notNull(),
  endDate: timestamp("end_date"),
  isAllDay: boolean("is_all_day").default(false),
  seminarId: integer("seminar_id"),
  color: text("color"),
  isCompleted: boolean("is_completed").default(false),
});

export const insertCalendarEventSchema = createInsertSchema(calendarEvents).omit({
  id: true,
});

export type InsertCalendarEvent = z.infer<typeof insertCalendarEventSchema>;
export type CalendarEvent = typeof calendarEvents.$inferSelect;

// Entrepreneurship Content
export const entrepreneurContent = pgTable("entrepreneur_content", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  type: text("type").notNull(),
  category: text("category").notNull(),
  content: text("content").notNull(),
  author: text("author"),
  duration: integer("duration"),
  thumbnail: text("thumbnail"),
  externalUrl: text("external_url"),
  isVerified: boolean("is_verified").default(true),
});

export const insertEntrepreneurContentSchema = createInsertSchema(entrepreneurContent).omit({
  id: true,
});

export type InsertEntrepreneurContent = z.infer<typeof insertEntrepreneurContentSchema>;
export type EntrepreneurContent = typeof entrepreneurContent.$inferSelect;

// Expense Categories
export const expenseCategories = [
  "Housing",
  "Food",
  "Transportation",
  "Education",
  "Entertainment",
  "Healthcare",
  "Utilities",
  "Clothing",
  "Personal",
  "Other"
] as const;

// Seminar Categories
export const seminarCategories = [
  "Career Development",
  "Technology",
  "Business",
  "Science",
  "Arts & Design",
  "Personal Development",
  "Networking",
  "Workshop"
] as const;

// Entrepreneur Content Types
export const contentTypes = [
  "Article",
  "Video",
  "Course",
  "Podcast",
  "Case Study"
] as const;

// Note Categories
export const noteCategories = [
  "General",
  "Career",
  "Academic",
  "Personal",
  "Ideas",
  "Research"
] as const;

// Calendar Event Types
export const calendarEventTypes = [
  "task",
  "seminar",
  "reminder",
  "deadline"
] as const;

// Interest Options
export const interestOptions = [
  "Technology",
  "Business",
  "Science",
  "Arts",
  "Healthcare",
  "Education",
  "Finance",
  "Engineering",
  "Law",
  "Social Sciences"
] as const;
