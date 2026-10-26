// Rules & regulations — taken from the official AI-AURA 2K26 PDF brochure.
// Events 13-18 are marked `proposed` exactly as in the PDF (subject to committee approval).

export const PDF_URL = "/downloads/AI-AURA-2K26-Rules-and-Regulations.pdf";
export const DRIVE_URL = "https://drive.google.com/file/d/1u77YK_Rx1S5MW5iE1vqABw-DwS0lua8h/view?usp=drivesdk";

export const WEBSITES = [
  { label: "BCA College Website", url: "https://www.klebcamahalingpur.com", text: "klebcamahalingpur.com" },
  { label: "BBA College Website", url: "https://www.klebbamahalingpur.com", text: "klebbamahalingpur.com" },
];

export const GROUPS = ["All", "Stage", "Art & Craft", "Writing", "Quiz & Logic", "AI & Digital"];

// id matches data/events.js (used for the icon + the "Register" button)
export const RULES = [
  { id: 1, group: "Quiz & Logic", type: "Academic & Knowledge", chips: ["2 per team", "60 MCQs", "60 min"],
    rules: ["Team participation: 2 students.", "The quiz has 60 multiple-choice questions, total duration 1 hour.", "Question distribution (from the previous brochure): Mathematics 10, Science 10, English 15, Current Affairs 25.", "The General & IT title is kept; the final IT component and question pattern will be confirmed by the organising committee."],
    judging: "Knowledge, accuracy and time management." },
  { id: 2, group: "Stage", type: "Performing Arts", chips: ["Solo: 1", "Group: 3–6", "3–4 min"],
    rules: ["Categories: Solo (one participant) and Group (three to six participants).", "Solo performance time: 3–4 minutes.", "Group performance time: 4 minutes.", "Be ready with your performance track and follow the announced event sequence."],
    judging: "Stage presence, coordination and expression." },
  { id: 3, group: "Art & Craft", type: "Visual Arts", chips: ["Individual", "90 min", "Pencil only"],
    rules: ["Theme: participant's own choice.", "Total time allowed: 1 hour 30 minutes.", "Bring your own pencils, erasers and sharpeners.", "Drawing sheets are provided by the organising college.", "Only pencil sketching is allowed: no colours, paints or pens.", "Shading and blending techniques are allowed."],
    judging: "Composition, detailing and technique." },
  { id: 4, group: "AI & Digital", type: "Digital Competition", chips: ["Individual", "Mobile gaming"],
    rules: ["Participation is individual.", "Games listed in the previous brochure: BGMI / Free Fire.", "Final game selection, match format and device requirements will be confirmed in the event briefing."],
    judging: "Gameplay, fair play and performance." },
  { id: 5, group: "Quiz & Logic", type: "Logic & Numeracy", chips: ["Individual", "6 rounds", "6-digit number"],
    rules: ["Each player gets a place-value chart: Lakhs, Ten-Thousands, Thousands, Hundreds, Tens and Ones.", "One digit is picked in each round.", "After a digit is chosen, place it in one empty column. Once placed, it cannot be moved.", "Continue until all six columns are filled (six rounds in total).", "Read your number aloud: the largest correctly formed number wins the round."],
    judging: "Place value, planning and number sense." },
  { id: 6, group: "Writing", type: "Writing & Expression", chips: ["Individual", "Kannada / English", "300–500 words"],
    rules: ["Write in only one language: Kannada or English.", "Time allowed: 45–60 minutes; essay length: 300–500 words.", "Indicative topics (previous brochure): Impact of Social Media on Society and Politics; Role of Elections in Indian Democracy; Benefits and Challenges of Science and Technology; Impact of the Internet and Smartphones; History of the Indian Economy.", "The final topic and writing duration will be announced by the committee."],
    judging: "Ideas, organisation, originality and language." },
  { id: 7, group: "Art & Craft", type: "Traditional Arts", chips: ["Up to 2", "90 min", "4 × 4 ft"],
    rules: ["Theme: participant's choice.", "Team size: maximum 2 members.", "Total time: 1 hour 30 minutes.", "Design area: 4 feet × 4 feet (16 square feet)."],
    judging: "Craftsmanship, colour and composition." },
  { id: 8, group: "AI & Digital", type: "Digital Content", chips: ["Solo or 2 members", "30–60 sec", "MP4"],
    rules: ["Theme: KLE Society's BCA & BBA College, Mahalingpur, and the AI-AURA 2K26 festival events.", "Participation: individual or a team of not more than 2 students.", "The reel must be 30–60 seconds long.", "Submit the final reel in MP4 format as per the organiser's instructions."],
    judging: "Storytelling, editing and relevance." },
  { id: 9, group: "AI & Digital", type: "Visual Storytelling", chips: ["Individual", "Campus / event photos"],
    rules: ["Participation is individual.", "Theme: AI-AURA 2K26 event photography or the KLE BCA & BBA College campus.", "Capture original photographs during the allowed event period.", "Permitted devices and the submission method will be announced at the venue."],
    judging: "Originality, framing and visual impact." },
  { id: 10, group: "Stage", type: "Performing Arts", chips: ["Individual", "Kannada / Hindi", "Up to 3 min"],
    rules: ["Participation: solo / individual.", "Songs may be performed in Kannada or Hindi.", "Maximum performance time: 3 minutes.", "Performances may be with or without karaoke / background music."],
    judging: "Pitch, clarity, expression and stage presence." },
  { id: 11, group: "Stage", type: "Public Speaking", chips: ["Individual", "Kannada / English", "3–5 min"],
    rules: ["Languages permitted: Kannada or English.", "Speaking time: 3–5 minutes.", "Topic choices: Role of Youth in Building the Nation; Digital India – Opportunities and Challenges; Power of Education in Changing Lives; Artificial Intelligence – A Boon or a Threat?; Small Steps Lead to Big Success.", "Select one of the announced topics and present within the allotted time."],
    judging: "Thought, organisation and delivery." },
  { id: 12, group: "Art & Craft", type: "Traditional Arts", chips: ["2 participants", "60 min", "Bring materials"],
    rules: ["Theme: traditional, cultural or festive design.", "Team: two members, one designer and one model.", "Time limit: 1 hour.", "Bring your own mehandi cones and other required materials."],
    judging: "Neatness, design originality and finish." },
  { id: 13, group: "AI & Digital", type: "Artificial Intelligence", proposed: true, chips: ["Individual", "30 min"],
    rules: ["Proposed format: individual multiple-choice quiz on AI basics, generative AI, applications, responsible use and prompt literacy.", "Proposed duration: 30 minutes; final question count and platform to be announced.", "No outside assistance or second device during the quiz unless expressly authorised.", "If scores are tied, the committee may conduct a short tie-breaker round."],
    judging: "Understanding, accuracy and responsible AI awareness." },
  { id: 14, group: "AI & Digital", type: "Generative Design", proposed: true, chips: ["Individual", "60 min"],
    rules: ["Proposed format: create one original digital poster based on the theme revealed at the venue.", "You may use approved AI image or design tools and should keep your prompts or working steps.", "Proposed time limit: 60 minutes.", "Present the final design in PNG, JPG or PDF format as directed by the organisers.", "Submissions are evaluated for idea, visual hierarchy, creativity and relevance."],
    judging: "Originality, design clarity and effective prompting." },
  { id: 15, group: "AI & Digital", type: "Generative Design", proposed: true, chips: ["Individual", "45 min"],
    rules: ["Proposed format: design an original digital greeting card using an approved AI tool.", "The occasion or theme will be announced before the activity.", "Proposed duration: 45 minutes.", "The card should include a clear greeting, a thoughtful message and an original visual design.", "Be ready to explain your creative concept and the prompts used."],
    judging: "Message, aesthetics and creative use of AI." },
  { id: 16, group: "Writing", type: "Creative Expression", proposed: true, chips: ["Individual", "Up to 3 min"],
    rules: ["Proposed format: individual recitation of an original poem in Kannada or English.", "Proposed presentation limit: 3 minutes.", "The work must be your own; copied material is not permitted.", "Poems should be suitable for an educational audience."],
    judging: "Original thought, language, rhythm and emotion." },
  { id: 17, group: "Stage", type: "Performing Arts", proposed: true, chips: ["Individual", "3–5 min"],
    rules: ["Proposed format: one participant performs a self-contained dramatic piece.", "Proposed duration: 3–5 minutes.", "Minimal hand-held props may be used if they are safe and easy to set up.", "Offensive content or hazardous props are not allowed.", "Judging may consider characterisation, expression, voice and stage presence."],
    judging: "Character, expression and performance." },
  { id: 18, group: "Stage", type: "Performing Arts", proposed: true, chips: ["Individual", "3–5 min"],
    rules: ["Proposed format: one participant performs on a musical instrument of their choice.", "Proposed performance time: 3–5 minutes.", "Bring and manage your own instrument and accessories.", "Any accompanying recorded track must not substitute for the live instrumental performance.", "Judging may consider technique, rhythm, interpretation and musicality."],
    judging: "Technique, timing and musical expression." },
];

