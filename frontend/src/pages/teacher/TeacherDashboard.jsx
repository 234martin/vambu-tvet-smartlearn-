import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import * as endpoints from "../../api/endpoints";

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [courseStats, setCourseStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    endpoints.coursesOverview().then((res) => {
      setCourseStats(res.data);
      setLoading(false);
    });
  }, []);

  const totalStudents = courseStats.reduce((sum, c) => sum + c.student_count, 0);
  const overallAvg =
    courseStats.filter((c) => c.average_quiz_score !== null).length > 0
      ? Math.round(
          courseStats.filter((c) => c.average_quiz_score !== null).reduce((s, c) => s + c.average_quiz_score, 0) /
            courseStats.filter((c) => c.average_quiz_score !== null).length
        )
      : null;

  return (
    <div>
      <div className="spec-label mb-1">{user.role === "admin" ? "ADMIN" : "TEACHER"} DASHBOARD</div>
      <h1 className="font-display font-bold text-3xl text-shop-50 mb-8">Welcome back, {user.full_name.split(" ")[0]}</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Courses" value={courseStats.length} />
        <StatCard label="Total students" value={totalStudents} />
        <StatCard label="Average quiz score" value={overallAvg !== null ? `${overallAvg}%` : "—"} />
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <Link to="/manage/courses" className="panel rounded-lg p-5 hover:border-amber-signal/50 transition-colors">
          <div className="font-semibold text-shop-50 mb-1">📚 Courses & Units</div>
          <div className="text-shop-400 text-sm">Create courses, add units, manage CBET level structure.</div>
        </Link>
        <Link to="/manage/content" className="panel rounded-lg p-5 hover:border-amber-signal/50 transition-colors">
          <div className="font-semibold text-shop-50 mb-1">📄 Content Library</div>
          <div className="text-shop-400 text-sm">Upload notes, past papers, marking schemes, and videos.</div>
        </Link>
        <Link to="/manage/quizzes" className="panel rounded-lg p-5 hover:border-amber-signal/50 transition-colors">
          <div className="font-semibold text-shop-50 mb-1">✏️ Quizzes</div>
          <div className="text-shop-400 text-sm">Build auto-graded quizzes for any unit.</div>
        </Link>
        <Link to="/manage/students" className="panel rounded-lg p-5 hover:border-amber-signal/50 transition-colors">
          <div className="font-semibold text-shop-50 mb-1">🎓 Students</div>
          <div className="text-shop-400 text-sm">View enrolled students and assign them to courses.</div>
        </Link>
      </div>

      <div className="panel rounded-lg p-6">
        <div className="spec-label mb-4">COURSE PERFORMANCE</div>
        {loading ? (
          <div className="spec-label">Loading…</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left spec-label border-b border-shop-700">
                <th className="py-2">Course</th>
                <th className="py-2">Level</th>
                <th className="py-2">Students</th>
                <th className="py-2">Avg. completion</th>
                <th className="py-2">Avg. quiz score</th>
              </tr>
            </thead>
            <tbody>
              {courseStats.map((c) => (
                <tr key={c.course_id} className="border-b border-shop-800">
                  <td className="py-3 text-shop-100 font-medium">{c.course_name}</td>
                  <td className="py-3 text-shop-300">{c.level}</td>
                  <td className="py-3 font-mono">{c.student_count}</td>
                  <td className="py-3 font-mono">{c.average_completion_pct}%</td>
                  <td className="py-3 font-mono">{c.average_quiz_score !== null ? `${c.average_quiz_score}%` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="panel rounded-lg p-5">
      <div className="spec-label mb-2">{label}</div>
      <div className="font-display font-bold text-3xl text-shop-50">{value}</div>
    </div>
  );
}
