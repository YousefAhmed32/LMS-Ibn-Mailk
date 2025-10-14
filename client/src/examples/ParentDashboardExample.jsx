// Example API Usage and Testing for Enhanced Parent Dashboard

// 1. Frontend API Calls (Axios Examples)

// Fetch student statistics
const fetchStudentStats = async (studentId) => {
  try {
    const response = await axiosInstance.get(`/api/parent/student/${studentId}/stats`);
    
    if (response.data.success) {
      const data = response.data.data;
      
      // Data structure:
      // {
      //   student: {
      //     _id: "student_id",
      //     firstName: "أحمد",
      //     secondName: "محمد",
      //     studentId: "STU12345678",
      //     userEmail: "ahmed@example.com",
      //     phoneStudent: "01234567890",
      //     grade: "الصف الثالث",
      //     governorate: "القاهرة"
      //   },
      //   statistics: {
      //     totalCourses: 5,
      //     completedCourses: 3,
      //     averageGrade: 87,
      //     attendanceRate: 92,
      //     lastExamResult: {
      //       subject: "الرياضيات",
      //       score: 95,
      //       date: "2024-01-15",
      //       courseName: "رياضيات متقدمة"
      //     }
      //   },
      //   charts: {
      //     gradeProgression: [
      //       { month: "يناير", grade: 85, subject: "عام" },
      //       { month: "فبراير", grade: 88, subject: "عام" },
      //       { month: "مارس", grade: 92, subject: "عام" }
      //     ],
      //     subjectDistribution: [
      //       { name: "الرياضيات", value: 90, percentage: 90, color: "#F97316", count: 3 },
      //       { name: "العلوم", value: 85, percentage: 85, color: "#3B82F6", count: 2 },
      //       { name: "اللغة العربية", value: 88, percentage: 88, color: "#10B981", count: 2 }
      //     ],
      //     coursePerformance: [
      //       {
      //         courseId: "course_id",
      //         courseName: "رياضيات متقدمة",
      //         status: "approved",
      //         progress: 75,
      //         averageGrade: 90,
      //         examCount: 3,
      //         lastExamDate: "2024-01-15"
      //       }
      //     ]
      //   },
      //   recentActivity: [
      //     {
      //       type: "exam",
      //       title: "امتحان الرياضيات",
      //       score: 95,
      //       date: "2024-01-15",
      //       courseName: "رياضيات متقدمة"
      //     }
      //   ]
      // }
      
      return data;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    console.error('Error fetching student stats:', error);
    throw error;
  }
};

// Search for student
const searchStudent = async (studentId) => {
  try {
    const response = await axiosInstance.post('/api/parent/search-student', {
      studentId: studentId.trim()
    });
    
    if (response.data.success) {
      return response.data.student;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    console.error('Error searching student:', error);
    throw error;
  }
};

// Export report as PDF
const exportReport = async (studentId) => {
  try {
    const response = await axiosInstance.get(`/api/parent/student/${studentId}/export-report`, {
      responseType: 'blob'
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `تقرير_الطالب_${studentId}_${new Date().getFullYear()}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('Error exporting report:', error);
    throw error;
  }
};

// 2. Backend Testing with cURL

// Test the new statistics endpoint
const testStudentStatsAPI = `
# Test GET /api/parent/student/:studentId/stats
curl -X GET "http://localhost:5000/api/parent/student/STU12345678/stats" \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
  -H "Content-Type: application/json"

# Expected Response:
# {
#   "success": true,
#   "data": {
#     "student": { ... },
#     "statistics": { ... },
#     "charts": { ... },
#     "recentActivity": [ ... ]
#   }
# }
`;

// Test student search
const testStudentSearchAPI = `
# Test POST /api/parent/search-student
curl -X POST "http://localhost:5000/api/parent/search-student" \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "studentId": "STU12345678"
  }'

# Expected Response:
# {
#   "success": true,
#   "student": {
#     "_id": "student_id",
#     "firstName": "أحمد",
#     "secondName": "محمد",
#     "studentId": "STU12345678",
#     "userEmail": "ahmed@example.com",
#     "phoneStudent": "01234567890",
#     "grade": "الصف الثالث",
#     "governorate": "القاهرة"
#   }
# }
`;

// Test report export
const testReportExportAPI = `
# Test GET /api/parent/student/:studentId/export-report
curl -X GET "http://localhost:5000/api/parent/student/STU12345678/export-report" \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
  -H "Content-Type: application/json" \\
  --output "student_report.pdf"

# Expected Response: PDF file download
`;

// 3. localStorage Management Examples

// Save student ID to localStorage
const saveStudentToLocalStorage = (studentId, studentName) => {
  try {
    const savedStudents = JSON.parse(localStorage.getItem('parent_student_ids') || '[]');
    const newStudent = { 
      studentId, 
      studentName, 
      savedAt: new Date().toISOString() 
    };
    
    // Remove existing entry if present
    const filteredStudents = savedStudents.filter(s => s.studentId !== studentId);
    const updatedStudents = [...filteredStudents, newStudent];
    
    localStorage.setItem('parent_student_ids', JSON.stringify(updatedStudents));
    return updatedStudents;
  } catch (error) {
    console.error('Error saving student to localStorage:', error);
    return [];
  }
};

// Load saved students from localStorage
const loadSavedStudents = () => {
  try {
    const savedStudents = localStorage.getItem('parent_student_ids');
    return savedStudents ? JSON.parse(savedStudents) : [];
  } catch (error) {
    console.error('Error loading saved students:', error);
    return [];
  }
};

// Remove student from localStorage
const removeStudentFromLocalStorage = (studentId) => {
  try {
    const savedStudents = JSON.parse(localStorage.getItem('parent_student_ids') || '[]');
    const filteredStudents = savedStudents.filter(s => s.studentId !== studentId);
    localStorage.setItem('parent_student_ids', JSON.stringify(filteredStudents));
    return filteredStudents;
  } catch (error) {
    console.error('Error removing student from localStorage:', error);
    return [];
  }
};

// 4. Chart Data Processing Examples

// Process grade progression data for Recharts
const processGradeProgressionData = (rawData) => {
  return rawData.map(item => ({
    month: item.month,
    grade: item.grade,
    subject: item.subject || 'عام'
  }));
};

// Process subject distribution data for PieChart
const processSubjectDistributionData = (rawData) => {
  return rawData.map(item => ({
    name: item.name,
    value: item.value,
    percentage: item.percentage,
    color: item.color,
    count: item.count
  }));
};

// 5. Complete Usage Example

const ParentDashboardExample = () => {
  const [savedStudents, setSavedStudents] = useState([]);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [studentStats, setStudentStats] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load saved students on component mount
    const saved = loadSavedStudents();
    setSavedStudents(saved);
    
    if (saved.length > 0) {
      setCurrentStudent(saved[0].studentId);
    }
  }, []);

  useEffect(() => {
    // Fetch stats when current student changes
    if (currentStudent) {
      loadStudentStats(currentStudent);
    }
  }, [currentStudent]);

  const loadStudentStats = async (studentId) => {
    setLoading(true);
    try {
      const stats = await fetchStudentStats(studentId);
      setStudentStats(stats);
    } catch (error) {
      console.error('Failed to load student stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const addNewStudent = async (studentId) => {
    try {
      const student = await searchStudent(studentId);
      const studentName = `${student.firstName} ${student.secondName}`;
      
      const updatedStudents = saveStudentToLocalStorage(studentId, studentName);
      setSavedStudents(updatedStudents);
      setCurrentStudent(studentId);
      
      // Load stats for the new student
      await loadStudentStats(studentId);
    } catch (error) {
      console.error('Failed to add student:', error);
    }
  };

  const removeStudent = (studentId) => {
    const updatedStudents = removeStudentFromLocalStorage(studentId);
    setSavedStudents(updatedStudents);
    
    if (currentStudent === studentId) {
      if (updatedStudents.length > 0) {
        setCurrentStudent(updatedStudents[0].studentId);
      } else {
        setCurrentStudent(null);
        setStudentStats(null);
      }
    }
  };

  const copyStudentId = (studentId) => {
    navigator.clipboard.writeText(studentId).then(() => {
      // Show success toast
      console.log('Student ID copied to clipboard');
    });
  };

  const exportStudentReport = async (studentId) => {
    try {
      await exportReport(studentId);
      // Show success toast
      console.log('Report exported successfully');
    } catch (error) {
      console.error('Failed to export report:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Student Management */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-sm font-medium text-gray-700">الطلاب المحفوظين:</span>
            {savedStudents.map((student) => (
              <div
                key={student.studentId}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
                  currentStudent === student.studentId
                    ? 'bg-blue-100 border-blue-300'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <button
                  onClick={() => setCurrentStudent(student.studentId)}
                  className="text-sm font-medium"
                >
                  {student.studentName} ({student.studentId})
                </button>
                
                <button onClick={() => copyStudentId(student.studentId)}>
                  <Copy size={14} />
                </button>
                
                <button onClick={() => removeStudent(student.studentId)}>
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Statistics Dashboard */}
      {studentStats && (
        <StatisticsDashboard
          student={studentStats.student}
          stats={studentStats.statistics}
          gradeProgression={studentStats.charts.gradeProgression}
          subjectDistribution={studentStats.charts.subjectDistribution}
          coursePerformance={studentStats.charts.coursePerformance}
          onCopyId={copyStudentId}
          onExportReport={() => exportStudentReport(currentStudent)}
        />
      )}
    </div>
  );
};

export default ParentDashboardExample;
