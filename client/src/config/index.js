// Egyptian Governorates
export const governorates = [
  "Cairo", "Giza", "Qalyubia", "Alexandria", "Port Said", "Ismailia",
  "Suez", "Damietta", "Dakahlia", "Sharqia", "Gharbia", "Monufia",
  "Kafr El-Sheikh", "Beheira", "Marsa Matrouh", "Fayoum", "Beni Suef",
  "Minya", "Assiut", "Sohag", "Qena", "Luxor", "Aswan", "Red Sea",
  "New Valley", "North Sinai", "South Sinai"
];

// School Grades - Egyptian System
export const grades = [
  { value: "grade7", label: "أولي إعدادي" },
  { value: "grade8", label: "ثاني إعدادي" },
  { value: "grade9", label: "ثالث إعدادي" },
  { value: "grade10", label: "أولي ثانوي" },
  { value: "grade11", label: "ثاني ثانوي" },
  { value: "grade12", label: "ثالث ثانوي" }
];

// Sign Up Form Controls
export const signUpFormControls = [
  {
    name: "firstName",
    label: "الاسم الأول",
    placeholder: "أدخل اسمك الأول",
    type: "text",
    componentType: "input",
    required: true,
  },
  {
    name: "secondName",
    label: "الاسم الثاني",
    placeholder: "أدخل اسمك الثاني",
    type: "text",
    componentType: "input",
    required: true,
  },
  {
    name: "thirdName",
    label: "الاسم الثالث",
    placeholder: "أدخل اسمك الثالث",
    type: "text",
    componentType: "input",
    required: true,
  },
  {
    name: "fourthName",
    label: "الاسم الرابع",
    placeholder: "أدخل اسمك الرابع",
    type: "text",
    componentType: "input",
    required: true,
  },
  {
    name: "phoneNumber",
    label: "رقم الهاتف",
    placeholder: "أدخل رقم هاتفك (مثال: +201234567890)",
    type: "tel",
    componentType: "input",
    required: true,
  },
  {
    name: "password",
    label: "كلمة المرور",
    placeholder: "أدخل كلمة المرور",
    type: "password",
    componentType: "input",
    required: true,
  },
  {
    name: "phoneStudent",
    label: "رقم هاتف الطالب",
    placeholder: "أدخل رقم هاتفك",
    type: "tel",
    componentType: "input",
    required: true,
  },
  {
    name: "guardianPhone",
    label: "رقم هاتف ولي الأمر",
    placeholder: "أدخل رقم هاتف ولي الأمر",
    type: "tel",
    componentType: "input",
    required: true,
  },
  {
    name: "phoneFather",
    label: "رقم هاتف الأب",
    placeholder: "أدخل رقم هاتف الأب (اختياري)",
    type: "tel",
    componentType: "input",
    required: false,
  },
  {
    name: "phoneMother",
    label: "رقم هاتف الأم",
    placeholder: "أدخل رقم هاتف الأم (اختياري)",
    type: "tel",
    componentType: "input",
    required: false,
  },
  {
    name: "governorate",
    label: "المحافظة",
    placeholder: "اختر المحافظة",
    type: "text",
    componentType: "select",
    options: governorates.map(gov => ({ id: gov, label: gov })),
    required: true,
  },
  {
    name: "grade",
    label: "الصف الدراسي",
    placeholder: "اختر الصف الدراسي",
    type: "text",
    componentType: "select",
    options: grades,
    required: true,
  },
  {
    name: "role",
    label: "الدور",
    placeholder: "اختر الدور",
    type: "text",
    componentType: "select",
    options: [
      { value: "student", label: "طالب" },
      { value: "parent", label: "ولي أمر" },
      { value: "admin", label: "مدير" }
    ],
    required: false,
  },
];

// Sign In Form Controls
export const signInFormControls = [
  {
    name: "phoneNumber",
    label: "رقم الهاتف",
    placeholder: "أدخل رقم هاتفك (مثال: +201234567890)",
    type: "tel",
    componentType: "input",
    required: true,
  },
  {
    name: "password",
    label: "كلمة المرور",
    placeholder: "أدخل كلمة المرور",
    type: "password",
    componentType: "input",
    required: true,
  },
];

// Initial Form Data
export const initialSignInFormData = {
  phoneNumber: "",
  password: "",
};

export const initialSignUpFormData = {
  firstName: "",
  secondName: "",
  thirdName: "",
  fourthName: "",
  phoneNumber: "",
  password: "",
  phoneStudent: "",
  guardianPhone: "",
  phoneFather: "",
  phoneMother: "",
  governorate: "",
  grade: "",
  role: "student",
};

