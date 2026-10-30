// Rules & regulations — extracted directly from the official AI-AURA 2K26 PDF brochure.
// Includes accurate rules, judging focus, faculty coordinators, and student coordinators.

export const PDF_URL = "/downloads/AI-AURA-2K26-Rules-and-Regulations.pdf";
export const DRIVE_URL = "https://drive.google.com/file/d/1RJu8FRjbmEdl8fkHuvjkkjgliWSObNJE/view?usp=sharing";
export const DRIVE_PREVIEW_URL = "https://drive.google.com/file/d/1RJu8FRjbmEdl8fkHuvjkkjgliWSObNJE/preview";
export const DRIVE_DOWNLOAD_URL = "https://drive.google.com/uc?export=download&id=1RJu8FRjbmEdl8fkHuvjkkjgliWSObNJE";

export const WEBSITES = [
  { label: "BCA College Website", url: "https://www.klebcamahalingpur.com", text: "klebcamahalingpur.com" },
  { label: "BBA College Website", url: "https://www.klebbamahalingpur.com", text: "klebbamahalingpur.com" },
];

export const GROUPS = ["All", "Stage", "Art & Craft", "Writing", "Quiz & Logic", "AI & Digital"];

// Complete 18 events data matching the official brochure
export const RULES = [
  {
    id: 1,
    name: "QUIZ (GENERAL & IT)",
    group: "Quiz & Logic",
    type: "Academic & Knowledge",
    chips: ["2 per team", "60 MCQs", "60 min"],
    rules: [
      "Team participation: 2 students per team.",
      "Round 1: 60 multiple-choice questions (Mathematics 10, Science 10, English 15, Current Affairs 25). Duration: 1 hour.",
      "Shortlisted teams from Round 1 qualify for Round 2.",
      "Round 2: Each shortlisted team receives four questions covering Science, Mathematics, Current Affairs, English & Information Technology.",
    ],
    judging: "Knowledge, accuracy and time management.",
    facultyCoordinators: [
      { name: "Prof. A. R. Urabi", phone: "8618378523" },
    ],
    studentCoordinators: [
      { name: "Basavraj Nandigoni", phone: "7975997136" },
    ],
    facultyCoordinator: { name: "Prof. A. R. Urabi", phone: "8618378523" },
    studentCoordinator: { name: "Basavraj Nandigoni", phone: "7975997136" },
  },
  {
    id: 2,
    name: "DANCE (SOLO OR GROUP)",
    group: "Stage",
    type: "Performing Arts",
    chips: ["Solo: 1", "Group: 3–6", "3–4 min"],
    rules: [
      "Categories: Solo (1 participant) and Group (3 to 6 participants).",
      "Solo performance time: 3–4 minutes. Group performance time: 4 minutes.",
      "Themes: Retro vs Modern, Indian Cultural Heritage, Sandalwood/Bollywood Dance, Karnataka Folk Dance, AI and Future World.",
      "Participants must bring their soundtrack on a pendrive and follow the event sequence.",
    ],
    themes: ["Retro vs Modern", "Indian Cultural Heritage", "Sandalwood/Bollywood", "Karnataka Folk Dance", "AI & Future World"],
    judging: "Stage presence, choreography coordination, and emotional expression.",
    facultyCoordinators: [
      { name: "Prof. Vinayak Badiger", phone: "8105582503" },
    ],
    studentCoordinators: [
      { name: "Deepa Wali", phone: "9483189917" },
      { name: "Sahana Bagalmani", phone: "6360685906" },
    ],
    facultyCoordinator: { name: "Prof. Vinayak Badiger", phone: "8105582503" },
    studentCoordinator: { name: "Deepa Wali & Sahana Bagalmani", phone: "9483189917" },
  },
  {
    id: 3,
    name: "PENCIL SKETCH",
    group: "Art & Craft",
    type: "Visual Arts",
    chips: ["Individual", "90 min", "Pencil only"],
    rules: [
      "Theme: Participant's own choice.",
      "Total time allowed: 1 hour 30 minutes (90 minutes).",
      "Bring your own pencils (graphite/charcoal), erasers, and sharpeners.",
      "Drawing sheets are provided by the college.",
      "Only pencil sketching is permitted (no colours, paints, sketch pens, or markers).",
      "Shading, hatching, and blending techniques are allowed.",
    ],
    judging: "Composition, detailing, shading depth, and drawing technique.",
    facultyCoordinators: [
      { name: "Prof. Deepa Banahatti", phone: "7975959090" },
    ],
    studentCoordinators: [
      { name: "Pratibha Madiwal", phone: "7338345949" },
    ],
    facultyCoordinator: { name: "Prof. Deepa Banahatti", phone: "7975959090" },
    studentCoordinator: { name: "Pratibha Madiwal", phone: "7338345949" },
  },
  {
    id: 4,
    name: "GAMING",
    group: "AI & Digital",
    type: "Mobile Esports",
    chips: ["Individual", "Mobile Gaming", "BGMI / FreeFire"],
    rules: [
      "Participation is individual.",
      "Games featured: Mobile Gaming (BGMI / FreeFire).",
      "Bring your own mobile device with game pre-installed and fully updated.",
      "Match format, lobby credentials, and tournament rules will be provided at the event briefing.",
      "Strict anti-cheat policy; any hacks or third-party plugins lead to immediate disqualification.",
    ],
    judging: "Gameplay skill, tactical strategy, fair play, and match rankings.",
    facultyCoordinators: [
      { name: "Prof. Kiran J", phone: "7846848055" },
    ],
    studentCoordinators: [
      { name: "Bhimanna Billur", phone: "7676519763" },
    ],
    facultyCoordinator: { name: "Prof. Kiran J", phone: "7846848055" },
    studentCoordinator: { name: "Bhimanna Billur", phone: "7676519763" },
  },
  {
    id: 5,
    name: "KNOW YOUR NUMBER",
    group: "Quiz & Logic",
    type: "Logic & Numeracy",
    chips: ["Individual", "6 rounds", "6-digit number"],
    rules: [
      "Each player receives a place-value chart: Lakhs, Ten-Thousands, Thousands, Hundreds, Tens, and Ones.",
      "A random digit is revealed in each of the 6 rounds.",
      "The player places the digit into one empty column; once placed, it cannot be moved.",
      "Continue until all six columns are filled (six rounds in total).",
      "Participants read their completed numbers aloud; the largest correctly formed number wins.",
    ],
    judging: "Place-value understanding, probability planning, and numerical strategy.",
    facultyCoordinators: [
      { name: "Prof. A. R. Urabi", phone: "8618378523" },
    ],
    studentCoordinators: [
      { name: "Laxmi Nagaral", phone: "8151841121" },
    ],
    facultyCoordinator: { name: "Prof. A. R. Urabi", phone: "8618378523" },
    studentCoordinator: { name: "Laxmi Nagaral", phone: "8151841121" },
  },
  {
    id: 6,
    name: "PRABANDA",
    group: "Writing",
    type: "Essay Writing",
    chips: ["Individual", "Kannada / English", "300–500 words"],
    rules: [
      "Participation: Individual.",
      "Write in only one chosen language: Kannada or English.",
      "Time allowed: 45–60 minutes. Target length: 300–500 words.",
      "Indicative Topics: Impact of Social Media on Society & Politics; Role of Elections in Indian Democracy; Benefits and Challenges of Science & Technology; Impact of the Internet and Smartphones; History of the Indian Economy.",
      "Final topic will be officially announced at the venue.",
    ],
    topics: [
      "Impact of Social Media on Society & Politics",
      "Role of Elections in Indian Democracy",
      "Benefits and Challenges of Science and Technology",
      "Impact of the Internet and Smartphones",
      "History of the Indian Economy",
    ],
    judging: "Depth of ideas, logical organisation, original perspective, and vocabulary.",
    facultyCoordinators: [
      { name: "Prof. Deepa Ammanagi", phone: "9353224484" },
    ],
    studentCoordinators: [
      { name: "Aishwarya Chinagundi", phone: "8792049378" },
      { name: "Aishwarya Kethagoud", phone: "6362028970" },
    ],
    facultyCoordinator: { name: "Prof. Deepa Ammanagi", phone: "9353224484" },
    studentCoordinator: { name: "Aishwarya C. & Aishwarya K.", phone: "8792049378" },
  },
  {
    id: 7,
    name: "RANGOLI",
    group: "Art & Craft",
    type: "Traditional Arts",
    chips: ["Up to 2 members", "90 min", "4 × 4 ft"],
    rules: [
      "Theme: Participant's choice (traditional, cultural, or artistic).",
      "Team size: Maximum 2 members.",
      "Total time: 1 hour and 30 minutes (90 minutes).",
      "Design boundary: 4 feet × 4 feet (16 square feet).",
      "Participants must bring their own rangoli powders, chalk, and decorative elements.",
    ],
    judging: "Craftsmanship, colour coordination, symmetry, and visual impact.",
    facultyCoordinators: [
      { name: "Prof. Deepa Banahatti", phone: "7975959090" },
    ],
    studentCoordinators: [
      { name: "Pratibha Madiwal", phone: "7338345949" },
    ],
    facultyCoordinator: { name: "Prof. Deepa Banahatti", phone: "7975959090" },
    studentCoordinator: { name: "Pratibha Madiwal", phone: "7338345949" },
  },
  {
    id: 8,
    name: "REEL MAKING",
    group: "AI & Digital",
    type: "Digital Content",
    chips: ["Solo or 2 members", "30–60 sec", "MP4 Format"],
    rules: [
      "Theme: KLE Society's BCA & BBA College, Mahalingpur, and AI-AURA 2K26 festival events.",
      "Participation: Individual or a team of up to 2 students.",
      "Duration: Reel must be 30 to 60 seconds long.",
      "Submit the finished reel in MP4 format as directed by the event coordinator.",
      "Content must be original and filmed on campus during festival hours.",
    ],
    judging: "Creative storytelling, video editing cadence, visual transitions, and theme relevance.",
    facultyCoordinators: [
      { name: "Prof. Ravikantha Uppara", phone: "9480119169" },
    ],
    studentCoordinators: [
      { name: "Shubham Patil", phone: "9148741541" },
    ],
    facultyCoordinator: { name: "Prof. Ravikantha Uppara", phone: "9480119169" },
    studentCoordinator: { name: "Shubham Patil", phone: "9148741541" },
  },
  {
    id: 9,
    name: "PHOTOGRAPHY",
    group: "AI & Digital",
    type: "Visual Storytelling",
    chips: ["Individual", "Campus / Fest", "Original Shots"],
    rules: [
      "Participation is strictly individual.",
      "Theme: AI-AURA 2K26 fest atmosphere or the scenic KLE BCA & BBA College campus.",
      "All photos must be captured on the day of the event within designated campus hours.",
      "Permitted cameras (DSLR/smartphone) and submission instructions will be announced at the venue.",
      "Raw natural framing encouraged; artificial generative manipulation is strictly forbidden.",
    ],
    judging: "Originality of perspective, composition framing, lighting balance, and visual story.",
    facultyCoordinators: [
      { name: "Prof. Vinayak Badiger", phone: "8105582503" },
    ],
    studentCoordinators: [
      { name: "Shreya Shivashimpi", phone: "8317370916" },
    ],
    facultyCoordinator: { name: "Prof. Vinayak Badiger", phone: "8105582503" },
    studentCoordinator: { name: "Shreya Shivashimpi", phone: "8317370916" },
  },
  {
    id: 10,
    name: "SINGING",
    group: "Stage",
    type: "Performing Arts",
    chips: ["Solo / Individual", "Kannada / Hindi", "Up to 3 min"],
    rules: [
      "Participation: Solo / individual only.",
      "Languages permitted: Kannada or Hindi.",
      "Maximum performance time: 3 minutes.",
      "Performances may be presented with or without a background karaoke track.",
      "Track must be handed over in advance during registration.",
    ],
    judging: "Vocal pitch, lyrical clarity, rhythmic sense, expression, and stage presence.",
    facultyCoordinators: [
      { name: "Prof. Ankita Kadahatti", phone: "9742411870" },
    ],
    studentCoordinators: [
      { name: "Sana Pakali", phone: "7483462354" },
    ],
    facultyCoordinator: { name: "Prof. Ankita Kadahatti", phone: "9742411870" },
    studentCoordinator: { name: "Sana Pakali", phone: "7483462354" },
  },
  {
    id: 11,
    name: "SPEECH",
    group: "Stage",
    type: "Public Speaking",
    chips: ["Individual", "Kannada / English", "3–5 min"],
    rules: [
      "Languages permitted: Kannada or English.",
      "Speaking duration: 3 to 5 minutes.",
      "Select one of the announced topics and deliver within allotted time.",
      "Topic Choices: Role of Youth in Nation Building; Digital India – Opportunities and Challenges; The Power of Education to Change Lives; Artificial Intelligence (AI) – Boon or Bane?; Small Steps Lead to Great Success.",
      "Notes are discouraged during delivery; speak from conviction.",
    ],
    topics: [
      "Role of Youth in Nation Building",
      "Digital India - Opportunities and Challenges",
      "The Power of Education to Change Lives",
      "Artificial Intelligence (AI) - Boon or Bane?",
      "Small Steps Lead to Great Success",
    ],
    judging: "Clarity of thought, rhetorical organisation, voice projection, and audience impact.",
    facultyCoordinators: [
      { name: "Prof. Akshata Hanamagond", phone: "9845393472" },
    ],
    studentCoordinators: [
      { name: "Sakshi", phone: "9019346770" },
    ],
    facultyCoordinator: { name: "Prof. Akshata Hanamagond", phone: "9845393472" },
    studentCoordinator: { name: "Sakshi", phone: "9019346770" },
  },
  {
    id: 12,
    name: "MEHANDI",
    group: "Art & Craft",
    type: "Traditional Arts",
    chips: ["2 participants", "60 min", "Bring materials"],
    rules: [
      "Team: Two members — one artist designer and one student model.",
      "Theme: Traditional, Indian cultural, bridal, or festive designs.",
      "Time limit: 1 hour (60 minutes).",
      "Participants must bring their own mehandi cones and cleaning materials.",
      "Designs must be applied on both sides of one hand up to wrist/forearm.",
    ],
    judging: "Neatness of line work, intricate symmetry, originality, and finish.",
    facultyCoordinators: [
      { name: "Prof. Rashmi Bandigani", phone: "9535784916" },
    ],
    studentCoordinators: [
      { name: "Bhoomika Sulakhe", phone: "8867253066" },
      { name: "Karishma Nadaf", phone: "9113065815" },
    ],
    facultyCoordinator: { name: "Prof. Rashmi Bandigani", phone: "9535784916" },
    studentCoordinator: { name: "Bhoomika S. & Karishma N.", phone: "8867253066" },
  },
  {
    id: 13,
    name: "AI QUIZ",
    group: "AI & Digital",
    type: "Artificial Intelligence",
    proposed: true,
    chips: ["Individual", "30 min", "AI & GenAI"],
    rules: [
      "Format: Individual multiple-choice quiz on AI basics, Generative AI, real-world applications, responsible use, and prompt literacy.",
      "Duration: 30 minutes.",
      "No outside assistance, secondary search, or unauthorized second device during testing.",
      "If scores are tied, a short tie-breaker round will decide the winner.",
    ],
    judging: "Domain understanding, accuracy, speed, and responsible AI awareness.",
    facultyCoordinators: [
      { name: "Prof. Ravikantha Uppara", phone: "9480119169" },
      { name: "Prof. A. R. Urabi", phone: "8618378523" },
    ],
    studentCoordinators: [
      { name: "Irappa Mali", phone: "9380929684" },
      { name: "Vinay Manmi", phone: "8861853790" },
    ],
    facultyCoordinator: { name: "Prof. Ravikantha Uppara & Prof. A. R. Urabi", phone: "9480119169" },
    studentCoordinator: { name: "Irappa Mali & Vinay Manmi", phone: "9380929684" },
  },
  {
    id: 14,
    name: "AI POSTER MAKING",
    group: "AI & Digital",
    type: "Generative Design",
    proposed: true,
    chips: ["Individual", "60 min", "Digital Poster"],
    rules: [
      "Format: Create one original digital poster based on the theme revealed at the venue (e.g. A futuristic world with innovation and hope).",
      "Participants may use approved AI image/design tools; must preserve prompt logs and iterations.",
      "Time limit: 60 minutes.",
      "Present the final output in PNG, JPG, or PDF format as instructed by organisers.",
    ],
    judging: "Concept originality, visual hierarchy, aesthetic balance, and prompt precision.",
    facultyCoordinators: [
      { name: "Prof. Deepa Banahatti", phone: "7975959090" },
      { name: "Prof. Kiran Jadar", phone: "9353966966" },
    ],
    studentCoordinators: [
      { name: "Irappa Mali", phone: "9380929684" },
      { name: "Vinay Manmi", phone: "8861853790" },
    ],
    facultyCoordinator: { name: "Prof. Deepa Banahatti & Prof. Kiran Jadar", phone: "7975959090" },
    studentCoordinator: { name: "Irappa Mali & Vinay Manmi", phone: "9380929684" },
  },
  {
    id: 15,
    name: "AI GREETING CARD",
    group: "AI & Digital",
    type: "Generative Design",
    proposed: true,
    chips: ["Individual", "45 min", "Digital Card"],
    rules: [
      "Format: Design an original digital greeting card using an approved AI tool.",
      "The occasion or theme will be announced on the spot before the event begins.",
      "Duration: 45 minutes.",
      "The card must incorporate an appropriate greeting, a heartwarming message, and clean visual art.",
      "Participants should be ready to demonstrate their creative prompt steps.",
    ],
    judging: "Message eloquence, visual aesthetics, and creative application of AI tooling.",
    facultyCoordinators: [
      { name: "Prof. Deepa Banahatti", phone: "7975959090" },
      { name: "Prof. Kiran Jadar", phone: "7846848055" },
    ],
    studentCoordinators: [
      { name: "Irappa Mali", phone: "9380929684" },
      { name: "Vinay Manmi", phone: "8861853790" },
    ],
    facultyCoordinator: { name: "Prof. Deepa Banahatti & Prof. Kiran Jadar", phone: "7975959090" },
    studentCoordinator: { name: "Irappa Mali & Vinay Manmi", phone: "9380929684" },
  },
  {
    id: 16,
    name: "POETRY",
    group: "Writing",
    type: "Creative Expression",
    proposed: true,
    chips: ["Individual", "Kannada / Hindi / English", "3–5 min"],
    rules: [
      "Participation: Solo / individual.",
      "Languages permitted: Kannada, Hindi, or English.",
      "Time limit: 3 to 5 minutes.",
      "Originality: Only original poetry is evaluated for creative writing; recited classic poems must be credited.",
      "Props and background audio accompaniment are not allowed.",
      "The decision of the jury is final.",
    ],
    judging: "Poetic imagery, depth of emotion, rhythm, voice modulation, and recitation impact.",
    facultyCoordinators: [
      { name: "Prof. Ramesh Kambar", phone: "9740208103" },
    ],
    studentCoordinators: [
      { name: "Sanjana Hipparagi", phone: "8951567615" },
    ],
    facultyCoordinator: { name: "Prof. Ramesh Kambar", phone: "9740208103" },
    studentCoordinator: { name: "Sanjana Hipparagi", phone: "8951567615" },
  },
  {
    id: 17,
    name: "MONO ACTING",
    group: "Stage",
    type: "Performing Arts",
    proposed: true,
    chips: ["Individual", "Kannada / Hindi / English", "3–5 min"],
    rules: [
      "Participation: Individual only.",
      "Time limit: 3 to 5 minutes.",
      "Languages permitted: Kannada, Hindi, or English.",
      "Hand props and background sound effects (if needed) must be arranged by the performer.",
      "The theatrical piece must be respectful and suitable for a general collegiate audience.",
      "The decision of the judges is final.",
    ],
    judging: "Acting range, characterisation, dialogue delivery, emotion transition, and stage presence.",
    facultyCoordinators: [
      { name: "Prof. S. S. Kamagond", phone: "9591694884" },
    ],
    studentCoordinators: [
      { name: "Prajwal Antapur", phone: "9620155437" },
    ],
    facultyCoordinator: { name: "Prof. S. S. Kamagond", phone: "9591694884" },
    studentCoordinator: { name: "Prajwal Antapur", phone: "9620155437" },
  },
  {
    id: 18,
    name: "UNIQUE IDEA",
    group: "AI & Digital",
    type: "Innovation & Prototype",
    proposed: true,
    chips: ["Team of 3–4", "Prototype / Model", "Presentation"],
    rules: [
      "Team size: 3–4 students per team (interdisciplinary streams encouraged).",
      "Medium: Teams may demonstrate sketches, charts, slide decks, or a physical working prototype.",
      "Topics include: Tech for Your Town, Smart Water-Saving Solutions, Waste to Wealth, 100 Startup, Smart Farming Business, Sell the Unsellable, Future Classroom Lab, Prompt Repair Lab.",
      "Originality: Ideas must be students' own formulation; AI tools used must be acknowledged.",
      "Equal Participation: Every team member must explain a portion during the oral presentation.",
    ],
    topics: [
      "Tech for Your Town",
      "Smart Water-Saving Solutions",
      "Waste to Wealth",
      "100 Startup",
      "Smart Farming Business",
      "Sell the Unsellable",
      "Future Classroom Lab",
      "Prompt Repair Lab",
    ],
    judging: "Innovation, practicality of execution, social impact, and clarity of presentation.",
    facultyCoordinators: [
      { name: "Prof. Shirish Halamani", phone: "9353966966" },
    ],
    studentCoordinators: [
      { name: "Shreya Shivashimpi", phone: "6363466952" },
    ],
    facultyCoordinator: { name: "Prof. Shirish Halamani", phone: "9353966966" },
    studentCoordinator: { name: "Shreya Shivashimpi", phone: "6363466952" },
  },
];

