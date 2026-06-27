import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ROLE_LABELS } from "../utils/cbet";

const studentNav = [
  { to: "/", label: "Dashboard", code: "01" },
  { to: "/courses", label: "My Course", code: "02" },
  { to: "/common-units", label: "Common Units", code: "03" },
  { to: "/progress", label: "My Progress", code: "04" },
];

const teacherNav = [
  { to: "/", label: "Dashboard", code: "01" },
  { to: "/manage/courses", label: "Courses & Units", code: "02" },
  { to: "/manage/content", label: "Content Library", code: "03" },
  { to: "/manage/quizzes", label: "Quizzes", code: "04" },
  { to: "/manage/analytics", label: "Analytics", code: "05" },
  { to: "/manage/students", label: "Students", code: "06" },
];

export default function AppShell({ children }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const nav = user?.role === "student" ? studentNav : teacherNav;

  const handleSignOut = () => {
    signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex bg-shop-950">
      <aside className="w-64 shrink-0 border-r border-shop-700 bg-shop-900 flex flex-col">
        <div className="px-5 py-6 border-b border-shop-700">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded bg-amber-signal flex items-center justify-center font-display font-extrabold text-shop-950 text-sm">
              VS
            </div>
            <div>
              <div className="font-display font-bold text-shop-50 text-sm leading-tight tracking-wide">
                VAMBU TVET
              </div>
              <div className="spec-label leading-tight">SmartLearn</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-shop-800 text-amber-signal border-l-2 border-amber-signal"
                    : "text-shop-300 hover:bg-shop-800 hover:text-shop-100 border-l-2 border-transparent"
                }`
              }
            >
              <span className="font-mono text-[10px] text-shop-500">{item.code}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-shop-700">
          <div className="px-3 py-2 mb-2">
            <div className="text-sm font-semibold text-shop-100 truncate">{user?.full_name}</div>
            <div className="spec-label">{ROLE_LABELS[user?.role] || user?.role}</div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full text-left px-3 py-2 rounded text-sm font-medium text-shop-300 hover:bg-shop-800 hover:text-red-flag transition-colors"
          >
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-8">{children}</div>
      </main>
    </div>
  );
}
