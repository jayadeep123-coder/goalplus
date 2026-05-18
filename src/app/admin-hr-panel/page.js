"use client";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useState, useEffect } from "react";

export default function adminhrpanelPage() {
  const router = useRouter();
  const [heatmapData, setHeatmapData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      // Query 1: All profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, role, department');

      // Query 2: All goals
      const { data: goalsRaw, error: goalsError } = await supabase
        .from('goals')
        .select('id, title, status, target_value, uom_type, employee_id');

      // Query 3: All checkins
      const { data: checkinsRaw, error: checkinsError } = await supabase
        .from('checkins')
        .select('id, goal_id, quarter, actual_value, status');

      if (profilesError) console.error('Profiles error:', profilesError.message);
      if (goalsError) console.error('Goals error:', goalsError.message);
      if (checkinsError) console.error('Checkins error:', checkinsError.message);

      if (profiles) {
        const employees = profiles.filter(p => p.role?.toLowerCase() === 'employee');

        const goals = goalsRaw || [];
        const checkins = checkinsRaw || [];

        const mapped = employees.map(p => {
          // Attach goals belonging to this employee
          const empGoals = goals.filter(g => g.employee_id === p.id).map(g => ({
            ...g,
            checkins: checkins.filter(c => c.goal_id === g.id)
          }));

          const totalGoals = empGoals.length;
          let completed = 0;
          let partial = 0;

          empGoals.forEach(g => {
            if (g.status?.toLowerCase() === 'approved') {
              if (g.checkins.some(c => c.status === 'Completed')) completed++;
              else partial++;
            }
          });

          let overallStatus = 'PENDING';
          if (totalGoals > 0) {
            if (completed === totalGoals) overallStatus = 'DONE';
            else if (completed > 0 || partial > 0) overallStatus = 'PARTIAL';
          }

          return {
            name: p.full_name,
            department: p.department || 'General',
            status: overallStatus,
            goals: empGoals,
            totalGoals,
            completed,
            partial
          };
        });

        setHeatmapData(mapped);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  // Derived stats from real data
  const totalEmployees = heatmapData.length;
  const doneCount = heatmapData.filter(e => e.status === 'DONE').length;
  const partialCount = heatmapData.filter(e => e.status === 'PARTIAL').length;
  const complianceRate = totalEmployees > 0
    ? Math.round(((doneCount + partialCount * 0.5) / totalEmployees) * 100)
    : 0;
  const pendingCount = heatmapData.reduce((sum, emp) => {
    return sum + emp.goals.filter(g => g.status?.toLowerCase() === 'pending' || g.status?.toLowerCase() === 'draft').length;
  }, 0);

  const exportCSV = () => {
    // Build rows as an array so newlines are real characters
    const rows = [
      ["Employee", "Department", "Goal Title", "Goal Status", "UoM Type", "Target", "Actual Achievement", "Quarter", "Check-in Status"]
    ];

    heatmapData.forEach(emp => {
      if (emp.goals.length === 0) {
        rows.push([emp.name, emp.department, "No Goals", "N/A", "N/A", "N/A", "N/A", "N/A", "N/A"]);
      } else {
        emp.goals.forEach(goal => {
          if (goal.checkins && goal.checkins.length > 0) {
            goal.checkins.forEach(c => {
              rows.push([
                emp.name,
                emp.department,
                goal.title,
                goal.status,
                goal.uom_type || "N/A",
                goal.target_value ?? "N/A",
                c.actual_value ?? "N/A",
                c.quarter || "N/A",
                c.status || "N/A"
              ]);
            });
          } else {
            rows.push([
              emp.name,
              emp.department,
              goal.title,
              goal.status,
              goal.uom_type || "N/A",
              goal.target_value ?? "N/A",
              "No Check-in",
              "N/A",
              "N/A"
            ]);
          }
        });
      }
    });

    // Convert rows to CSV string with proper line endings
    const csvString = rows
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\r\n");

    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "GoalPulse_Achievement_Report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };


  const handleLogout = async (e) => {
    e.preventDefault();
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="bg-page-base text-on-surface min-h-screen">
      

<header className="fixed top-0 w-full z-50 flex justify-between items-center px-lg h-16 bg-surface-white shadow-[0_2px_12px_rgba(26,26,24,0.08)]">
<div className="flex items-center gap-8">
<span className="text-headline-md font-headline-md font-bold text-primary">GoalPulse</span>
<nav className="hidden md:flex gap-6">
<a className="text-primary font-bold border-b-2 border-primary transition-colors duration-200 text-label-md font-label-md" href="/dashboard">Dashboard</a>
<a className="text-body-charcoal font-medium hover:text-primary transition-colors duration-200 text-label-md font-label-md" href="/dashboard">Goals</a>
<a className="text-body-charcoal font-medium hover:text-primary transition-colors duration-200 text-label-md font-label-md" href="/team-goals">Team</a>
</nav>
</div>
<div className="flex items-center gap-4">
<button className="material-symbols-outlined text-body-charcoal hover:text-primary transition-all p-2 rounded-full hover:bg-surface-container" data-icon="notifications">notifications</button>
<button className="material-symbols-outlined text-body-charcoal hover:text-primary transition-all p-2 rounded-full hover:bg-surface-container" data-icon="settings">settings</button>
<div className="w-8 h-8 rounded-full bg-primary-fixed overflow-hidden border border-outline-variant">
<img alt="User profile" data-alt="A professional corporate headshot of a female HR executive with a warm, approachable smile, wearing a sophisticated dark green blazer. The lighting is soft and high-key, set against a minimalist light cream background, echoing a premium digital publication aesthetic with high clarity and editorial elegance." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCF0Z2ThK8QhcMh5ezsGUFY0zXeGpGG67fihF2eUBCO1y7-_hms6DZHjwgGlPY4l046qEOgc-goPr22a2W4tZ36-w3e7kk7v_krxATGxtvOGDDhBs-8I2xFwmTq9vfAAuRq30gnrkHifGYdakoPSJEyWJ6QiQK5reMsFzy7CqFd1UAGNQipko90YFsjqiEJfYT0uYEwhxgPn7V8N4OrLrUG-28j5ZgvsZEVO__Xm1wX-FL4wEG484lVlbiFn0eHH-R7j5jKzKlezz-x" />
</div>
</div>
</header>

<aside className="fixed left-0 top-0 h-screen w-[220px] z-40 flex flex-col pt-16 bg-page-base border-r border-outline-variant">
<div className="mt-8 flex flex-col gap-1">
<a className="flex items-center gap-3 text-body-charcoal px-4 py-3 hover:bg-surface-container transition-all text-label-md font-label-md" href="/dashboard">
<span className="material-symbols-outlined" data-icon="dashboard">dashboard</span> Dashboard
            </a>
<a className="flex items-center gap-3 text-body-charcoal px-4 py-3 hover:bg-surface-container transition-all text-label-md font-label-md" href="/dashboard">
<span className="material-symbols-outlined" data-icon="track_changes">track_changes</span> My Goals
            </a>
<a className="flex items-center gap-3 text-body-charcoal px-4 py-3 hover:bg-surface-container transition-all text-label-md font-label-md" href="/quarterly-check-in">
<span className="material-symbols-outlined" data-icon="event_note">event_note</span> Check-ins
            </a>
<a className="flex items-center gap-3 text-body-charcoal px-4 py-3 hover:bg-surface-container transition-all text-label-md font-label-md" href="/team-goals">
<span className="material-symbols-outlined" data-icon="groups">groups</span> Team Goals
            </a>
<a className="flex items-center gap-3 text-body-charcoal px-4 py-3 hover:bg-surface-container transition-all text-label-md font-label-md" href="/reports">
<span className="material-symbols-outlined" data-icon="assessment">assessment</span> Reports
            </a>
</div>
<div className="mt-auto border-t border-outline-variant p-4">
<div className="mt-4 flex flex-col gap-1">
<a className="flex items-center gap-3 text-body-charcoal px-2 py-2 text-label-md font-label-md hover:text-primary" href="#">
<span className="material-symbols-outlined text-[20px]" data-icon="help">help</span> Help Center
                </a>
<button onClick={handleLogout} className="flex items-center gap-3 text-red-600 font-bold bg-transparent border-none px-2 py-2 text-label-md font-label-md hover:text-red-700 cursor-pointer text-left w-full">
<span className="material-symbols-outlined text-[20px]" data-icon="logout">logout</span> Log Out
</button>
</div>
</div>
</aside>

<main className="ml-[220px] pt-16 min-h-screen flex">
<div className="flex-1 p-8 overflow-y-auto">

<div className="flex justify-between items-end mb-8">
<div>
<h1 className="font-headline-lg text-headline-lg text-primary">Admin Console</h1>
<p className="text-body-md text-body-charcoal mt-1">Strategic performance tracking and compliance oversight.</p>
</div>
<div className="flex gap-3">
<button onClick={exportCSV} className="px-4 py-2 text-label-md font-bold border border-outline rounded-lg hover:bg-surface-container transition-all flex items-center gap-2">
  <span className="material-symbols-outlined text-[18px]">download</span> Export CSV
</button>
<button className="px-4 py-2 bg-primary text-surface-white text-label-md font-bold rounded-lg shadow-sm hover:opacity-90 transition-all flex items-center gap-2">
<span className="material-symbols-outlined text-[18px]" data-icon="add">add</span> Initiate Cycle
                    </button>
</div>
</div>

<div className="grid grid-cols-12 gap-6">

<div className="col-span-12 lg:col-span-8 bg-surface-white rounded-xl p-6 shadow-[0_2px_12px_rgba(26,26,24,0.08)]">
<div className="flex justify-between items-center mb-6">
<h2 className="font-headline-md text-headline-md text-primary">Completion Heatmap</h2>
<div className="flex gap-4 items-center">
<div className="flex items-center gap-2">
<div className="w-3 h-3 rounded-[2px] bg-primary"></div>
<span className="text-label-sm font-label-sm text-body-charcoal">DONE</span>
</div>
<div className="flex items-center gap-2">
<div className="w-3 h-3 rounded-[2px] bg-secondary-container"></div>
<span className="text-label-sm font-label-sm text-body-charcoal">PARTIAL</span>
</div>
<div className="flex items-center gap-2">
<div className="w-3 h-3 rounded-[2px] bg-surface-variant"></div>
<span className="text-label-sm font-label-sm text-body-charcoal">PENDING</span>
</div>
</div>
</div>
<div className="overflow-x-auto custom-scrollbar">
<table className="w-full text-left border-collapse">
<thead>
<tr>
<th className="pb-4 pr-6 text-label-sm font-label-sm text-body-charcoal border-b border-outline-variant">EMPLOYEE</th>
<th className="pb-4 pr-6 text-label-sm font-label-sm text-body-charcoal border-b border-outline-variant">DEPT</th>
<th className="pb-4 text-label-sm font-label-sm text-body-charcoal border-b border-outline-variant">GOAL STATUS HEATMAP</th>
</tr>
</thead>
<tbody>
{loading ? (
  <tr><td colSpan="3" className="py-4 text-center font-bold text-outline">Loading Data...</td></tr>
) : heatmapData.length === 0 ? (
  <tr><td colSpan="3" className="py-4 text-center font-bold text-outline">No employee data found.</td></tr>
) : (
  heatmapData.map((emp, i) => (
    <tr key={i} className="hover:bg-primary/5 transition-colors">
      <td className="py-4 pr-6 font-bold text-label-md text-primary">{emp.name}</td>
      <td className="py-4 pr-6 text-label-md text-body-charcoal">{emp.department}</td>
      <td className="py-4">
        <div className="flex gap-1 flex-wrap max-w-[300px]">
          {emp.goals.length === 0 ? (
             <span className="text-xs text-outline italic">No goals</span>
          ) : (
            emp.goals.map((goal, j) => {
              let bgClass = "bg-surface-variant"; // default pending
              if (goal.status === 'approved') {
                if (goal.checkins && goal.checkins.some(c => c.status === 'Completed')) bgClass = "bg-primary";
                else bgClass = "bg-secondary-container"; // partial
              }
              return (
                <div key={j} className={`heatmap-cell ${bgClass} rounded-sm w-4 h-4 md:w-6 md:h-6`} title={`${goal.title} - ${goal.status}`}></div>
              );
            })
          )}
        </div>
      </td>
    </tr>
  ))
)}
</tbody>
</table>
</div>
</div>

<div className="col-span-12 lg:col-span-4 grid grid-rows-2 gap-6">
<div className="bg-primary text-surface-white rounded-xl p-6 flex flex-col justify-between shadow-[0_2px_12px_rgba(26,26,24,0.08)]">
<div>
<span className="text-label-sm font-label-sm uppercase tracking-wider opacity-80">Total Compliance</span>
<div className="text-display-lg font-display-lg mt-2">{loading ? '...' : `${complianceRate}%`}</div>
</div>
<div className="flex items-center gap-2 text-primary-fixed">
<span className="material-symbols-outlined text-[20px]" data-icon="trending_up">trending_up</span>
<span className="text-label-md font-label-md">{totalEmployees} employees tracked</span>
</div>
</div>
<div className="bg-surface-white border border-outline-variant rounded-xl p-6 flex flex-col justify-between">
<div>
<span className="text-label-sm font-label-sm uppercase tracking-wider text-body-charcoal">Pending Reviews</span>
<div className="text-display-lg font-display-lg mt-2 text-primary">{loading ? '...' : pendingCount}</div>
</div>
<div className="text-label-sm text-body-charcoal mt-2">{doneCount} fully completed · {partialCount} in progress</div>
</div>
</div>

<div className="col-span-12 bg-surface-white rounded-xl p-6 shadow-[0_2px_12px_rgba(26,26,24,0.08)] overflow-hidden">
<div className="flex justify-between items-center mb-6">
<h2 className="font-headline-md text-headline-md text-primary">Active &amp; Past Cycles</h2>
<div className="flex gap-2">
<span className="px-3 py-1 rounded-full bg-surface-container text-body-charcoal text-label-sm font-label-sm cursor-pointer hover:bg-surface-container-high transition-all">All</span>
<span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-label-sm font-label-sm font-bold cursor-pointer transition-all">Active</span>
<span className="px-3 py-1 rounded-full bg-surface-container text-body-charcoal text-label-sm font-label-sm cursor-pointer hover:bg-surface-container-high transition-all">Archived</span>
</div>
</div>
<div className="overflow-x-auto">
<table className="w-full text-left">
<thead>
<tr className="border-b border-outline-variant">
<th className="pb-3 text-label-sm font-label-sm text-body-charcoal uppercase tracking-wider">Cycle Name</th>
<th className="pb-3 text-label-sm font-label-sm text-body-charcoal uppercase tracking-wider">Date Range</th>
<th className="pb-3 text-label-sm font-label-sm text-body-charcoal uppercase tracking-wider">Status</th>
<th className="pb-3 text-label-sm font-label-sm text-body-charcoal uppercase tracking-wider text-right">Completion</th>
<th className="pb-3 text-label-sm font-label-sm text-body-charcoal uppercase tracking-wider text-right">Actions</th>
</tr>
</thead>
<tbody className="divide-y divide-outline-variant">
<tr className="hover:bg-page-base/50 transition-colors">
<td className="py-4 font-bold text-label-md text-primary">Q3 Performance Review 2024</td>
<td className="py-4 text-body-sm text-body-charcoal">Jul 01 - Sep 30, 2024</td>
<td className="py-4">
<span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-bold uppercase tracking-widest">Active</span>
</td>
<td className="py-4 text-right">
<div className="flex items-center justify-end gap-3">
<div className="w-24 h-1.5 bg-surface-container rounded-full overflow-hidden">
<div className="h-full bg-primary w-[65%]"></div>
</div>
<span className="text-label-sm font-label-sm text-primary">65%</span>
</div>
</td>
<td className="py-4 text-right">
<button className="material-symbols-outlined text-body-charcoal hover:text-primary transition-all" data-icon="more_vert">more_vert</button>
</td>
</tr>
<tr className="hover:bg-page-base/50 transition-colors">
<td className="py-4 font-bold text-label-md text-primary">Annual Strategy Alignment</td>
<td className="py-4 text-body-sm text-body-charcoal">Jan 01 - Dec 31, 2024</td>
<td className="py-4">
<span className="px-2 py-1 bg-secondary-container/20 text-secondary rounded-full text-[10px] font-bold uppercase tracking-widest">In Progress</span>
</td>
<td className="py-4 text-right">
<div className="flex items-center justify-end gap-3">
<div className="w-24 h-1.5 bg-surface-container rounded-full overflow-hidden">
<div className="h-full bg-secondary-container w-[42%]"></div>
</div>
<span className="text-label-sm font-label-sm text-secondary">42%</span>
</div>
</td>
<td className="py-4 text-right">
<button className="material-symbols-outlined text-body-charcoal hover:text-primary transition-all" data-icon="more_vert">more_vert</button>
</td>
</tr>
<tr className="hover:bg-page-base/50 transition-colors">
<td className="py-4 font-bold text-label-md text-primary">Q2 Leadership Assessment</td>
<td className="py-4 text-body-sm text-body-charcoal">Apr 01 - Jun 30, 2024</td>
<td className="py-4">
<span className="px-2 py-1 bg-surface-variant text-body-charcoal rounded-full text-[10px] font-bold uppercase tracking-widest">Completed</span>
</td>
<td className="py-4 text-right">
<div className="flex items-center justify-end gap-3">
<div className="w-24 h-1.5 bg-surface-container rounded-full overflow-hidden">
<div className="h-full bg-body-charcoal w-full"></div>
</div>
<span className="text-label-sm font-label-sm text-body-charcoal">100%</span>
</div>
</td>
<td className="py-4 text-right">
<button className="material-symbols-outlined text-body-charcoal hover:text-primary transition-all" data-icon="more_vert">more_vert</button>
</td>
</tr>
</tbody>
</table>
</div>
</div>
</div>
</div>

<aside className="w-80 bg-surface-white border-l border-outline-variant p-6 sticky top-16 h-[calc(100vh-64px)] overflow-y-auto custom-scrollbar">
<h3 className="font-headline-md text-headline-md text-primary mb-6">Audit Log</h3>
<div className="space-y-6">
<div className="relative pl-6 border-l-2 border-primary/20">
<div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-primary"></div>
<div className="text-label-sm font-mono text-body-charcoal">2024-07-15 14:32:01</div>
<p className="text-body-sm mt-1">
<span className="font-bold text-primary">Sarah Miller</span> updated Q3 goal targets for the <span className="italic text-primary-container">Engineering</span> department.
                    </p>
</div>
<div className="relative pl-6 border-l-2 border-primary/20">
<div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-primary/40"></div>
<div className="text-label-sm font-mono text-body-charcoal">2024-07-15 11:20:45</div>
<p className="text-body-sm mt-1">
<span className="font-bold text-primary">System</span> automatically archived <span className="italic text-primary-container">Q1 Review Cycle</span> data.
                    </p>
</div>
<div className="relative pl-6 border-l-2 border-primary/20">
<div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-secondary-container"></div>
<div className="text-label-sm font-mono text-body-charcoal">2024-07-15 09:15:22</div>
<p className="text-body-sm mt-1">
<span className="font-bold text-primary">James Wilson</span> flagged a potential discrepancy in <span className="italic text-primary-container">Sales Compensation</span> metrics.
                    </p>
</div>
<div className="relative pl-6 border-l-2 border-primary/20">
<div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-primary/40"></div>
<div className="text-label-sm font-mono text-body-charcoal">2024-07-14 17:55:10</div>
<p className="text-body-sm mt-1">
<span className="font-bold text-primary">Sarah Miller</span> initiated a new <span className="italic text-primary-container">Ad-hoc Peer Review</span> for senior staff.
                    </p>
</div>
<div className="relative pl-6 border-l-2 border-primary/20">
<div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-danger-terracotta"></div>
<div className="text-label-sm font-mono text-body-charcoal">2024-07-14 15:30:00</div>
<p className="text-body-sm mt-1">
<span className="font-bold text-primary">Admin Root</span> revoked access for <span className="italic text-primary-container">Contractor ID #9921</span>.
                    </p>
</div>
<div className="relative pl-6 border-l-2 border-primary/20">
<div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-primary/40"></div>
<div className="text-label-sm font-mono text-body-charcoal">2024-07-14 10:12:44</div>
<p className="text-body-sm mt-1">
<span className="font-bold text-primary">Marcus Chen</span> exported the <span className="italic text-primary-container">Annual Compliance Report</span>.
                    </p>
</div>
</div>
<button className="w-full mt-8 py-3 text-label-md font-bold text-body-charcoal bg-surface-container rounded-lg hover:bg-surface-container-high transition-all flex items-center justify-center gap-2">
<span className="material-symbols-outlined text-[20px]" data-icon="history">history</span> View Full History
            </button>
</aside>
</main>


    </div>
  );
}