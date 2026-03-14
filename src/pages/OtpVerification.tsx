import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Loader2, ShieldCheck, ArrowLeft, MailOpen } from "lucide-react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

export default function OtpVerification() {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(120);
  
  const { verifyEmail } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { email?: string; devOtp?: string } | null;
  const email = state?.email;

  useEffect(() => {
    if (!email) {
      navigate("/signup");
      return;
    }
  }, [email, navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (otp.length !== 6 || !email) return;
    
    setError(null);
    setSubmitting(true);
    const err = await verifyEmail(email, otp);
    setSubmitting(false);

    if (err) {
      setError(err);
    } else {
      navigate("/login", { state: { message: "Email verified successfully! You can now log in." } });
    }
  };

  const handleResend = () => {
    // In a real app, you'd trigger a resend API here
    setCountdown(120);
  };

  if (!email) return null;

  return (
    <AuthLayout>
      <div className="flex flex-col space-y-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        <button 
          onClick={() => navigate("/signup")}
          className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors mb-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex flex-col space-y-2 text-left">
          <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center mb-2">
            <MailOpen className="w-6 h-6 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-display">
            Verify Your Email
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            We sent a 6-digit verification code to <span className="font-semibold text-slate-900">{email}</span>.
          </p>
        </div>

        {state?.devOtp && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/50 flex flex-col items-center">
             <p className="text-xs font-semibold text-amber-700 tracking-wider uppercase">Dev Mode OTP</p>
             <p className="text-xl font-mono font-bold tracking-[0.3em] text-amber-900 mt-1">{state.devOtp}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600 flex items-center gap-2 animate-in slide-in-from-top-2">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-center py-2">
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={(value) => setOtp(value)}
              onComplete={() => {
                // Auto submit when 6 digits are entered
                if (otp.length === 5) {
                   setTimeout(() => {
                      const form = document.getElementById("otp-form") as HTMLFormElement;
                      if(form) form.requestSubmit();
                   }, 300);
                }
              }}
            >
              <InputOTPGroup className="gap-2 sm:gap-3">
                <InputOTPSlot index={0} className="w-11 h-12 sm:w-14 sm:h-16 text-lg sm:text-2xl font-semibold rounded-xl border-slate-200 shadow-sm" />
                <InputOTPSlot index={1} className="w-11 h-12 sm:w-14 sm:h-16 text-lg sm:text-2xl font-semibold rounded-xl border-slate-200 shadow-sm" />
                <InputOTPSlot index={2} className="w-11 h-12 sm:w-14 sm:h-16 text-lg sm:text-2xl font-semibold rounded-xl border-slate-200 shadow-sm" />
                <InputOTPSlot index={3} className="w-11 h-12 sm:w-14 sm:h-16 text-lg sm:text-2xl font-semibold rounded-xl border-slate-200 shadow-sm" />
                <InputOTPSlot index={4} className="w-11 h-12 sm:w-14 sm:h-16 text-lg sm:text-2xl font-semibold rounded-xl border-slate-200 shadow-sm" />
                <InputOTPSlot index={5} className="w-11 h-12 sm:w-14 sm:h-16 text-lg sm:text-2xl font-semibold rounded-xl border-slate-200 shadow-sm" />
              </InputOTPGroup>
            </InputOTP>
          </div>

          <div className="flex flex-col items-center justify-center space-y-4">
            <Button 
              id="otp-form"
              type="submit" 
              className="w-full h-12 text-base font-medium rounded-xl bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg hover:shadow-indigo-600/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
              disabled={submitting || otp.length !== 6}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify Email"
              )}
            </Button>

            <div className="flex items-center gap-2 text-sm text-slate-500">
              {countdown > 0 ? (
                <p>Code expires in: <span className="font-mono font-medium text-slate-700">0{Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}</span></p>
              ) : (
                <p>Code expired. Please request a new one.</p>
              )}
            </div>

            <button
              type="button"
              disabled={countdown > 90} // Disabled for first 30 seconds
              onClick={handleResend}
              className={`text-sm font-semibold transition-colors ${countdown > 90 ? 'text-slate-400 cursor-not-allowed' : 'text-indigo-600 hover:text-indigo-500'}`}
            >
              Resend Code
            </button>
          </div>

        </form>
      </div>
    </AuthLayout>
  );
}
