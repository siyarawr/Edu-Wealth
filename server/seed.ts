import { db } from "./db";
import {
  internships, scholarships, seminars, entrepreneurContent,
  type InsertInternship, type InsertScholarship, type InsertSeminar, type InsertEntrepreneurContent
} from "@shared/schema";

async function seed() {
  console.log("Seeding database...");

  const existingInternships = await db.select().from(internships);
  if (existingInternships.length > 0) {
    console.log("Database already seeded, skipping...");
    return;
  }

  const internshipData: InsertInternship[] = [
    {
      company: "Google",
      title: "Software Engineering Intern",
      location: "Mountain View, CA",
      type: "Summer",
      description: "Join our team to work on cutting-edge projects in cloud computing and machine learning.",
      requirements: "CS major, strong coding skills, data structures knowledge",
      deadline: new Date("2026-02-15"),
      salary: "$8,000/month",
      applyUrl: "https://careers.google.com",
      isRemote: false,
    },
    {
      company: "Microsoft",
      title: "Product Management Intern",
      location: "Seattle, WA",
      type: "Summer",
      description: "Work with product teams to define and ship features for Microsoft 365.",
      requirements: "Business or CS major, analytical skills, communication",
      deadline: new Date("2026-02-28"),
      salary: "$7,500/month",
      applyUrl: "https://careers.microsoft.com",
      isRemote: true,
    },
    {
      company: "Amazon",
      title: "Data Science Intern",
      location: "New York, NY",
      type: "Fall",
      description: "Apply machine learning and statistical techniques to solve complex business problems.",
      requirements: "Statistics or CS major, Python, SQL, ML fundamentals",
      deadline: new Date("2026-03-01"),
      salary: "$7,800/month",
      applyUrl: "https://amazon.jobs",
      isRemote: false,
    },
    {
      company: "Stripe",
      title: "Backend Engineering Intern",
      location: "San Francisco, CA",
      type: "Summer",
      description: "Build and scale the infrastructure that powers millions of businesses.",
      requirements: "CS major, systems programming, Ruby or Go preferred",
      deadline: new Date("2026-02-20"),
      salary: "$9,000/month",
      applyUrl: "https://stripe.com/jobs",
      isRemote: true,
    },
  ];

  const scholarshipData: InsertScholarship[] = [
    {
      name: "Merit Excellence Scholarship",
      organization: "National Education Foundation",
      amount: "$10,000/year",
      country: "United States",
      deadline: new Date("2026-03-01"),
      requirements: "GPA 3.5+, Full-time enrollment",
      description: "Supporting outstanding students who demonstrate academic excellence.",
      eligibility: "Undergraduate students in any major",
      applyUrl: "https://example.com/apply",
    },
    {
      name: "STEM Leaders Award",
      organization: "Tech for Tomorrow Foundation",
      amount: "$15,000",
      country: "United States",
      deadline: new Date("2026-02-15"),
      requirements: "STEM major, demonstrated interest in technology",
      description: "Empowering the next generation of technology leaders.",
      eligibility: "Undergraduate and graduate STEM students",
      applyUrl: "https://example.com/apply",
    },
    {
      name: "Global Scholars Program",
      organization: "International Education Council",
      amount: "$20,000",
      country: "International",
      deadline: new Date("2026-04-01"),
      requirements: "Any nationality, GPA 3.7+, English proficiency",
      description: "A prestigious international scholarship for exceptional students.",
      eligibility: "Graduate students from any country",
      applyUrl: "https://example.com/apply",
    },
    {
      name: "Commonwealth Scholarship",
      organization: "UK Government",
      amount: "Full Tuition + Stipend",
      country: "United Kingdom",
      deadline: new Date("2026-01-31"),
      requirements: "Commonwealth country citizen, Master's or PhD program",
      description: "Fully funded scholarship for students from Commonwealth countries.",
      eligibility: "Citizens of Commonwealth countries",
      applyUrl: "https://example.com/apply",
    },
  ];

  const seminarData: InsertSeminar[] = [
    {
      title: "Career Fair Preparation Workshop",
      description: "Learn how to make the most of career fairs, including resume tips and networking strategies.",
      speaker: "Dr. Sarah Chen",
      speakerBio: "Career counselor with 15 years of experience.",
      category: "Career Development",
      date: new Date("2026-01-15T14:00:00"),
      duration: 90,
      location: "Student Center, Room 201",
      signupUrl: "https://example.com/signup",
      university: "State University",
      isVirtual: false,
    },
    {
      title: "Tech Industry Insights: AI and the Future of Work",
      description: "Join us for an insightful talk on how AI is reshaping industries.",
      speaker: "Mark Johnson",
      speakerBio: "Former Google engineer and AI researcher.",
      category: "Speaker Event",
      date: new Date("2026-01-18T10:00:00"),
      duration: 60,
      location: "Virtual",
      signupUrl: "https://example.com/signup",
      university: "Tech Institute",
      isVirtual: true,
    },
    {
      title: "Student Startup Showcase",
      description: "Watch fellow students pitch their innovative startup ideas.",
      speaker: "Student Entrepreneurs Panel",
      speakerBio: "A panel of student founders sharing their experiences.",
      category: "Student Talk",
      date: new Date("2026-01-20T16:00:00"),
      duration: 120,
      location: "Innovation Hub",
      signupUrl: "https://example.com/signup",
      university: "Business School",
      isVirtual: false,
    },
    {
      title: "Graduate School Application Workshop",
      description: "Everything you need to know about applying to graduate school.",
      speaker: "Prof. Emily Watson",
      speakerBio: "Graduate admissions committee member for 10+ years.",
      category: "Grad Event",
      date: new Date("2026-01-22T13:00:00"),
      duration: 75,
      location: "Library Conference Room",
      signupUrl: "https://example.com/signup",
      university: "State University",
      isVirtual: false,
    },
    {
      title: "Resume Building Masterclass",
      description: "Learn how to craft a resume that stands out to recruiters.",
      speaker: "Lisa Park",
      speakerBio: "HR director at a Fortune 500 company.",
      category: "Workshop",
      date: new Date("2026-01-25T11:00:00"),
      duration: 90,
      location: "Career Services Center",
      signupUrl: "https://example.com/signup",
      university: "State University",
      isVirtual: false,
    },
  ];

  const contentData: InsertEntrepreneurContent[] = [
    {
      title: "How to Validate Your Startup Idea",
      type: "Article",
      category: "Idea Validation",
      content: "Learn the essential steps to validate your startup idea before investing time and money.",
      author: "Sarah Chen",
      duration: 8,
    },
    {
      title: "Building a MVP in 30 Days",
      type: "Video",
      category: "Product Development",
      content: "A step-by-step guide to building your minimum viable product quickly.",
      author: "Tech Startup Academy",
      duration: 45,
    },
    {
      title: "Startup Funding 101",
      type: "Course",
      category: "Fundraising",
      content: "Comprehensive course covering all stages of startup funding.",
      author: "Venture Academy",
      duration: 180,
    },
    {
      title: "The Lean Startup Methodology",
      type: "Podcast",
      category: "Business Strategy",
      content: "Deep dive into Eric Ries' lean startup methodology.",
      author: "Startup Stories",
      duration: 55,
    },
  ];

  await db.insert(internships).values(internshipData);
  await db.insert(scholarships).values(scholarshipData);
  await db.insert(seminars).values(seminarData);
  await db.insert(entrepreneurContent).values(contentData);

  console.log("Database seeded successfully!");
}

seed().catch(console.error);
