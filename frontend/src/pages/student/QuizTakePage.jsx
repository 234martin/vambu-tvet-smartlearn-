import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import * as endpoints from "../../api/endpoints";

export default function QuizTakePage() {
  const { quizId } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(null);

  useEffect(() => {
    endpoints
      .getQuiz(quizId)
      .then((res) => {
        setQuiz(res.data);
        if (res.data.time_limit_minutes) {
          setSecondsLeft(res.data.time_limit_minutes * 60);
        }
      })
      .catch((err) => setError(err.response?.data?.detail || "Couldn't load this quiz."))
      .finally(() => setLoading(false));
  }, [quizId]);

  const handleSubmit = useCallback(async () => {
    if (submitting || result) return;
    setSubmitting(true);
    try {
      const res = await endpoints.submitQuiz(quizId, answers);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Couldn't submit your quiz.");
    } finally {
      setSubmitting(false);
    }
  }, [quizId, answers, submitting, result]);

  useEffect(() => {
    if (secondsLeft === null || result) return;
    if (secondsLeft <= 0) {
      handleSubmit();
      return;
    }
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft, result, handleSubmit]);

  if (loading) return <div className="spec-label">Loading…</div>;
  if (error && !quiz) {
    return (
      <div className="panel rounded-lg p-8 text-center">
        <div className="text-red-flag">{error}</div>
        <Link to="/" className="text-amber-signal text-sm mt-3 inline-block">← Back to dashboard</Link>
      </div>
    );
  }

  if (result) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="panel rounded-lg p-8 text-center">
          <div className="spec-label mb-3">QUIZ SUBMITTED</div>
          {result.is_graded ? (
            <>
              <div className="font-display font-extrabold text-6xl text-amber-signal mb-2">
                {Math.round(result.score)}%
              </div>
              <div className="text-shop-300 text-sm">
                {result.score >= 50 ? "Well done — keep it up." : "Review the unit materials and try again."}
              </div>
            </>
          ) : (
            <div className="text-shop-300">
              Your answers have been submitted. Some questions need teacher review before a final score is shown.
            </div>
          )}
          <Link
            to={`/units/${quiz.unit_id}`}
            className="inline-block mt-6 px-5 py-2.5 rounded bg-amber-signal text-shop-950 font-semibold text-sm hover:bg-amber-deep transition-colors"
          >
            Back to unit
          </Link>
        </div>
      </div>
    );
  }

  const minutes = secondsLeft !== null ? Math.floor(secondsLeft / 60) : null;
  const seconds = secondsLeft !== null ? secondsLeft % 60 : null;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="spec-label mb-1">QUIZ</div>
          <h1 className="font-display font-bold text-2xl text-shop-50">{quiz.title}</h1>
        </div>
        {secondsLeft !== null && (
          <div
            className={`font-mono text-lg font-semibold px-3 py-1.5 rounded border ${
              secondsLeft < 60
                ? "text-red-flag border-red-flag/40 bg-red-flag/10"
                : "text-shop-100 border-shop-700 bg-shop-800"
            }`}
          >
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </div>
        )}
      </div>

      {quiz.description && <p className="text-shop-300 text-sm mb-6">{quiz.description}</p>}

      <div className="space-y-5">
        {quiz.questions.map((q, idx) => (
          <div key={q.id} className="panel rounded-lg p-5">
            <div className="spec-label mb-2">QUESTION {idx + 1} · {q.points} PT{q.points > 1 ? "S" : ""}</div>
            <div className="font-medium text-shop-50 mb-4">{q.question_text}</div>

            {q.question_type === "short_answer" ? (
              <textarea
                rows={3}
                value={answers[q.id] || ""}
                onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                className="w-full px-3 py-2 rounded bg-shop-800 border border-shop-700 text-shop-100 text-sm focus:outline-none focus:border-amber-signal"
                placeholder="Type your answer…"
              />
            ) : (
              <div className="space-y-2">
                {(q.options || []).map((opt) => (
                  <label
                    key={opt}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded border cursor-pointer transition-colors ${
                      answers[q.id] === opt
                        ? "border-amber-signal bg-amber-signal/10"
                        : "border-shop-700 bg-shop-800 hover:border-shop-600"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`q-${q.id}`}
                      value={opt}
                      checked={answers[q.id] === opt}
                      onChange={() => setAnswers((a) => ({ ...a, [q.id]: opt }))}
                      className="accent-amber-signal"
                    />
                    <span className="text-sm text-shop-100">{opt}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {error && (
        <div className="mt-4 px-3.5 py-2.5 rounded bg-red-flag/10 border border-red-flag/30 text-red-flag text-sm">
          {error}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full mt-6 py-3 rounded bg-amber-signal text-shop-950 font-semibold hover:bg-amber-deep transition-colors disabled:opacity-60"
      >
        {submitting ? "Submitting…" : "Submit quiz"}
      </button>
    </div>
  );
}
