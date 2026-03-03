export const collegeData = {
  // 🏫 THE COLLEGE MANUAL
  collegeInfo: {
    name: "Naipunnya Institute of Management and Information Technology (NIMIT)",
    location: "Pongam, Koratty, Thrissur, Kerala",
    universityAffiliation: "University of Calicut",
    accreditation: "UGC Autonomous, AICTE Approved, NAAC A++ Grade, ISO 9001:2015 Certified",
    vision: "To become recognized for the quality of vocational training and creative endeavors that mold and motivate youngsters to fulfill their dreams.",
    departments: [
      "Computer Science", 
      "Hotel Management", 
      "Commerce", 
      "English", 
      "Social Work", 
      "Fashion Designing", 
      "MBA (Naipunnya Business School)"
    ],
    csProgrammes: [
      "Bachelor of Computer Applications (BCA)", 
      "B.Sc Computer Science", 
      "B.Sc IT (Information Technology)", 
      "M.Sc. Computer Science"
    ],
    placements: {
      topRecruiters: ["TCS (Tata Consultancy Services)", "Infosys", "Deloitte", "KPMG", "Amazon", "Axis Bank", "HCL", "Holiday Inn"],
      highlights: "Active placement cell providing 90 hours of soft-skills training. 100% placement record for eligible Hotel Management students. Strong placements in IT and Management sectors with average entry packages around 3.15 LPA.",
      careerSupport: ["Pre-Placement Talks", "Mock Interviews", "Industry Visits", "Summer Internships"]
    },
    campusLife: {
      majorEvents: ["LAQSHYA (Techno-Cultural-Management Fest)", "Vismaya (Arts Day)", "Viva (Sports Day)", "Nidarsana (Opening Day)", "Expressions (Fresher's Day)"],
      activeClubs: ["Bhoomitrasena Club", "Entrepreneurship Development Club", "NSS", "Quiz Club", "Arts & Music Clubs"],
      studentSupport: ["Counselling Center (Pratidhi)", "Placement Cell", "Grievance Redressal Cell", "Women's Cell (Ananya)"]
    }
  },

  // 💻 THE APP MANUAL (CampusCanvas)
  appManual: {
    projectName: "CampusCanvas",
    purpose: "A centralized institutional repository to archive, manage, and showcase final year student projects for NIMIT.",
    team: "Built by Mebin Martin, Glodin M Y, Alen Shajan, and Greeshma Hari.",
    userGuide: {
      howToAddProject: "To add a project, click the big '+' button in the top navigation bar. Fill in the title, description, category, and paste a Base64 image string (under 1MB). You can also add a Live Demo URL. Then click Submit.",
      howToFindProjects: "Use the Search Bar at the top to type keywords, or click the Category Tabs (Web App, AI/ML, IoT) to filter projects. Click on any project card to see full details.",
      adminControls: "If you are logged in as an Admin (Faculty), you will see an 'Admin Dashboard' option. There, you can review pending projects and click 'Approve' or 'Reject'."
    },
    uiGuide: {
      plusButton: "The '+' button in the navbar opens the 'Add Project' form.",
      askAiButton: "The '✨ Ask AI' button opens me! Your personal campus assistant.",
      profileIcon: "The circle with your initial in the top right opens your Profile menu, where you can log out.",
      launchAppButton: "The 'Launch Live App 🚀' button on a project page takes you to the actual working deployment of that student's project."
    },
    technicalArchitecture: {
      frontend: "React.js with Tailwind CSS for responsive UI design.",
      backend: "Firebase Firestore (NoSQL database).",
      imageStorage: "Base64 strings stored in Firestore. Max 1MB.",
      hosting: "Vercel."
    }
  }
};