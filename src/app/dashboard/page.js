"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import CountUp from "react-countup";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const [goals, setGoals] = useState([]);
  const [activeCycle, setActiveCycle] = useState(null);
  const [stats, setStats] = useState({ submitted: 0, approved: 0, pending: 0, overall: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) return;
    // Not logged in → go to login
    if (!user) {
      window.location.href = '/login';
      return;
    }
    
    const fetchDashboardData = async () => {
      // 1. Get active cycle
      const { data: cycleData } = await supabase
        .from('goal_cycles')
        .select('*')
        .eq('is_active', true)
        .single();
        
      if (cycleData) {
        setActiveCycle(cycleData);
        
        // 2. Get user's goals for this cycle, including their latest checkin
        const { data: goalsData, error: goalsError } = await supabase
          .from('goals')
          .select('*, checkins(actual_value, status)')
          .eq('employee_id', user.id)
          .eq('cycle_id', cycleData.id);
          
        if (goalsData) {
          // Process goals to calculate progress
          const processedGoals = goalsData.map(g => {
            // Get latest checkin if any
            const latestCheckin = (g.checkins && g.checkins.length > 0) 
              ? g.checkins[g.checkins.length - 1] 
              : { actual_value: 0, status: 'Not Started' };
            
            // Calculate progress % based on UoM
            let progressPercent = 0;
            if (g.uom_type === 'zero_based') {
              progressPercent = latestCheckin.actual_value === 0 ? 100 : 0;
            } else if (g.target_value > 0) {
              progressPercent = Math.min((latestCheckin.actual_value / g.target_value) * 100, 100);
            }

            return {
              ...g,
              progressPercent,
              latestCheckin
            };
          });

          setGoals(processedGoals);
          
          // Calculate top stats
          const submitted = processedGoals.length;
          const approved = processedGoals.filter(g => g.status === 'approved').length;
          const pending = processedGoals.filter(g => g.status === 'draft').length;
          
          let overallProgress = 0;
          processedGoals.forEach(g => {
            overallProgress += (g.progressPercent * (g.weightage / 100));
          });
          
          setStats({
            submitted,
            approved,
            pending,
            overall: Math.round(overallProgress)
          });
        }
      }
      setLoading(false);
    };
    
    fetchDashboardData();
  }, [user, authLoading]);

  if (authLoading || loading) {
    return <div className="flex justify-center items-center h-64 text-primary font-semibold">Loading Dashboard...</div>;
  }

  return (
    <div className="flex flex-col gap-10 max-w-6xl mx-auto">
      
      {/* Header Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-primary text-white p-10 flex justify-between items-center rounded-2xl shadow-sm"
      >
        <div>
          <p className="font-label-sm text-label-sm text-[#92D2B5] mb-3 font-medium tracking-[0.02em] normal-case">
            {activeCycle?.name || "No Active Cycle"} • {profile?.full_name || "Employee"}
          </p>
          <h1 className="font-headline-lg text-headline-lg text-white mb-2 leading-tight">Performance at a<br/>glance</h1>
          <p className="text-[#92D2B5] text-sm">
            {stats.pending > 0 ? `${stats.pending} goals awaiting approval` : "All goals approved!"}
          </p>
        </div>
        
        <div className="flex items-center gap-10">
          <div className="text-center pr-6 border-r border-white/20">
            <div className="text-3xl font-headline-md mb-1"><CountUp end={stats.submitted} duration={1.5} /></div>
            <div className="text-xs text-[#92D2B5] uppercase tracking-wider font-bold mt-2">Submitted</div>
          </div>
          
          <div className="text-center pr-6 border-r border-white/20">
            <div className="text-3xl font-headline-md mb-1"><CountUp end={stats.approved} duration={1.5} /></div>
            <div className="text-xs text-[#92D2B5] uppercase tracking-wider font-bold mt-2">Approved</div>
          </div>
          
          <div className="text-center pr-4">
            <div className="text-3xl font-headline-md text-secondary-container mb-1"><CountUp end={stats.pending} duration={1.5} /></div>
            <div className="text-xs text-secondary-container uppercase tracking-wider font-bold mt-2">Pending</div>
          </div>
          
          <div className="relative w-20 h-20 flex items-center justify-center ml-4">
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle cx="40" cy="40" r="36" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="4" />
              <motion.circle 
                cx="40" cy="40" r="36" fill="none" stroke="#FFFFFF" strokeWidth="4" 
                strokeDasharray="226" 
                strokeDashoffset={226 - (226 * stats.overall) / 100}
                strokeLinecap="round" 
                initial={{ strokeDashoffset: 226 }}
                animate={{ strokeDashoffset: 226 - (226 * stats.overall) / 100 }}
                transition={{ duration: 2, ease: "easeOut" }}
              />
            </svg>
            <div className="text-center">
              <div className="text-base font-bold"><CountUp end={stats.overall} duration={2} />%</div>
              <div className="text-[8px] tracking-wider uppercase">Overall</div>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Stats Row */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-3 gap-6"
      >
        <div className="bg-white p-6 flex flex-col relative rounded-xl shadow-[0_2px_12px_rgba(26,26,24,0.08)]">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs text-outline font-bold uppercase tracking-wider">Goals Submitted</span>
            <span className="text-success-sage text-sm font-bold">↗</span>
          </div>
          <div className="text-4xl font-headline-md text-primary"><CountUp end={stats.submitted} /></div>
        </div>
        
        <div className="bg-white p-6 flex flex-col relative rounded-xl shadow-[0_2px_12px_rgba(26,26,24,0.08)]">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs text-outline font-bold uppercase tracking-wider">Approved</span>
            <span className="text-success-sage text-sm font-bold">✓</span>
          </div>
          <div className="text-4xl font-headline-md text-primary"><CountUp end={stats.approved} /></div>
        </div>
        
        <div className="bg-white p-6 flex flex-col relative rounded-xl shadow-[0_2px_12px_rgba(26,26,24,0.08)] overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1 bg-secondary-container"></div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs text-outline font-bold uppercase tracking-wider">Pending Check-in</span>
            <span className="text-secondary-container text-sm">📋</span>
          </div>
          <div className="text-4xl font-headline-md text-secondary-container"><CountUp end={0} /></div>
        </div>
      </motion.div>
      
      {/* Active Performance Goals Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="flex justify-between items-end mb-5">
          <div>
            <h2 className="font-headline-md text-headline-md text-on-surface mb-1">Active Performance Goals</h2>
            <p className="font-body-sm text-body-sm text-outline">Track and manage your strategic objectives</p>
          </div>
          <Link href="/goal-creation-form">
            <button className="bg-primary text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-primary-container transition-colors cursor-pointer">+ New Goal</button>
          </Link>
        </div>
        
        {goals.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-10 bg-white border border-dashed border-outline-variant rounded-xl flex flex-col items-center text-center mt-4"
          >
            <div className="w-20 h-16 bg-surface-container rounded-lg mb-6 flex items-center justify-center">
              <span className="text-2xl">🎯</span>
            </div>
            <h3 className="text-base font-semibold text-on-surface mb-2">Ready to expand your impact?</h3>
            <p className="text-sm text-outline max-w-md mb-6 leading-relaxed">Collaborate with your manager to define new strategic objectives for {activeCycle?.name}.</p>
            <Link href="/goal-creation-form">
              <button className="bg-transparent border border-primary text-primary rounded-md px-5 py-2 hover:bg-primary/5 font-medium transition-colors cursor-pointer">Create first goal</button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 gap-6">
            {goals.map((goal) => (
              <div key={goal.id} className="bg-white p-6 rounded-xl shadow-[0_2px_12px_rgba(26,26,24,0.08)] flex flex-col hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex justify-between items-start mb-3">
                  <span className={`text-xs font-bold uppercase tracking-wider ${
                    goal.status === 'approved' ? 'text-success-sage' : 'text-secondary-container'
                  }`}>
                    {goal.thrust_area}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-wide ${
                    goal.latestCheckin.status === 'On Track' ? 'bg-success-sage/10 text-success-sage' : 
                    goal.latestCheckin.status === 'Completed' ? 'bg-primary/10 text-primary' :
                    'bg-black/5 text-outline'
                  }`}>
                    {goal.latestCheckin.status}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-on-surface mb-6">{goal.title}</h3>
                
                <div className="mb-2 flex justify-between">
                  <span className="text-xs text-outline font-medium">Progress</span>
                  <span className="text-xs font-semibold">{Math.round(goal.progressPercent)}%</span>
                </div>
                <div className="w-full h-1.5 bg-surface-container rounded-full mb-8">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${goal.progressPercent}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className={`h-full rounded-full ${
                      goal.progressPercent > 75 ? 'bg-success-sage' : 
                      goal.progressPercent > 25 ? 'bg-primary' : 'bg-secondary-container'
                    }`}
                  ></motion.div>
                </div>
                
                <div className="flex justify-between items-end mt-auto pt-4 border-t border-surface-container">
                  <div>
                    <div className="text-[10px] text-outline font-bold tracking-wider uppercase mb-1">WEIGHTING</div>
                    <div className="text-base font-headline-md text-on-surface">{goal.weightage}%</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-outline font-bold tracking-wider uppercase mb-1">STATUS</div>
                    <div className="text-sm font-semibold capitalize text-on-surface">{goal.status}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
      
    </div>
  );
}