// Profile Update Form Controls
export const profileUpdateFormControls = [
  {
    name: "firstName",
    label: "الاسم الأول",
    placeholder: "أدخل اسمك الأول",
    type: "text",
    componentType: "input",
    required: false,
  },
  {
    name: "secondName",
    label: "الاسم الثاني",
    placeholder: "أدخل اسمك الثاني",
    type: "text",
    componentType: "input",
    required: false,
  },
  {
    name: "thirdName",
    label: "الاسم الثالث",
    placeholder: "أدخل اسمك الثالث",
    type: "text",
    componentType: "input",
    required: false,
  },
  {
    name: "fourthName",
    label: "الاسم الرابع",
    placeholder: "أدخل اسمك الرابع",
    type: "text",
    componentType: "input",
    required: false,
  },
  {
    name: "phoneStudent",
    label: "رقم هاتف الطالب",
    placeholder: "أدخل رقم هاتفك",
    type: "tel",
    componentType: "input",
    required: false,
  },
  {
    name: "phoneFather",
    label: "رقم هاتف الأب",
    placeholder: "أدخل رقم هاتف الأب",
    type: "tel",
    componentType: "input",
    required: false,
  },
  {
    name: "phoneMother",
    label: "رقم هاتف الأم",
    placeholder: "أدخل رقم هاتف الأم",
    type: "tel",
    componentType: "input",
    required: false,
  },
  {
    name: "governorate",
    label: "المحافظة",
    placeholder: "اختر المحافظة",
    type: "text",
    componentType: "select",
    options: governorates.map(gov => ({ id: gov, label: gov })),
    required: false,
  },
  {
    name: "grade",
    label: "الصف الدراسي",
    placeholder: "اختر الصف الدراسي",
    type: "text",
    componentType: "select",
    options: grades,
    required: false,
  },
];

// Language Options
export const languageOptions = [
  { id: "english", label: "English" },
  { id: "spanish", label: "Spanish" },
  { id: "french", label: "French" },
  { id: "german", label: "German" },
  { id: "chinese", label: "Chinese" },
  { id: "japanese", label: "Japanese" },
  { id: "korean", label: "Korean" },
  { id: "portuguese", label: "Portuguese" },
  { id: "arabic", label: "Arabic" },
  { id: "russian", label: "Russian" },
];

// Course Level Options
export const courseLevelOptions = [
  { id: "beginner", label: "Beginner" },
  { id: "intermediate", label: "Intermediate" },
  { id: "advanced", label: "Advanced" },
];

// Course Categories
export const courseCategories = [
  { id: "web-development", label: "Web Development" },
  { id: "backend-development", label: "Backend Development" },
  { id: "data-science", label: "Data Science" },
  { id: "machine-learning", label: "Machine Learning" },
  { id: "artificial-intelligence", label: "Artificial Intelligence" },
  { id: "cloud-computing", label: "Cloud Computing" },
  { id: "cyber-security", label: "Cyber Security" },
  { id: "mobile-development", label: "Mobile Development" },
  { id: "game-development", label: "Game Development" },
  { id: "software-engineering", label: "Software Engineering" },
];

// Course Landing Page Form Controls
export const courseLandingPageFormControls = [
  {
    name: "title",
    label: "Title",
    componentType: "input",
    type: "text",
    placeholder: "Enter course title",
  },
  {
    name: "category",
    label: "Category",
    componentType: "select",
    type: "text",
    placeholder: "",
    options: courseCategories,
  },
  {
    name: "level",
    label: "Level",
    componentType: "select",
    type: "text",
    placeholder: "",
    options: courseLevelOptions,
  },
  {
    name: "primaryLanguage",
    label: "Primary Language",
    componentType: "select",
    type: "text",
    placeholder: "",
    options: languageOptions,
  },
  {
    name: "subtitle",
    label: "Subtitle",
    componentType: "input",
    type: "text",
    placeholder: "Enter course subtitle",
  },
  {
    name: "description",
    label: "Description",
    componentType: "textarea",
    type: "text",
    placeholder: "Enter course description",
  },
  {
    name: "pricing",
    label: "Pricing",
    componentType: "input",
    type: "number",
    placeholder: "Enter course pricing",
  },
  {
    name: "objectives",
    label: "Objectives",
    componentType: "textarea",
    type: "text",
    placeholder: "Enter course objectives",
  },
  {
    name: "welcomeMessage",
    label: "Welcome Message",
    componentType: "textarea",
    placeholder: "Welcome message for students",
  },
];

// Course Landing Initial Form Data
export const courseLandingInitialFormData = {
  title: "",
  category: "",
  level: "",
  primaryLanguage: "",
  subtitle: "",
  description: "",
  pricing: "",
  objectives: "",
  welcomeMessage: "",
  image: "",
};

// Course Curriculum Initial Form Data
export const courseCurriculumInitialFormData = [
  {
    title: "",
    videoUrl: "",
    freePreview: false,
    public_id: "",
  },
];

// Sort Options
export const sortOptions = [
  { id: "price-lowtohigh", label: "Price: Low to High" },
  { id: "price-hightolow", label: "Price: High to Low" },
  { id: "title-atoz", label: "Title: A to Z" },
  { id: "title-ztoa", label: "Title: Z to A" },
];

// Filter Options
export const filterOptions = {
  category: courseCategories,
  level: courseLevelOptions,
  primaryLanguage: languageOptions,
};
