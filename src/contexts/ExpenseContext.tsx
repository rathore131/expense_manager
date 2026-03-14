import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from "react";
import { API } from "@/lib/api";
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

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch transactions
        const txnsRes = await API.get('/transactions');
        setTransactions(txnsRes.data.map((t: any) => ({
          ...t,
          amount: Number(t.amount)
        })));

        // Fetch settings & budgets
        const settingsRes = await API.get('/settings');
        if (settingsRes.category_budgets) {
          setCategoryBudgets(settingsRes.category_budgets.map((b: any) => ({
            category: b.category,
            limit: Number(b.limit)
          })));
        }
        if (settingsRes.settings) {
          setMonthlyBudgetState(Number(settingsRes.settings.monthly_budget));
        }
      } catch (err) {
        console.error("Failed to load user data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const addTransaction = useCallback(
    async (t: Omit<Transaction, "id">) => {
      if (!user) return;
      try {
        const res = await API.post('/transactions', t);
        if (res.data && res.data[0]) {
          const newTx = { ...res.data[0], amount: Number(res.data[0].amount) };
          setTransactions((prev) => [newTx, ...prev]);
        }
      } catch (err) {
        console.error("Failed to add transaction", err);
      }
    },
    [user]
  );

  const deleteTransaction = useCallback(
    async (id: string) => {
      if (!user) return;
      try {
        await API.delete(`/transactions/${id}`);
        setTransactions((prev) => prev.filter((t) => t.id !== id));
      } catch (err) {
        console.error("Failed to delete transaction", err);
      }
    },
    [user]
  );

  const setCategoryBudget = useCallback(
    async (category: string, limit: number) => {
      if (!user) return;
      try {
        await API.post('/budgets', { category, limit });
        setCategoryBudgets((prev) => {
          const existing = prev.find((b) => b.category === category);
          if (existing) return prev.map((b) => (b.category === category ? { category, limit } : b));
          return [...prev, { category, limit }];
        });
      } catch (err) {
        console.error("Failed to set category budget", err);
      }
    },
    [user]
  );

  const setMonthlyBudget = useCallback(
    async (v: number) => {
      if (!user) return;
      try {
        await API.put('/settings', { monthly_budget: v });
        setMonthlyBudgetState(v);
      } catch (err) {
        console.error("Failed to update monthly budget", err);
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
