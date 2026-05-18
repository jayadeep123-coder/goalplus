"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function QuarterlyCheckinPage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  
  const [activeCycle, setActiveCycle] = useState(null);
  const [goals, setGoals] = useState([]);
  const [checkinsData, setCheckinsData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [currentPeriod, setCurrentPeriod] = useState("Q3");

  useEffect(() => {
    if (!user) return;
    
    const fetchData = async () => {
      // 1. Get active cycle
      const { data: cycleData } = await supabase
        .from('goal_cycles')
        .select('*')
        .eq('is_active', true)
        .single();
        
      if (cycleData) {
        setActiveCycle(cycleData);
        
        // 2. Get user's goals
        const { data: goalsData } = await supabase
          .from('goals')
          .select('*, checkins(*)')
          .eq('employee_id', user.id)
          .eq('cycle_id', cycleData.id);
          
        if (goalsData) {
          setGoals(goalsData);
          
          // 3. Initialize checkin state
          const initialCheckins = {};
          goalsData.forEach(g => {
            const existingCheckin = g.checkins?.find(c => c.quarter === currentPeriod);
            initialCheckins[g.id] = {
              actual_value: existingCheckin ? existingCheckin.actual_value : "",
              status: existingCheckin ? existingCheckin.status : "Not Started"
            };
          });
          setCheckinsData(initialCheckins);
        }
      }
      setLoading(false);
    };
    
    fetchData();
  }, [user, currentPeriod]);

  const handleUpdateCheckin = (goalId, field, value) => {
    setCheckinsData(prev => ({
      ...prev,
      [goalId]: {
        ...prev[goalId],
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const upsertPromises = goals.map(async (goal) => {
        const data = checkinsData[goal.id];
        if (data.actual_value === "") return; // Skip if no value entered
        
        const existingCheckin = goal.checkins?.find(c => c.quarter === currentPeriod);
        
        if (existingCheckin) {
           const { error } = await supabase.from('checkins').update({
             actual_value: Number(data.actual_value),
             status: data.status,
             updated_at: new Date().toISOString()
           }).eq('id', existingCheckin.id);
           if (error) throw error;
        } else {
           const { error } = await supabase.from('checkins').insert({
             goal_id: goal.id,
             quarter: currentPeriod,
             actual_value: Number(data.actual_value),
             status: data.status
           });
           if (error) throw error;
        }
      });
      
      await Promise.all(upsertPromises);
      router.push("/dashboard");
    } catch (err) {
      console.error("Save Checkin Error:", err);
      setErrorMsg(err.message || "Database Error. Please try running: NOTIFY pgrst, 'reload schema'; in Supabase.");
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center font-bold text-primary">Loading Check-ins...</div>;
  }

  return (
    <div className="bg-page-base text-on-surface min-h-screen">
      {/* SIDEBAR */}
      <aside className="fixed left-0 top-0 h-screen w-[220px] z-40 flex flex-col pt-16 bg-page-base border-r border-outline-variant">
        <div className="px-6 mb-8">
          <h1 className="text-headline-sm font-black text-primary">GoalPulse</h1>
          <p className="text-label-md text-body-charcoal/60">Strategic Tracking</p>
        </div>
        <nav className="flex-1 space-y-1">
          <Link href="/dashboard" className="flex items-center gap-3 text-body-charcoal px-4 py-3 hover:bg-surface-container transition-all font-label-md text-label-md">
            <span className="material-symbols-outlined">dashboard</span> Dashboard
          </Link>
          <Link href="/goal-creation-form" className="flex items-center gap-3 text-body-charcoal px-4 py-3 hover:bg-surface-container transition-all font-label-md text-label-md">
            <span className="material-symbols-outlined">track_changes</span> New Goal
          </Link>
          <Link href="/quarterly-check-in" className="flex items-center gap-3 bg-primary-fixed-dim/20 text-primary border-l-4 border-primary px-4 py-3 font-bold font-label-md text-label-md translate-x-1">
            <span className="material-symbols-outlined">event_note</span> Check-ins
          </Link>
        </nav>
      </aside>

      <main className="ml-[220px] w-full flex flex-col min-h-screen relative pb-24">
        {/* HEADER */}
        <header className="fixed top-0 right-0 left-[220px] h-16 z-50 flex justify-between items-center px-lg bg-surface-white shadow-[0_2px_12px_rgba(26,26,24,0.08)]">
          <div className="flex items-center gap-4">
            <span className="text-headline-md font-bold text-primary">GoalPulse</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-bold text-sm">{profile?.full_name}</span>
            <div className="w-8 h-8 rounded-full bg-surface-container overflow-hidden border border-outline-variant">
              <img alt="User profile" src="https://i.pravatar.cc/100?img=5" />
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <section className="mt-24 px-margin-desktop max-w-6xl mx-auto w-full">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
            <div>
              <span className="text-label-sm font-label-sm text-secondary uppercase tracking-widest">{activeCycle?.name || "Performance Cycle"}</span>
              <h2 className="page-title-font text-display-lg text-primary mt-2">Quarterly Review</h2>
            </div>
            
            <div className="flex bg-surface-container-low p-1.5 rounded-xl border border-outline-variant shadow-sm">
              {['Q1', 'Q2', 'Q3', 'Q4'].map(period => (
                <button 
                  key={period}
                  onClick={() => setCurrentPeriod(period)}
                  className={`px-6 py-2 rounded-lg text-label-md font-label-md transition-all ${currentPeriod === period ? 'bg-secondary-container text-on-secondary-fixed font-bold shadow-sm ring-1 ring-secondary/20' : 'text-body-charcoal/40 hover:bg-surface-variant'}`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-gutter">
            {goals.length === 0 ? (
              <div className="bg-surface-white p-10 rounded-xl shadow-sm text-center">
                <p className="font-bold text-lg mb-2">No active goals found.</p>
                <p className="text-outline mb-6">Create a goal first before submitting a check-in.</p>
                <Link href="/goal-creation-form" className="bg-primary text-white px-6 py-2 rounded-lg font-bold hover:bg-primary-container">
                  Create Goal
                </Link>
              </div>
            ) : (
              goals.map((goal) => {
                const data = checkinsData[goal.id] || { actual_value: "", status: "Not Started" };
                let score = 0;
                if (goal.uom_type === 'zero_based') {
                  score = data.actual_value === 0 ? 1.0 : 0.0;
                } else if (goal.target_value > 0 && data.actual_value !== "") {
                  score = Math.min(Number(data.actual_value) / goal.target_value, 1.0).toFixed(1);
                }

                return (
                  <div key={goal.id} className="bg-surface-white p-md rounded-xl shadow-[0_2px_12px_rgba(26,26,24,0.08)] border border-outline-variant/30 flex flex-col md:flex-row gap-8">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-headline-md text-headline-md text-primary">{goal.title}</h3>
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${score >= 0.8 ? 'bg-success-sage/10 border-success-sage/20' : 'bg-primary/5 border-primary/10'}`}>
                          <span className={`text-label-sm font-label-sm uppercase ${score >= 0.8 ? 'text-success-sage' : 'text-primary'}`}>Score</span>
                          <span className={`text-headline-md font-bold ${score >= 0.8 ? 'text-success-sage' : 'text-primary'}`}>{score}</span>
                        </div>
                      </div>
                      <p className="text-body-md text-body-charcoal mb-6 leading-relaxed">{goal.description}</p>
                      
                      <div className="flex items-center gap-4">
                        <span className="text-label-sm font-label-sm text-body-charcoal/60 uppercase">Status</span>
                        <div className="flex p-1 bg-surface-container-high rounded-lg gap-1">
                          {['Not Started', 'On Track', 'Completed'].map(status => (
                            <button 
                              key={status}
                              onClick={() => handleUpdateCheckin(goal.id, 'status', status)}
                              className={`px-4 py-1.5 rounded-md text-label-sm font-label-sm transition-colors ${
                                data.status === status 
                                  ? (status === 'Completed' ? 'bg-success-sage text-surface-white shadow-sm' : 'bg-secondary-container text-on-secondary-fixed shadow-sm') 
                                  : 'bg-transparent text-body-charcoal/40 hover:text-body-charcoal'
                              }`}
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 md:w-96">
                      <div className="flex flex-col gap-2">
                        <label className="text-label-sm font-label-sm text-body-charcoal/60 uppercase">Planned Target</label>
                        <div className="bg-surface-container p-4 rounded-lg border border-outline-variant opacity-60">
                          <span className="text-headline-md font-bold text-body-charcoal">{goal.target_value}</span>
                          <p className="text-label-sm text-body-charcoal/60 mt-1 capitalize">{goal.uom_type.replace('_', ' ')}</p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-label-sm font-label-sm text-primary uppercase">Actual Achievement</label>
                        <div className="bg-surface-white p-4 rounded-lg border-2 border-secondary-container shadow-[0_0_15px_rgba(253,186,73,0.15)] ring-2 ring-secondary-container/10">
                          <input 
                            className="w-full bg-transparent border-none p-0 text-headline-md font-bold text-on-surface focus:ring-0 outline-none" 
                            type="number" 
                            placeholder="0"
                            value={data.actual_value} 
                            onChange={(e) => handleUpdateCheckin(goal.id, 'actual_value', e.target.value)}
                          />
                          <p className="text-label-sm text-secondary font-bold mt-1">Current Entry</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        <footer className="fixed bottom-0 right-0 left-[220px] bg-surface-white border-t border-outline-variant/30 px-margin-desktop py-4 flex items-center justify-between z-50 shadow-[0_-4px_20px_rgba(26,26,24,0.05)]">
          <div className="flex items-center gap-6">
             {errorMsg && <div className="text-red-500 font-bold bg-red-50 px-4 py-2 rounded-lg border border-red-200">{errorMsg}</div>}
          </div>
          <div className="flex gap-4">
            <Link href="/dashboard" className="px-6 py-2 rounded-lg text-label-md font-bold text-body-charcoal hover:bg-surface-container transition-colors flex items-center">Cancel</Link>
            <button 
              onClick={handleSave} 
              disabled={saving || goals.length === 0}
              className="px-8 py-2 bg-primary text-surface-white rounded-lg text-label-md font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save & Submit"}
            </button>
          </div>
        </footer>
      </main>
    </div>
  );
}