# ExpenseHub UI Prompts

## Starting Page & Landing Page Prompt

### General Product Context
Design a modern SaaS fintech landing experience for a web application called ExpenseHub.
ExpenseHub is a privacy-first personal finance tracker that helps users:
* Track income and expenses
* Monitor category budgets
* View financial analytics
* Export financial data
* Maintain full data privacy with local database storage

The design should feel like a premium fintech dashboard product, similar to Notion, Linear, Arc browser landing pages, and modern SaaS finance tools.
Focus on clean UI, strong typography, spacious layouts, and subtle glassmorphism elements.

### Visual Design System

**Color Palette**
* Primary Accent: Deep Indigo / Royal Blue `#4F46E5`
* Dark Mode Background: Deep Navy `#0F172A`
* Light Mode Background: `#F8FAFC`
* Card Background: `#FFFFFF` / `#1E293B` (dark mode)
* Success: `#22C55E`
* Warning: `#F59E0B`
* Danger: `#EF4444`
* Border: `#E2E8F0`

**Typography**
Primary Font: Inter / Geist / SF Pro style
* H1 → 56px bold
* H2 → 40px semibold
* H3 → 28px semibold
* Body → 16px regular
* Small → 14px

**Design Style**
* Rounded corners (12px–20px)
* Soft shadows
* Subtle gradients
* Glass blur panels
* Floating UI components
* Smooth hover animations
* Minimal icons (lucide icons)

### Starting Page Layout

**1. Navigation Bar**
Left side: 💰 ExpenseHub
Right side: Features, Dashboard, Security, Pricing, GitHub
Buttons: Sign In, Get Started
Navbar style: translucent glass background, blur effect, thin border bottom

**2. Hero Section**
Headline: Take Control of Your Money Without Compromising Privacy
Subheading: ExpenseHub is a modern personal finance tracker that lets you monitor spending...
Buttons: Get Started Free, View Demo
Visual: Floating dashboard mockup with cards (Total Balance, Income, Expenses, Remaining Budget), line chart, donut chart.
Animated floating elements: Coffee $4.50, Groceries $78, Uber $12.

**3. Trust Section**
🔒 Privacy First | ⚡ Fast Local Database | 📊 Real-Time Analytics | 🧾 Export Anytime

**4. Features Section**
3 column grid cards explaining:
1. Track Every Expense
2. Visual Financial Insights
3. Category Budget Control
4. Full Privacy
5. Secure Authentication
6. Export Your Data

**5. Dashboard Preview Section**
Title: See Your Finances Clearly
Large screenshot UI preview showing cards, recent transactions, charts, budget progress bars.

**6. Security Section**
Your Data Belongs To You - local SQLite, no third-party cloud, encrypted auth, secure OTP.
Illustration: secure vault/shield/database icon.

**7. Onboarding Section**
Steps UI: Create Account -> Verify Email OTP -> Set Currency & Budget -> Start Tracking

**8. Call To Action Section**
Start Managing Your Money Today. No ads. No trackers...
Buttons: Create Free Account, Explore Dashboard. Subtly blurred background gradient.

**9. Footer**
Product, Resources, Company columns. © 2026 ExpenseHub.

**Micro-Interactions**
Hover lifting for buttons, soft glowing cards. 200ms ease-in-out transitions. Floating elements.

**Responsive Design**
Adaptive stacking on mobile, tablet, and desktop viewports. Accessible colors and navigation.

***

*(Add additional prompts here as provided by the user)*

---

# ExpenseHub Authentication System — Ultra Detailed Prompt

## General Context

Design a complete authentication experience for a modern fintech web application called ExpenseHub.
ExpenseHub is a privacy-first personal finance tracker where users manage income, expenses, and budgets.

The authentication flow must include:
1. Login Page
2. Sign Up Page
3. OTP Verification Page
4. Forgot Password Page
5. Reset Password Page

The design must feel like a modern SaaS fintech platform.
Design inspiration: Stripe, Notion, Linear, Vercel, Arc browser.
The UI should be: clean, minimal, premium, fast, trustworthy.

---

# Global Layout Style
All authentication pages share the same base layout: Two-column layout.

