import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AppShell from "./components/AppShell";

import LoginPage from "./pages/LoginPage";
import StudentDashboard from "./pages/student/StudentDashboard";
import CourseUnitsPage from "./pages/student/CourseUnitsPage";
import CommonUnitsPage from "./pages/student/CommonUnitsPage";
import UnitDetailPage from "./pages/student/UnitDetailPage";
import QuizTakePage from "./pages/student/QuizTakePage";
import StudentProgressPage from "./pages/student/StudentProgressPage";

import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import ManageCoursesPage from "./pages/teacher/ManageCoursesPage";
import ManageContentPage from "./pages/teacher/ManageContentPage";
import ManageQuizzesPage from "./pages/teacher/ManageQuizzesPage";
import AnalyticsPage from "./pages/teacher/AnalyticsPage";
import ManageStudentsPage from "./pages/teacher/ManageStudentsPage";

function HomeRouter() {
  const { user } = useAuth();
  if (user?.role === "student") return <StudentDashboard />;
  return <TeacherDashboard />;
}

function Shell({ children }) {
  return <AppShell>{children}</AppShell>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Shell><HomeRouter /></Shell>
              </ProtectedRoute>
            }
          />

          <Route
            path="/courses"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <Shell><CourseUnitsPage /></Shell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/common-units"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <Shell><CommonUnitsPage /></Shell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/units/:unitId"
            element={
              <ProtectedRoute>
                <Shell><UnitDetailPage /></Shell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/quiz/:quizId"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <Shell><QuizTakePage /></Shell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/progress"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <Shell><StudentProgressPage /></Shell>
              </ProtectedRoute>
            }
          />

          <Route
            path="/manage/courses"
            element={
              <ProtectedRoute allowedRoles={["teacher", "admin"]}>
                <Shell><ManageCoursesPage /></Shell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/manage/content"
            element={
              <ProtectedRoute allowedRoles={["teacher", "admin"]}>
                <Shell><ManageContentPage /></Shell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/manage/quizzes"
            element={
              <ProtectedRoute allowedRoles={["teacher", "admin"]}>
                <Shell><ManageQuizzesPage /></Shell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/manage/analytics"
            element={
              <ProtectedRoute allowedRoles={["teacher", "admin"]}>
                <Shell><AnalyticsPage /></Shell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/manage/students"
            element={
              <ProtectedRoute allowedRoles={["teacher", "admin"]}>
                <Shell><ManageStudentsPage /></Shell>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
