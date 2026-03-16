import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Loader2, Mail, ShieldCheck, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  
  const { forgotPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    
    const result = await forgotPassword(email);
    
    if (result.error) {
      setErrorMessage(result.error);
      setStatus("error");
    } else {
      setStatus("success");
    }
  };

  return (
    <AuthLayout>
      <div className="flex flex-col space-y-6 w-full animate-in fade-in zoom-in-95 duration-500">
        
        <Link 
          to="/login"
          className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors mb-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>

        <div className="flex flex-col space-y-2 text-left">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-display">
            Forgot Password?
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            Enter your email address and we will send you a 6-digit reset code.
          </p>
        </div>

        {status === "success" ? (
          <div className="space-y-6 animate-in slide-in-from-bottom-4">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 flex flex-col items-center text-center space-y-3">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-emerald-900">Reset Code Sent</h3>
              <p className="text-sm text-emerald-700">
                If an account exists for <span className="font-medium text-emerald-900">{email}</span>, a reset code has been sent.
              </p>
              

            </div>

            <Button 
              asChild
              className="w-full h-12 text-base font-medium rounded-xl bg-indigo-600 hover:bg-indigo-700 shadow-md transition-all"
            >
              <Link to="/reset-password" state={{ email }}>
                Enter Reset Code
              </Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {status === "error" && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600 flex items-center gap-2 animate-in slide-in-from-top-2">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700">Email Address</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your account email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={status === "submitting"}
                  className="pl-10 h-12 rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 transition-all bg-slate-50/50"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-base font-medium rounded-xl bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg hover:shadow-indigo-600/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
              disabled={status === "submitting" || !email}
            >
              {status === "submitting" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Reset Code"
              )}
            </Button>

            <div className="text-center pt-2">
              <Link to="/login" className="text-sm font-semibold text-indigo-600 hover:text-indigo-500 hover:underline transition-all">
                Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </AuthLayout>
  );
}
