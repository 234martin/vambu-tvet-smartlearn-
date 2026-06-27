import { getLevelInfo, levelNumber } from "../utils/cbet";

/**
 * The signature visual motif of the platform: a certification-stamp badge
 * representing a CBET level, styled like an official trade-certificate seal.
 */
export default function LevelStamp({ level, size = "md" }) {
  const info = getLevelInfo(level);
  if (!info) return null;

  const sizes = {
    sm: { box: "w-10 h-10", text: "text-xs", sub: "hidden" },
    md: { box: "w-14 h-14", text: "text-base", sub: "text-[7px]" },
    lg: { box: "w-20 h-20", text: "text-2xl", sub: "text-[9px]" },
  };
  const s = sizes[size];

  return (
    <div
      className={`stamp-badge relative ${s.box} rounded-full border-2 border-amber-signal/70 flex flex-col items-center justify-center bg-shop-900 shrink-0`}
      style={{
        backgroundImage:
          "repeating-radial-gradient(circle at center, transparent 0, transparent calc(100% - 3px), rgba(242,169,59,0.15) calc(100% - 2px))",
      }}
      title={`${info.short} — ${info.label}`}
    >
      <span className={`${s.text} font-bold text-amber-signal leading-none`}>{levelNumber(level)}</span>
      <span className={`${s.sub} uppercase tracking-wider text-shop-300 leading-none mt-0.5`}>LVL</span>
    </div>
  );
}
