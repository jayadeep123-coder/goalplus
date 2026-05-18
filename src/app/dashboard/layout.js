"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function DashboardLayout({ children }) {
  const router = useRouter();

  const handleLogout = async (e) => {
    e.preventDefault();
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="bg-page-base text-on-surface min-h-screen">
      
      {/* Topbar */}
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-lg h-16 bg-surface-white shadow-[0_2px_12px_rgba(26,26,24,0.08)]">
        <div className="flex items-center gap-8">
          <span className="text-headline-md font-headline-md font-bold text-primary">GoalPulse</span>
          <div className="hidden md:flex gap-6">
            <Link className="text-primary font-bold border-b-2 border-primary" href="/dashboard">Dashboard</Link>
            <Link className="text-body-charcoal font-medium hover:text-primary transition-colors duration-200" href="/manager-dashboard">Team</Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="material-symbols-outlined text-body-charcoal hover:text-primary p-2 transition-all">notifications</button>
          <button onClick={handleLogout} className="flex items-center gap-1 text-red-600 hover:text-red-700 font-bold ml-2 px-3 py-1 rounded hover:bg-red-50 transition-all">
            <span className="material-symbols-outlined text-sm">logout</span>
            Logout
          </button>
        </div>
      </nav>

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-[220px] z-40 flex flex-col pt-16 bg-page-base border-r border-outline-variant hidden md:flex">
        <div className="flex flex-col flex-grow py-8 overflow-y-auto">
          <div className="px-6 mb-8">
            <h2 className="text-headline-sm font-headline-sm font-black text-primary">GoalPulse</h2>
            <p className="text-label-sm text-body-charcoal opacity-70">Strategic Tracking</p>
          </div>
          <nav className="flex flex-col gap-1">
            <Link className="flex items-center gap-3 bg-primary-fixed-dim/20 text-primary border-l-4 border-primary px-4 py-3 font-bold translate-x-1 transition-transform duration-200" href="/dashboard">
              <span className="material-symbols-outlined" data-icon="dashboard">dashboard</span>
              <span className="font-label-md text-label-md">Dashboard</span>
            </Link>
            <Link className="flex items-center gap-3 text-body-charcoal px-4 py-3 hover:bg-surface-container-high transition-all" href="/quarterly-check-in">
              <span className="material-symbols-outlined" data-icon="event_note">event_note</span>
              <span className="font-label-md text-label-md">Check-ins</span>
            </Link>
            <Link className="flex items-center gap-3 text-body-charcoal px-4 py-3 hover:bg-surface-container-high transition-all" href="/manager-dashboard">
              <span className="material-symbols-outlined" data-icon="groups">groups</span>
              <span className="font-label-md text-label-md">Team Goals</span>
            </Link>
          </nav>
        </div>
        <div className="mt-auto border-t border-outline-variant p-4">
          <button onClick={handleLogout} className="flex items-center gap-3 text-red-600 font-bold bg-transparent border-none px-2 py-2 text-label-md font-label-md hover:text-red-700 cursor-pointer text-left w-full">
            <span className="material-symbols-outlined text-[20px]" data-icon="logout">logout</span> Log Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="md:pl-[220px] pt-16 min-h-screen">
        <div className="p-margin-mobile md:p-margin-desktop max-w-[1400px] mx-auto">
          {children}
        </div>
      </main>
      
    </div>
  );
}
