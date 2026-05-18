"use client";
import CountUp from "react-countup";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function reportsPage() {
  const router = useRouter();

  const handleLogout = async (e) => {
    e.preventDefault();
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="bg-page-base text-on-surface min-h-screen">
      

<header className="fixed top-0 w-full z-50 flex justify-between items-center px-lg h-16 bg-surface-white shadow-[0_2px_12px_rgba(26,26,24,0.08)]">
<div className="flex items-center gap-2">
<span className="text-headline-md font-headline-md font-bold text-primary">GoalPulse</span>
</div>
<nav className="hidden md:flex items-center gap-8">
<a className="text-body-charcoal font-medium hover:text-primary transition-colors duration-200" href="/dashboard">Dashboard</a>
<a className="text-body-charcoal font-medium hover:text-primary transition-colors duration-200" href="/dashboard">Goals</a>
<a className="text-body-charcoal font-medium hover:text-primary transition-colors duration-200" href="/team-goals">Team</a>
</nav>
<div className="flex items-center gap-4">
<button className="material-symbols-outlined text-body-charcoal hover:text-primary transition-colors duration-200" data-icon="notifications">notifications</button>
<button className="material-symbols-outlined text-body-charcoal hover:text-primary transition-colors duration-200" data-icon="settings">settings</button>
<img alt="User profile" className="w-8 h-8 rounded-full border border-outline-variant" data-alt="A professional headshot of a smiling executive in a high-end office setting. The person has a friendly but authoritative expression, lit by soft natural light from a window. The overall aesthetic is warm and sophisticated, with a blurred background showing minimalist architecture and light cream walls that match the UI design system." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBTl3C-HEPak3liOHsl9qwtrXaXH9Wf1h3mdan469a1VQAHbDBZgJ0Ve-URM-HlOb7ss1jibkCqicr9Wvy0FCB4MqL2cBjsDn9eqZiPMVIAQ3bSYZ16yMEYPdBXRgLFWgUMoWU7N5wnEFYOZepX279wHzMgXGgvmpMu7eGEXs9vhn35uhxkYG-kcFrfXinASgRxiSsXsHq5TjepFjnn8nCySshuY87v4G07rwDnPkmZyXRsbhO9o3fc4aPocRbJLqJ2bDxBmoDtUJ0a" />
</div>
</header>

<aside className="fixed left-0 top-0 h-screen w-[220px] z-40 flex flex-col pt-16 bg-page-base border-r border-outline-variant hidden md:flex">
<div className="flex flex-col flex-1 mt-8">
<a className="flex items-center gap-3 text-body-charcoal px-4 py-3 hover:bg-surface-container transition-all" href="/dashboard">
<span className="material-symbols-outlined" data-icon="dashboard">dashboard</span>
<span className="text-label-md font-label-md">Dashboard</span>
</a>
<a className="flex items-center gap-3 text-body-charcoal px-4 py-3 hover:bg-surface-container transition-all" href="/dashboard">
<span className="material-symbols-outlined" data-icon="track_changes">track_changes</span>
<span className="text-label-md font-label-md">My Goals</span>
</a>
<a className="flex items-center gap-3 text-body-charcoal px-4 py-3 hover:bg-surface-container transition-all" href="/quarterly-check-in">
<span className="material-symbols-outlined" data-icon="event_note">event_note</span>
<span className="text-label-md font-label-md">Check-ins</span>
</a>
<a className="flex items-center gap-3 text-body-charcoal px-4 py-3 hover:bg-surface-container transition-all" href="/team-goals">
<span className="material-symbols-outlined" data-icon="groups">groups</span>
<span className="text-label-md font-label-md">Team Goals</span>
</a>
<a className="flex items-center gap-3 bg-primary-fixed-dim/20 text-primary border-l-4 border-primary px-4 py-3 font-bold translate-x-1 transition-transform duration-200" href="/reports">
<span className="material-symbols-outlined" data-icon="assessment" >assessment</span>
<span className="text-label-md font-label-md">Reports</span>
</a>
</div>
<div className="flex flex-col mb-4">
<a className="flex items-center gap-3 text-body-charcoal px-4 py-2 hover:bg-surface-container transition-all" href="#">
<span className="material-symbols-outlined" data-icon="help">help</span>
<span className="text-label-md font-label-md">Help Center</span>
</a>
<button onClick={handleLogout} className="flex items-center gap-3 text-red-600 font-bold bg-transparent border-none px-4 py-2 hover:bg-surface-container transition-all cursor-pointer">
<span className="material-symbols-outlined" data-icon="logout">logout</span>
<span className="text-label-md font-label-md">Log Out</span>
</button>
</div>
</aside>

<main className="md:pl-[220px] pt-16 min-h-screen">
<div className="max-w-[1200px] mx-auto px-margin-mobile md:px-margin-desktop py-lg">

<div className="flex flex-col md:flex-row md:items-end justify-between mb-xl gap-4">
<div>
<h1 className="text-display-lg font-display-lg text-primary mb-2">Strategic Insights</h1>
<p className="text-body-lg text-body-charcoal max-w-2xl">Visualizing performance patterns and objective alignment across your organization.</p>
</div>
<button className="flex items-center gap-2 text-body-charcoal font-bold hover:bg-surface-container-high px-4 py-2 rounded-lg transition-all">
<span className="material-symbols-outlined" data-icon="download">download</span>
<span className="text-label-md font-label-md">Export CSV/Excel</span>
</button>
</div>

<div className="flex flex-wrap items-center gap-4 mb-lg p-sm bg-surface-white rounded-xl shadow-[0_2px_12px_rgba(26,26,24,0.08)]">
<div className="flex flex-col gap-1 min-w-[180px]">
<label className="text-label-sm font-label-sm text-outline px-1">DEPARTMENT</label>
<select className="bg-surface-white border border-outline-variant rounded-lg px-3 py-2 text-label-md focus:border-primary focus:ring-0">
<option>All Departments</option>
<option>Product &amp; Design</option>
<option>Engineering</option>
<option>Marketing</option>
<option>Sales</option>
</select>
</div>
<div className="flex flex-col gap-1 min-w-[140px]">
<label className="text-label-sm font-label-sm text-outline px-1">QUARTER</label>
<select className="bg-surface-white border border-outline-variant rounded-lg px-3 py-2 text-label-md focus:border-primary focus:ring-0">
<option>Current (Q3 2024)</option>
<option>Previous (Q2 2024)</option>
<option>YTD 2024</option>
</select>
</div>
<div className="flex flex-col gap-1 min-w-[140px]">
<label className="text-label-sm font-label-sm text-outline px-1">STATUS</label>
<select className="bg-surface-white border border-outline-variant rounded-lg px-3 py-2 text-label-md focus:border-primary focus:ring-0">
<option>All Statuses</option>
<option>On Track</option>
<option>At Risk</option>
<option>Behind</option>
</select>
</div>
<button className="mt-5 ml-auto flex items-center gap-2 text-primary font-bold px-4 py-2">
<span className="material-symbols-outlined" data-icon="refresh">refresh</span>
<span className="text-label-md font-label-md">Reset Filters</span>
</button>
</div>

<div className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-xl">

<div className="bg-surface-white p-md rounded-xl shadow-[0_2px_12px_rgba(26,26,24,0.08)] flex flex-col items-center text-center">
<div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-3">
<span className="material-symbols-outlined" data-icon="trending_up">trending_up</span>
</div>
<p className="text-label-md font-label-md text-outline mb-1">Avg Achievement %</p>
<p className="text-display-lg font-display-lg text-primary"><CountUp end={88} duration={2} /><span className="text-headline-md">%</span></p>
<div className="mt-3 px-3 py-1 bg-success-sage/10 text-success-sage text-label-sm rounded-full flex items-center gap-1">
<span className="material-symbols-outlined text-[14px]" data-icon="arrow_upward">arrow_upward</span>
                        +4% from last quarter
                    </div>
</div>

<div className="bg-surface-white p-md rounded-xl shadow-[0_2px_12px_rgba(26,26,24,0.08)] flex flex-col items-center text-center">
<div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-3">
<span className="material-symbols-outlined" data-icon="task_alt">task_alt</span>
</div>
<p className="text-label-md font-label-md text-outline mb-1">Goals On Track</p>
<p className="text-display-lg font-display-lg text-primary"><CountUp end={42} duration={2} /></p>
<p className="mt-3 text-body-sm text-body-charcoal">Out of 48 total active goals</p>
</div>

<div className="bg-surface-white p-md rounded-xl shadow-[0_2px_12px_rgba(26,26,24,0.08)] flex flex-col items-center text-center">
<div className="w-12 h-12 bg-secondary-container/10 rounded-full flex items-center justify-center text-secondary mb-3">
<span className="material-symbols-outlined" data-icon="pending_actions">pending_actions</span>
</div>
<p className="text-label-md font-label-md text-outline mb-1">Overdue Check-ins</p>
<p className="text-display-lg font-display-lg text-secondary"><CountUp end={5} duration={2} /></p>
<div className="mt-3 px-3 py-1 bg-secondary-container/10 text-secondary text-label-sm rounded-full flex items-center gap-1">
<span className="material-symbols-outlined text-[14px]" data-icon="warning">warning</span>
                        Requires immediate attention
                    </div>
</div>
</div>

<div className="bg-surface-white p-xl rounded-xl shadow-[0_2px_12px_rgba(26,26,24,0.08)]">
<div className="flex items-center justify-between mb-lg">
<div>
<h2 className="text-headline-md font-headline-md text-primary">Planned vs Actual Achievement</h2>
<p className="text-body-sm text-outline">Department-level performance distribution for Q3</p>
</div>
<div className="flex items-center gap-6">
<div className="flex items-center gap-2">
<div className="w-3 h-3 rounded-full bg-primary"></div>
<span className="text-label-sm font-label-sm text-body-charcoal">PLANNED</span>
</div>
<div className="flex items-center gap-2">
<div className="w-3 h-3 rounded-full bg-secondary-container"></div>
<span className="text-label-sm font-label-sm text-body-charcoal">ACTUAL</span>
</div>
</div>
</div>

<div className="h-[400px] w-full flex items-end gap- gutter border-b border-l border-outline-variant pt-4 pb-0 relative">

<div className="absolute inset-0 flex flex-col justify-between pointer-events-none pr-gutter">
<div className="w-full border-t border-surface-container-high h-0"></div>
<div className="w-full border-t border-surface-container-high h-0"></div>
<div className="w-full border-t border-surface-container-high h-0"></div>
<div className="w-full border-t border-surface-container-high h-0"></div>
<div className="w-full h-0"></div>
</div>

<div className="flex-1 flex flex-col items-center h-full justify-end relative group">
<div className="flex items-end gap-1 h-full w-full justify-center">
<div className="w-8 bg-primary rounded-t-sm" ></div>
<div className="w-8 bg-secondary-container rounded-t-sm" ></div>
</div>
<p className="absolute top-[102%] text-label-sm font-label-sm text-body-charcoal whitespace-nowrap">Product</p>
</div>

<div className="flex-1 flex flex-col items-center h-full justify-end relative group">
<div className="flex items-end gap-1 h-full w-full justify-center">
<div className="w-8 bg-primary rounded-t-sm" ></div>
<div className="w-8 bg-secondary-container rounded-t-sm" ></div>
</div>
<p className="absolute top-[102%] text-label-sm font-label-sm text-body-charcoal whitespace-nowrap">Eng</p>
</div>

<div className="flex-1 flex flex-col items-center h-full justify-end relative group">
<div className="flex items-end gap-1 h-full w-full justify-center">
<div className="w-8 bg-primary rounded-t-sm" ></div>
<div className="w-8 bg-secondary-container rounded-t-sm" ></div>
</div>
<p className="absolute top-[102%] text-label-sm font-label-sm text-body-charcoal whitespace-nowrap">Marketing</p>
</div>

<div className="flex-1 flex flex-col items-center h-full justify-end relative group">
<div className="flex items-end gap-1 h-full w-full justify-center">
<div className="w-8 bg-primary rounded-t-sm" ></div>
<div className="w-8 bg-secondary-container rounded-t-sm" ></div>
</div>
<p className="absolute top-[102%] text-label-sm font-label-sm text-body-charcoal whitespace-nowrap">Sales</p>
</div>

<div className="flex-1 flex flex-col items-center h-full justify-end relative group">
<div className="flex items-end gap-1 h-full w-full justify-center">
<div className="w-8 bg-primary rounded-t-sm" ></div>
<div className="w-8 bg-secondary-container rounded-t-sm" ></div>
</div>
<p className="absolute top-[102%] text-label-sm font-label-sm text-body-charcoal whitespace-nowrap">HR</p>
</div>

<div className="flex-1 flex flex-col items-center h-full justify-end relative group">
<div className="flex items-end gap-1 h-full w-full justify-center">
<div className="w-8 bg-primary rounded-t-sm" ></div>
<div className="w-8 bg-secondary-container rounded-t-sm" ></div>
</div>
<p className="absolute top-[102%] text-label-sm font-label-sm text-body-charcoal whitespace-nowrap">Ops</p>
</div>
</div>
</div>

<div className="mt-xl bg-surface-white rounded-xl shadow-[0_2px_12px_rgba(26,26,24,0.08)] overflow-hidden">
<div className="px-md py-4 border-b border-surface-container-high flex justify-between items-center">
<h3 className="text-headline-sm font-headline-sm text-primary">Departmental Performance Index</h3>
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-outline text-[20px]" data-icon="search">search</span>
<input className="bg-transparent border-none text-body-sm focus:ring-0 placeholder:text-outline-variant" placeholder="Search departments..." type="text" />
</div>
</div>
<div className="overflow-x-auto">
<table className="w-full text-left border-collapse">
<thead>
<tr className="bg-page-base">
<th className="px-md py-3 text-label-sm font-label-sm text-outline uppercase">Department</th>
<th className="px-md py-3 text-label-sm font-label-sm text-outline uppercase">Active Goals</th>
<th className="px-md py-3 text-label-sm font-label-sm text-outline uppercase">Status</th>
<th className="px-md py-3 text-label-sm font-label-sm text-outline uppercase">Achievement</th>
<th className="px-md py-3 text-label-sm font-label-sm text-outline uppercase">Last Sync</th>
</tr>
</thead>
<tbody>
<tr className="hover:bg-primary/5 transition-colors border-b border-surface-container">
<td className="px-md py-4 font-bold text-primary">Engineering</td>
<td className="px-md py-4 text-body-sm">12</td>
<td className="px-md py-4">
<span className="px-3 py-1 bg-success-sage/10 text-success-sage text-label-sm rounded-full">Exceptional</span>
</td>
<td className="px-md py-4">
<div className="flex items-center gap-2">
<div className="w-24 h-2 bg-surface-container rounded-full overflow-hidden">
<div className="h-full bg-primary w-[88%]"></div>
</div>
<span className="text-label-md">88%</span>
</div>
</td>
<td className="px-md py-4 text-body-sm text-outline">2 hours ago</td>
</tr>
<tr className="hover:bg-primary/5 transition-colors border-b border-surface-container">
<td className="px-md py-4 font-bold text-primary">Product &amp; Design</td>
<td className="px-md py-4 text-body-sm">8</td>
<td className="px-md py-4">
<span className="px-3 py-1 bg-success-sage/10 text-success-sage text-label-sm rounded-full">On Track</span>
</td>
<td className="px-md py-4">
<div className="flex items-center gap-2">
<div className="w-24 h-2 bg-surface-container rounded-full overflow-hidden">
<div className="h-full bg-primary w-[78%]"></div>
</div>
<span className="text-label-md">78%</span>
</div>
</td>
<td className="px-md py-4 text-body-sm text-outline">Yesterday</td>
</tr>
<tr className="hover:bg-primary/5 transition-colors">
<td className="px-md py-4 font-bold text-primary">Marketing</td>
<td className="px-md py-4 text-body-sm">15</td>
<td className="px-md py-4">
<span className="px-3 py-1 bg-secondary-container/10 text-secondary text-label-sm rounded-full">At Risk</span>
</td>
<td className="px-md py-4">
<div className="flex items-center gap-2">
<div className="w-24 h-2 bg-surface-container rounded-full overflow-hidden">
<div className="h-full bg-secondary-container w-[75%]"></div>
</div>
<span className="text-label-md">75%</span>
</div>
</td>
<td className="px-md py-4 text-body-sm text-outline">3 hours ago</td>
</tr>
</tbody>
</table>
</div>
<div className="px-md py-4 bg-page-base flex items-center justify-between">
<p className="text-label-sm text-outline">Showing 1-3 of 6 departments</p>
<div className="flex gap-2">
<button className="px-3 py-1 border border-outline-variant rounded-md hover:bg-surface-white text-label-md disabled:opacity-50" disabled="">Previous</button>
<button className="px-3 py-1 border border-outline-variant bg-surface-white rounded-md hover:bg-primary hover:text-white transition-colors text-label-md">Next</button>
</div>
</div>
</div>
</div>
</main>

<nav className="md:hidden fixed bottom-0 left-0 w-full bg-surface-white border-t border-outline-variant flex justify-around items-center h-16 z-50">
<a className="flex flex-col items-center text-outline" href="#">
<span className="material-symbols-outlined" data-icon="dashboard">dashboard</span>
<span className="text-[10px] font-bold">DASHBOARD</span>
</a>
<a className="flex flex-col items-center text-outline" href="#">
<span className="material-symbols-outlined" data-icon="track_changes">track_changes</span>
<span className="text-[10px] font-bold">GOALS</span>
</a>
<a className="flex flex-col items-center text-primary" href="#">
<span className="material-symbols-outlined" data-icon="assessment" >assessment</span>
<span className="text-[10px] font-bold">REPORTS</span>
</a>
<a className="flex flex-col items-center text-outline" href="#">
<span className="material-symbols-outlined" data-icon="settings">settings</span>
<span className="text-[10px] font-bold">SETTINGS</span>
</a>
</nav>

    </div>
  );
}