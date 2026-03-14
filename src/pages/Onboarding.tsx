import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Rocket } from "lucide-react";

export default function Onboarding() {
  const [currency, setCurrency] = useState("USD");
  const [budget, setBudget] = useState("2000");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await API.post('/settings/onboarding', {
        currency,
        monthly_budget: parseFloat(budget)
      });
      // Force reload to refresh user token/state completely into the app
      window.location.href = "/";
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-lg border-border shadow-2xl">
        <CardHeader className="text-center space-y-4 pt-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Rocket className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-display">Welcome to ExpenseHub!</CardTitle>
          <CardDescription className="text-base">
            Let's set up your core tracking preferences before you get started.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            
            <div className="space-y-3">
              <Label htmlFor="currency" className="text-base">Target Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="h-12 bg-card">
                  <SelectValue placeholder="Select Currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($) - US Dollar</SelectItem>
                  <SelectItem value="EUR">EUR (€) - Euro</SelectItem>
                  <SelectItem value="GBP">GBP (£) - British Pound</SelectItem>
                  <SelectItem value="INR">INR (₹) - Indian Rupee</SelectItem>
                  <SelectItem value="JPY">JPY (¥) - Japanese Yen</SelectItem>
                  <SelectItem value="AUD">AUD ($) - Australian Dollar</SelectItem>
                  <SelectItem value="CAD">CAD ($) - Canadian Dollar</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                You can always change this later in your settings.
              </p>
            </div>

            <div className="space-y-3">
              <Label htmlFor="budget" className="text-base">Monthly Budget Goal</Label>
              <div className="relative">
                <span className="absolute left-4 top-3 text-muted-foreground">{currency === 'INR' ? '₹' : currency === 'JPY' ? '¥' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$'}</span>
                <Input
                  id="budget"
                  type="number"
                  placeholder="2000"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="pl-12 h-12 bg-card text-lg"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="pb-8 pt-4">
            <Button type="submit" className="w-full h-12 text-lg" disabled={submitting}>
              {submitting ? "Saving..." : "Let's Go!"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
