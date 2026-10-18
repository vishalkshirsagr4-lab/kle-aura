import { BadgeCheck as FaCertificate, Presentation as FaChalkboardUser, Laptop as FaLaptopCode, Briefcase as FaBriefcase, User as FaUserTie, Trophy as FaTrophy } from "lucide-react";

export const COLLEGE = {
  name: "KLE BCA & BBA College",
  place: "Mahalingpur",
};

export const FACILITIES = [
  {
    id: "courses",
    Icon: FaCertificate,
    title: "Sem-wise certificate courses",
    text: "Skill-based certificate courses in every semester, alongside the university syllabus.",
  },
  {
    id: "seminars",
    Icon: FaChalkboardUser,
    title: "Seminars & guest talks",
    text: "Seminars and workshops that bring industry and academic experts to campus.",
  },
  {
    id: "hackathon",
    Icon: FaLaptopCode,
    title: "Hackathon preparation",
    text: "Mentoring and practice for hackathons and innovation competitions.",
  },
  {
    id: "placement",
    Icon: FaBriefcase,
    title: "Pre-placement training",
    text: "Aptitude, resume and mock-interview training before campus placements.",
  },
  {
    id: "staff",
    Icon: FaUserTie,
    title: "Experienced staff",
    text: "Experienced faculty who guide students from the classroom to a career.",
  },
  {
    id: "talent",
    Icon: FaTrophy,
    title: "Talent showcase",
    text: "Events like AI-AURA give every student a stage to show what they can build.",
  },
];

// NOTE: these course lists are sample entries — edit them to match the
// certificate courses your college actually runs in each semester.
export const COURSES = {
  BCA: [
    { sem: "I", items: ["Office Productivity & Typing Skills", "Web Basics (HTML & CSS)"] },
    { sem: "II", items: ["Python Programming", "Database Fundamentals (SQL)"] },
    { sem: "III", items: ["JavaScript & React Basics", "Git & GitHub"] },
    { sem: "IV", items: ["Node.js & MongoDB", "Cloud Fundamentals"] },
    { sem: "V", items: ["AI & Machine Learning Basics", "Cyber Security Essentials"] },
    { sem: "VI", items: ["Placement Aptitude & Interview Skills", "Capstone Project Mentoring"] },
  ],
  BBA: [
    { sem: "I", items: ["Business Communication", "Tally Basics"] },
    { sem: "II", items: ["Digital Marketing Basics", "Excel for Business"] },
    { sem: "III", items: ["Financial Accounting with Tally Prime", "Business Analytics with Excel"] },
    { sem: "IV", items: ["Entrepreneurship Workshop", "GST Fundamentals"] },
    { sem: "V", items: ["HR Analytics", "Stock Market Basics"] },
    { sem: "VI", items: ["Placement Aptitude & Interview Skills", "Internship Guidance"] },
  ],
};
