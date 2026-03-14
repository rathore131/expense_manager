import { Link } from "react-router-dom";
import { Wallet, CheckCircle2, LayoutDashboard, PieChart, CreditCard, Banknote } from "lucide-react";
import dashboardPreviewImg from "@/assets/dashboard-preview.png";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full flex bg-slate-50 relative overflow-hidden">
      {/* Left Side: Brand Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col bg-slate-900 overflow-hidden">
        {/* Abstract Background Gradient/Shapes */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-slate-900 to-indigo-950/80 z-0"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/20 blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-cyan-600/10 blur-[120px] pointer-events-none"></div>

        {/* Brand Content */}
        <div className="relative z-10 flex-1 flex flex-col pt-12 px-12 xl:px-20">
          <Link to="/" className="flex items-center gap-3 w-max">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 shadow-lg shadow-indigo-600/30">
              <Wallet className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white drop-shadow-sm">ExpenseHub</span>
          </Link>

          <div className="mt-20">
            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight font-display">
              Track your money with clarity and privacy.
            </h1>
            
            <ul className="mt-10 space-y-5">
              {[
                "Track income and expenses easily",
                "Visual budget insights",
                "Privacy-first financial tracking"
              ].map((benefit, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span className="text-lg">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Graphical Mockup Display */}
          <div className="mt-auto relative w-full h-[320px] translate-y-12 shrink-0">
            {/* Main Mockup Image */}
            <div className="absolute top-0 left-0 right-[-10%] rounded-t-2xl border border-slate-700/50 bg-slate-800/80 backdrop-blur shadow-2xl overflow-hidden p-2">
              <img 
                src={dashboardPreviewImg} 
                alt="Dashboard Mockup" 
                className="w-full h-auto rounded-xl opacity-80 mix-blend-screen"
              />
            </div>

            {/* Floating Transactions */}
            <div className="absolute top-[30px] -left-6 bg-white border border-slate-100 rounded-xl p-3 shadow-2xl flex items-center gap-3 animate-float-slow z-20">
              <div className="bg-amber-100 p-2 rounded-lg"><CreditCard className="w-4 h-4 text-amber-600" /></div>
              <div>
                <div className="text-xs font-semibold text-slate-800">Coffee</div>
                <div className="text-xs font-medium text-slate-500">-₹185</div>
              </div>
            </div>

            <div className="absolute top-[110px] right-[10%] bg-white border border-slate-100 rounded-xl p-3 shadow-2xl flex items-center gap-3 animate-float-slower z-20">
              <div className="bg-emerald-100 p-2 rounded-lg"><Banknote className="w-4 h-4 text-emerald-600" /></div>
              <div>
                <div className="text-xs font-semibold text-slate-800">Groceries</div>
                <div className="text-xs font-medium text-slate-500">-₹2,450</div>
              </div>
            </div>
            
             <div className="absolute top-[180px] -left-2 bg-white border border-slate-100 rounded-xl p-3 shadow-2xl flex items-center gap-3 animate-float z-20">
              <div className="bg-blue-100 p-2 rounded-lg"><CreditCard className="w-4 h-4 text-blue-600" /></div>
              <div>
                <div className="text-xs font-semibold text-slate-800">Uber</div>
                <div className="text-xs font-medium text-slate-500">-₹450</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        {/* Mobile Logo */}
        <Link to="/" className="lg:hidden absolute top-6 left-6 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
            <Wallet className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">ExpenseHub</span>
        </Link>
        
        <div className="w-full max-w-[420px]">
          {children}
        </div>
      </div>
    </div>
  );
}
