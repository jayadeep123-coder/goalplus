"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // alert("Step 1: Attempting to sign in with Supabase...");
      const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;
      
      // alert("Step 2: Sign in successful! Fetching profile for user ID: " + user.id);

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("Profile fetch error:", profileError);
        // It's fine if the profile is missing for the demo, just force route them!
      }
      // Force a hard browser redirect to bypass ANY Next.js routing bugs!
      if (profile?.role === 'admin') {
        window.location.href = "/admin-hr-panel";
      } else if (profile?.role === 'manager' || email.toLowerCase() === 'manager@goalpulse.com') {
        window.location.href = "/manager-dashboard";
      } else {
        window.location.href = "/dashboard";
      }
    } catch (err) {
      console.error("LOGIN ERROR:", err);
      setError(err.message || "Failed to login. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-page-base text-on-surface min-h-screen flex items-center justify-center p-sm md:p-lg font-body-md">
      
      <main className="w-full max-w-5xl flex flex-col md:flex-row bg-surface-white rounded-xl shadow-[0_2px_12px_rgba(26,26,24,0.08)] overflow-hidden min-h-[600px]">

        <section className="hidden md:flex md:w-1/2 bg-primary-container relative overflow-hidden items-center justify-center p-xl">
          <div className="relative w-full aspect-square max-w-[320px]">
            <div className="absolute inset-0 rounded-full border-[20px] border-secondary-container opacity-90 mix-blend-screen translate-x-12 translate-y-8"></div>
            <div className="absolute inset-0 rounded-full border-[20px] border-on-primary-container opacity-80 -translate-x-8 -translate-y-4"></div>
            <div className="absolute inset-0 rounded-full bg-primary opacity-30 blur-2xl"></div>

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-surface-white text-center">
              <p className="font-headline-lg text-headline-lg leading-tight">Elevating<br />Strategic<br />Focus</p>
            </div>
          </div>

          <div className="absolute bottom-12 left-12 h-1 w-24 bg-secondary-container rounded-full"></div>
          <div className="absolute top-12 right-12 h-12 w-12 border-2 border-on-tertiary-container rounded-full opacity-40"></div>
        </section>

        <section className="w-full md:w-1/2 p-lg md:p-xl flex flex-col justify-center">
          <div className="max-w-sm mx-auto w-full space-y-lg">

            <div className="space-y-sm">
              <img alt="GoalPulse Logo" className="h-10 w-auto" src="data:image/png;base64,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" />
              <p className="font-body-lg text-body-lg text-body-charcoal">Your goals. Your growth.</p>
            </div>

            <form className="space-y-md" onSubmit={handleLogin}>
              <div className="space-y-xs">
                <label className="font-label-md text-label-md text-on-surface block" htmlFor="email">Work Email</label>
                <input 
                  className="w-full px-sm py-3 rounded-lg border border-outline-variant bg-surface-white focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none text-body-md" 
                  id="email" 
                  placeholder="name@company.com" 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-xs">
                <div className="flex justify-between items-center">
                  <label className="font-label-md text-label-md text-on-surface block" htmlFor="password">Password</label>
                  <a className="font-label-sm text-label-sm text-primary hover:underline transition-all" href="#">Forgot password?</a>
                </div>
                <div className="relative">
                  <input 
                    className="w-full px-sm py-3 rounded-lg border border-outline-variant bg-surface-white focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none text-body-md" 
                    id="password" 
                    placeholder="••••••••" 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors" type="button">
                    <span className="material-symbols-outlined text-md">visibility</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary" id="remember" type="checkbox" />
                <label className="font-label-sm text-label-sm text-body-charcoal" htmlFor="remember">Keep me signed in for 30 days</label>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium">
                  {error}
                </div>
              )}

              <button disabled={loading} className="w-full bg-primary text-surface-white py-4 px-lg font-bold text-body-md rounded-lg shadow-sm hover:shadow-md hover:bg-tertiary-container active:scale-[0.98] transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed" type="submit">
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <div className="relative flex items-center py-4">
              <div className="flex-grow border-t border-outline-variant"></div>
              <span className="flex-shrink mx-4 font-label-sm text-label-sm text-outline">OR</span>
              <div className="flex-grow border-t border-outline-variant"></div>
            </div>

            <button type="button" onClick={handleLogin} className="w-full bg-secondary-container text-on-secondary-fixed py-3 px-lg font-bold text-label-md rounded-full flex items-center justify-center gap-2 border border-secondary transition-all hover:bg-secondary-fixed hover:shadow-sm active:scale-[0.98] cursor-pointer">
              <span className="material-symbols-outlined">key</span>
              Sign in with SSO
            </button>

            <footer className="pt-md text-center">
              <p className="font-label-sm text-label-sm text-body-charcoal">
                New to GoalPulse? 
                <a className="text-primary font-bold hover:underline" href="#">Request a Demo</a>
              </p>
            </footer>

          </div>
        </section>
      </main>

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 md:hidden">
        <p className="font-label-sm text-label-sm text-outline">© 2024 GoalPulse Strategic Tracking</p>
      </div>

    </div>
  );
}