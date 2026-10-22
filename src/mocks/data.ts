// ---------------------------------------------------------------------------
// Mock seed data for SM Report module
// ---------------------------------------------------------------------------

// ------ social_media_question ------
export const platforms = [
  { id: 1, question: "Facebook" },
  { id: 2, question: "Instagram" },
  { id: 3, question: "YouTube" },
  { id: 4, question: "Twitter / X" },
  { id: 5, question: "LinkedIn" },
  { id: 6, question: "ShareChat" },
];

// ------ tehsil_list ------
export const tehsils = [
  { id: 1, name: "Haveli" },
  { id: 2, name: "Mulshi" },
  { id: 3, name: "Mawal" },
  { id: 4, name: "Velhe" },
  { id: 5, name: "Bhor" },
  { id: 6, name: "Purandar" },
  { id: 7, name: "Daund" },
  { id: 8, name: "Indapur" },
];

// ------ Base sevadar pool (25 sevadars) ------
const QUESTIONS = [
  { id: 1 }, { id: 2 }, { id: 3 },
  { id: 4 }, { id: 5 }, { id: 6 },
];

const REGIONS = [
  // Team Leaders (role_id present)
  { sevadar_id: 101, sevadar_name: "Ramesh Kumar",      guardian_name: "Suresh Kumar",    relation: "s/o", role_id: 5, tehsil_id: 1 },
  { sevadar_id: 102, sevadar_name: "Priya Sharma",      guardian_name: "Mohan Sharma",    relation: "d/o", role_id: 5, tehsil_id: 2 },
  { sevadar_id: 103, sevadar_name: "Vikram Singh",      guardian_name: "Ranjit Singh",    relation: "s/o", role_id: 5, tehsil_id: 3 },
  // Regular sevadars
  { sevadar_id: 104, sevadar_name: "Sunita Devi",       guardian_name: "Anil Kumar",      relation: "w/o", tehsil_id: 1 },
  { sevadar_id: 105, sevadar_name: "Rajesh Verma",      guardian_name: "Dinesh Verma",    relation: "s/o", tehsil_id: 1 },
  { sevadar_id: 106, sevadar_name: "Anita Patel",       guardian_name: "Sunil Patel",     relation: "w/o", tehsil_id: 2 },
  { sevadar_id: 107, sevadar_name: "Manoj Gupta",       guardian_name: "Ramesh Gupta",    relation: "s/o", tehsil_id: 2 },
  { sevadar_id: 108, sevadar_name: "Kavita Joshi",      guardian_name: "Prakash Joshi",   relation: "d/o", tehsil_id: 3 },
  { sevadar_id: 109, sevadar_name: "Suresh Yadav",      guardian_name: "Bharat Yadav",    relation: "s/o", tehsil_id: 3 },
  { sevadar_id: 110, sevadar_name: "Meena Tiwari",      guardian_name: "Gopal Tiwari",    relation: "w/o", tehsil_id: 4 },
  { sevadar_id: 111, sevadar_name: "Ashok Mishra",      guardian_name: "Kailash Mishra",  relation: "s/o", tehsil_id: 4 },
  { sevadar_id: 112, sevadar_name: "Pooja Agarwal",     guardian_name: "Sanjay Agarwal",  relation: "d/o", tehsil_id: 5 },
  { sevadar_id: 113, sevadar_name: "Deepak Chauhan",    guardian_name: "Umesh Chauhan",   relation: "s/o", tehsil_id: 5 },
  { sevadar_id: 114, sevadar_name: "Rekha Pandey",      guardian_name: "Vijay Pandey",    relation: "w/o", tehsil_id: 6 },
  { sevadar_id: 115, sevadar_name: "Santosh Dubey",     guardian_name: "Ramdeen Dubey",   relation: "s/o", tehsil_id: 6 },
  { sevadar_id: 116, sevadar_name: "Lalita Rawat",      guardian_name: "Mohan Rawat",     relation: "d/o", tehsil_id: 7 },
  { sevadar_id: 117, sevadar_name: "Vinod Saxena",      guardian_name: "Kedar Saxena",    relation: "s/o", tehsil_id: 7 },
  { sevadar_id: 118, sevadar_name: "Shanti Rani",       guardian_name: "Balram Das",      relation: "w/o", tehsil_id: 8 },
  { sevadar_id: 119, sevadar_name: "Narendra Thakur",   guardian_name: "Sohan Thakur",    relation: "s/o", tehsil_id: 8 },
  { sevadar_id: 120, sevadar_name: "Usha Kumari",       guardian_name: "Devi Prasad",     relation: "d/o", tehsil_id: 1 },
  { sevadar_id: 121, sevadar_name: "Hemant Shukla",     guardian_name: "Jagdish Shukla",  relation: "s/o", tehsil_id: 2 },
  { sevadar_id: 122, sevadar_name: "Savita Bajpai",     guardian_name: "Rakesh Bajpai",   relation: "w/o", tehsil_id: 3 },
  { sevadar_id: 123, sevadar_name: "Pankaj Srivastava", guardian_name: "Arun Srivastava", relation: "s/o", tehsil_id: 4 },
  { sevadar_id: 124, sevadar_name: "Geeta Singh",       guardian_name: "Hari Singh",      relation: "d/o", tehsil_id: 5 },
  { sevadar_id: 125, sevadar_name: "Arun Tiwari",       guardian_name: "Shiv Tiwari",     relation: "s/o", tehsil_id: 6 },
];

