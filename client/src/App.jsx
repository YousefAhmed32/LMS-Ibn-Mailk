import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import Toaster from "./components/ui/toaster";
import { ThemeProvider } from "./contexts/ThemeContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { AuthProvider } from "./contexts/AuthContext";
import { useToast } from "./hooks/use-toast";

// Import header layout styles
import "./styles/header-layout.css";

// Pages (critical path — keep static)
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

// Luxury Pages — lazy loaded
const LuxuryCoursesPage = lazy(() => import("./pages/courses/LuxuryCoursesPage"));
const LuxuryCourseDetailsPage = lazy(() => import("./pages/courses/LuxuryCourseDetailsPage"));
const CourseContentPage = lazy(() => import("./pages/courses/CourseContentPage"));
const CoursePreviewPage = lazy(() => import("./pages/courses/CoursePreviewPage"));
const ExamPage = lazy(() => import("./pages/courses/ExamPage"));
import LuxuryMyAccountPage from "./pages/account/LuxuryMyAccountPage";

// Payment Pages
import PaymentPage from "./pages/payment/PaymentPage";

// Modern Admin Pages — lazy loaded
const ModernAdminDashboard = lazy(() => import("./components/admin/ModernAdminDashboard"));
const CourseManagement = lazy(() => import("./pages/admin/CourseManagement"));
import EditCourse from "./pages/admin/EditCourse";
const EnhancedUsersPage = lazy(() => import("./pages/admin/EnhancedUsersPage"));

// Exam Pages
import ExamPageStandalone from "./pages/exam/ExamPage";
const ExamTakingPage = lazy(() => import("./pages/exam/ExamTakingPage")); // deprecated
const ExamPageWrapper = lazy(() => import("./pages/exam/ExamPageWrapper"));
import StudentProfile from "./pages/admin/StudentProfile";
import PaymentManagement from "./pages/admin/PaymentManagement";
const AdminPaymentsPage = lazy(() => import("./pages/admin/AdminPaymentsPage"));
import AdminNotificationsPage from "./pages/admin/AdminNotificationsPage";

// Groups Pages — lazy loaded
const GroupsManagement = lazy(() => import("./pages/admin/GroupsManagement"));
const EnhancedGroupDetails = lazy(() => import("./pages/admin/EnhancedGroupDetails"));
const StudentGroupProfile = lazy(() => import("./pages/admin/StudentGroupProfile"));
import MyGroups from "./pages/student/MyGroups";
const EnhancedMyGroups = lazy(() => import("./pages/student/EnhancedMyGroups"));

// Parent Pages — lazy loaded
import ParentLoginPage from "./pages/parent/ParentLoginPage";
import LinkStudentPage from "./pages/parent/LinkStudentPage";
const ParentDashboard = lazy(() => import("./pages/parent/ParentDashboard"));
import ParentDemo from "./pages/parent/ParentDemo";

// Student Pages — lazy loaded
const StudentStatisticsPage = lazy(() => import("./pages/student/StudentStatisticsPage"));
const StudentStats = lazy(() => import("./pages/student/StudentStats"));
const LuxuryStudentStats = lazy(() => import("./pages/student/LuxuryStudentStats"));

// Components
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AdminRoute from "./components/auth/AdminRoute";
import AdminLayout from "./components/admin/AdminLayout";
import ErrorBoundary from "./components/ErrorBoundary";
import CourseVideoPage from './pages/courses/CourseVideoPage';
import NotificationsPage from './pages/NotificationsPage';
import SmartDashboardRouter from './components/smart/SmartDashboardRouter';
import LuxuryErrorPage from './components/error/LuxuryErrorPage';

// Fallback for lazy-loaded routes
function PageLoaderFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center" role="status" aria-label="جاري التحميل">
      <div className="text-muted-foreground animate-pulse">جاري التحميل...</div>
    </div>
  );
}

function App() {
  const { toasts, dismiss } = useToast();
  
  return (
    <ThemeProvider>
      <NotificationProvider>
        <AuthProvider>
          <div className="App overflow-x-hidden w-full max-w-full">
          <Suspense fallback={<PageLoaderFallback />}>
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
                  path="/courses/:id/preview"
                  element={
                    <ProtectedRoute>
                      <CoursePreviewPage />
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
                      <ExamPageWrapper />
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
                      <ExamPageWrapper />
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
          </Suspense>

              {/* Toast Notifications */}
              <Toaster toasts={toasts} dismiss={dismiss} />
            </div>
          </AuthProvider>
        </NotificationProvider>
      </ThemeProvider>
  );
}

export default App;
  