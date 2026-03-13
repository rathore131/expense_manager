import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from "react";
import { supabase, isDemoMode } from "@/lib/supabase";
import { useAuth } from "./AuthContext";

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  category: string;
  type: "income" | "expense";
  date: string;
  note?: string;
}

export interface CategoryBudget {
  category: string;
  limit: number;
}

export const CATEGORIES = [
  "Food",
  "Transport",
  "Shopping",
  "Bills",
  "Entertainment",
  "Health",
  "Salary",
  "Freelance",
  "Other",
];

export const CATEGORY_COLORS: Record<string, string> = {
  Food: "hsl(158, 64%, 42%)",
  Transport: "hsl(40, 90%, 56%)",
  Shopping: "hsl(200, 70%, 50%)",
  Bills: "hsl(280, 60%, 55%)",
  Entertainment: "hsl(330, 65%, 50%)",
  Health: "hsl(15, 80%, 55%)",
  Salary: "hsl(190, 60%, 45%)",
  Freelance: "hsl(120, 50%, 45%)",
  Other: "hsl(220, 50%, 55%)",
};

// Sample data for demo mode
const DEMO_TRANSACTIONS: Transaction[] = [
  { id: "s1", title: "Monthly Salary", amount: 5000, category: "Salary", type: "income", date: "2026-03-01" },
  { id: "s2", title: "Grocery Store", amount: 124.5, category: "Food", type: "expense", date: "2026-03-02" },
  { id: "s3", title: "Metro Pass", amount: 45, category: "Transport", type: "expense", date: "2026-03-03" },
  { id: "s4", title: "Netflix", amount: 15.99, category: "Entertainment", type: "expense", date: "2026-03-04" },
  { id: "s5", title: "Electric Bill", amount: 89, category: "Bills", type: "expense", date: "2026-03-05" },
  { id: "s6", title: "New Sneakers", amount: 120, category: "Shopping", type: "expense", date: "2026-03-06" },
  { id: "s7", title: "Freelance Project", amount: 800, category: "Freelance", type: "income", date: "2026-03-07" },
  { id: "s8", title: "Pharmacy", amount: 32, category: "Health", type: "expense", date: "2026-03-08" },
  { id: "s9", title: "Restaurant", amount: 67, category: "Food", type: "expense", date: "2026-03-09" },
  { id: "s10", title: "Uber Ride", amount: 18.5, category: "Transport", type: "expense", date: "2026-03-10" },
];

const DEMO_BUDGETS: CategoryBudget[] = [
  { category: "Food", limit: 400 },
  { category: "Transport", limit: 150 },
  { category: "Shopping", limit: 300 },
  { category: "Bills", limit: 200 },
  { category: "Entertainment", limit: 100 },
  { category: "Health", limit: 100 },
];

interface ExpenseContextType {
  transactions: Transaction[];
  addTransaction: (t: Omit<Transaction, "id">) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  categoryBudgets: CategoryBudget[];
  setCategoryBudget: (category: string, limit: number) => Promise<void>;
  monthlyBudget: number;
  setMonthlyBudget: (v: number) => Promise<void>;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  loading: boolean;
}

const ExpenseContext = createContext<ExpenseContextType | null>(null);

export const useExpenses = () => {
  const ctx = useContext(ExpenseContext);
  if (!ctx) throw new Error("useExpenses must be inside ExpenseProvider");
  return ctx;
};

