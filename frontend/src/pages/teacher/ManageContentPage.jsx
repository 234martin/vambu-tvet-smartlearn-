import { useEffect, useState } from "react";
import * as endpoints from "../../api/endpoints";
import { CONTENT_TYPE_LABELS } from "../../utils/cbet";

export default function ManageContentPage() {
  const [courses, setCourses] = useState([]);
  const [units, setUnits] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState("");
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({ title: "", description: "", content_type: "note" });
  const [file, setFile] = useState(null);

  useEffect(() => {
    async function load() {
      const coursesRes = await endpoints.listCourses();
      setCourses(coursesRes.data);

      const allUnits = [];
      for (const c of coursesRes.data) {
        const res = await endpoints.listUnitsForCourse(c.id);
        res.data.forEach((u) => {
          if (!allUnits.find((existing) => existing.id === u.id)) {
            allUnits.push({ ...u, courseName: u.is_common ? "Common" : c.name });
          }
        });
      }
      setUnits(allUnits);
      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    if (selectedUnit) {
      endpoints.listContentForUnit(selectedUnit).then((res) => setContent(res.data));
    } else {
      setContent([]);
    }
  }, [selectedUnit]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedUnit) {
      setError("Choose a unit first.");
      return;
    }
    setError("");
    setUploading(true);
    try {
      const formData = new FormData();
      if (file) formData.append("file", file);
      await endpoints.uploadContent(formData, {
        title: form.title,
        content_type: form.content_type,
        unit_id: selectedUnit,
        description: form.description,
      });
      setForm({ title: "", description: "", content_type: "note" });
      setFile(null);
      const res = await endpoints.listContentForUnit(selectedUnit);
      setContent(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    await endpoints.deleteContent(id);
    setContent((c) => c.filter((item) => item.id !== id));
  };

  if (loading) return <div className="spec-label">Loading…</div>;

  return (
    <div>
      <div className="spec-label mb-1">CONTENT MANAGEMENT</div>
      <h1 className="font-display font-bold text-3xl text-shop-50 mb-8">Content Library</h1>

      <div className="panel rounded-lg p-5 mb-6">
        <label className="spec-label block mb-1.5">Select unit</label>
        <select
          value={selectedUnit}
          onChange={(e) => setSelectedUnit(e.target.value)}
          className="w-full px-3 py-2 rounded bg-shop-800 border border-shop-700 text-shop-100 text-sm focus:outline-none focus:border-amber-signal"
        >
          <option value="">— Choose a unit —</option>
          {units.map((u) => (
            <option key={u.id} value={u.id}>{u.courseName} · {u.title}</option>
          ))}
        </select>
      </div>

      {selectedUnit && (
        <>
          <form onSubmit={handleUpload} className="panel rounded-lg p-5 mb-6 space-y-3">
            <div className="spec-label">UPLOAD NEW MATERIAL</div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="spec-label block mb-1.5">Title</label>
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full px-3 py-2 rounded bg-shop-800 border border-shop-700 text-shop-100 text-sm focus:outline-none focus:border-amber-signal"
                />
              </div>
              <div>
                <label className="spec-label block mb-1.5">Type</label>
                <select
                  value={form.content_type}
                  onChange={(e) => setForm((f) => ({ ...f, content_type: e.target.value }))}
                  className="w-full px-3 py-2 rounded bg-shop-800 border border-shop-700 text-shop-100 text-sm focus:outline-none focus:border-amber-signal"
                >
                  {Object.entries(CONTENT_TYPE_LABELS).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="spec-label block mb-1.5">File</label>
              <input
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
                className="w-full text-sm text-shop-300 file:mr-3 file:px-3 file:py-1.5 file:rounded file:border-0 file:bg-shop-700 file:text-shop-100 file:text-xs file:font-semibold"
              />
            </div>
            {error && <div className="text-red-flag text-sm">{error}</div>}
            <button
              disabled={uploading}
              className="px-4 py-2 rounded bg-amber-signal text-shop-950 font-semibold text-sm hover:bg-amber-deep transition-colors disabled:opacity-60"
            >
              {uploading ? "Uploading…" : "Upload"}
            </button>
          </form>

          <div className="panel rounded-lg p-5">
            <div className="spec-label mb-3">EXISTING MATERIALS</div>
            <div className="space-y-2">
              {content.map((item) => (
                <div key={item.id} className="flex items-center justify-between px-4 py-3 rounded bg-shop-800">
                  <div>
                    <div className="text-sm font-medium text-shop-100">{item.title}</div>
                    <div className="spec-label">{CONTENT_TYPE_LABELS[item.content_type]}</div>
                  </div>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-xs font-semibold text-red-flag hover:text-red-400 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              ))}
              {content.length === 0 && <div className="text-shop-400 text-sm">No materials uploaded yet.</div>}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
