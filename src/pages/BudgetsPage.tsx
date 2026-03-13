import { useState } from "react";
import { useExpenses, CATEGORIES, CATEGORY_COLORS } from "@/contexts/ExpenseContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Pencil, Check, Target } from "lucide-react";

const BudgetsPage = () => {
  const { transactions, categoryBudgets, setCategoryBudget, monthlyBudget, setMonthlyBudget } = useExpenses();
  const [editingOverall, setEditingOverall] = useState(false);
  const [overallInput, setOverallInput] = useState(monthlyBudget.toString());
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [catInput, setCatInput] = useState("");

  const totalExpense = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const overallPct = monthlyBudget > 0 ? Math.min((totalExpense / monthlyBudget) * 100, 100) : 0;

  const categorySpending = CATEGORIES.filter((c) => c !== "Salary" && c !== "Freelance").map((cat) => {
    const spent = transactions.filter((t) => t.type === "expense" && t.category === cat).reduce((s, t) => s + t.amount, 0);
    const budget = categoryBudgets.find((b) => b.category === cat);
    const limit = budget?.limit || 0;
    const pct = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
    return { category: cat, spent, limit, pct };
  });

  const handleOverallSave = async () => {
    const val = parseFloat(overallInput);
    if (!isNaN(val) && val > 0) await setMonthlyBudget(val);
    setEditingOverall(false);
  };

  const handleCatSave = async (cat: string) => {
    const val = parseFloat(catInput);
    if (!isNaN(val) && val >= 0) await setCategoryBudget(cat, val);
    setEditingCategory(null);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-display font-bold text-foreground">Budgets</h2>
        <p className="text-sm text-muted-foreground">Set and track your spending limits</p>
      </div>

      {/* Overall Budget */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-lg font-display font-bold text-foreground">Overall Monthly Budget</p>
                {editingOverall ? (
                  <div className="flex items-center gap-2 mt-1">
                    <Input type="number" className="h-8 w-32 text-sm" value={overallInput} onChange={(e) => setOverallInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleOverallSave()} autoFocus />
                    <Button size="sm" variant="outline" className="h-8" onClick={handleOverallSave}><Check className="h-3 w-3" /></Button>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">${totalExpense.toFixed(2)} spent of ${monthlyBudget.toFixed(2)}</p>
                )}
              </div>
            </div>
            {!editingOverall && (
              <Button variant="ghost" size="icon" onClick={() => { setOverallInput(monthlyBudget.toString()); setEditingOverall(true); }}>
                <Pencil className="h-4 w-4 text-muted-foreground" />
              </Button>
            )}
          </div>
          <Progress value={overallPct} className="h-3" />
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>{overallPct.toFixed(0)}% used</span>
            <span>${Math.max(monthlyBudget - totalExpense, 0).toFixed(2)} remaining</span>
          </div>
        </CardContent>
      </Card>

      {/* Category Budgets */}
      <div>
        <h3 className="text-lg font-display font-semibold text-foreground mb-4">Category Budgets</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {categorySpending.map((item) => (
            <Card key={item.category}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[item.category] || "hsl(220,50%,55%)" }} />
                    <span className="font-medium text-foreground">{item.category}</span>
                  </div>
                  {editingCategory === item.category ? (
                    <div className="flex items-center gap-1">
                      <Input type="number" className="h-7 w-20 text-xs" value={catInput} onChange={(e) => setCatInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleCatSave(item.category)} autoFocus />
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleCatSave(item.category)}><Check className="h-3 w-3" /></Button>
                    </div>
                  ) : (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => { setCatInput(item.limit.toString()); setEditingCategory(item.category); }}
                    >
                      <Pencil className="h-3 w-3 text-muted-foreground" />
                    </Button>
                  )}
                </div>
                {item.limit > 0 ? (
                  <>
                    <Progress value={item.pct} className="h-2 mb-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>${item.spent.toFixed(2)} spent</span>
                      <span className={item.pct >= 90 ? "text-expense font-medium" : ""}>
                        ${Math.max(item.limit - item.spent, 0).toFixed(2)} left
                      </span>
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground">No budget set — click edit to add one</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BudgetsPage;
