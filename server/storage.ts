import {
  type User, type InsertUser, type UpdateUserProfile,
  type Expense, type InsertExpense,
  type Budget, type InsertBudget,
  type Internship, type InsertInternship,
  type Scholarship, type InsertScholarship,
  type Seminar, type InsertSeminar,
  type SeminarNote, type InsertSeminarNote,
  type EntrepreneurContent, type InsertEntrepreneurContent,
  type CalendarEvent, type InsertCalendarEvent,
  type MeetingNote, type InsertMeetingNote,
  type MeetingNoteShare, type InsertMeetingNoteShare,
  type Conversation, type InsertConversation,
  type ConversationParticipant, type InsertConversationParticipant,
  type Message, type InsertMessage,
  type MessageReaction, type InsertMessageReaction,
  type FinanceEntry, type InsertFinanceEntry,
  type FinanceReminder, type InsertFinanceReminder,
  type UserEvent, type InsertUserEvent,
  users, expenses, budgets, internships, scholarships, seminars, seminarNotes, entrepreneurContent, calendarEvents,
  meetingNotes, meetingNoteShares, conversations, conversationParticipants, messages, messageReactions, financeEntries, financeReminders, userEvents,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, gte, lte, count } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserProfile(id: string, profile: Partial<UpdateUserProfile>): Promise<User | undefined>;
  getExpenses(userId: string): Promise<Expense[]>;
  getExpense(id: number): Promise<Expense | undefined>;
  createExpense(expense: InsertExpense): Promise<Expense>;
  updateExpense(id: number, expense: Partial<InsertExpense>): Promise<Expense | undefined>;
  deleteExpense(id: number): Promise<void>;
  getBudgets(userId: string, month: string): Promise<Budget[]>;
  createBudget(budget: InsertBudget): Promise<Budget>;
  updateBudget(id: number, spent: number): Promise<Budget | undefined>;
  getInternships(): Promise<Internship[]>;
  getInternship(id: number): Promise<Internship | undefined>;
  createInternship(internship: InsertInternship): Promise<Internship>;
  getScholarships(country?: string): Promise<Scholarship[]>;
  getScholarship(id: number): Promise<Scholarship | undefined>;
  createScholarship(scholarship: InsertScholarship): Promise<Scholarship>;
  getSeminars(isOnline?: boolean): Promise<Seminar[]>;
  getSeminar(id: number): Promise<Seminar | undefined>;
  createSeminar(seminar: InsertSeminar): Promise<Seminar>;
  getSeminarNotes(userId: string): Promise<SeminarNote[]>;
  getSeminarNote(id: number): Promise<SeminarNote | undefined>;
  createSeminarNote(note: InsertSeminarNote): Promise<SeminarNote>;
  updateSeminarNote(id: number, note: Partial<InsertSeminarNote>): Promise<SeminarNote | undefined>;
  deleteSeminarNote(id: number): Promise<void>;
  getEntrepreneurContent(type?: string): Promise<EntrepreneurContent[]>;
  createEntrepreneurContent(content: InsertEntrepreneurContent): Promise<EntrepreneurContent>;
  getCalendarEvents(userId: string, startDate?: Date, endDate?: Date): Promise<CalendarEvent[]>;
  getCalendarEvent(id: number): Promise<CalendarEvent | undefined>;
  createCalendarEvent(event: InsertCalendarEvent): Promise<CalendarEvent>;
  updateCalendarEvent(id: number, event: Partial<InsertCalendarEvent>): Promise<CalendarEvent | undefined>;
  findUserReaction(messageId: number, userId: string, reaction: string): Promise<MessageReaction | undefined>;
  deleteConversation(id: number): Promise<void>;
  deleteCalendarEvent(id: number): Promise<void>;
  getMeetingNotes(userId: string): Promise<MeetingNote[]>;
  getMeetingNote(id: number): Promise<MeetingNote | undefined>;
  createMeetingNote(note: InsertMeetingNote): Promise<MeetingNote>;
  updateMeetingNote(id: number, note: Partial<InsertMeetingNote>): Promise<MeetingNote | undefined>;
  deleteMeetingNote(id: number): Promise<void>;
  getMeetingNoteShares(noteId: number): Promise<MeetingNoteShare[]>;
  createMeetingNoteShare(share: InsertMeetingNoteShare): Promise<MeetingNoteShare>;
  deleteMeetingNoteShare(id: number): Promise<void>;
  getConversations(userId: string): Promise<Conversation[]>;
  getConversation(id: number): Promise<Conversation | undefined>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  getConversationParticipants(conversationId: number): Promise<ConversationParticipant[]>;
  addConversationParticipant(participant: InsertConversationParticipant): Promise<ConversationParticipant>;
  getMessages(conversationId: number): Promise<Message[]>;
  getMessage(id: number): Promise<Message | undefined>;
  createMessage(message: InsertMessage): Promise<Message>;
  updateMessage(id: number, content: string): Promise<Message | undefined>;
  getMessageReactions(messageId: number): Promise<MessageReaction[]>;
  addMessageReaction(reaction: InsertMessageReaction): Promise<MessageReaction>;
  removeMessageReaction(id: number): Promise<void>;
  getFinanceEntries(userId: string): Promise<FinanceEntry[]>;
  getFinanceEntry(id: number): Promise<FinanceEntry | undefined>;
  createFinanceEntry(entry: InsertFinanceEntry): Promise<FinanceEntry>;
  updateFinanceEntry(id: number, entry: Partial<InsertFinanceEntry>): Promise<FinanceEntry | undefined>;
  deleteFinanceEntry(id: number): Promise<void>;
  getFinanceReminders(userId: string): Promise<FinanceReminder[]>;
  getFinanceReminder(id: number): Promise<FinanceReminder | undefined>;
  createFinanceReminder(reminder: InsertFinanceReminder): Promise<FinanceReminder>;
  updateFinanceReminder(id: number, reminder: Partial<InsertFinanceReminder>): Promise<FinanceReminder | undefined>;
  deleteFinanceReminder(id: number): Promise<void>;
  logUserEvent(event: InsertUserEvent): Promise<UserEvent>;
  getUserEvents(limit?: number): Promise<UserEvent[]>;
  getUserStats(): Promise<{ totalUsers: number; todaySignups: number; todayLogins: number; weeklyActive: number }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUserProfile(id: string, profile: Partial<UpdateUserProfile>): Promise<User | undefined> {
    const [updated] = await db.update(users).set(profile).where(eq(users.id, id)).returning();
    return updated || undefined;
  }

  async getExpenses(userId: string): Promise<Expense[]> {
    return db.select().from(expenses).where(eq(expenses.userId, userId)).orderBy(desc(expenses.date));
  }

  async getExpense(id: number): Promise<Expense | undefined> {
    const [expense] = await db.select().from(expenses).where(eq(expenses.id, id));
    return expense || undefined;
  }

  async createExpense(expense: InsertExpense): Promise<Expense> {
    const [newExpense] = await db.insert(expenses).values(expense).returning();
    return newExpense;
  }

  async updateExpense(id: number, expense: Partial<InsertExpense>): Promise<Expense | undefined> {
    const [updated] = await db.update(expenses).set(expense).where(eq(expenses.id, id)).returning();
    return updated || undefined;
  }

  async deleteExpense(id: number): Promise<void> {
    await db.delete(expenses).where(eq(expenses.id, id));
  }

  async getBudgets(userId: string, month: string): Promise<Budget[]> {
    return db.select().from(budgets).where(and(eq(budgets.userId, userId), eq(budgets.month, month)));
  }

  async createBudget(budget: InsertBudget): Promise<Budget> {
    const [newBudget] = await db.insert(budgets).values(budget).returning();
    return newBudget;
  }

  async updateBudget(id: number, spent: number): Promise<Budget | undefined> {
    const [updated] = await db.update(budgets).set({ spent }).where(eq(budgets.id, id)).returning();
    return updated || undefined;
  }

  async getInternships(): Promise<Internship[]> {
    return db.select().from(internships);
  }

  async getInternship(id: number): Promise<Internship | undefined> {
    const [internship] = await db.select().from(internships).where(eq(internships.id, id));
    return internship || undefined;
  }

  async createInternship(internship: InsertInternship): Promise<Internship> {
    const [newInternship] = await db.insert(internships).values(internship).returning();
    return newInternship;
  }

  async getScholarships(country?: string): Promise<Scholarship[]> {
    if (country) {
      return db.select().from(scholarships).where(
        or(eq(scholarships.country, country), eq(scholarships.country, "International"))
      );
    }
    return db.select().from(scholarships);
  }

  async getScholarship(id: number): Promise<Scholarship | undefined> {
    const [scholarship] = await db.select().from(scholarships).where(eq(scholarships.id, id));
    return scholarship || undefined;
  }

  async createScholarship(scholarship: InsertScholarship): Promise<Scholarship> {
    const [newScholarship] = await db.insert(scholarships).values(scholarship).returning();
    return newScholarship;
  }

  async getSeminars(isOnline?: boolean): Promise<Seminar[]> {
    if (isOnline !== undefined) {
      return db.select().from(seminars).where(eq(seminars.isOnline, isOnline)).orderBy(seminars.date);
    }
    return db.select().from(seminars).orderBy(seminars.date);
  }

  async getSeminar(id: number): Promise<Seminar | undefined> {
    const [seminar] = await db.select().from(seminars).where(eq(seminars.id, id));
    return seminar || undefined;
  }

  async createSeminar(seminar: InsertSeminar): Promise<Seminar> {
    const [newSeminar] = await db.insert(seminars).values(seminar).returning();
    return newSeminar;
  }

  async getSeminarNotes(userId: string): Promise<SeminarNote[]> {
    return db.select().from(seminarNotes).where(eq(seminarNotes.userId, userId)).orderBy(desc(seminarNotes.createdAt));
  }

  async getSeminarNote(id: number): Promise<SeminarNote | undefined> {
    const [note] = await db.select().from(seminarNotes).where(eq(seminarNotes.id, id));
    return note || undefined;
  }

  async createSeminarNote(note: InsertSeminarNote): Promise<SeminarNote> {
    const [newNote] = await db.insert(seminarNotes).values(note).returning();
    return newNote;
  }

  async updateSeminarNote(id: number, note: Partial<InsertSeminarNote>): Promise<SeminarNote | undefined> {
    const [updated] = await db.update(seminarNotes).set(note).where(eq(seminarNotes.id, id)).returning();
    return updated || undefined;
  }

  async deleteSeminarNote(id: number): Promise<void> {
    await db.delete(seminarNotes).where(eq(seminarNotes.id, id));
  }

  async getEntrepreneurContent(type?: string): Promise<EntrepreneurContent[]> {
    if (type) {
      return db.select().from(entrepreneurContent).where(eq(entrepreneurContent.type, type));
    }
    return db.select().from(entrepreneurContent);
  }

  async createEntrepreneurContent(content: InsertEntrepreneurContent): Promise<EntrepreneurContent> {
    const [newContent] = await db.insert(entrepreneurContent).values(content).returning();
    return newContent;
  }

  async getCalendarEvents(userId: string, startDate?: Date, endDate?: Date): Promise<CalendarEvent[]> {
    if (startDate && endDate) {
      return db.select().from(calendarEvents).where(
        and(
          eq(calendarEvents.userId, userId),
          gte(calendarEvents.date, startDate),
          lte(calendarEvents.date, endDate)
        )
      ).orderBy(calendarEvents.date);
    }
    return db.select().from(calendarEvents).where(eq(calendarEvents.userId, userId)).orderBy(calendarEvents.date);
  }

  async getCalendarEvent(id: number): Promise<CalendarEvent | undefined> {
    const [event] = await db.select().from(calendarEvents).where(eq(calendarEvents.id, id));
    return event || undefined;
  }

  async createCalendarEvent(event: InsertCalendarEvent): Promise<CalendarEvent> {
    const [newEvent] = await db.insert(calendarEvents).values(event).returning();
    return newEvent;
  }

  async updateCalendarEvent(id: number, event: Partial<InsertCalendarEvent>): Promise<CalendarEvent | undefined> {
    const [updated] = await db.update(calendarEvents).set(event).where(eq(calendarEvents.id, id)).returning();
    return updated || undefined;
  }

  async deleteCalendarEvent(id: number): Promise<void> {
    await db.delete(calendarEvents).where(eq(calendarEvents.id, id));
  }

  async getMeetingNotes(userId: string): Promise<MeetingNote[]> {
    return db.select().from(meetingNotes).where(eq(meetingNotes.userId, userId)).orderBy(desc(meetingNotes.createdAt));
  }

  async getMeetingNote(id: number): Promise<MeetingNote | undefined> {
    const [note] = await db.select().from(meetingNotes).where(eq(meetingNotes.id, id));
    return note || undefined;
  }

  async createMeetingNote(note: InsertMeetingNote): Promise<MeetingNote> {
    const [newNote] = await db.insert(meetingNotes).values(note).returning();
    return newNote;
  }

  async updateMeetingNote(id: number, note: Partial<InsertMeetingNote>): Promise<MeetingNote | undefined> {
    const [updated] = await db.update(meetingNotes).set({ ...note, updatedAt: new Date() }).where(eq(meetingNotes.id, id)).returning();
    return updated || undefined;
  }

  async deleteMeetingNote(id: number): Promise<void> {
    await db.delete(meetingNoteShares).where(eq(meetingNoteShares.noteId, id));
    await db.delete(meetingNotes).where(eq(meetingNotes.id, id));
  }

  async getMeetingNoteShares(noteId: number): Promise<MeetingNoteShare[]> {
    return db.select().from(meetingNoteShares).where(eq(meetingNoteShares.noteId, noteId));
  }

  async createMeetingNoteShare(share: InsertMeetingNoteShare): Promise<MeetingNoteShare> {
    const [newShare] = await db.insert(meetingNoteShares).values(share).returning();
    return newShare;
  }

  async deleteMeetingNoteShare(id: number): Promise<void> {
    await db.delete(meetingNoteShares).where(eq(meetingNoteShares.id, id));
  }

  async getConversations(userId: string): Promise<Conversation[]> {
    const participantConvos = await db.select({ conversationId: conversationParticipants.conversationId })
      .from(conversationParticipants)
      .where(eq(conversationParticipants.userId, userId));
    
    const convIds = participantConvos.map(p => p.conversationId);
    if (convIds.length === 0) return [];
    
    return db.select().from(conversations).where(
      or(...convIds.map(id => eq(conversations.id, id)))
    ).orderBy(desc(conversations.createdAt));
  }

  async getConversation(id: number): Promise<Conversation | undefined> {
    const [conv] = await db.select().from(conversations).where(eq(conversations.id, id));
    return conv || undefined;
  }

  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    const [newConv] = await db.insert(conversations).values(conversation).returning();
    return newConv;
  }

  async getConversationParticipants(conversationId: number): Promise<ConversationParticipant[]> {
    return db.select().from(conversationParticipants).where(eq(conversationParticipants.conversationId, conversationId));
  }

  async addConversationParticipant(participant: InsertConversationParticipant): Promise<ConversationParticipant> {
    const [newParticipant] = await db.insert(conversationParticipants).values(participant).returning();
    return newParticipant;
  }

  async getMessages(conversationId: number): Promise<Message[]> {
    return db.select().from(messages).where(eq(messages.conversationId, conversationId)).orderBy(messages.createdAt);
  }

  async getMessage(id: number): Promise<Message | undefined> {
    const [msg] = await db.select().from(messages).where(eq(messages.id, id));
    return msg || undefined;
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMsg] = await db.insert(messages).values(message).returning();
    return newMsg;
  }

  async updateMessage(id: number, content: string): Promise<Message | undefined> {
    const [updated] = await db.update(messages).set({ content, isEdited: true, updatedAt: new Date() }).where(eq(messages.id, id)).returning();
    return updated || undefined;
  }

  async getMessageReactions(messageId: number): Promise<MessageReaction[]> {
    return db.select().from(messageReactions).where(eq(messageReactions.messageId, messageId));
  }

  async addMessageReaction(reaction: InsertMessageReaction): Promise<MessageReaction> {
    const [newReaction] = await db.insert(messageReactions).values(reaction).returning();
    return newReaction;
  }

  async removeMessageReaction(id: number): Promise<void> {
    await db.delete(messageReactions).where(eq(messageReactions.id, id));
  }

  async findUserReaction(messageId: number, userId: string, reaction: string): Promise<MessageReaction | undefined> {
    const [found] = await db.select().from(messageReactions)
      .where(and(
        eq(messageReactions.messageId, messageId),
        eq(messageReactions.userId, userId),
        eq(messageReactions.reaction, reaction)
      ));
    return found || undefined;
  }

  async deleteConversation(id: number): Promise<void> {
    const msgs = await this.getMessages(id);
    for (const msg of msgs) {
      await db.delete(messageReactions).where(eq(messageReactions.messageId, msg.id));
    }
    await db.delete(messages).where(eq(messages.conversationId, id));
    await db.delete(conversationParticipants).where(eq(conversationParticipants.conversationId, id));
    await db.delete(conversations).where(eq(conversations.id, id));
  }

  async getFinanceEntries(userId: string): Promise<FinanceEntry[]> {
    return db.select().from(financeEntries).where(eq(financeEntries.userId, userId)).orderBy(desc(financeEntries.date));
  }

  async getFinanceEntry(id: number): Promise<FinanceEntry | undefined> {
    const [entry] = await db.select().from(financeEntries).where(eq(financeEntries.id, id));
    return entry || undefined;
  }

  async createFinanceEntry(entry: InsertFinanceEntry): Promise<FinanceEntry> {
    const [newEntry] = await db.insert(financeEntries).values(entry).returning();
    return newEntry;
  }

  async updateFinanceEntry(id: number, entry: Partial<InsertFinanceEntry>): Promise<FinanceEntry | undefined> {
    const [updated] = await db.update(financeEntries).set(entry).where(eq(financeEntries.id, id)).returning();
    return updated || undefined;
  }

  async deleteFinanceEntry(id: number): Promise<void> {
    await db.delete(financeEntries).where(eq(financeEntries.id, id));
  }

  async getFinanceReminders(userId: string): Promise<FinanceReminder[]> {
    return db.select().from(financeReminders).where(eq(financeReminders.userId, userId)).orderBy(financeReminders.dueDate);
  }

  async getFinanceReminder(id: number): Promise<FinanceReminder | undefined> {
    const [reminder] = await db.select().from(financeReminders).where(eq(financeReminders.id, id));
    return reminder || undefined;
  }

  async createFinanceReminder(reminder: InsertFinanceReminder): Promise<FinanceReminder> {
    const [newReminder] = await db.insert(financeReminders).values(reminder).returning();
    return newReminder;
  }

  async updateFinanceReminder(id: number, reminder: Partial<InsertFinanceReminder>): Promise<FinanceReminder | undefined> {
    const [updated] = await db.update(financeReminders).set(reminder).where(eq(financeReminders.id, id)).returning();
    return updated || undefined;
  }

  async deleteFinanceReminder(id: number): Promise<void> {
    await db.delete(financeReminders).where(eq(financeReminders.id, id));
  }

  async logUserEvent(event: InsertUserEvent): Promise<UserEvent> {
    const [newEvent] = await db.insert(userEvents).values(event).returning();
    return newEvent;
  }

  async getUserEvents(limit: number = 50): Promise<UserEvent[]> {
    return db.select().from(userEvents).orderBy(desc(userEvents.createdAt)).limit(limit);
  }

  async getUserStats(): Promise<{ totalUsers: number; todaySignups: number; todayLogins: number; weeklyActive: number }> {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const allUsers = await db.select().from(users);
    const totalUsers = allUsers.length;

    const todayEvents = await db.select().from(userEvents).where(gte(userEvents.createdAt, todayStart));
    const todaySignups = todayEvents.filter(e => e.eventType === 'signup').length;
    const todayLogins = todayEvents.filter(e => e.eventType === 'login').length;

    const weekEvents = await db.select().from(userEvents).where(gte(userEvents.createdAt, weekAgo));
    const uniqueUsers = new Set(weekEvents.map(e => e.userId).filter(Boolean));
    const weeklyActive = uniqueUsers.size;

    return { totalUsers, todaySignups, todayLogins, weeklyActive };
  }
}

export const storage = new DatabaseStorage();
