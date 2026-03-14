# Product Requirements Document (PRD)

## 1. Product Overview
**Product Name:** ExpenseHub
**Type:** Web Application  
**Description:** ExpenseHub is a modern, privacy-first personal finance application that helps users track their income, categorize expenses, and monitor their monthly budget goals in real time. It features a fully localized backend that ensures user data remains secure on their own servers rather than relying on third-party cloud database providers.

## 2. Target Audience
Individuals who want an ad-free, secure, and intuitive tool to gain control over their personal finances, track daily spending against defined budgets, and analyze categorical expenditure trends effortlessly.

## 3. Core Features

### 3.1 Authentication & Onboarding
*   **Sign Up & Secure Login:** Users can create isolated accounts securely hashed using bcrypt.
*   **6-Digit OTP Email Verification:** Replaces vulnerable verification links with a robust 6-digit One-Time Password sent directly to the user's inbox (via MailerSend) to activate an account.
*   **Startup Onboarding Flow:** Upon first login, new users are seamlessly guided to a setup screen where they configure their **Primary Currency** (e.g., USD, EUR, INR, JPY) and their **Overall Monthly Budget Goal**.
*   **Session Management:** Secure stateless authentication powered by JWT (JSON Web Tokens).

### 3.2 Dashboard & Analytics
*   **High-Level Metrics:** Features at-a-glance cards showing Total Balance, Monthly Income, Monthly Expenses, and Remaining Budget based on user configuration.
*   **Visual Spending Charts:** Dynamic charts (powered by Recharts) visualize spending trends over the current month compared to previous periods.
*   **Recent Transactions:** A mini-feed of the 5 most recent activities providing quick context on where money just went.

### 3.3 Transaction Management
*   **Add / Edit / Delete Transactions:** Users can quickly log income or an expense, capturing the Amount, Category, Date, and an optional Note.
*   **Categorization:** Built-in standard categories (e.g., Groceries, Housing, Transport, Entertainment, Salary) to ensure standard reporting.
*   **Filtering:** A searchable and filterable list view of all historical transactions.

### 3.4 Category Budgets
*   **Granular Limits:** Users can assign specific budget caps to individual categories (e.g., "Limit Dining Out to $300/mo").
*   **Progress Indicators:** Visual progress bars turn from green to yellow to red as the user nears or exceeds a category limit.

### 3.5 Reports
*   **Category Breakdown:** A comprehensive pie/donut chart view detailing exactly what percentage of income went to which category.
*   **Time-Series Analysis:** Bar charts documenting day-by-day spending spikes across the month.

### 3.6 Settings & Preferences
*   **Currency Switcher:** The ability to globally update the display currency at any time.
*   **Data Export:** A one-click "Export CSV" feature allowing users to download their entire transaction history for use in Excel or tax software.
*   **Theme Switcher (System/Light/Dark):** First-class support for a meticulously designed Dark Mode (Deep Navy) and Light Mode.

## 4. Technical Architecture

### 4.1 Frontend (Client)
*   **Framework:** React 18 (via Vite)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS + Shadcn UI (accessible, unstyled, customizable components)
*   **Routing:** React Router v6
*   **State Management:** React Query (for data fetching/caching) + React Context API (Auth, Currency, Settings state)
*   **Charting:** Recharts

### 4.2 Backend (Server)
*   **Environment:** Node.js + Express.js
*   **Database:** SQLite 3 (Fully local, server-side `.sqlite` file for maximum autonomy and zero vendor lock-in)
*   **Authentication:** `jsonwebtoken` (JWT) for stateless API access, `bcrypt` for password hashing
*   **Email Provider:** MailerSend API integration for sending transaction/OTP emails programmatically

## 5. User Flows

### 5.1 New User Journey
1.  User clicks "Sign Up".
2.  Submits Name, Email, and Password.
3.  Backend creates inactive user state and generates a 6-digit OTP, dispatching an email.
4.  UI transforms into an OTP input screen.
5.  User enters the 6-digit code. Backend validates and activates the user.
6.  User logs in. Dashboard detects new user and redirects them to the `/onboarding` screen.
7.  User selects currency and monthly budget.
8.  User lands on the interactive Dashboard.

### 5.2 Daily Usage Flow
1.  User buys a coffee.
2.  Opens ExpenseHub on mobile/desktop.
3.  Clicks the floating action "+" or "Add Transaction" button on the Dashboard.
4.  Enters `$4.50`, selects "Food & Dining", types "Morning Coffee", hits submit.
5.  The Dashboard figures automatically recalculate, and the user's "Food & Dining" category budget progress bar ticks closer to its limit.

## 6. Design Axioms
*   **Clean, Modern Aesthetics:** Utilize rounded corners, subtle drop shadows, and glassmorphism elements to deliver a premium feel out of the box.
*   **Responsive First:** The interface must scale perfectly from an iPhone screen up to a 4K desktop monitor without breaking layouts.
*   **Immediate Feedback:** Any destructive actions, form submissions, or API requests are paired with immediate Toast notifications (`sonner`) to keep the user informed.
