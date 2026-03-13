import { useExpenses, CATEGORY_COLORS } from "@/contexts/ExpenseContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Wallet, TrendingUp, TrendingDown, Target, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useMemo } from "react";

const DashboardPage = () => {
  const { transactions, totalIncome, totalExpense, balance, monthlyBudget, categoryBudgets } = useExpenses();

  const budgetUsed = monthlyBudget > 0 ? Math.min((totalExpense / monthlyBudget) * 100, 100) : 0;

  const categoryData = useMemo(() => {
    const map = new Map<string, number>();
    transactions
      .filter((t) => t.type === "expense")
      .forEach((t) => map.set(t.category, (map.get(t.category) || 0) + t.amount));
    return Array.from(map, ([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [transactions]);

  const dailyData = useMemo(() => {
    const map = new Map<string, { income: number; expense: number }>();
    transactions.forEach((t) => {
      const day = t.date.slice(5); // MM-DD
      const entry = map.get(day) || { income: 0, expense: 0 };
      entry[t.type] += t.amount;
      map.set(day, entry);
    });
    return Array.from(map, ([day, data]) => ({ day, ...data })).sort((a, b) => a.day.localeCompare(b.day));
  }, [transactions]);

  const recentTransactions = transactions.slice(0, 5);

  const topBudgetAlerts = useMemo(() => {
    return categoryBudgets
      .map((b) => {
        const spent = transactions
          .filter((t) => t.type === "expense" && t.category === b.category)
          .reduce((s, t) => s + t.amount, 0);
        return { ...b, spent, pct: b.limit > 0 ? (spent / b.limit) * 100 : 0 };
      })
      .filter((b) => b.pct > 50)
      .sort((a, b) => b.pct - a.pct)
      .slice(0, 4);
  }, [transactions, categoryBudgets]);

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard icon={Wallet} label="Balance" value={`$${balance.toFixed(2)}`} />
        <SummaryCard icon={TrendingUp} label="Income" value={`$${totalIncome.toFixed(2)}`} valueClass="text-income" iconClass="text-income" />
        <SummaryCard icon={TrendingDown} label="Expenses" value={`$${totalExpense.toFixed(2)}`} valueClass="text-expense" iconClass="text-expense" />
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Budget Used</p>
                <p className="text-xl font-display font-bold text-foreground">{budgetUsed.toFixed(0)}%</p>
              </div>
            </div>
            <Progress value={budgetUsed} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">${(monthlyBudget - totalExpense).toFixed(2)} remaining</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-display">Spending by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No expenses yet</p>
            ) : (
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="w-44 h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={categoryData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value" stroke="none">
                        {categoryData.map((entry) => (
                          <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] || "hsl(220,50%,55%)"} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => [`$${value.toFixed(2)}`, ""]}
                        contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "0.5rem", color: "hsl(var(--foreground))", fontSize: "0.8rem" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-2 w-full">
                  {categoryData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2 text-sm">
                      <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: CATEGORY_COLORS[item.name] || "hsl(220,50%,55%)" }} />
                      <span className="text-foreground flex-1 truncate">{item.name}</span>
                      <span className="font-medium text-foreground">${item.value.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-display">Daily Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {dailyData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>
            ) : (
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "0.5rem", color: "hsl(var(--foreground))", fontSize: "0.8rem" }} />
                    <Bar dataKey="income" fill="hsl(var(--income))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expense" fill="hsl(var(--expense))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-display">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentTransactions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No transactions yet</p>
            ) : (
              recentTransactions.map((t) => (
                <div key={t.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center">
                      {t.type === "income" ? (
                        <ArrowUpRight className="h-4 w-4 text-income" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-expense" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{t.title}</p>
                      <p className="text-xs text-muted-foreground">{t.category}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-display font-semibold ${t.type === "income" ? "text-income" : "text-expense"}`}>
                    {t.type === "income" ? "+" : "-"}${t.amount.toFixed(2)}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Budget Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-display">Budget Alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {topBudgetAlerts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">All budgets on track 🎉</p>
            ) : (
              topBudgetAlerts.map((b) => (
                <div key={b.category} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground font-medium">{b.category}</span>
                    <span className="text-muted-foreground">${b.spent.toFixed(0)} / ${b.limit.toFixed(0)}</span>
                  </div>
                  <Progress value={Math.min(b.pct, 100)} className="h-2" />
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const SummaryCard = ({
  icon: Icon,
  label,
  value,
  valueClass = "text-foreground",
  iconClass = "text-foreground",
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  valueClass?: string;
  iconClass?: string;
}) => (
  <Card>
    <CardContent className="flex items-center gap-4 p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
        <Icon className={`h-5 w-5 ${iconClass}`} />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={`text-xl font-display font-bold ${valueClass}`}>{value}</p>
      </div>
    </CardContent>
  </Card>
);

export default DashboardPage;