export const GENERAL = [
  {
    title: "Participation & Eligibility",
    icon: "id",
    points: [
      "All events are exclusively open to pre-university (PUC) students across Karnataka.",
      "Registration commences at 9:00 AM on 4 November 2026. Spot entries subject to availability.",
      "Students must carry their official college identity card and Aadhaar card for verification.",
      "Participation is permitted in multiple events provided there are no direct scheduling clashes.",
    ],
  },
  {
    title: "Reporting & Campus Discipline",
    icon: "clock",
    points: [
      "Report to the assigned hall or venue at least 15 minutes before the scheduled event time.",
      "Late arrival may lead to disqualification; participants must follow the announced sequence.",
      "All candidates are expected to uphold collegiate decorum, mutual respect, and sportsmanship.",
    ],
  },
  {
    title: "Honors & Recognition",
    icon: "gavel",
    points: [
      "Evaluation is conducted objectively by expert faculty and external juries.",
      "The decisions of the judges and organizing committee will be final and binding.",
      "Honors: First Place Trophy, Second Place Trophy, General Championship Rolling Trophy, and Runner-Up Rolling Shield. Official state certificates for all registered participants.",
    ],
  },
];

export const PRIZES = ["First Place Trophy", "Second Place Trophy", "General Championship Rolling Trophy", "Runner-Up Rolling Shield"];

// Overall Fest Lead Coordinators
export const CONTACTS = [
  { role: "Coordinator, BCA", name: "Prof. S. I. Patil", phone: "8904601004" },
  { role: "Coordinator, BBA", name: "Prof. Shirish Halemani", phone: "9353966996" },
];
