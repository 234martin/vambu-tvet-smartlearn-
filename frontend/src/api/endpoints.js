import api from "./client";

// ---- Auth ----
export const login = (email, password) => api.post("/api/auth/login", { email, password });
export const register = (payload) => api.post("/api/auth/register", payload);
export const getMe = () => api.get("/api/auth/me");

// ---- Courses & Units ----
export const listCourses = (level) => api.get("/api/courses", { params: level ? { level } : {} });
export const createCourse = (payload) => api.post("/api/courses", payload);
export const getCourse = (courseId) => api.get(`/api/courses/${courseId}`);
export const listUnitsForCourse = (courseId) => api.get(`/api/courses/${courseId}/units`);
export const listCommonUnits = () => api.get("/api/courses/units/common");
export const createUnit = (payload) => api.post("/api/courses/units", payload);

// ---- Content ----
export const listContentForUnit = (unitId) => api.get(`/api/content/unit/${unitId}`);
export const uploadContent = (formData, params) =>
  api.post("/api/content/upload", formData, {
    params,
    headers: { "Content-Type": "multipart/form-data" },
  });
export const downloadContentUrl = (contentId) => `${api.defaults.baseURL}/api/content/${contentId}/download`;
export const deleteContent = (contentId) => api.delete(`/api/content/${contentId}`);

// ---- Quizzes ----
export const listQuizzesForUnit = (unitId) => api.get(`/api/quizzes/unit/${unitId}`);
export const getQuiz = (quizId) => api.get(`/api/quizzes/${quizId}`);
export const createQuiz = (payload) => api.post("/api/quizzes", payload);
export const submitQuiz = (quizId, answers) => api.post(`/api/quizzes/${quizId}/submit`, { answers });
export const myAttempts = () => api.get("/api/quizzes/attempts/me");
export const attemptsForQuiz = (quizId) => api.get(`/api/quizzes/${quizId}/attempts`);

// ---- Progress ----
export const upsertProgress = (payload) => api.post("/api/progress", payload);
export const myProgress = () => api.get("/api/progress/me");
export const progressForStudent = (studentId) => api.get(`/api/progress/student/${studentId}`);
export const studentsOverview = (courseId) =>
  api.get("/api/progress/overview/students", { params: courseId ? { course_id: courseId } : {} });
export const coursesOverview = () => api.get("/api/progress/overview/courses");

// ---- Users ----
export const listUsers = (params) => api.get("/api/users", { params });
export const deactivateUser = (userId) => api.patch(`/api/users/${userId}/deactivate`);
export const reactivateUser = (userId) => api.patch(`/api/users/${userId}/reactivate`);
export const assignCourse = (userId, courseId) =>
  api.patch(`/api/users/${userId}/assign-course`, null, { params: { course_id: courseId } });
