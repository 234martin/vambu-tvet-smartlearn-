import { useEffect, useState } from "react";
import * as endpoints from "../../api/endpoints";
import { CBET_LEVELS } from "../../utils/cbet";

export default function ManageCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [unitsByCourse, setUnitsByCourse] = useState({});
  const [commonUnits, setCommonUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [showUnitForm, setShowUnitForm] = useState(null);

  const [courseForm, setCourseForm] = useState({ name: "", level: "level_2", description: "" });
  const [unitForm, setUnitForm] = useState({ title: "", description: "", order_index: 0 });
  const [saving, setSaving] = useState(false);

  async function loadAll() {
    setLoading(true);
    const coursesRes = await endpoints.listCourses();
    setCourses(coursesRes.data);

    const unitsMap = {};
    await Promise.all(
      coursesRes.data.map(async (c) => {
        const res = await endpoints.listUnitsForCourse(c.id);
        unitsMap[c.id] = res.data.filter((u) => !u.is_common);
      })
    );
    setUnitsByCourse(unitsMap);

    const commonRes = await endpoints.listCommonUnits();
    setCommonUnits(commonRes.data);
    setLoading(false);
  }

  useEffect(() => {
    loadAll();
  }, []);

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await endpoints.createCourse(courseForm);
      setCourseForm({ name: "", level: "level_2", description: "" });
      setShowCourseForm(false);
      await loadAll();
    } finally {
      setSaving(false);
    }
  };

  const handleCreateUnit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title: unitForm.title,
        description: unitForm.description,
        order_index: Number(unitForm.order_index) || 0,
        is_common: showUnitForm === "common",
        course_id: showUnitForm === "common" ? null : showUnitForm,
      };
      await endpoints.createUnit(payload);
      setUnitForm({ title: "", description: "", order_index: 0 });
      setShowUnitForm(null);
      await loadAll();
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="spec-label">Loading…</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="spec-label mb-1">CBET STRUCTURE</div>
          <h1 className="font-display font-bold text-3xl text-shop-50">Courses & Units</h1>
        </div>
        <button
          onClick={() => setShowCourseForm((s) => !s)}
          className="px-4 py-2 rounded bg-amber-signal text-shop-950 font-semibold text-sm hover:bg-amber-deep transition-colors"
        >
          + New course
        </button>
      </div>

      {showCourseForm && (
        <form onSubmit={handleCreateCourse} className="panel rounded-lg p-5 mb-6 space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="spec-label block mb-1.5">Course name</label>
              <input
                required
                value={courseForm.name}
                onChange={(e) => setCourseForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full px-3 py-2 rounded bg-shop-800 border border-shop-700 text-shop-100 text-sm focus:outline-none focus:border-amber-signal"
                placeholder="e.g. Welding & Fabrication"
              />
            </div>
            <div>
              <label className="spec-label block mb-1.5">CBET Level</label>
              <select
                value={courseForm.level}
                onChange={(e) => setCourseForm((f) => ({ ...f, level: e.target.value }))}
                className="w-full px-3 py-2 rounded bg-shop-800 border border-shop-700 text-shop-100 text-sm focus:outline-none focus:border-amber-signal"
              >
                {CBET_LEVELS.map((l) => (
                  <option key={l.value} value={l.value}>{l.short} — {l.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="spec-label block mb-1.5">Description</label>
            <textarea
              value={courseForm.description}
              onChange={(e) => setCourseForm((f) => ({ ...f, description: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2 rounded bg-shop-800 border border-shop-700 text-shop-100 text-sm focus:outline-none focus:border-amber-signal"
            />
          </div>
          <button
            disabled={saving}
            className="px-4 py-2 rounded bg-amber-signal text-shop-950 font-semibold text-sm hover:bg-amber-deep transition-colors disabled:opacity-60"
          >
            {saving ? "Saving…" : "Create course"}
          </button>
        </form>
      )}

      <div className="panel rounded-lg p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="spec-label">COMMON UNITS — VISIBLE TO ALL STUDENTS</div>
          <button
            onClick={() => setShowUnitForm(showUnitForm === "common" ? null : "common")}
            className="text-xs font-semibold text-amber-signal hover:text-amber-deep transition-colors"
          >
            + Add common unit
          </button>
        </div>
        {showUnitForm === "common" && (
          <UnitForm unitForm={unitForm} setUnitForm={setUnitForm} onSubmit={handleCreateUnit} saving={saving} />
        )}
        <div className="space-y-1.5">
          {commonUnits.map((u) => (
            <div key={u.id} className="px-3 py-2 rounded bg-shop-800 text-sm text-shop-100">{u.title}</div>
          ))}
          {commonUnits.length === 0 && <div className="text-shop-400 text-sm">No common units yet.</div>}
        </div>
      </div>

      <div className="space-y-4">
        {courses.map((course) => (
          <div key={course.id} className="panel rounded-lg p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="font-semibold text-shop-50">{course.name}</div>
                <div className="spec-label">{course.level.replace("level_", "LEVEL ").toUpperCase()}</div>
              </div>
              <button
                onClick={() => setShowUnitForm(showUnitForm === course.id ? null : course.id)}
                className="text-xs font-semibold text-amber-signal hover:text-amber-deep transition-colors"
              >
                + Add unit
              </button>
            </div>
            {showUnitForm === course.id && (
              <UnitForm unitForm={unitForm} setUnitForm={setUnitForm} onSubmit={handleCreateUnit} saving={saving} />
            )}
            <div className="space-y-1.5">
              {(unitsByCourse[course.id] || []).map((u) => (
                <div key={u.id} className="px-3 py-2 rounded bg-shop-800 text-sm text-shop-100">{u.title}</div>
              ))}
              {(unitsByCourse[course.id] || []).length === 0 && (
                <div className="text-shop-400 text-sm">No units added yet.</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function UnitForm({ unitForm, setUnitForm, onSubmit, saving }) {
  return (
    <form onSubmit={onSubmit} className="bg-shop-800 rounded p-4 mb-3 space-y-3">
      <div>
        <label className="spec-label block mb-1.5">Unit title</label>
        <input
          required
          value={unitForm.title}
          onChange={(e) => setUnitForm((f) => ({ ...f, title: e.target.value }))}
          className="w-full px-3 py-2 rounded bg-shop-900 border border-shop-700 text-shop-100 text-sm focus:outline-none focus:border-amber-signal"
        />
      </div>
      <div>
        <label className="spec-label block mb-1.5">Description</label>
        <input
          value={unitForm.description}
          onChange={(e) => setUnitForm((f) => ({ ...f, description: e.target.value }))}
          className="w-full px-3 py-2 rounded bg-shop-900 border border-shop-700 text-shop-100 text-sm focus:outline-none focus:border-amber-signal"
        />
      </div>
      <button
        disabled={saving}
        className="px-4 py-2 rounded bg-amber-signal text-shop-950 font-semibold text-sm hover:bg-amber-deep transition-colors disabled:opacity-60"
      >
        {saving ? "Saving…" : "Add unit"}
      </button>
    </form>
  );
}
