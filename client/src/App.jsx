import React from "react";
import { Routes, Route } from "react-router-dom";
import Toaster from "./components/ui/toaster";
import { ThemeProvider } from "./contexts/ThemeContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { AuthProvider } from "./contexts/AuthContext";
import { useToast } from "./hooks/use-toast";

// Import header layout styles
import "./styles/header-layout.css";

// Pages
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ModernDashboardUser from "./pages/ModernDashboardUser";
import ProfilePage from "./pages/profile";
import CoursesPage from "./pages/courses";
import SettingsPage from "./pages/settings";
import MySubscriptions from "./pages/student/MySubscriptions";
import SubscriptionFlow from "./pages/subscription/SubscriptionFlow";
import NavigationTest from "./components/test/NavigationTest";
import ThemeSystemTest from "./components/test/ThemeSystemTest";
import FooterDemo from "./components/demo/FooterDemo";

// New Pages
import AboutPage from "./pages/AboutPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsConditionsPage from "./pages/TermsConditionsPage";

// Luxury Pages
import LuxuryCoursesPage from "./pages/courses/LuxuryCoursesPage";
import LuxuryCourseDetailsPage from "./pages/courses/LuxuryCourseDetailsPage";
import CourseContentPage from "./pages/courses/CourseContentPage";
import ExamPage from "./pages/courses/ExamPage";
import LuxuryMyAccountPage from "./pages/account/LuxuryMyAccountPage";

// Payment Pages
import PaymentPage from "./pages/payment/PaymentPage";

// Modern Admin Pages
import ModernAdminDashboard from "./components/admin/ModernAdminDashboard";
import CourseManagement from "./pages/admin/CourseManagement";
import EditCourse from "./pages/admin/EditCourse";
import EnhancedUsersPage from "./pages/admin/EnhancedUsersPage";

// Exam Pages
import ExamPageStandalone from "./pages/exam/ExamPage";
import ExamTakingPage from "./pages/exam/ExamTakingPage";
import StudentProfile from "./pages/admin/StudentProfile";
import PaymentManagement from "./pages/admin/PaymentManagement";
import AdminPaymentsPage from "./pages/admin/AdminPaymentsPage";
import Notifications from "./pages/Notifications";
import AdminNotificationsPage from "./pages/admin/AdminNotificationsPage";

// Groups Pages
import GroupsManagement from "./pages/admin/GroupsManagement";
import EnhancedGroupDetails from "./pages/admin/EnhancedGroupDetails";
import StudentGroupProfile from "./pages/admin/StudentGroupProfile";
import MyGroups from "./pages/student/MyGroups";
import EnhancedMyGroups from "./pages/student/EnhancedMyGroups";

// Parent Pages
import ParentLoginPage from "./pages/parent/ParentLoginPage";
import LinkStudentPage from "./pages/parent/LinkStudentPage";
import ParentDashboard from "./pages/parent/ParentDashboard";
import ParentDemo from "./pages/parent/ParentDemo";

// Student Pages
import StudentStatisticsPage from "./pages/student/StudentStatisticsPage";
import StudentStats from "./pages/student/StudentStats";
import LuxuryStudentStats from "./pages/student/LuxuryStudentStats";

// Components
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AdminRoute from "./components/auth/AdminRoute";
import AdminLayout from "./components/admin/AdminLayout";
import ErrorBoundary from "./components/ErrorBoundary";
import CourseVideoPage from './pages/courses/CourseVideoPage';
import NotificationsPage from './pages/NotificationsPage';
import SmartDashboardRouter from './components/smart/SmartDashboardRouter';
import LuxuryErrorPage from './components/error/LuxuryErrorPage';

