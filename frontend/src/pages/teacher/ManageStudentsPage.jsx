import { useEffect, useState } from "react";
import * as endpoints from "../../api/endpoints";

export default function ManageStudentsPage() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(null);

  useEffect(() => {
    async function load() {
      const [studentsRes, coursesRes] = await Promise.all([
        endpoints.listUsers({ role: "student" }),
        endpoints.listCourses(),
      ]);
      setStudents(studentsRes.data);
      setCourses(coursesRes.data);
      setLoading(false);
    }
    load();
  }, []);

  const handleAssign = async (studentId, courseId) => {
    if (!courseId) return;
    setAssigning(studentId);
    try {
      const res = await endpoints.assignCourse(studentId, Number(courseId));
      setStudents((s) => s.map((st) => (st.id === studentId ? res.data : st)));
    } finally {
      setAssigning(null);
    }
  };

  const handleDeactivate = async (studentId, isActive) => {
    const res = isActive
      ? await endpoints.deactivateUser(studentId)
      : await endpoints.reactivateUser(studentId);
    setStudents((s) => s.map((st) => (st.id === studentId ? res.data : st)));
  };

  if (loading) return <div className="spec-label">Loading…</div>;

  return (
    <div>
      <div className="spec-label mb-1">ENROLLMENT</div>
      <h1 className="font-display font-bold text-3xl text-shop-50 mb-8">Students</h1>

      <div className="panel rounded-lg p-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left spec-label border-b border-shop-700">
              <th className="py-2">Name</th>
              <th className="py-2">Email</th>
              <th className="py-2">Course</th>
              <th className="py-2">Status</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id} className="border-b border-shop-800">
                <td className="py-3 text-shop-100 font-medium">{s.full_name}</td>
                <td className="py-3 text-shop-400">{s.email}</td>
                <td className="py-3">
                  <select
                    defaultValue={s.course_id || ""}
                    onChange={(e) => handleAssign(s.id, e.target.value)}
                    disabled={assigning === s.id}
                    className="px-2 py-1.5 rounded bg-shop-800 border border-shop-700 text-shop-100 text-xs focus:outline-none focus:border-amber-signal"
                  >
                    <option value="">— Unassigned —</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </td>
                <td className="py-3">
                  {s.is_active ? (
                    <span className="text-teal-gauge text-xs font-mono">ACTIVE</span>
                  ) : (
                    <span className="text-red-flag text-xs font-mono">DEACTIVATED</span>
                  )}
                </td>
                <td className="py-3">
                  <button
                    onClick={() => handleDeactivate(s.id, s.is_active)}
                    className="text-xs font-semibold text-shop-300 hover:text-amber-signal transition-colors"
                  >
                    {s.is_active ? "Deactivate" : "Reactivate"}
                  </button>
                </td>
              </tr>
            ))}
            {students.length === 0 && (
              <tr>
                <td colSpan={5} className="py-6 text-center text-shop-400">No students registered yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
