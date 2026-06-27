import { useEffect, useState } from "react";
import * as endpoints from "../../api/endpoints";

export default function AnalyticsPage() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [courseFilter, setCourseFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    endpoints.listCourses().then((res) => setCourses(res.data));
  }, []);

  useEffect(() => {
    setLoading(true);
    endpoints.studentsOverview(courseFilter || undefined).then((res) => {
      setStudents(res.data);
      setLoading(false);
    });
  }, [courseFilter]);

  return (
    <div>
      <div className="spec-label mb-1">PERFORMANCE ANALYTICS</div>
      <h1 className="font-display font-bold text-3xl text-shop-50 mb-8">Student Analytics</h1>

      <div className="mb-6">
        <select
          value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}
          className="px-3 py-2 rounded bg-shop-800 border border-shop-700 text-shop-100 text-sm focus:outline-none focus:border-amber-signal"
        >
          <option value="">All courses</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="panel rounded-lg p-6">
        {loading ? (
          <div className="spec-label">Loading…</div>
        ) : students.length === 0 ? (
          <div className="text-shop-400 text-sm">No students found for this filter.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left spec-label border-b border-shop-700">
                <th className="py-2">Student</th>
                <th className="py-2">Course</th>
                <th className="py-2">Level</th>
                <th className="py-2">Units completed</th>
                <th className="py-2">Quizzes taken</th>
                <th className="py-2">Avg. quiz score</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.student_id} className="border-b border-shop-800">
                  <td className="py-3">
                    <div className="text-shop-100 font-medium">{s.full_name}</div>
                    <div className="text-shop-500 text-xs">{s.email}</div>
                  </td>
                  <td className="py-3 text-shop-300">{s.course_name || "—"}</td>
                  <td className="py-3 text-shop-300">{s.level || "—"}</td>
                  <td className="py-3 font-mono">{s.units_completed} / {s.units_total}</td>
                  <td className="py-3 font-mono">{s.quizzes_taken}</td>
                  <td className="py-3 font-mono">
                    {s.average_quiz_score !== null ? (
                      <span className={s.average_quiz_score >= 50 ? "text-teal-gauge" : "text-red-flag"}>
                        {s.average_quiz_score}%
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
