import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Loader2, ShieldCheck, Lock, CheckCircle2, XCircle } from "lucide-react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

export default function ResetPassword() {
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Password Validation State
  const [pwdValidations, setPwdValidations] = useState({
    length: false,
    number: false,
    uppercase: false,
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { email?: string } | null;
  const email = state?.email;

  useEffect(() => {
    if (!email) {
      navigate("/forgot-password");
    }
  }, [email, navigate]);

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
    if (!email) return;
    
    setError(null);

    if (otp.length !== 6) {
      setError("Please enter the 6-digit reset code.");
      return;
    }

    if (!allRulesMet) {
      setError("Please ensure your new password meets all requirements.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    const err = await resetPassword(email, otp, password);
    setSubmitting(false);

    if (err) {
      setError(err);
    } else {
      setSuccess(true);
      setTimeout(() => {
        navigate("/login", { state: { message: "Password successfully updated." } });
      }, 2500);
    }
  };

  if (!email) return null;

  return (
    <AuthLayout>
      <div className="flex flex-col space-y-6 w-full animate-in fade-in zoom-in-95 duration-500">
        
        <div className="flex flex-col space-y-2 text-left">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-display">
            Reset Your Password
          </h1>
          <p className="text-sm text-slate-500">
            Enter the reset code sent to <span className="font-medium text-slate-900">{email}</span> and your new password below.
          </p>
        </div>

        {success ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 flex flex-col items-center text-center space-y-4 animate-in zoom-in-95">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-lg font-semibold text-emerald-900">Password Updated!</h3>
            <p className="text-sm text-emerald-700">
              Your password has been successfully reset. Redirecting to login...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600 flex items-center gap-2 animate-in slide-in-from-top-2">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-3">
              <Label className="text-slate-700">6-Digit Reset Code</Label>
              <div className="flex justify-start">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={(value) => setOtp(value)}
                  disabled={submitting}
                >
                  <InputOTPGroup className="gap-2">
                    <InputOTPSlot index={0} className="w-10 h-10 sm:w-12 sm:h-12 text-lg font-semibold rounded-xl border-slate-200 shadow-sm" />
                    <InputOTPSlot index={1} className="w-10 h-10 sm:w-12 sm:h-12 text-lg font-semibold rounded-xl border-slate-200 shadow-sm" />
                    <InputOTPSlot index={2} className="w-10 h-10 sm:w-12 sm:h-12 text-lg font-semibold rounded-xl border-slate-200 shadow-sm" />
                    <InputOTPSlot index={3} className="w-10 h-10 sm:w-12 sm:h-12 text-lg font-semibold rounded-xl border-slate-200 shadow-sm" />
                    <InputOTPSlot index={4} className="w-10 h-10 sm:w-12 sm:h-12 text-lg font-semibold rounded-xl border-slate-200 shadow-sm" />
                    <InputOTPSlot index={5} className="w-10 h-10 sm:w-12 sm:h-12 text-lg font-semibold rounded-xl border-slate-200 shadow-sm" />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700">New Password</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a new secure password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={submitting}
                  className="pl-10 h-11 rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 bg-slate-50/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-slate-700">Confirm New Password</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your new password"
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
              className="w-full h-11 text-base font-medium rounded-xl bg-indigo-600 hover:bg-indigo-700 shadow-md transition-all hover:-translate-y-0.5"
              disabled={submitting || !allRulesMet || otp.length !== 6}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting...
                </>
              ) : (
                "Reset Password"
              )}
            </Button>
            
            <div className="text-center pt-2">
              <Link to="/login" className="text-sm font-semibold text-slate-500 hover:text-slate-700 transition-all">
                Cancel
              </Link>
            </div>
          </form>
        )}
      </div>
    </AuthLayout>
  );
}
