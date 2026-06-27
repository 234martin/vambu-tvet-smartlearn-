import { useEffect, useState } from "react";
import * as endpoints from "../../api/endpoints";

export default function StudentProgressPage() {
  const [progress, setProgress] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([endpoints.myProgress(), endpoints.myAttempts()]).then(([p, a]) => {
      setProgress(p.data);
      setAttempts(a.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="spec-label">Loading…</div>;

  return (
    <div>
      <div className="spec-label mb-1">PERFORMANCE RECORD</div>
      <h1 className="font-display font-bold text-3xl text-shop-50 mb-8">My Progress</h1>

      <div className="panel rounded-lg p-6 mb-6">
        <div className="spec-label mb-4">UNIT COMPLETION</div>
        {progress.length === 0 ? (
          <div className="text-shop-400 text-sm">No progress recorded yet — open a unit and mark it complete.</div>
        ) : (
          <div className="space-y-2">
            {progress.map((p) => (
              <div key={p.id} className="flex items-center justify-between px-4 py-3 rounded bg-shop-800">
                <span className="text-sm text-shop-100">Unit #{p.unit_id}</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 h-1.5 rounded-full bg-shop-700 overflow-hidden">
                    <div
                      className="h-full bg-teal-gauge"
                      style={{ width: `${p.completion_pct}%` }}
                    />
                  </div>
                  <span className="font-mono text-xs text-shop-300 w-10 text-right">{p.completion_pct}%</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="panel rounded-lg p-6">
        <div className="spec-label mb-4">QUIZ HISTORY</div>
        {attempts.length === 0 ? (
          <div className="text-shop-400 text-sm">No quiz attempts yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left spec-label border-b border-shop-700">
                <th className="py-2">Quiz</th>
                <th className="py-2">Score</th>
                <th className="py-2">Status</th>
                <th className="py-2">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {attempts.map((a) => (
                <tr key={a.id} className="border-b border-shop-800">
                  <td className="py-3 text-shop-100">Quiz #{a.quiz_id}</td>
                  <td className="py-3 font-mono">
                    {a.score !== null ? `${Math.round(a.score)}%` : "—"}
                  </td>
                  <td className="py-3">
                    {a.is_graded ? (
                      <span className="text-teal-gauge">Graded</span>
                    ) : (
                      <span className="text-amber-signal">Awaiting review</span>
                    )}
                  </td>
                  <td className="py-3 text-shop-400">
                    {a.submitted_at ? new Date(a.submitted_at).toLocaleDateString() : "—"}
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
