import { useMemo } from "react";
import { useExpenses, CATEGORY_COLORS, CATEGORIES } from "@/contexts/ExpenseContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line,
  AreaChart, Area,
} from "recharts";

const chartTooltipStyle = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "0.5rem",
  color: "hsl(var(--foreground))",
  fontSize: "0.8rem",
};

const ReportsPage = () => {
  const { transactions, totalIncome, totalExpense } = useExpenses();
  const { fmt } = useCurrency();

  const categoryData = useMemo(() => {
    const map = new Map<string, number>();
    transactions.filter((t) => t.type === "expense").forEach((t) => map.set(t.category, (map.get(t.category) || 0) + t.amount));
    return Array.from(map, ([name, value]) => ({ name, value, pct: totalExpense > 0 ? ((value / totalExpense) * 100).toFixed(1) : "0" })).sort((a, b) => b.value - a.value);
  }, [transactions, totalExpense]);

  const dailyTrend = useMemo(() => {
    const map = new Map<string, number>();
    transactions.filter((t) => t.type === "expense").forEach((t) => {
      map.set(t.date, (map.get(t.date) || 0) + t.amount);
    });
    let cumulative = 0;
    return Array.from(map, ([date, amount]) => ({ date: date.slice(5), amount }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((d) => { cumulative += d.amount; return { ...d, cumulative }; });
  }, [transactions]);

  const incomeVsExpense = useMemo(() => {
    const incomeByDate = new Map<string, number>();
    const expenseByDate = new Map<string, number>();
    transactions.forEach((t) => {
      const day = t.date.slice(5);
      if (t.type === "income") incomeByDate.set(day, (incomeByDate.get(day) || 0) + t.amount);
      else expenseByDate.set(day, (expenseByDate.get(day) || 0) + t.amount);
    });
    const allDays = new Set([...incomeByDate.keys(), ...expenseByDate.keys()]);
    return Array.from(allDays).sort().map((day) => ({
      day,
      income: incomeByDate.get(day) || 0,
      expense: expenseByDate.get(day) || 0,
    }));
  }, [transactions]);

  const topExpenses = useMemo(() => {
    return [...transactions]
      .filter((t) => t.type === "expense")
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [transactions]);

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h2 className="text-2xl font-display font-bold text-foreground">Reports</h2>
        <p className="text-sm text-muted-foreground">Insights into your spending habits</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center">
          <p className="text-xs text-muted-foreground">Total Income</p>
          <p className="text-lg font-display font-bold text-income">{fmt(totalIncome)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-xs text-muted-foreground">Total Expenses</p>
          <p className="text-lg font-display font-bold text-expense">{fmt(totalExpense)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-xs text-muted-foreground">Savings Rate</p>
          <p className="text-lg font-display font-bold text-foreground">{totalIncome > 0 ? (((totalIncome - totalExpense) / totalIncome) * 100).toFixed(0) : 0}%</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-xs text-muted-foreground">Transactions</p>
          <p className="text-lg font-display font-bold text-foreground">{transactions.length}</p>
        </CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Category Pie */}
        <Card>
          <CardHeader><CardTitle className="text-base font-display">Expense Breakdown</CardTitle></CardHeader>
          <CardContent>
            {categoryData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No expenses yet</p>
            ) : (
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="w-48 h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={categoryData} cx="50%" cy="50%" innerRadius={45} outerRadius={80} paddingAngle={3} dataKey="value" stroke="none">
                        {categoryData.map((e) => <Cell key={e.name} fill={CATEGORY_COLORS[e.name] || "hsl(220,50%,55%)"} />)}
                      </Pie>
                      <Tooltip formatter={(v: number) => [fmt(v), ""]} contentStyle={chartTooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-2 w-full">
                  {categoryData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2 text-sm">
                      <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: CATEGORY_COLORS[item.name] || "hsl(220,50%,55%)" }} />
                      <span className="text-foreground flex-1">{item.name}</span>
                      <span className="text-muted-foreground">{item.pct}%</span>
                      <span className="font-medium text-foreground">{fmt(item.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cumulative Spending */}
        <Card>
          <CardHeader><CardTitle className="text-base font-display">Cumulative Spending</CardTitle></CardHeader>
          <CardContent>
            {dailyTrend.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>
            ) : (
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Area type="monotone" dataKey="cumulative" fill="hsl(var(--primary) / 0.2)" stroke="hsl(var(--primary))" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Income vs Expense */}
        <Card>
          <CardHeader><CardTitle className="text-base font-display">Income vs Expense</CardTitle></CardHeader>
          <CardContent>
            {incomeVsExpense.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>
            ) : (
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={incomeVsExpense}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Bar dataKey="income" fill="hsl(var(--income))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expense" fill="hsl(var(--expense))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Expenses */}
        <Card>
          <CardHeader><CardTitle className="text-base font-display">Top Expenses</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {topExpenses.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No expenses yet</p>
            ) : (
              topExpenses.map((t, i) => (
                <div key={t.id} className="flex items-center gap-3">
                  <span className="text-xs font-medium text-muted-foreground w-5">#{i + 1}</span>
                  <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: CATEGORY_COLORS[t.category] || "hsl(220,50%,55%)" }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{t.title}</p>
                    <p className="text-xs text-muted-foreground">{t.category} · {t.date}</p>
                  </div>
                  <span className="text-sm font-display font-semibold text-expense">{fmt(t.amount)}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReportsPage;
