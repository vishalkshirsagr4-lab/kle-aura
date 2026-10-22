import crypto from "crypto";

const genId = () => crypto.randomBytes(12).toString("hex");

// Pre-seeded announcements
let announcements = [
  {
    _id: "507f191e810c19729de860ea",
    title: "AI-AURA 2K26 Registrations Open!",
    message: "Welcome to AI-AURA 2K26 - A State Level Tech & Cultural Talent Hunt for PUC students. Explore 18 competitive events and register today!",
    category: "important",
    date: "2026-11-06",
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    _id: "507f191e810c19729de860eb",
    title: "Event Date & Venue Announced",
    message: "The mega event will be held on 6th November 2026 at KLE Society's BCA & BBA College, Mahalingpur. Free food & transport assistance provided.",
    category: "date",
    date: "2026-11-06",
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    _id: "507f191e810c19729de860ec",
    title: "Exciting Cash Prizes & Free Certificate Courses",
    message: "Trophies, certificates, and exciting cash prizes for winners. All participants receive digital certificates and workshop entry.",
    category: "general",
    date: "2026-11-06",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
];

// Pre-seeded registrations for live demo
let registrations = [
  {
    _id: "507f1f77bcf86cd799439011",
    fullname: "Rahul Sharma",
    email: "rahul.sharma@example.com",
    college: "KLE Independent PU College, Mahalingpur",
    phone: "9876543210",
    event: "QUIZ (GENERAL & IT)",
    pucRoll: "PU2026-1042",
    teamName: "Byte Wizards",
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    _id: "507f1f77bcf86cd799439012",
    fullname: "Priya Patil",
    email: "priya.patil@example.com",
    college: "Basaveshwar PU Science College, Bagalkot",
    phone: "9812345678",
    event: "AI POSTER MAKING",
    pucRoll: "PU2026-2085",
    teamName: "",
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    _id: "507f1f77bcf86cd799439013",
    fullname: "Karthik Hegde",
    email: "karthik.h@example.com",
    college: "BVB PU College, Hubli",
    phone: "9731245670",
    event: "GAMING",
    pucRoll: "PU2026-3110",
    teamName: "Shadow Strikers",
    createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
  },
  {
    _id: "507f1f77bcf86cd799439014",
    fullname: "Ananya Kulkarni",
    email: "ananya.k@example.com",
    college: "Govt PU College, Mudhol",
    phone: "9845012345",
    event: "AI QUIZ",
    pucRoll: "PU2026-4021",
    teamName: "",
    createdAt: new Date(Date.now() - 1000 * 60 * 150).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 150).toISOString(),
  },
];

let settings = {
  key: "main",
  eventDate: "2026-11-06",
  startTime: "09:00",
  endTime: "17:00",
  venue: "KLE Society's BCA & BBA College, Mahalingpur",
  website: "https://www.klebcamahalingpur.com",
  instagram: "https://instagram.com/kle_aura",
  youtube: "",
  facebook: "",
  linkedin: "",
};

export default {
  genId,
  getAnnouncements: () => announcements,
  setAnnouncements: (arr) => { announcements = arr; },
  getRegistrations: () => registrations,
  setRegistrations: (arr) => { registrations = arr; },
  getSettings: () => settings,
  setSettings: (s) => { settings = s; },
};
