import { Link } from "react-router-dom";
import { 
  ArrowRight, Shield, Zap, BarChart3, Download, Lock, CheckCircle2,
  PieChart, LayoutDashboard, Wallet, CreditCard, ChevronRight
} from "lucide-react";
import dashboardPreviewImg from "@/assets/dashboard-preview.png";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-500/30 font-sans overflow-x-hidden">
      
      {/* 1. Navigation Bar */}
      <nav className="fixed top-0 inset-x-0 z-50 transition-all border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center gap-2">
              <div className="bg-indigo-600 p-1.5 rounded-lg">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-xl tracking-tight text-slate-900">
                ExpenseHub
              </span>
            </div>
            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Features</a>
              <a href="#dashboard" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Dashboard</a>
              <a href="#security" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Security</a>
              <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Sign In</Link>
              <Link to="/signup" className="text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-full transition-all hover:scale-105 active:scale-95 shadow-lg shadow-indigo-600/20">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Abstract Background Glows */}
        <div className="absolute top-0 inset-x-0 h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-indigo-400/20 blur-[120px]" />
          <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] rounded-full bg-blue-300/20 blur-[120px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 border border-indigo-200 text-indigo-700 text-sm font-medium mb-6 animate-fade-in">
                <Shield className="w-4 h-4" />
                <span>100% Local Privacy</span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-display font-bold text-slate-900 leading-[1.1] tracking-tight mb-6">
                Take Control of Your Money <br className="hidden lg:block"/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">
                  Without Compromising Privacy
                </span>
              </h1>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed max-w-xl">
                ExpenseHub is a modern personal finance tracker that lets you monitor spending, manage budgets, and visualize your financial life — all while keeping your data fully under your control.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/signup" className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-full font-medium text-lg transition-all hover:-translate-y-1 hover:shadow-xl active:scale-95">
                  Get Started Free
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <a href="#dashboard" className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 px-8 py-4 rounded-full font-medium text-lg transition-all active:scale-95 border border-slate-200 shadow-sm">
                  View Demo
                </a>
              </div>
            </div>

            {/* Right Visual Hover Mockup */}
            <div className="relative mt-10 lg:mt-0 perspective-1000">
              <div className="relative rounded-2xl border border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-2xl p-2 transform-gpu lg:rotate-y-[-5deg] lg:rotate-x-[5deg] transition-transform duration-700 hover:rotate-0">
                <img 
                  src={dashboardPreviewImg} 
                  alt="ExpenseHub Dashboard Preview" 
                  className="w-full h-auto rounded-xl shadow-inner mix-blend-multiply opacity-0 transition-opacity duration-300"
                  onLoad={(e) => (e.currentTarget.style.opacity = '1')}
                  onError={(e) => {
                    // Fallback gradient block if image isn't available yet
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement!.innerHTML = `
                      <div class="h-64 sm:h-96 w-full rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 flex items-center justify-center">
                        <span class="text-indigo-300 font-medium">Dashboard Preview</span>
                      </div>
                    `;
                  }}
                />
                
                {/* Floating Elements Animation */}
                <div className="absolute -right-8 top-16 bg-white border border-slate-100 rounded-xl p-3 shadow-xl flex items-center gap-3 animate-bounce" style={{ animationDuration: '4s' }}>
                  <div className="bg-rose-100 p-2 rounded-lg"><PieChart className="w-5 h-5 text-rose-600" /></div>
                  <div>
                    <div className="text-sm font-medium text-slate-900">Groceries</div>
                    <div className="text-xs text-rose-600 font-semibold">-₹4,500</div>
                  </div>
                </div>
                
                <div className="absolute -left-6 bottom-16 bg-white border border-slate-100 rounded-xl p-3 shadow-xl flex items-center gap-3 animate-bounce" style={{ animationDuration: '5s', animationDelay: '1s' }}>
                  <div className="bg-emerald-100 p-2 rounded-lg"><CreditCard className="w-5 h-5 text-emerald-600" /></div>
                  <div>
                    <div className="text-sm font-medium text-slate-900">Salary</div>
                    <div className="text-xs text-emerald-600 font-semibold">+₹85,000</div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Trust Section */}
      <section className="border-y border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-wrap justify-center gap-8 lg:gap-16">
            <div className="flex items-center gap-2 text-slate-600 font-medium">
              <Lock className="w-5 h-5 text-indigo-600" /> Privacy First
            </div>
            <div className="flex items-center gap-2 text-slate-600 font-medium">
              <Zap className="w-5 h-5 text-indigo-600" /> Fast Local Database
            </div>
            <div className="flex items-center gap-2 text-slate-600 font-medium">
              <BarChart3 className="w-5 h-5 text-indigo-600" /> Real-Time Analytics
            </div>
            <div className="flex items-center gap-2 text-slate-600 font-medium">
              <Download className="w-5 h-5 text-indigo-600" /> Export Anytime
            </div>
          </div>
        </div>
      </section>

      {/* 4. Features Section */}
      <section id="features" className="py-24 relative bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-4">Powerful Tools for Personal Finance</h2>
            <p className="text-slate-600 text-lg">Everything you need to gain absolute clarity over your financial life, without the sacrifice of your personal data.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-8 hover:shadow-md transition-shadow group">
              <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-6 text-indigo-600 group-hover:scale-110 transition-transform">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Track Every Expense</h3>
              <p className="text-slate-600 leading-relaxed">Log income and expenses quickly with intuitive transaction entry. Always know exactly where every Rupee goes.</p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-8 hover:shadow-md transition-shadow group">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6 text-blue-600 group-hover:scale-110 transition-transform">
                <PieChart className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Visual Financial Insights</h3>
              <p className="text-slate-600 leading-relaxed">Understand your spending through beautiful, interactive charts and reports that update in real-time.</p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-8 hover:shadow-md transition-shadow group">
              <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center mb-6 text-rose-600 group-hover:scale-110 transition-transform">
                <LayoutDashboard className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Category Budget Control</h3>
              <p className="text-slate-600 leading-relaxed">Set specific limits for categories like Dining or Shopping. Visual progress bars keep you within your spending goals.</p>
            </div>
            
            {/* Feature 4 */}
            <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-8 hover:shadow-md transition-shadow group">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-6 text-emerald-600 group-hover:scale-110 transition-transform">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Full Privacy</h3>
              <p className="text-slate-600 leading-relaxed">Your financial data lives on your own server using a local SQLite database. No third-party cloud data harvesting.</p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-8 hover:shadow-md transition-shadow group">
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mb-6 text-purple-600 group-hover:scale-110 transition-transform">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Secure Authentication</h3>
              <p className="text-slate-600 leading-relaxed">Protected with industry-standard bcrypt password hashing, secure JWT sessions, and 6-digit OTP email verification.</p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-8 hover:shadow-md transition-shadow group">
              <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mb-6 text-amber-600 group-hover:scale-110 transition-transform">
                <Download className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Export Your Data</h3>
              <p className="text-slate-600 leading-relaxed">Your data isn't trapped. Download your entire financial history as a CSV file anytime for external use.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Security & Privacy Deep Dive */}
      <section id="security" className="py-24 bg-white border-y border-slate-200 relative overflow-hidden">
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-indigo-100 rounded-full blur-[100px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-6">Your Data Belongs To You</h2>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                Most personal finance apps are free because they analyze and sell your spending habits. ExpenseHub is built fundamentally differently.
              </p>
              <ul className="space-y-4">
                {[
                  "Local SQLite database stored entirely on your server",
                  "No third-party cloud data providers (AWS/GCP/Supabase)",
                  "No advertising or tracking scripts",
                  "Secure one-time-password (OTP) email verification"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                    <span className="text-slate-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative flex justify-center lg:justify-end">
              <div className="w-72 h-72 sm:w-96 sm:h-96 relative">
                 <div className="absolute inset-0 bg-gradient-to-tr from-indigo-200 to-blue-200 rounded-full blur-2xl" />
                 <div className="relative w-full h-full bg-white border border-slate-200 rounded-full shadow-2xl flex items-center justify-center">
                   <Shield className="w-32 h-32 text-indigo-600" strokeWidth={1} />
                   <Lock className="absolute w-12 h-12 text-blue-500 bottom-1/4 right-1/4" />
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Dashboard Preview Banner */}
      <section id="dashboard" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-4">See Your Finances Clearly</h2>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto mb-16">The ExpenseHub dashboard shows real-time financial insights so you always know exactly where your money goes.</p>
          
          <div className="max-w-5xl mx-auto rounded-xl p-1 shadow-2xl relative overflow-hidden group bg-white border border-slate-200">
            <img 
              src={dashboardPreviewImg} 
              alt="ExpenseHub Dashboard" 
              className="w-full h-auto rounded-lg shadow-sm block"
            />
          </div>
        </div>
      </section>

      {/* 7. Call To Action */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-indigo-50" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-200/50 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-slate-900 mb-6">Start Managing Your Money Today</h2>
          <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
            No ads. No trackers. No hidden fees.<br/> Just a powerful tool to understand your finances.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/signup" className="inline-flex items-center justify-center bg-indigo-600 text-white hover:bg-indigo-700 px-8 py-4 rounded-full font-bold text-lg transition-all hover:scale-105 active:scale-95 shadow-xl shadow-indigo-600/20">
              Create Free Account
            </Link>
          </div>
          <div className="mt-8 text-slate-500 text-sm flex items-center justify-center gap-6">
            <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500"/> No credit card</span>
            <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500"/> 1 minute setup</span>
          </div>
        </div>
      </section>

      {/* 8. Footer */}
      <footer className="border-t border-slate-200 bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Wallet className="w-5 h-5 text-indigo-600" />
                <span className="font-display font-bold text-lg text-slate-900">ExpenseHub</span>
              </div>
              <p className="text-slate-500 text-sm max-w-xs">
                The privacy-first personal finance tracker that lives on your server.
              </p>
            </div>
            <div>
              <h4 className="text-slate-900 font-medium mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><a href="#features" className="hover:text-indigo-600 transition-colors">Features</a></li>
                <li><a href="#dashboard" className="hover:text-indigo-600 transition-colors">Dashboard</a></li>
                <li><a href="#security" className="hover:text-indigo-600 transition-colors">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-slate-900 font-medium mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">GitHub</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">API</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between text-sm text-slate-400">
            <p>© 2026 ExpenseHub — Privacy First Personal Finance</p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <a href="#" className="hover:text-slate-600 transition-colors">Privacy</a>
              <a href="#" className="hover:text-slate-600 transition-colors">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
