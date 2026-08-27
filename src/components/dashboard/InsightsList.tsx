import { Card } from "../common/Card";

interface InsightsListProps {
  insights: string[];
}

export function InsightsList({ insights }: InsightsListProps) {
  return (
    <Card>
      <h2 className="mb-3 text-lg text-maroon-deep">Needs Your Attention</h2>
      {insights.length === 0 ? (
        <p className="text-sm text-charcoal-soft">You're all caught up. Nothing urgent right now.</p>
      ) : (
        <ul className="space-y-2.5">
          {insights.map((insight, i) => (
            <li
              key={i}
              className="rounded-xl bg-cream-soft/70 px-3.5 py-2.5 text-sm text-charcoal"
            >
              {insight}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
