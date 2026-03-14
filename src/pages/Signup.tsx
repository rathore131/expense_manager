import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Loader2, ShieldCheck, Mail, Lock, User, CheckCircle2, XCircle } from "lucide-react";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Password Validation State
  const [pwdValidations, setPwdValidations] = useState({
    length: false,
    number: false,
    uppercase: false,
  });

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setPwdValidations({
      length: password.length >= 8,
      number: /\d/.test(password),
      uppercase: /[A-Z]/.test(password),
    });
  }, [password]);

  const allRulesMet = pwdValidations.length && pwdValidations.number && pwdValidations.uppercase;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!allRulesMet) {
      setError("Please ensure your password meets all requirements.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    const result = await signup(name, email, password);
    setSubmitting(false);

    if (result.error) {
      setError(result.error);
    } else {
      // Redirect to the OTP Verification Page
      navigate("/verify-email", { state: { email, devOtp: result.otp } });
    }
  };

  return (
    <AuthLayout>
      <div className="flex flex-col space-y-6 w-full animate-in fade-in zoom-in-95 duration-500">
        
        <div className="flex flex-col space-y-2 text-center sm:text-left">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-display">
            Create Your Account
          </h1>
          <p className="text-sm text-slate-500">
            Start tracking your finances with a private and secure expense tracker.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name" className="text-slate-700">Full Name</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User className="h-4 w-4" />
              </div>
              <Input
                id="name"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={submitting}
                className="pl-10 h-11 rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 bg-slate-50/50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-700">Email Address</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail className="h-4 w-4" />
              </div>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={submitting}
                className="pl-10 h-11 rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 bg-slate-50/50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-700">Password</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="h-4 w-4" />
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Create a secure password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={submitting}
                className="pl-10 h-11 rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 bg-slate-50/50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-slate-700">Confirm Password</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="h-4 w-4" />
              </div>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={submitting}
                className={`pl-10 h-11 rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 bg-slate-50/50 ${
                  confirmPassword && password !== confirmPassword ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                }`}
              />
            </div>
          </div>

          {/* Live Password Rules */}
          <div className="bg-slate-50 rounded-lg p-3 text-sm space-y-2 border border-slate-100">
            <p className="text-slate-600 font-medium text-xs">Password must contain:</p>
            <ul className="space-y-1">
              <li className={`flex items-center gap-2 text-xs ${pwdValidations.length ? 'text-emerald-600' : 'text-slate-500'}`}>
                {pwdValidations.length ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                Minimum 8 characters
              </li>
              <li className={`flex items-center gap-2 text-xs ${pwdValidations.number ? 'text-emerald-600' : 'text-slate-500'}`}>
                {pwdValidations.number ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                One number
              </li>
              <li className={`flex items-center gap-2 text-xs ${pwdValidations.uppercase ? 'text-emerald-600' : 'text-slate-500'}`}>
                {pwdValidations.uppercase ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                One uppercase letter
              </li>
            </ul>
          </div>

          <Button 
            type="submit" 
            className="w-full h-11 text-base font-medium rounded-xl bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg hover:shadow-indigo-600/20 transition-all hover:-translate-y-0.5 active:translate-y-0 mt-2"
            disabled={submitting || !allRulesMet}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              "Create Account"
            )}
          </Button>

          <p className="text-xs text-center text-slate-500 px-4 mt-4">
            By creating an account you agree to our Terms and Privacy Policy.
          </p>
        </form>

        <div className="text-center pt-2 border-t border-slate-100">
          <p className="text-sm text-slate-600">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500 hover:underline transition-all">
              Log In
            </Link>
          </p>
        </div>
        
      </div>
    </AuthLayout>
  );
}
