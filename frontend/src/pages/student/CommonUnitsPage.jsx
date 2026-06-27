import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import * as endpoints from "../../api/endpoints";

export default function CommonUnitsPage() {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    endpoints.listCommonUnits().then((res) => {
      setUnits(res.data);
      setLoading(false);
    });
  }, []);

  return (
    <div>
      <div className="spec-label mb-1">SHARED ACROSS ALL TRADES</div>
      <h1 className="font-display font-bold text-3xl text-shop-50 mb-1">Common Units</h1>
      <p className="text-shop-300 text-sm mb-8">
        Safety, math, and communication units available to every student, regardless of course or level.
      </p>

      {loading ? (
        <div className="spec-label">Loading…</div>
      ) : (
        <div className="space-y-3">
          {units.map((unit) => (
            <Link
              key={unit.id}
              to={`/units/${unit.id}`}
              className="panel rounded-lg p-5 flex items-center justify-between hover:border-amber-signal/50 transition-colors block"
            >
              <div>
                <div className="font-semibold text-shop-50">{unit.title}</div>
                {unit.description && <div className="text-shop-400 text-sm mt-0.5">{unit.description}</div>}
              </div>
              <span className="text-shop-500">→</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
