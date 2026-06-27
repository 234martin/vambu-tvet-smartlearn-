import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import * as endpoints from "../../api/endpoints";

export default function CourseUnitsPage() {
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [units, setUnits] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!user.course_id) {
        setLoading(false);
        return;
      }
      const [courseRes, unitsRes, progressRes] = await Promise.all([
        endpoints.getCourse(user.course_id),
        endpoints.listUnitsForCourse(user.course_id),
        endpoints.myProgress(),
      ]);
      setCourse(courseRes.data);
      setUnits(unitsRes.data.filter((u) => !u.is_common)); // course-specific only here
      const map = {};
      progressRes.data.forEach((p) => (map[p.unit_id] = p));
      setProgressMap(map);
      setLoading(false);
    }
    load();
  }, [user.course_id]);

  if (loading) return <div className="spec-label">Loading…</div>;

  if (!user.course_id) {
    return (
      <div className="panel rounded-lg p-8 text-center">
        <div className="text-shop-300">You haven't been enrolled in a course yet. Ask your teacher to assign you one.</div>
      </div>
    );
  }

  return (
    <div>
      <div className="spec-label mb-1">MY COURSE</div>
      <h1 className="font-display font-bold text-3xl text-shop-50 mb-1">{course?.name}</h1>
      <p className="text-shop-300 text-sm mb-8">{course?.description}</p>

      <div className="space-y-3">
        {units.map((unit) => {
          const p = progressMap[unit.id];
          return (
            <Link
              key={unit.id}
              to={`/units/${unit.id}`}
              className="panel rounded-lg p-5 flex items-center justify-between hover:border-amber-signal/50 transition-colors block"
            >
              <div>
                <div className="font-semibold text-shop-50">{unit.title}</div>
                {unit.description && <div className="text-shop-400 text-sm mt-0.5">{unit.description}</div>}
              </div>
              <div className="flex items-center gap-3">
                {p?.is_completed ? (
                  <span className="px-2.5 py-1 rounded text-xs font-mono bg-teal-gauge/15 text-teal-gauge border border-teal-gauge/30">
                    COMPLETE
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded text-xs font-mono bg-shop-800 text-shop-400 border border-shop-700">
                    IN PROGRESS
                  </span>
                )}
                <span className="text-shop-500">→</span>
              </div>
            </Link>
          );
        })}
        {units.length === 0 && <div className="text-shop-400 text-sm">No units have been added to this course yet.</div>}
      </div>
    </div>
  );
}
