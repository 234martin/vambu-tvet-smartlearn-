import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import * as endpoints from "../../api/endpoints";
import LevelStamp from "../../components/LevelStamp";
import { getLevelInfo } from "../../utils/cbet";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [units, setUnits] = useState([]);
  const [progress, setProgress] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [progressRes, attemptsRes] = await Promise.all([
          endpoints.myProgress(),
          endpoints.myAttempts(),
        ]);
        setProgress(progressRes.data);
        setAttempts(attemptsRes.data);

        if (user.course_id) {
          const [courseRes, unitsRes] = await Promise.all([
            endpoints.getCourse(user.course_id),
            endpoints.listUnitsForCourse(user.course_id),
          ]);
          setCourse(courseRes.data);
          setUnits(unitsRes.data);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user.course_id]);

  const completedCount = progress.filter((p) => p.is_completed).length;
  const avgScore =
    attempts.filter((a) => a.score !== null).length > 0
      ? Math.round(
          attempts.filter((a) => a.score !== null).reduce((sum, a) => sum + a.score, 0) /
            attempts.filter((a) => a.score !== null).length
        )
      : null;

  const levelInfo = getLevelInfo(user.level);

  return (
    <div>
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="spec-label mb-1">STUDENT DASHBOARD</div>
          <h1 className="font-display font-bold text-3xl text-shop-50">Welcome back, {user.full_name.split(" ")[0]}</h1>
        </div>
        {user.level && <LevelStamp level={user.level} size="lg" />}
      </div>

      {/* Course banner */}
      <div className="panel rounded-lg p-6 mb-6 flex items-center justify-between">
        <div>
          <div className="spec-label mb-1">ENROLLED COURSE</div>
          <div className="font-display font-bold text-xl text-shop-50">
            {loading ? "Loading…" : course?.name || "No course assigned yet"}
          </div>
          {levelInfo && <div className="text-shop-300 text-sm mt-1">{levelInfo.short} — {levelInfo.label}</div>}
        </div>
        {course && (
          <Link
            to="/courses"
            className="px-4 py-2 rounded bg-amber-signal text-shop-950 font-semibold text-sm hover:bg-amber-deep transition-colors"
          >
            View units →
          </Link>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Units in course" value={units.length} />
        <StatCard label="Units completed" value={completedCount} />
        <StatCard label="Average quiz score" value={avgScore !== null ? `${avgScore}%` : "—"} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="panel rounded-lg p-6">
          <div className="spec-label mb-4">QUICK LINKS</div>
          <div className="space-y-2">
            <Link to="/courses" className="block px-4 py-3 rounded bg-shop-800 hover:bg-shop-700 transition-colors text-sm font-medium text-shop-100">
              📘 Browse my course materials
            </Link>
            <Link to="/common-units" className="block px-4 py-3 rounded bg-shop-800 hover:bg-shop-700 transition-colors text-sm font-medium text-shop-100">
              🛠️ Common units (Safety, Math, English)
            </Link>
            <Link to="/progress" className="block px-4 py-3 rounded bg-shop-800 hover:bg-shop-700 transition-colors text-sm font-medium text-shop-100">
              📊 View my full progress report
            </Link>
          </div>
        </div>

        <div className="panel rounded-lg p-6">
          <div className="spec-label mb-4">RECENT QUIZ ATTEMPTS</div>
          {attempts.length === 0 ? (
            <div className="text-shop-400 text-sm">You haven't attempted any quizzes yet.</div>
          ) : (
            <div className="space-y-2">
              {attempts.slice(-5).reverse().map((a) => (
                <div key={a.id} className="flex items-center justify-between px-4 py-2.5 rounded bg-shop-800 text-sm">
                  <span className="text-shop-300">Quiz #{a.quiz_id}</span>
                  <span className={`font-mono font-semibold ${a.score >= 50 ? "text-teal-gauge" : "text-red-flag"}`}>
                    {a.score !== null ? `${Math.round(a.score)}%` : "Pending review"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
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