function App() {
  const { toasts, dismiss } = useToast();
  
  return (
    <ThemeProvider>
      <NotificationProvider>
        <AuthProvider>
          <div className="App overflow-x-hidden w-full max-w-full">
          <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                
                {/* Parent Routes */}
                <Route path="/parent/login" element={<ParentLoginPage />} />
                <Route path="/test-navigation" element={<NavigationTest />} />
                <Route path="/test-theme" element={<ThemeSystemTest />} />
                <Route path="/footer-demo" element={<FooterDemo />} />
                
                {/* New Pages */}
                <Route path="/about" element={<AboutPage />} />
                <Route path="/privacy" element={<PrivacyPolicyPage />} />
                <Route path="/terms" element={<TermsConditionsPage />} />

                {/* Smart Dashboard Router - Routes based on user role */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <SmartDashboardRouter />
                    </ProtectedRoute>
                  }
                />
                
                {/* Individual Dashboard Routes */}

                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/courses"
                  element={
                    <ProtectedRoute>
                      <LuxuryCoursesPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/notifications"
                  element={
                    <ProtectedRoute>
                      <NotificationsPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/courses/:id"
                  element={
                    <ProtectedRoute>
                      <LuxuryCourseDetailsPage />
                    </ProtectedRoute>
                  }
                />


                <Route
                  path="/exam/:courseId/:examId"
                  element={
                    <ProtectedRoute>
                      <ExamTakingPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/courses/:id/content"
                  element={
                    <ProtectedRoute>
                      <CourseContentPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/courses/:courseId/exams/:examId"
                  element={
                    <ProtectedRoute>
                      <ExamPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/payment/:courseId"
                  element={
                    <ProtectedRoute>
                      <PaymentPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-subscriptions"
                  element={
                    <ProtectedRoute>
                      <MySubscriptions />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/notifications"
                  element={
                    <ProtectedRoute>
                      <Notifications />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/account"
                  element={
                    <ProtectedRoute>
                      <LuxuryMyAccountPage />
                    </ProtectedRoute>
                  }
                />

        <Route
          path="/my-groups"
          element={
            <ProtectedRoute>
              <EnhancedMyGroups />
            </ProtectedRoute>
          }
        />

                <Route
                  path="/wallet"
                  element={
                    <ProtectedRoute>
                      <ModernDashboardUser />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <SettingsPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/subscription/:courseId"
                  element={
                    <ProtectedRoute>
                      <SubscriptionFlow />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Routes */}
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminLayout>
                        <ModernAdminDashboard />
                      </AdminLayout>
                    </AdminRoute>
                  }
                />
                
                <Route
                  path="/admin/users"
                  element={
                    <AdminRoute>
                      <AdminLayout>
                        <EnhancedUsersPage />
                    
                      </AdminLayout>
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/users/:id"
                  element={
                    <AdminRoute>
                      <AdminLayout>
                        <StudentProfile />
                      </AdminLayout>
                    </AdminRoute>
                  }
                />
                
                <Route
                  path="/admin/courses"
                  element={
                    <AdminRoute>
                      <AdminLayout>
                        <CourseManagement />
                      </AdminLayout>
                    </AdminRoute>
                  }
                />
                
                <Route
                  path="/admin/courses/:id"
                  element={
                    <AdminRoute>
                      <AdminLayout>
                        <CourseManagement />
                      </AdminLayout>
                    </AdminRoute>
                  }
                />
                
                <Route
                  path="/admin/courses/:id/edit"
                  element={
                    <AdminRoute>
                      <AdminLayout>
                        <EditCourse />
                      </AdminLayout>
                    </AdminRoute>
                  }
                />
                
                <Route
                  path="/admin/courses/new"
                  element={
                    <AdminRoute>
                      <AdminLayout>
                        <CourseManagement />
                      </AdminLayout>
                    </AdminRoute>
                  }
                />
                
                <Route
                  path="/admin/payments"
                  element={
                    <AdminRoute>
                      <AdminLayout>
                        <AdminPaymentsPage />
                      </AdminLayout>
                    </AdminRoute>
                  }
                />
                
                
                <Route
                  path="/admin/notifications"
                  element={
                    <AdminRoute>
                      <AdminLayout>
                        <AdminNotificationsPage />
                      </AdminLayout>
                    </AdminRoute>
                  }
                />
                
                <Route
                  path="/admin/groups"
                  element={
                    <AdminRoute>
                      <AdminLayout>
                        <GroupsManagement />
                      </AdminLayout>
                    </AdminRoute>
                  }
                />
                
        <Route
          path="/admin/groups/:id"
          element={
            <AdminRoute>
              <AdminLayout>
                <EnhancedGroupDetails />
              </AdminLayout>
            </AdminRoute>
          }
        />
                
                <Route
                  path="/admin/groups/:groupId/students/:studentId"
                  element={
                    <AdminRoute>
                      <AdminLayout>
                        <StudentGroupProfile />
                      </AdminLayout>
                    </AdminRoute>
                  }
                />
                
                <Route
                  path="/admin/settings"
                  element={
                    <AdminRoute>
                      <AdminLayout>
                        <ModernAdminDashboard />
                      </AdminLayout>
                    </AdminRoute>
                  }
                />
                
                <Route
                  path="/admin/profile"
                  element={
                    <AdminRoute>
                      <AdminLayout>
                        <ModernAdminDashboard />
                      </AdminLayout>
                    </AdminRoute>
                  }
                />

                <Route path="/courses/:courseId/video/:videoId" element={<CourseVideoPage />} />

                {/* Exam Routes */}
                <Route
                  path="/exam/:examId"
                  element={
                    <ProtectedRoute>
                      <ExamPageStandalone />
                    </ProtectedRoute>
                  }
                />

                {/* Parent Protected Routes */}
                <Route
                  path="/parent/link-student"
                  element={
                    <ProtectedRoute allowedRoles={['parent']}>
                      <LinkStudentPage />
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="/parent/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['parent']}>
                      <ErrorBoundary>
                        <ParentDashboard />
                      </ErrorBoundary>
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="/parent/demo"
                  element={
                    <ErrorBoundary>
                      <ParentDemo />
                    </ErrorBoundary>
                  }
                />
                
                <Route
                  path="/parent/stats/:studentId"
                  element={
                    <ProtectedRoute allowedRoles={['parent']}>
                      <ErrorBoundary>
                        {/* <StudentStatsPage /> */}
                        <StudentStatisticsPage />

                      </ErrorBoundary>
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="/student/stats"
                  element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <ErrorBoundary>
                        <LuxuryStudentStats />
                      </ErrorBoundary>
                    </ProtectedRoute>
                  }
                />
                
                {/* <Route
                  path="/student/statistics/:studentId"
                  element={
                    <ProtectedRoute allowedRoles={['parent', 'student']}>
                      <ErrorBoundary>
                        <StudentStatisticsPage />
                      </ErrorBoundary>
                    </ProtectedRoute>
                  }
                /> */}

                {/* 404 Error Page - Catch all route */}
                <Route
                  path="*"
                  element={
                    <LuxuryErrorPage
                      errorCode={404}
                      title="الصفحة غير موجودة"
                      message="عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها. يرجى التحقق من الرابط أو العودة للصفحة الرئيسية."
                    />
                  }
                />
              </Routes>

              {/* Toast Notifications */}
              <Toaster toasts={toasts} dismiss={dismiss} />
            </div>
          </AuthProvider>
        </NotificationProvider>
      </ThemeProvider>
  );
}

export default App;
  