**Left Side (Brand Panel)**
Background gradient: Deep Navy → Indigo.
Include subtle pattern or abstract shapes.
Show product branding: ExpenseHub Logo
Tagline: Track your money with clarity and privacy.
Below tagline show benefits:
• Track income and expenses easily
• Visual budget insights
• Privacy-first financial tracking
Include dashboard preview mockup showing Cards (Total Balance, Monthly Income, Monthly Expenses, Remaining Budget), Charts (Spending trend line chart, Category donut chart), Add soft floating transaction cards like Coffee – $4.50, Groceries – $72, Uber – $11.

**Right Side**
Authentication form.

---

# LOGIN PAGE
Purpose: Allow returning users to securely log into their account.
Page Title: Welcome Back
Subtitle: Log in to your ExpenseHub account and continue managing your finances.

**Login Form Fields**
Email Address (Enter your email)
Password (Enter your password)
Password field must include: Show/Hide toggle icon.

**Additional Options**
Remember Me checkbox
Forgot Password link (Right side below password input)

**Primary Button**
Log In
Button style: Full width, Rounded corners, Primary accent color.
Hover animation: Subtle lift and glow.

**Secondary Option**
Below login button: "Don’t have an account? Sign Up" (clickable).

**Security Message**
Below form show small text: "Your login is secured with encrypted authentication and JWT sessions."

**Micro-interactions**
Input fields: Border highlight on focus.
Button: Loading spinner during authentication.
Error states: Red border + error message.

---

# SIGN UP PAGE
Purpose: Allow new users to create an account.
Page Title: Create Your ExpenseHub Account
Subtitle: Start tracking your finances with a private and secure expense tracker.

**Form Fields**
Full Name (Enter your name)
Email Address (Enter your email)
Password (Create a secure password)
Confirm Password (Confirm your password)

**Password Rules**
Show below password field: Password must contain: Minimum 8 characters, One number, One uppercase letter. Display live validation checkmarks.

**Primary Button**
Create Account. When clicked: Backend sends 6-digit OTP email. Redirect user to OTP page.

**Login Redirect**
Below form: "Already have an account? Login"

**Terms Notice**
Small text below button: "By creating an account you agree to our Terms and Privacy Policy."

---

# OTP VERIFICATION PAGE
Purpose: Verify the user’s email using a 6-digit OTP code.
Page Title: Verify Your Email
Subtitle: Enter the 6-digit verification code sent to your email.

**OTP Input**
6 separate input boxes. Each box: Auto-focus next input. Auto move backward on delete. Allow paste of full code.

**Timer & Resend**
Below OTP input show: "Code expires in: 02:00"
Resend Code (Disabled for first 30 seconds).

**Submit Button**
Verify Email

**Success State**
Show success message: "Email verified successfully." Redirect user to login page.

---

# FORGOT PASSWORD PAGE
Purpose: Allow users to request a password reset email.
Page Title: Forgot Your Password?
Subtitle: Enter your email address and we will send you a reset code.

**Form Field**
Email Address (Enter your account email)

**Button & Confirmation**
"Send Reset Code". After submission: "If an account exists for that email, a reset code has been sent." Back to Login link below message.

---

# RESET PASSWORD PAGE
Purpose: Allow user to set a new password after OTP verification.
Page Title: Reset Your Password
Subtitle: Enter your new password below.

**Form Fields**
New Password, Confirm Password. Password rules displayed again.

**Button & Success Message**
"Reset Password". "Password successfully updated. Redirect to login page."

---

# UI Design Elements
**Colors**
Primary: Indigo / Blue accent.
Background Light mode: Soft gray. Dark mode: Deep navy.
Success: Green. Error: Red.

**Typography**
Primary font: Inter or Geist.
Heading sizes: H1: 36px, H2: 28px, Body: 16px, Small text: 14px.

**Icons**
Use minimal icon set (Email icon, Lock icon, Shield icon, User icon).

**Animations**
Page transitions: Fade-in animation.
Input focus: Smooth border glow.
Button press: Subtle scale.
OTP verification success: Checkmark animation.

**Mobile Responsiveness**
Single column. Logo at top. Form centered. Buttons full width. OTP inputs enlarge for touch.

**Accessibility**
Include Keyboard navigation, ARIA labels, High contrast text, Accessible button sizes.
