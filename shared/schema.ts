import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, real, timestamp, boolean, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  country: text("country"),
  university: text("university"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Expenses
export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  category: text("category").notNull(),
  amount: real("amount").notNull(),
  description: text("description"),
  date: timestamp("date").defaultNow().notNull(),
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

// Scholarships
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
});

export const insertScholarshipSchema = createInsertSchema(scholarships).omit({
  id: true,
});

export type InsertScholarship = z.infer<typeof insertScholarshipSchema>;
export type Scholarship = typeof scholarships.$inferSelect;

// Seminars
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
});

export const insertSeminarSchema = createInsertSchema(seminars).omit({
  id: true,
});

export type InsertSeminar = z.infer<typeof insertSeminarSchema>;
export type Seminar = typeof seminars.$inferSelect;

// Seminar Notes (AI-generated)
export const seminarNotes = pgTable("seminar_notes", {
  id: serial("id").primaryKey(),
  seminarId: integer("seminar_id").notNull(),
  userId: varchar("user_id").notNull(),
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
  "Student Talk",
  "Speaker Event",
  "Grad Event",
  "Workshop",
  "Networking"
] as const;

// Entrepreneur Content Types
export const contentTypes = [
  "Article",
  "Video",
  "Course",
  "Podcast",
  "Case Study"
] as const;