export const ExpenseProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categoryBudgets, setCategoryBudgets] = useState<CategoryBudget[]>([]);
  const [monthlyBudget, setMonthlyBudgetState] = useState(2000);
  const [loading, setLoading] = useState(true);

  // Fetch all data when user changes
  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setCategoryBudgets([]);
      setMonthlyBudgetState(2000);
      setLoading(false);
      return;
    }

    // Demo mode: use sample data
    if (isDemoMode) {
      setTransactions(DEMO_TRANSACTIONS);
      setCategoryBudgets(DEMO_BUDGETS);
      setMonthlyBudgetState(2000);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);

      // Fetch transactions
      const { data: txns } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false });
      if (txns) {
        setTransactions(
          txns.map((t) => ({
            id: t.id,
            title: t.title,
            amount: Number(t.amount),
            category: t.category,
            type: t.type,
            date: t.date,
            note: t.note,
          }))
        );
      }

      // Fetch category budgets
      const { data: budgets } = await supabase
        .from("category_budgets")
        .select("*")
        .eq("user_id", user.id);
      if (budgets) {
        setCategoryBudgets(
          budgets.map((b) => ({ category: b.category, limit: Number(b.limit_amount) }))
        );
      }

      // Fetch user settings
      const { data: settings } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (settings) {
        setMonthlyBudgetState(Number(settings.monthly_budget));
      }

      setLoading(false);
    };

    fetchData();
  }, [user]);

  const addTransaction = useCallback(
    async (t: Omit<Transaction, "id">) => {
      if (!user) return;

      if (isDemoMode) {
        setTransactions((prev) => [{ ...t, id: crypto.randomUUID() }, ...prev]);
        return;
      }

      const { data, error } = await supabase
        .from("transactions")
        .insert({
          user_id: user.id,
          title: t.title,
          amount: t.amount,
          category: t.category,
          type: t.type,
          date: t.date,
          note: t.note || null,
        })
        .select()
        .single();
      if (!error && data) {
        setTransactions((prev) => [
          {
            id: data.id,
            title: data.title,
            amount: Number(data.amount),
            category: data.category,
            type: data.type,
            date: data.date,
            note: data.note,
          },
          ...prev,
        ]);
      }
    },
    [user]
  );

  const deleteTransaction = useCallback(
    async (id: string) => {
      if (!user) return;

      if (isDemoMode) {
        setTransactions((prev) => prev.filter((t) => t.id !== id));
        return;
      }

      const { error } = await supabase.from("transactions").delete().eq("id", id);
      if (!error) {
        setTransactions((prev) => prev.filter((t) => t.id !== id));
      }
    },
    [user]
  );

  const setCategoryBudget = useCallback(
    async (category: string, limit: number) => {
      if (!user) return;

      if (isDemoMode) {
        setCategoryBudgets((prev) => {
          const existing = prev.find((b) => b.category === category);
          if (existing) return prev.map((b) => (b.category === category ? { ...b, limit } : b));
          return [...prev, { category, limit }];
        });
        return;
      }

      const { error } = await supabase
        .from("category_budgets")
        .upsert(
          { user_id: user.id, category, limit_amount: limit },
          { onConflict: "user_id,category" }
        );
      if (!error) {
        setCategoryBudgets((prev) => {
          const existing = prev.find((b) => b.category === category);
          if (existing) return prev.map((b) => (b.category === category ? { ...b, limit } : b));
          return [...prev, { category, limit }];
        });
      }
    },
    [user]
  );

  const setMonthlyBudget = useCallback(
    async (v: number) => {
      if (!user) return;

      if (isDemoMode) {
        setMonthlyBudgetState(v);
        return;
      }

      const { error } = await supabase
        .from("user_settings")
        .upsert({ user_id: user.id, monthly_budget: v }, { onConflict: "user_id" });
      if (!error) {
        setMonthlyBudgetState(v);
      }
    },
    [user]
  );

  const totalIncome = useMemo(
    () => transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0),
    [transactions]
  );
  const totalExpense = useMemo(
    () => transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0),
    [transactions]
  );
  const balance = totalIncome - totalExpense;

  return (
    <ExpenseContext.Provider
      value={{
        transactions,
        addTransaction,
        deleteTransaction,
        categoryBudgets,
        setCategoryBudget,
        monthlyBudget,
        setMonthlyBudget,
        totalIncome,
        totalExpense,
        balance,
        loading,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};