export const GENERAL = [
  { title: "Participation & Eligibility", icon: "id", points: ["All events are open to pre-university (PUC) students.", "Registration begins at 9:00 AM. Spot registration may be allowed, subject to availability.", "Carry a valid college ID and Aadhaar card, as stated in the earlier event brochure.", "The earlier brochure permits participation in one event per student, unless the organising committee announces a revision."] },
  { title: "Reporting & Discipline", icon: "clock", points: ["Report at least 15 minutes before your event.", "Late arrival may result in disqualification; everyone must follow the announced timings.", "Misconduct, vulgarity or indiscipline may result in disqualification."] },
  { title: "Judging & Recognition", icon: "gavel", points: ["Judging considers creativity, theme relevance, presentation and overall performance as appropriate.", "The judges' decision will be final.", "Prizes: First Place, Second Place, General Championship and Runner-Up. Participation certificates are intended for valid participants."] },
];

export const PRIZES = ["First Place", "Second Place", "General Championship", "Runner-Up"];

// Coordinator contacts printed on the official AI-AURA 2K26 poster
export const CONTACTS = [
  { role: "Coordinator, BCA", name: "Prof. S. I. Patil", phone: "8904601004" },
  { role: "Coordinator, BBA", name: "Prof. Shirish Halemani", phone: "9353966996" },
];