// IDs that have submitted (15 out of 25 = 60%)
const SUBMITTED_IDS = [101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115];

// seva_count for all submitted sevadars across all 6 platforms
const SEVA_COUNTS = SUBMITTED_IDS.flatMap((sevadar_id) =>
  QUESTIONS.map((q) => ({
    sevadar_id,
    question_id: q.id,
    seva_count: Math.floor(Math.random() * 3) + 1,
  }))
);

// ------ social_media_seva_wise_report_all_regions (default: all regions) ------
export const sevadarWiseReport = {
  headers: { district: "Pune" },
  report: {
    questions: QUESTIONS,
    regions: REGIONS,
    seva_count: SEVA_COUNTS,
  },
};

// ------ Tehsil-filtered: return only sevadars in that tehsil ------
export function getSevadarReportForTehsil(tehsilId: number) {
  const tehsil = tehsils.find((t) => t.id === tehsilId);
  const filtered = REGIONS.filter((r) => r.tehsil_id === tehsilId);
  const filteredIds = filtered.map((r) => r.sevadar_id);
  const filteredCounts = SEVA_COUNTS.filter((sc) => filteredIds.includes(sc.sevadar_id));
  return {
    headers: { tehsil: tehsil?.name ?? "Tehsil" },
    report: {
      questions: QUESTIONS,
      regions: filtered,
      seva_count: filteredCounts,
    },
  };
}

// ------ Tehsil-level (scope=tehsil / sevadar_level=regions): group totals per tehsil ------
export const tehsilWiseReport = {
  headers: { district: "Pune" },
  report: {
    questions: QUESTIONS,
    regions: tehsils.map((t) => ({
      tehsil_id: t.id,
      tehsil_name: t.name,
    })),
    seva_count: tehsils.flatMap((t) => {
      const tehsilSevadars = REGIONS.filter((r) => r.tehsil_id === t.id);
      const submitted = tehsilSevadars.filter((r) => SUBMITTED_IDS.includes(r.sevadar_id));
      return QUESTIONS.map((q) => ({
        tehsil_id: t.id,
        question_id: q.id,
        seva_count: submitted.length > 0 ? submitted.length : 0,
      }));
    }),
  },
};

// ------ social_media_all_seva_report ------
export const allPlatformsReport = {
  reports: [
    { question: "Facebook",    icon: "facebook",   seva_count: 18 },
    { question: "Instagram",   icon: "instagram",  seva_count: 14 },
    { question: "YouTube",     icon: "youtube",    seva_count: 11 },
    { question: "Twitter / X", icon: "twitter",    seva_count: 9  },
    { question: "LinkedIn",    icon: "linkedin",   seva_count: 7  },
    { question: "ShareChat",   icon: "sharechat",  seva_count: 5  },
  ],
  total_sevadar: 25,
  total_submissions: 15,
};

