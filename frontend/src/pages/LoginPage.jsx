import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await signIn(email, password);
      navigate(location.state?.from?.pathname || "/", { replace: true });
    } catch (err) {
      setError(err.response?.data?.detail || "Couldn't sign in. Check your email and password.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-shop-950">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden border-r border-shop-700">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, var(--color-amber-signal) 0, var(--color-amber-signal) 2px, transparent 2px, transparent 14px)",
          }}
        />
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded bg-amber-signal flex items-center justify-center font-display font-extrabold text-shop-950">
              VS
            </div>
            <div className="font-display font-bold text-shop-50 tracking-wide">VAMBU TVET SMARTLEARN</div>
          </div>

          <div>
            <div className="spec-label mb-3">LEARN ANYWHERE — EVEN OFFLINE</div>
            <h1 className="font-display font-extrabold text-5xl text-shop-50 leading-[1.05] mb-6">
              Curriculum.
              <br />
              Practice.
              <br />
              <span className="text-amber-signal">Certification.</span>
            </h1>
            <p className="text-shop-300 max-w-md leading-relaxed">
              CBET-aligned notes, past papers, and quizzes for TVET trades —
              built for Kenyan polytechnics, Level 2 through Level 6.
            </p>
          </div>

          <div className="flex gap-6 spec-label">
            <span>L2 FOUNDATION</span>
            <span>L4 CRAFT</span>
            <span>L6 DIPLOMA</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded bg-amber-signal flex items-center justify-center font-display font-extrabold text-shop-950">
              VS
            </div>
            <div className="font-display font-bold text-shop-50">VAMBU TVET SMARTLEARN</div>
          </div>

          <h2 className="font-display font-bold text-2xl text-shop-50 mb-1">Sign in</h2>
          <p className="text-shop-300 text-sm mb-8">Access your courses, quizzes, and progress.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="spec-label block mb-1.5">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded bg-shop-900 border border-shop-700 text-shop-50 placeholder-shop-500 focus:outline-none focus:border-amber-signal transition-colors"
                placeholder="you@vsl.ac.ke"
              />
            </div>
            <div>
              <label className="spec-label block mb-1.5">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded bg-shop-900 border border-shop-700 text-shop-50 placeholder-shop-500 focus:outline-none focus:border-amber-signal transition-colors"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="px-3.5 py-2.5 rounded bg-red-flag/10 border border-red-flag/30 text-red-flag text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded bg-amber-signal text-shop-950 font-semibold hover:bg-amber-deep transition-colors disabled:opacity-60"
            >
              {submitting ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-shop-800">
            <div className="spec-label mb-2">Demo accounts</div>
            <div className="text-xs text-shop-400 space-y-1 font-mono">
              <div>admin@vsl.ac.ke / Admin@123</div>
              <div>teacher@vsl.ac.ke / Teacher@123</div>
              <div>student1@vsl.ac.ke / Student@123</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
