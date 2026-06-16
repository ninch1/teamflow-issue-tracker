import type { Activity } from "../../types/activityTypes";
import PrimaryButton from "../common/PrimaryButton";
import { Link, useParams } from "react-router-dom";

type ActivityPanelProps = {
  activities: Activity[];
  isLoading: boolean;
  error: string;
  onViewAllActivityClick?: () => void;
};

function formatActivityDate(date: string) {
  return new Date(date).toLocaleString();
}

export default function ActivityPanel({
  activities,
  isLoading,
  error,
  onViewAllActivityClick,
}: ActivityPanelProps) {
  const { workspaceId } = useParams();

  if (!workspaceId) {
    return null;
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-slate-950">
          Recent activity
        </h2>
        <p className="text-sm text-slate-500">Latest workspace updates</p>
      </div>

      {isLoading && (
        <p className="mt-4 text-sm text-slate-500">Loading activity...</p>
      )}

      {error && (
        <p className="mt-4 text-sm font-medium text-red-600">{error}</p>
      )}

      {!isLoading && !error && activities.length === 0 && (
        <p className="mt-4 text-sm text-slate-500">No activity yet.</p>
      )}

      {!isLoading && !error && activities.length > 0 && (
        <div className="mt-4 mb-4 space-y-3">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="min-w-0 overflow-hidden rounded-lg border border-slate-100 bg-slate-50 p-3"
            >
              <p className="break-words text-sm text-slate-700">
                {activity.message}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                {formatActivityDate(activity.createdAt)}
              </p>
            </div>
          ))}
        </div>
      )}

      <Link
        onClick={onViewAllActivityClick}
        to={`/workspaces/${workspaceId}/activity`}
      >
        <PrimaryButton fullWidth={true}>View all activity</PrimaryButton>
      </Link>
    </section>
  );
}