// ------ social_media_report_seva_wise (platform-wise) ------
// Returns 20 sevadars for whichever platform is requested
export function getPlatformWiseReport(questionId: number) {
  const platform = platforms.find((p) => p.id === questionId) ?? platforms[0];
  // Different submission counts per platform to make it realistic
  const submittedCount = [0, 12, 9, 14, 7, 11, 5][questionId] ?? 10;
  const sevadars = REGIONS.slice(0, 20).map((r, idx) => ({
    sevadar_id:    r.sevadar_id,
    sevadar_name:  r.sevadar_name,
    guardian_name: r.guardian_name,
    relation:      r.relation,
    seva_count:    idx < submittedCount ? Math.floor(Math.random() * 3) + 1 : 0,
  }));
  return [
    {
      question: { id: platform.id, question: platform.question },
      report: sevadars,
    },
  ];
}

// ------ book_seva_reports (18 rows) ------
export const bookOrders = [
  { sevadar_name: "Ramesh Kumar",      guardian_name: "Suresh Kumar",    tehsil_name: "Haveli",   national_orders: 3,  international_orders: 1 },
  { sevadar_name: "Priya Sharma",      guardian_name: "Mohan Sharma",    tehsil_name: "Haveli",   national_orders: 2,  international_orders: 0 },
  { sevadar_name: "Vikram Singh",      guardian_name: "Ranjit Singh",    tehsil_name: "Mulshi",   national_orders: 5,  international_orders: 2 },
  { sevadar_name: "Sunita Devi",       guardian_name: "Anil Kumar",      tehsil_name: "Mulshi",   national_orders: 1,  international_orders: 0 },
  { sevadar_name: "Rajesh Verma",      guardian_name: "Dinesh Verma",    tehsil_name: "Mawal",    national_orders: 4,  international_orders: 1 },
  { sevadar_name: "Anita Patel",       guardian_name: "Sunil Patel",     tehsil_name: "Mawal",    national_orders: 2,  international_orders: 3 },
  { sevadar_name: "Manoj Gupta",       guardian_name: "Ramesh Gupta",    tehsil_name: "Velhe",    national_orders: 0,  international_orders: 2 },
  { sevadar_name: "Kavita Joshi",      guardian_name: "Prakash Joshi",   tehsil_name: "Velhe",    national_orders: 3,  international_orders: 0 },
  { sevadar_name: "Suresh Yadav",      guardian_name: "Bharat Yadav",    tehsil_name: "Bhor",     national_orders: 1,  international_orders: 1 },
  { sevadar_name: "Meena Tiwari",      guardian_name: "Gopal Tiwari",    tehsil_name: "Bhor",     national_orders: 2,  international_orders: 0 },
  { sevadar_name: "Ashok Mishra",      guardian_name: "Kailash Mishra",  tehsil_name: "Purandar", national_orders: 6,  international_orders: 2 },
  { sevadar_name: "Pooja Agarwal",     guardian_name: "Sanjay Agarwal",  tehsil_name: "Purandar", national_orders: 0,  international_orders: 1 },
  { sevadar_name: "Deepak Chauhan",    guardian_name: "Umesh Chauhan",   tehsil_name: "Daund",    national_orders: 3,  international_orders: 0 },
  { sevadar_name: "Rekha Pandey",      guardian_name: "Vijay Pandey",    tehsil_name: "Daund",    national_orders: 1,  international_orders: 2 },
  { sevadar_name: "Santosh Dubey",     guardian_name: "Ramdeen Dubey",   tehsil_name: "Indapur",  national_orders: 2,  international_orders: 0 },
  { sevadar_name: "Lalita Rawat",      guardian_name: "Mohan Rawat",     tehsil_name: "Indapur",  national_orders: 4,  international_orders: 1 },
  { sevadar_name: "Vinod Saxena",      guardian_name: "Kedar Saxena",    tehsil_name: "Haveli",   national_orders: 0,  international_orders: 3 },
  { sevadar_name: "Shanti Rani",       guardian_name: "Balram Das",      tehsil_name: "Mulshi",   national_orders: 2,  international_orders: 0 },
];
