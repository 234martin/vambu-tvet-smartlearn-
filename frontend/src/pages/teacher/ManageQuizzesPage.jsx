import { useEffect, useState } from "react";
import * as endpoints from "../../api/endpoints";

const emptyQuestion = () => ({
  question_text: "",
  question_type: "mcq",
  options: ["", "", "", ""],
  correct_answer: "",
  points: 1,
  order_index: 0,
});

export default function ManageQuizzesPage() {
  const [units, setUnits] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState("");
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [quizForm, setQuizForm] = useState({ title: "", description: "", time_limit_minutes: "" });
  const [questions, setQuestions] = useState([emptyQuestion()]);

  useEffect(() => {
    async function load() {
      const coursesRes = await endpoints.listCourses();
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
      endpoints.listQuizzesForUnit(selectedUnit).then((res) => setQuizzes(res.data));
    } else {
      setQuizzes([]);
    }
  }, [selectedUnit]);

  const updateQuestion = (idx, field, value) => {
    setQuestions((qs) => qs.map((q, i) => (i === idx ? { ...q, [field]: value } : q)));
  };

  const updateOption = (qIdx, optIdx, value) => {
    setQuestions((qs) =>
      qs.map((q, i) => {
        if (i !== qIdx) return q;
        const newOptions = [...q.options];
        newOptions[optIdx] = value;
        return { ...q, options: newOptions };
      })
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUnit) {
      setError("Choose a unit first.");
      return;
    }
    setError("");
    setSaving(true);
    try {
      const payload = {
        title: quizForm.title,
        description: quizForm.description,
        unit_id: Number(selectedUnit),
        time_limit_minutes: quizForm.time_limit_minutes ? Number(quizForm.time_limit_minutes) : null,
        questions: questions.map((q, idx) => ({
          question_text: q.question_text,
          question_type: q.question_type,
          options: q.question_type === "short_answer" ? null : q.options.filter((o) => o.trim() !== ""),
          correct_answer: q.correct_answer,
          points: Number(q.points) || 1,
          order_index: idx,
        })),
      };
      await endpoints.createQuiz(payload);
      setQuizForm({ title: "", description: "", time_limit_minutes: "" });
      setQuestions([emptyQuestion()]);
      setShowForm(false);
      const res = await endpoints.listQuizzesForUnit(selectedUnit);
      setQuizzes(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Couldn't create quiz.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="spec-label">Loading…</div>;

  return (
    <div>
      <div className="spec-label mb-1">ASSESSMENT BUILDER</div>
      <h1 className="font-display font-bold text-3xl text-shop-50 mb-8">Quizzes</h1>

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
          <div className="flex justify-between items-center mb-4">
            <div className="spec-label">EXISTING QUIZZES</div>
            <button
              onClick={() => setShowForm((s) => !s)}
              className="px-4 py-2 rounded bg-amber-signal text-shop-950 font-semibold text-sm hover:bg-amber-deep transition-colors"
            >
              + New quiz
            </button>
          </div>

          <div className="space-y-2 mb-6">
            {quizzes.map((q) => (
              <div key={q.id} className="panel rounded-lg p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium text-shop-100 text-sm">{q.title}</div>
                  {q.time_limit_minutes && <div className="spec-label">{q.time_limit_minutes} MIN LIMIT</div>}
                </div>
              </div>
            ))}
            {quizzes.length === 0 && <div className="text-shop-400 text-sm">No quizzes yet for this unit.</div>}
          </div>

          {showForm && (
            <form onSubmit={handleSubmit} className="panel rounded-lg p-5 space-y-5">
              <div className="spec-label">QUIZ DETAILS</div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="spec-label block mb-1.5">Title</label>
                  <input
                    required
                    value={quizForm.title}
                    onChange={(e) => setQuizForm((f) => ({ ...f, title: e.target.value }))}
                    className="w-full px-3 py-2 rounded bg-shop-800 border border-shop-700 text-shop-100 text-sm focus:outline-none focus:border-amber-signal"
                  />
                </div>
                <div>
                  <label className="spec-label block mb-1.5">Time limit (minutes, optional)</label>
                  <input
                    type="number"
                    min="1"
                    value={quizForm.time_limit_minutes}
                    onChange={(e) => setQuizForm((f) => ({ ...f, time_limit_minutes: e.target.value }))}
                    className="w-full px-3 py-2 rounded bg-shop-800 border border-shop-700 text-shop-100 text-sm focus:outline-none focus:border-amber-signal"
                  />
                </div>
              </div>

              <div className="spec-label pt-2">QUESTIONS</div>
              {questions.map((q, idx) => (
                <div key={idx} className="bg-shop-800 rounded p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="spec-label">QUESTION {idx + 1}</span>
                    {questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setQuestions((qs) => qs.filter((_, i) => i !== idx))}
                        className="text-xs text-red-flag font-semibold"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <input
                    required
                    placeholder="Question text"
                    value={q.question_text}
                    onChange={(e) => updateQuestion(idx, "question_text", e.target.value)}
                    className="w-full px-3 py-2 rounded bg-shop-900 border border-shop-700 text-shop-100 text-sm focus:outline-none focus:border-amber-signal"
                  />
                  <div className="grid sm:grid-cols-2 gap-3">
                    <select
                      value={q.question_type}
                      onChange={(e) => updateQuestion(idx, "question_type", e.target.value)}
                      className="w-full px-3 py-2 rounded bg-shop-900 border border-shop-700 text-shop-100 text-sm focus:outline-none focus:border-amber-signal"
                    >
                      <option value="mcq">Multiple choice</option>
                      <option value="true_false">True / False</option>
                      <option value="short_answer">Short answer (manual review)</option>
                    </select>
                    <input
                      type="number"
                      min="1"
                      value={q.points}
                      onChange={(e) => updateQuestion(idx, "points", e.target.value)}
                      placeholder="Points"
                      className="w-full px-3 py-2 rounded bg-shop-900 border border-shop-700 text-shop-100 text-sm focus:outline-none focus:border-amber-signal"
                    />
                  </div>

                  {q.question_type === "mcq" && (
                    <div className="space-y-2">
                      {q.options.map((opt, optIdx) => (
                        <input
                          key={optIdx}
                          placeholder={`Option ${optIdx + 1}`}
                          value={opt}
                          onChange={(e) => updateOption(idx, optIdx, e.target.value)}
                          className="w-full px-3 py-2 rounded bg-shop-900 border border-shop-700 text-shop-100 text-sm focus:outline-none focus:border-amber-signal"
                        />
                      ))}
                    </div>
                  )}

                  {q.question_type !== "short_answer" && (
                    <div>
                      <label className="spec-label block mb-1.5">Correct answer (must match an option exactly)</label>
                      <input
                        required
                        value={q.correct_answer}
                        onChange={(e) => updateQuestion(idx, "correct_answer", e.target.value)}
                        placeholder={q.question_type === "true_false" ? "True or False" : "Exact correct option text"}
                        className="w-full px-3 py-2 rounded bg-shop-900 border border-shop-700 text-shop-100 text-sm focus:outline-none focus:border-amber-signal"
                      />
                    </div>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={() => setQuestions((qs) => [...qs, emptyQuestion()])}
                className="text-sm font-semibold text-amber-signal hover:text-amber-deep transition-colors"
              >
                + Add another question
              </button>

              {error && <div className="text-red-flag text-sm">{error}</div>}

              <button
                disabled={saving}
                className="w-full py-2.5 rounded bg-amber-signal text-shop-950 font-semibold text-sm hover:bg-amber-deep transition-colors disabled:opacity-60"
              >
                {saving ? "Creating quiz…" : "Create quiz"}
              </button>
            </form>
          )}
        </>
      )}
    </div>
  );
}
