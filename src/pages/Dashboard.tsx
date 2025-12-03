import React from "react";
import { useData } from "../context/DataContext";

const Dashboard: React.FC = () => {
  const {
    campaigns = [],
    tasks = [],
    payments = [],
    jobs = [],
    loading,
    error,
  } = useData() || ({} as any);

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
        <p className="text-sm text-gray-500">Loading your data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
        <p className="text-sm text-red-500">Error: {error}</p>
      </div>
    );
  }

  const incomeThisMonth = payments
    .filter((p) => p.type === "Income" && p.status === "Paid")
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-surface p-4 rounded-lg border border-borderColor">
          <p className="text-sm text-textMuted">Campaigns</p>
          <p className="text-2xl font-bold">{campaigns.length}</p>
        </div>

        <div className="bg-surface p-4 rounded-lg border border-borderColor">
          <p className="text-sm text-textMuted">Open Tasks</p>
          <p className="text-2xl font-bold">
            {tasks.filter((t) => t.status !== "Completed").length}
          </p>
        </div>

        <div className="bg-surface p-4 rounded-lg border border-borderColor">
          <p className="text-sm text-textMuted">Active UGC Jobs</p>
          <p className="text-2xl font-bold">
            {jobs.filter((j) =>
              ["Accepted", "Filming", "Editing"].includes(j.status)
            ).length}
          </p>
        </div>

        <div className="bg-surface p-4 rounded-lg border border-borderColor">
          <p className="text-sm text-textMuted">Income (All Time)</p>
          <p className="text-2xl font-bold">
            ${incomeThisMonth.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
