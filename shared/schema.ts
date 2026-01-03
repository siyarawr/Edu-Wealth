import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, real, timestamp, boolean, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User Activity Events (for admin tracking)
export const userEvents = pgTable("user_events", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id"),
  eventType: text("event_type").notNull(),
  userEmail: text("user_email"),
  userName: text("user_name"),
  metadata: text("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserEventSchema = createInsertSchema(userEvents).omit({
  id: true,
  createdAt: true,
});

export type InsertUserEvent = z.infer<typeof insertUserEventSchema>;
export type UserEvent = typeof userEvents.$inferSelect;

// Users with full profile (includes Replit Auth fields)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username"),
  password: text("password"),
  // Replit Auth fields
  firstName: text("first_name"),
  lastName: text("last_name"),
  profileImageUrl: text("profile_image_url"),
  // Personal info
  fullName: text("full_name"),
  email: text("email"),
  linkedinUrl: text("linkedin_url"),
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
  isPremium: boolean("is_premium").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  id: true,
  username: true,
  password: true,
  firstName: true,
  lastName: true,
  email: true,
  profileImageUrl: true,
});

export type UpsertUser = typeof users.$inferInsert;

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

// Finance Reminders - Track when finances are due
export const financeReminders = pgTable("finance_reminders", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  title: text("title").notNull(),
  amount: real("amount"),
  dueDate: timestamp("due_date").notNull(),
  category: text("category").notNull(),
  notes: text("notes"),
  isPaid: boolean("is_paid").default(false),
  isRecurring: boolean("is_recurring").default(false),
  recurringFrequency: text("recurring_frequency"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertFinanceReminderSchema = createInsertSchema(financeReminders).omit({
  id: true,
  createdAt: true,
});

export type InsertFinanceReminder = z.infer<typeof insertFinanceReminderSchema>;
export type FinanceReminder = typeof financeReminders.$inferSelect;

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

// Meeting Notes with sharing permissions
export const meetingNotes = pgTable("meeting_notes", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  title: text("title").notNull(),
  date: timestamp("date").notNull(),
  category: text("category").notNull(),
  attendees: text("attendees"),
  summary: text("summary"),
  comments: text("comments"),
  agenda: text("agenda"),
  questions: text("questions"),
  notes: text("notes"),
  lastUpdatedBy: text("last_updated_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertMeetingNoteSchema = createInsertSchema(meetingNotes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertMeetingNote = z.infer<typeof insertMeetingNoteSchema>;
export type MeetingNote = typeof meetingNotes.$inferSelect;

// Meeting Note Sharing Permissions
export const meetingNoteShares = pgTable("meeting_note_shares", {
  id: serial("id").primaryKey(),
  noteId: integer("note_id").notNull(),
  email: text("email").notNull(),
  permission: text("permission").notNull(), // 'view', 'comment', 'edit'
  invitedBy: varchar("invited_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMeetingNoteShareSchema = createInsertSchema(meetingNoteShares).omit({
  id: true,
  createdAt: true,
});

export type InsertMeetingNoteShare = z.infer<typeof insertMeetingNoteShareSchema>;
export type MeetingNoteShare = typeof meetingNoteShares.$inferSelect;

// Chat Conversations
export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  createdBy: varchar("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
});

export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;

// Conversation Participants
export const conversationParticipants = pgTable("conversation_participants", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull(),
  userId: varchar("user_id"),
  email: text("email").notNull(),
  inviteToken: text("invite_token"),
  joinedAt: timestamp("joined_at"),
  isActive: boolean("is_active").default(true),
});

export const insertConversationParticipantSchema = createInsertSchema(conversationParticipants).omit({
  id: true,
});

export type InsertConversationParticipant = z.infer<typeof insertConversationParticipantSchema>;
export type ConversationParticipant = typeof conversationParticipants.$inferSelect;

// Chat Messages
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull(),
  senderId: varchar("sender_id").notNull(),
  senderName: text("sender_name"),
  content: text("content").notNull(),
  replyToId: integer("reply_to_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at"),
  isEdited: boolean("is_edited").default(false),
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

// Message Reactions
export const messageReactions = pgTable("message_reactions", {
  id: serial("id").primaryKey(),
  messageId: integer("message_id").notNull(),
  userId: varchar("user_id").notNull(),
  reaction: text("reaction").notNull(), // 'heart', 'thumbs_up'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMessageReactionSchema = createInsertSchema(messageReactions).omit({
  id: true,
  createdAt: true,
});

export type InsertMessageReaction = z.infer<typeof insertMessageReactionSchema>;
export type MessageReaction = typeof messageReactions.$inferSelect;

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

// Finance Tracker Entries (Income & Expenses with tags)
export const financeEntries = pgTable("finance_entries", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  type: text("type").notNull(), // "income" or "expense"
  source: text("source").notNull(),
  amount: real("amount").notNull(),
  tag: text("tag").notNull(),
  date: timestamp("date").defaultNow().notNull(),
});

export const insertFinanceEntrySchema = createInsertSchema(financeEntries).omit({
  id: true,
});

export type InsertFinanceEntry = z.infer<typeof insertFinanceEntrySchema>;
export type FinanceEntry = typeof financeEntries.$inferSelect;

// Finance Entry Tags
export const incomeTagOptions = [
  "Salary",
  "Freelance",
  "Investment",
  "Scholarship",
  "Gift",
  "Other"
] as const;

export const expenseTagOptions = [
  "Rent/Mortgage",
  "Utilities",
  "Groceries",
  "Dining Out",
  "Transportation",
  "Healthcare",
  "Entertainment",
  "Retail",
  "Education",
  "Other"
] as const;

// Re-export sessions from auth model
export { sessions } from "./models/auth";
