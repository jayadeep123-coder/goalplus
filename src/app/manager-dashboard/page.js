"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CountUp from "react-countup";

export default function ManagerDashboardPage() {
  const { user, profile } = useAuth();
  const [teamGoals, setTeamGoals] = useState([]);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState(null);
  
  const [editingGoalId, setEditingGoalId] = useState(null);
  const [editForm, setEditForm] = useState({ target_value: '', weightage: '' });
  const [commentForm, setCommentForm] = useState({});
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    // If the auth context is still figuring out if we are logged in, just wait.
    // But if we are definitely NOT logged in, redirect to login!
    if (user === null) {
       const timer = setTimeout(() => {
           if (!user) router.push('/login');
       }, 1500);
       return () => clearTimeout(timer);
    }
    
    if (user) {
      const fetchTeamGoals = async () => {
        // Fetch goals with employee profiles
        const { data: goalsData, error } = await supabase
          .from('goals')
          .select(`
            *,
            profiles (full_name),
            checkins (*)
          `);
          
        if (error) {
          setDbError(error.message);
        }
          
        if (goalsData) {
          // Filter out manager's own goals to see only team goals
          const filtered = goalsData.filter(g => g.employee_id !== user.id);
          setTeamGoals(filtered);
        }
        setLoading(false);
      };
      
      fetchTeamGoals();
    }
  }, [user, router]);

  const handleApprove = async (goalId) => {
    setActionLoading(prev => ({ ...prev, [goalId]: 'approving' }));
    const { error } = await supabase
      .from('goals')
      .update({ status: 'approved' })
      .eq('id', goalId);
      
    if (!error) {
      setTeamGoals(prev => prev.map(g => g.id === goalId ? { ...g, status: 'approved' } : g));
    } else {
      alert("Error approving goal: " + error.message);
    }
    setActionLoading(prev => ({ ...prev, [goalId]: null }));
  };

  const handleReject = async (goalId) => {
    setActionLoading(prev => ({ ...prev, [goalId]: 'rejecting' }));
    const { error } = await supabase
      .from('goals')
      .update({ status: 'needs revision' })
      .eq('id', goalId);
      
    if (!error) {
      setTeamGoals(prev => prev.map(g => g.id === goalId ? { ...g, status: 'needs revision' } : g));
    } else {
      alert("Error rejecting goal: " + error.message);
    }
    setActionLoading(prev => ({ ...prev, [goalId]: null }));
  };

  const handleEditClick = (goal) => {
    setEditingGoalId(goal.id);
    setEditForm({ target_value: goal.target_value, weightage: goal.weightage });
  };

  const handleSaveEdit = async (goalId) => {
    const { error } = await supabase
      .from('goals')
      .update({ target_value: editForm.target_value, weightage: editForm.weightage })
      .eq('id', goalId);
      
    if (!error) {
      setTeamGoals(prev => prev.map(g => g.id === goalId ? { ...g, target_value: editForm.target_value, weightage: editForm.weightage } : g));
      setEditingGoalId(null);
    } else {
      alert("Error saving goal: " + error.message);
    }
  };

  const handleSaveComment = async (checkinId, goalId) => {
    const comment = commentForm[checkinId];
    if (!comment) return;
    
    const { error } = await supabase
      .from('checkins')
      .update({ manager_comment: comment })
      .eq('id', checkinId);
      
    if (!error) {
      setTeamGoals(prev => prev.map(g => {
        if (g.id === goalId) {
          return {
            ...g,
            checkins: g.checkins.map(c => c.id === checkinId ? { ...c, manager_comment: comment } : c)
          };
        }
        return g;
      }));
      alert("Comment saved successfully!");
    } else {
      alert("Error saving comment: " + error.message);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen text-primary font-bold">Loading Manager Dashboard...</div>;
  }

  // Use toLowerCase() to make the check bulletproof against database capitalization!
  const pendingGoals = teamGoals.filter(g => g.status?.toLowerCase() === 'draft' || g.status?.toLowerCase() === 'pending');
  const approvedGoals = teamGoals.filter(g => g.status?.toLowerCase() === 'approved');
  const goalsWithCheckins = approvedGoals.filter(g => g.checkins && g.checkins.length > 0);

  return (
    <div className="bg-page-base text-on-surface min-h-screen">
      
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-lg h-16 bg-surface-white shadow-[0_2px_12px_rgba(26,26,24,0.08)]">
        <div className="flex items-center gap-8">
          <span className="text-headline-md font-headline-md font-bold text-primary">GoalPulse</span>
          <div className="hidden md:flex gap-6">
            <Link className="text-body-charcoal font-medium hover:text-primary transition-colors duration-200" href="/dashboard">Dashboard</Link>
            <Link className="text-primary font-bold border-b-2 border-primary" href="/manager-dashboard">Team</Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-bold text-sm">{profile?.full_name} (Manager)</span>
          <button className="material-symbols-outlined text-body-charcoal hover:text-primary p-2 transition-all">notifications</button>
          <button onClick={handleLogout} className="flex items-center gap-1 text-red-600 hover:text-red-700 font-bold ml-2 px-3 py-1 rounded hover:bg-red-50 transition-all">
            <span className="material-symbols-outlined text-sm">logout</span>
            Logout
          </button>
        </div>
      </nav>

      <aside className="fixed left-0 top-0 h-screen w-[220px] z-40 flex flex-col pt-16 bg-page-base border-r border-outline-variant hidden md:flex">
        <div className="flex flex-col flex-grow py-8 overflow-y-auto">
          <div className="px-6 mb-8">
            <h2 className="text-headline-sm font-headline-sm font-black text-primary">GoalPulse</h2>
            <p className="text-label-sm text-body-charcoal opacity-70">Strategic Tracking</p>
          </div>
          <nav className="flex flex-col gap-1">
            <Link className="flex items-center gap-3 text-body-charcoal px-4 py-3 hover:bg-surface-container-high transition-all" href="/dashboard">
              <span className="material-symbols-outlined" data-icon="dashboard">dashboard</span>
              <span className="font-label-md text-label-md">Dashboard</span>
            </Link>
            <Link className="flex items-center gap-3 bg-primary-fixed-dim/20 text-primary border-l-4 border-primary px-4 py-3 font-bold translate-x-1 transition-transform duration-200" href="/manager-dashboard">
              <span className="material-symbols-outlined" data-icon="groups">groups</span>
              <span className="font-label-md text-label-md">Team Goals</span>
            </Link>
          </nav>
        </div>
      </aside>

      <main className="md:pl-[220px] pt-16 min-h-screen">
        <div className="p-margin-mobile md:p-margin-desktop max-w-[1400px] mx-auto">
          
          {dbError && (
            <div className="bg-red-50 text-red-600 border border-red-200 p-4 rounded-xl mb-6 font-bold shadow-sm">
              🚨 Supabase Error: {dbError}
            </div>
          )}

          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-xl gap-4">
            <div>
              <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2">Team Performance</h1>
              <p className="text-body-lg text-body-charcoal max-w-2xl">Review quarterly progress and approve strategic targets for your direct reports.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter mb-xl">
            <div className="md:col-span-8 bg-surface-white rounded-xl p-md shadow-[0_2px_12px_rgba(26,26,24,0.08)] flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-label-sm font-label-sm text-primary uppercase tracking-wider">Overall Team Velocity</span>
                  <h3 className="font-headline-md text-headline-md mt-1">
                    <CountUp end={approvedGoals.length} /> Goals Approved
                  </h3>
                </div>
              </div>
              <div className="mt-8 h-24 flex items-end gap-2">
                <div className="flex-grow bg-primary/10 rounded-sm h-12"></div>
                <div className="flex-grow bg-primary/10 rounded-sm h-16"></div>
                <div className="flex-grow bg-primary/10 rounded-sm h-20"></div>
                <div className="flex-grow bg-primary/20 rounded-sm h-14"></div>
                <div className="flex-grow bg-primary rounded-sm h-24"></div>
                <div className="flex-grow bg-primary rounded-sm h-20"></div>
              </div>
            </div>
            <div className="md:col-span-4 bg-primary text-surface-white rounded-xl p-md shadow-[0_2px_12px_rgba(26,26,24,0.12)]">
              <div className="flex flex-col h-full justify-between">
                <div>
                  <span className="material-symbols-outlined text-secondary-container" >bolt</span>
                  <h3 className="font-headline-md text-headline-md mt-2">
                    <CountUp end={pendingGoals.length} /> Pending Approvals
                  </h3>
                  <p className="text-body-sm opacity-80 mt-2">New goal updates from your team require your immediate review to maintain alignment.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-surface-white rounded-xl shadow-[0_2px_12px_rgba(26,26,24,0.08)] overflow-hidden">
            <div className="p-md border-b border-surface-container">
              <h3 className="font-headline-md text-headline-md">Employee Goals Awaiting Approval</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-surface-container-low">
                    <th className="px-md py-4 text-label-sm font-label-sm uppercase text-body-charcoal">Employee</th>
                    <th className="px-md py-4 text-label-sm font-label-sm uppercase text-body-charcoal">Goal Title</th>
                    <th className="px-md py-4 text-label-sm font-label-sm uppercase text-body-charcoal">Thrust Area</th>
                    <th className="px-md py-4 text-label-sm font-label-sm uppercase text-body-charcoal">Target</th>
                    <th className="px-md py-4 text-label-sm font-label-sm uppercase text-body-charcoal">Weightage</th>
                    <th className="px-md py-4 text-label-sm font-label-sm uppercase text-body-charcoal">Status</th>
                    <th className="px-md py-4 text-label-sm font-label-sm uppercase text-body-charcoal text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container">
                  {pendingGoals.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center py-10 font-bold text-outline">No goals awaiting approval. Great job!</td>
                    </tr>
                  )}
                  {pendingGoals.map((goal) => (
                    <tr key={goal.id} className="hover:bg-primary/5 transition-colors group">
                      <td className="px-md py-4">
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="font-bold text-on-surface">{goal.profiles?.full_name || "Unknown Employee"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-md py-4 font-label-md text-label-md max-w-[250px] truncate">{goal.title}</td>
                      <td className="px-md py-4 font-label-md text-label-md">{goal.thrust_area}</td>
                      
                      {editingGoalId === goal.id ? (
                        <>
                          <td className="px-md py-4">
                            <input type="number" className="w-24 border rounded px-2 py-1" value={editForm.target_value} onChange={e => setEditForm({...editForm, target_value: e.target.value})} />
                          </td>
                          <td className="px-md py-4">
                            <input type="number" className="w-16 border rounded px-2 py-1" value={editForm.weightage} onChange={e => setEditForm({...editForm, weightage: e.target.value})} />%
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-md py-4 font-label-md text-label-md">{goal.target_value} {goal.uom_type === 'percentage' ? '%' : ''}</td>
                          <td className="px-md py-4 font-label-md text-label-md font-bold">{goal.weightage}%</td>
                        </>
                      )}

                      <td className="px-md py-4">
                        <span className="bg-secondary-container/20 text-secondary px-3 py-1 rounded-full text-label-sm font-bold">{goal.status}</span>
                      </td>
                      <td className="px-md py-4 text-right flex justify-end gap-2">
                        {editingGoalId === goal.id ? (
                          <>
                            <button onClick={() => setEditingGoalId(null)} className="px-3 py-1 text-body-charcoal bg-surface-container hover:bg-surface-variant font-bold rounded">Cancel</button>
                            <button onClick={() => handleSaveEdit(goal.id)} className="px-4 py-1 text-white bg-primary hover:bg-primary/90 font-bold rounded">Save</button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => handleEditClick(goal)} disabled={!!actionLoading[goal.id]} className="px-3 py-1 text-primary bg-primary/10 hover:bg-primary/20 font-bold rounded disabled:opacity-50">Edit</button>
                            <button onClick={() => handleReject(goal.id)} disabled={!!actionLoading[goal.id]} className="px-3 py-1 text-red-600 bg-red-50 hover:bg-red-100 font-bold rounded disabled:opacity-50 transition-all">
                              {actionLoading[goal.id] === 'rejecting' ? '⏳ Rejecting...' : 'Reject'}
                            </button>
                            <button onClick={() => handleApprove(goal.id)} disabled={!!actionLoading[goal.id]} className="px-4 py-1 text-white bg-primary hover:bg-primary/90 font-bold rounded disabled:opacity-50 transition-all">
                              {actionLoading[goal.id] === 'approving' ? '⏳ Approving...' : 'Approve'}
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          
          <div className="bg-surface-white rounded-xl shadow-[0_2px_12px_rgba(26,26,24,0.08)] overflow-hidden mt-10">
            <div className="p-md border-b border-surface-container">
              <h3 className="font-headline-md text-headline-md">Approved Goals</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-surface-container-low">
                    <th className="px-md py-4 text-label-sm font-label-sm uppercase text-body-charcoal">Employee</th>
                    <th className="px-md py-4 text-label-sm font-label-sm uppercase text-body-charcoal">Goal Title</th>
                    <th className="px-md py-4 text-label-sm font-label-sm uppercase text-body-charcoal">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container">
                  {approvedGoals.map((goal) => (
                    <tr key={goal.id} className="hover:bg-primary/5 transition-colors">
                      <td className="px-md py-4 font-bold">{goal.profiles?.full_name || "Unknown Employee"}</td>
                      <td className="px-md py-4">{goal.title}</td>
                      <td className="px-md py-4">
                        <span className="bg-success-sage/10 text-success-sage px-3 py-1 rounded-full text-label-sm font-bold">Approved</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-surface-white rounded-xl shadow-[0_2px_12px_rgba(26,26,24,0.08)] overflow-hidden mt-10">
            <div className="p-md border-b border-surface-container flex justify-between items-center">
              <h3 className="font-headline-md text-headline-md">Quarterly Check-ins Review</h3>
            </div>
            <div className="p-md flex flex-col gap-6">
              {goalsWithCheckins.length === 0 ? (
                <div className="text-center py-6 text-outline font-bold">No check-ins submitted by the team yet.</div>
              ) : (
                goalsWithCheckins.map(goal => (
                  <div key={goal.id} className="border border-surface-variant rounded-xl p-6 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-bold text-lg text-primary">{goal.title}</h4>
                        <p className="text-sm text-body-charcoal">Employee: <span className="font-bold">{goal.profiles?.full_name}</span> | Target: {goal.target_value} {goal.uom_type}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {goal.checkins.map(checkin => (
                        <div key={checkin.id} className="bg-surface-container-low p-4 rounded-lg flex flex-col md:flex-row gap-4 border border-outline-variant/30">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="bg-secondary-container text-on-secondary-fixed px-2 py-0.5 rounded text-xs font-bold">{checkin.quarter}</span>
                              <span className="text-sm font-bold">Achievement: {checkin.actual_value}</span>
                              <span className="text-xs bg-surface-variant px-2 py-0.5 rounded-full">{checkin.status}</span>
                            </div>
                            
                            <div className="mt-4">
                              <label className="text-xs font-bold text-outline uppercase tracking-wider mb-1 block">Manager Comment</label>
                              {checkin.manager_comment ? (
                                <p className="text-sm text-body-charcoal bg-surface-white p-3 rounded border border-surface-variant">{checkin.manager_comment}</p>
                              ) : (
                                <div className="flex gap-2">
                                  <input 
                                    type="text" 
                                    placeholder="Add structured feedback..." 
                                    className="flex-1 text-sm border border-outline-variant rounded px-3 py-2"
                                    value={commentForm[checkin.id] || ''}
                                    onChange={(e) => setCommentForm({...commentForm, [checkin.id]: e.target.value})}
                                  />
                                  <button onClick={() => handleSaveComment(checkin.id, goal.id)} className="bg-primary text-white px-4 py-2 rounded text-sm font-bold">Save</button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </main>

    </div>
  );
}