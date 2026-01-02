import {
  type User, type InsertUser,
  type Expense, type InsertExpense,
  type Budget, type InsertBudget,
  type Internship, type InsertInternship,
  type Scholarship, type InsertScholarship,
  type Seminar, type InsertSeminar,
  type SeminarNote, type InsertSeminarNote,
  type EntrepreneurContent, type InsertEntrepreneurContent,
  users, expenses, budgets, internships, scholarships, seminars, seminarNotes, entrepreneurContent,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getExpenses(userId: string): Promise<Expense[]>;
  getExpense(id: number): Promise<Expense | undefined>;
  createExpense(expense: InsertExpense): Promise<Expense>;
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
  getSeminars(): Promise<Seminar[]>;
  getSeminar(id: number): Promise<Seminar | undefined>;
  createSeminar(seminar: InsertSeminar): Promise<Seminar>;
  getSeminarNotes(userId: string): Promise<SeminarNote[]>;
  getSeminarNote(id: number): Promise<SeminarNote | undefined>;
  createSeminarNote(note: InsertSeminarNote): Promise<SeminarNote>;
  deleteSeminarNote(id: number): Promise<void>;
  getEntrepreneurContent(type?: string): Promise<EntrepreneurContent[]>;
  createEntrepreneurContent(content: InsertEntrepreneurContent): Promise<EntrepreneurContent>;
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

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
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

  async getSeminars(): Promise<Seminar[]> {
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
}

export const storage = new DatabaseStorage();
