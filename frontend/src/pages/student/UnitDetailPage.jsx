import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import * as endpoints from "../../api/endpoints";
import { CONTENT_TYPE_LABELS } from "../../utils/cbet";

const CONTENT_ICONS = {
  note: "📄",
  past_paper: "📝",
  marking_scheme: "✅",
  video: "🎬",
};

export default function UnitDetailPage() {
  const { unitId } = useParams();
  const [content, setContent] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const [contentRes, quizzesRes, progressRes] = await Promise.all([
          endpoints.listContentForUnit(unitId),
          endpoints.listQuizzesForUnit(unitId),
          endpoints.myProgress(),
        ]);
        setContent(contentRes.data);
        setQuizzes(quizzesRes.data);
        setProgress(progressRes.data.find((p) => p.unit_id === Number(unitId)) || null);
      } catch (err) {
        setError(err.response?.data?.detail || "You don't have access to this unit.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [unitId]);

  const markComplete = async () => {
    setMarking(true);
    try {
      const res = await endpoints.upsertProgress({
        unit_id: Number(unitId),
        is_completed: true,
        completion_pct: 100,
      });
      setProgress(res.data);
    } finally {
      setMarking(false);
    }
  };

  if (loading) return <div className="spec-label">Loading…</div>;
  if (error) {
    return (
      <div className="panel rounded-lg p-8 text-center">
        <div className="text-red-flag">{error}</div>
        <Link to="/" className="text-amber-signal text-sm mt-3 inline-block">← Back to dashboard</Link>
      </div>
    );
  }

  return (
    <div>
      <Link to="/courses" className="spec-label hover:text-amber-signal transition-colors mb-3 inline-block">← BACK TO UNITS</Link>

      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display font-bold text-3xl text-shop-50">Unit Materials</h1>
        {progress?.is_completed ? (
          <span className="px-3 py-1.5 rounded text-xs font-mono bg-teal-gauge/15 text-teal-gauge border border-teal-gauge/30">
            ✓ COMPLETED
          </span>
        ) : (
          <button
            onClick={markComplete}
            disabled={marking}
            className="px-4 py-2 rounded bg-teal-gauge text-shop-950 font-semibold text-sm hover:bg-teal-deep transition-colors disabled:opacity-60"
          >
            {marking ? "Saving…" : "Mark unit complete"}
          </button>
        )}
      </div>

      {/* Content items */}
      <div className="panel rounded-lg p-6 mb-6">
        <div className="spec-label mb-4">NOTES & MATERIALS</div>
        {content.length === 0 ? (
          <div className="text-shop-400 text-sm">No materials have been uploaded for this unit yet.</div>
        ) : (
          <div className="space-y-2">
            {content.map((item) => (
              <div key={item.id} className="flex items-center justify-between px-4 py-3 rounded bg-shop-800">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{CONTENT_ICONS[item.content_type]}</span>
                  <div>
                    <div className="font-medium text-shop-100 text-sm">{item.title}</div>
                    <div className="spec-label">{CONTENT_TYPE_LABELS[item.content_type]}</div>
                  </div>
                </div>
                {item.file_path ? (
                  <a
                    href={endpoints.downloadContentUrl(item.id)}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded bg-shop-700 hover:bg-shop-600 text-xs font-semibold text-shop-100 transition-colors"
                  >
                    Download
                  </a>
                ) : item.external_url ? (
                  <a
                    href={item.external_url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded bg-shop-700 hover:bg-shop-600 text-xs font-semibold text-shop-100 transition-colors"
                  >
                    Open
                  </a>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quizzes */}
      <div className="panel rounded-lg p-6">
        <div className="spec-label mb-4">QUIZZES</div>
        {quizzes.length === 0 ? (
          <div className="text-shop-400 text-sm">No quizzes available for this unit yet.</div>
        ) : (
          <div className="space-y-2">
            {quizzes.map((quiz) => (
              <Link
                key={quiz.id}
                to={`/quiz/${quiz.id}`}
                className="flex items-center justify-between px-4 py-3 rounded bg-shop-800 hover:bg-shop-700 transition-colors block"
              >
                <div>
                  <div className="font-medium text-shop-100 text-sm">{quiz.title}</div>
                  {quiz.time_limit_minutes && (
                    <div className="spec-label">TIME LIMIT: {quiz.time_limit_minutes} MIN</div>
                  )}
                </div>
                <span className="text-amber-signal text-sm font-semibold">Start →</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
