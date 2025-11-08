# Magic Patterns AI Design Prompt for StudyGapAI

## 🎨 Complete Frontend Design Prompt

Copy and paste this entire prompt into Magic Patterns AI Mockup Builder:

---

## Project Overview

Create a complete, mobile-first frontend design for **StudyGapAI** - an AI-powered diagnostic and personalized learning web application for JAMB (Joint Admissions and Matriculation Board) students in Nigeria. The app helps students identify learning gaps through diagnostic quizzes, receive AI-generated analysis, and follow personalized 6-week study plans.

**Tech Stack:** React + Vite + TailwindCSS + React Router + React Query  
**Target Audience:** JAMB students (ages 16-22) using mobile devices (2G/3G networks)  
**Design Style:** Modern, clean, educational, mobile-first, accessible

---

## Design Requirements

### Color Palette
- **Primary:** Blue (#3b82f6) - Trust, education, professionalism
- **Success:** Green (#10b981) - Positive feedback, strong topics
- **Warning:** Yellow (#f59e0b) - Developing topics, attention needed
- **Error/Danger:** Red (#ef4444) - Weak topics, errors
- **Background:** White (#ffffff) with light gray (#f9fafb) for cards
- **Text:** Dark gray (#1f2937) for headings, gray (#6b7280) for body
- **Border:** Light gray (#e5e7eb)

### Typography
- **Headings:** Bold, 2xl-3xl (24-30px), Inter or System Font
- **Body:** Regular, base-lg (16-18px), readable
- **Small Text:** 14px, gray-600
- **Mobile:** Responsive, minimum 16px for readability

### Layout Principles
- **Mobile-First:** Design for mobile (375px) first, then tablet (768px), desktop (1024px+)
- **Spacing:** Generous padding (16-24px), clear visual hierarchy
- **Cards:** White background, rounded-lg (8px), shadow-md, padding-6 (24px)
- **Buttons:** Rounded-md (6px), padding-4 py-2 (16px vertical, 8px horizontal), clear hover states
- **Containers:** Max-width 7xl (1280px), centered, padding-x-4 (16px) on mobile

---

## Page Structure & Components

### 1. Landing Page (`/`)

**IMPORTANT: Guest Mode Supported**
- **Primary CTA:** "Take Diagnostic Quiz" (allows guest access)
- **Secondary CTA:** "Login" (for existing users)
- **No login required** to take diagnostic quiz

**Layout:**
- **Hero Section:** Full-width, centered content
  - Large heading: "Master JAMB with AI-Powered Learning"
  - Subheading: "Identify your gaps, get personalized study plans, ace your exams"
  - **Primary CTA Button:** "Take Diagnostic Quiz" (primary blue, large, prominent)
  - **Secondary CTA Button:** "Login" (outline, for existing users)
  - **Optional:** "Create Account" link (smaller, less prominent)
  - Hero image/illustration (optional, can be placeholder)
  - **Note:** Emphasize that quiz is free and no account required

- **Features Section:** 3-column grid (1 column on mobile, 3 on desktop)
  - Feature cards with icons:
    - "Diagnostic Quiz" - Take AI-powered diagnostic tests
    - "Personalized Analysis" - Get detailed performance insights
    - "Study Plans" - Follow 6-week personalized learning paths

- **How It Works Section:** Step-by-step (numbered steps)
  1. Take Diagnostic Quiz (30 questions)
  2. Get AI Analysis Report
  3. Follow Personalized Study Plan
  4. Track Your Progress

- **Footer:** Links to About, Contact, Privacy Policy (simple, minimal)

**Components:**
- Navigation bar (sticky, transparent on hero, white after scroll)
- Hero section with CTA buttons
- Feature cards grid
- How it works section
- Footer

**State Logic:**
- If user is authenticated → redirect to `/dashboard`
- If not authenticated → show landing page
- **IMPORTANT:** User can take diagnostic quiz WITHOUT login (guest mode)
- Primary CTA ("Take Diagnostic Quiz") allows guest access
- No authentication barrier for quiz access

---

### 2. Authentication Pages (`/login`, `/register`)

**Note:** Authentication is **OPTIONAL** for taking the diagnostic quiz. Users can:
- Take quiz as guest (no login required)
- View diagnostic results as guest
- Create account later to save results

**Post-Registration Flow:**
- After successful registration/login, check for unsaved guest diagnostic
- If unsaved diagnostic exists, prompt user to save it
- Save diagnostic to user account if user chooses

**Layout:**
- **Centered Card:** Max-width md (448px), centered on page
- **Form Fields:**
  - Email input (required, type="email")
  - Password input (required, type="password", show/hide toggle)
  - Name input (register only, required)
  - Phone input (register only, optional, type="tel")
  - "Remember me" checkbox (login only)
  - "Forgot password?" link (login only)

- **Submit Button:** Full-width, primary blue, disabled state while loading
- **Error Message:** Red text below form if authentication fails
- **Success Message:** Green text if registration successful
- **Link to Other Page:** "Don't have an account? Register" or "Already have an account? Login"

**Components:**
- Form container card
- Input fields with labels
- Submit button
- Error/success message display
- Navigation link to other auth page

**Visual Design:**
- Clean, minimal form
- Clear labels above inputs
- Input focus states (blue border)
- Button loading spinner
- Accessible (proper labels, ARIA attributes)

---

### 3. Quiz Interface (`/quiz`)

**IMPORTANT: Guest Mode Supported**
- **No authentication required** - Users can take quiz as guest
- Quiz data is stored in localStorage (temporary, client-side only)
- Users can create account later to save results

**Layout:**
- **Header:** Progress bar (shows X of 30 questions), Timer (countdown or elapsed time)
- **Guest Mode Banner (Optional):** Small banner at top
  - Message: "Taking quiz as guest - Create account to save your results"
  - Link: "Create Account" (optional, can be dismissible)
- **Question Card:** Large, centered
  - Question number indicator (e.g., "Question 1 of 30")
  - Question text (large, readable font)
  - Answer options (A, B, C, D) - Radio buttons or large clickable cards
    - Each option: Letter (A/B/C/D) in circle, option text
    - Selected option: Blue border, blue background tint
    - Hover state: Light gray background

- **Confidence Slider (Optional):** Below answer options
  - Label: "How confident are you in this answer?"
  - Slider: 1 (Not confident) to 5 (Very confident)
  - Display current value

- **Explanation Textarea:** Below confidence slider
  - **Dynamic Label:** 
    - If answer is WRONG: "Explain your reasoning (required)" - Red text, asterisk
    - If answer is CORRECT: "Explain your reasoning (optional)" - Gray text
  - **Validation:**
    - REQUIRED if answer is wrong - Show error message if empty
    - OPTIONAL if answer is correct - Can be left empty
    - Block "Next" button if wrong answer has no explanation
  - **Error State:**
    - Red border when wrong answer has no explanation
    - Error message: "Please explain why you chose this answer" (below textarea)
  - Textarea: Multi-line, placeholder text
  - **Dynamic Behavior:** Label and requirement update when user selects answer

- **Navigation Buttons:** Bottom of card
  - "Previous" button (disabled on first question, outline style)
  - "Next" button (primary blue, changes to "Submit Quiz" on last question)
  - Question indicator dots (optional, show progress)

**Components:**
- Guest mode banner component (optional)
- Progress bar component
- Timer component
- Question card component
- Answer option component (radio buttons or cards)
- Confidence slider component (optional)
- Explanation textarea component (optional)
- Navigation buttons component

**State Logic:**
- **Track guest mode:** `isGuest: boolean` (true if no auth token)
- Track current question index
- Store selected answers (in state + localStorage for guest mode)
- **Check answer correctness** when user selects an option
- **Dynamic explanation requirement:**
  - If answer is WRONG: Explanation is REQUIRED
  - If answer is CORRECT: Explanation is OPTIONAL
- **Validation:** Block "Next" button if wrong answer has no explanation
- Store confidence scores (if collected)
- Store explanations (if collected)
- Track time per question
- Disable "Previous" on first question
- Show "Submit Quiz" on last question
- **For guest mode:** Store quiz data in localStorage (auto-save)

**Visual Design:**
- Large, readable question text (18-20px)
- Clear answer option cards (touch-friendly, minimum 48px height)
- Progress indication (progress bar + question number)
- Timer visibility (always visible, color changes as time runs low)
- Guest mode banner (subtle, non-intrusive)

---

### 4. Diagnostic Results Page (`/diagnostic/:quizId` or `/results`)

**IMPORTANT: Guest Mode Supported**
- **No authentication required** - Results displayed for guest users
- Results stored in localStorage (temporary, client-side only)
- **"Save Results" prompt appears** - User can create account to save

**Layout:**
- **"Save Results" Banner (Guest Mode):** Top of page, prominent but dismissible
  - Message: "Save your results and track your progress?"
  - Primary Button: "Create Account" (blue, prominent)
  - Secondary Link: "Continue Without Saving" (gray, less prominent)
  - Dismissible: X button to close (optional)
  - **Only shows for guest users** (no auth token)

- **Header:** "Your Diagnostic Report" heading, share/download buttons (top right)

- **Overall Performance Card:** Large card, top of page
  - Accuracy percentage (large, bold, 48px+)
  - Stats grid: Total questions, Correct answers, Average confidence, Time per question
  - Visual: Circular progress indicator or large number display

- **JAMB Score Projection Card:** Below overall performance
  - Predicted score (large, bold, e.g., "325")
  - Confidence interval (e.g., "± 25 points")
  - Visual: Score gauge or large number with context

- **Topic Breakdown Section:** Table or card grid
  - Table headers: Topic, Accuracy, Fluency Index, Status, Questions Attempted
  - Each row: Topic name, accuracy percentage, fluency index (progress bar), status badge (Weak/Developing/Strong), question count
  - **Status Color Coding:**
    - Weak: Red background (#fee2e2), red text (#991b1b), red border
    - Developing: Yellow background (#fef3c7), yellow text (#92400e), yellow border
    - Strong: Green background (#d1fae5), green text (#065f46), green border
  - Sortable columns (optional)

- **Root Cause Analysis Section:** Chart section
  - Heading: "Error Distribution"
  - Pie chart or bar chart showing:
    - Conceptual gap
    - Procedural error
    - Careless mistake
    - Knowledge gap
    - Misinterpretation
  - Primary weakness highlighted (e.g., "Primary Weakness: Conceptual Gap")

- **Recommendations Section:** List of recommendation cards
  - Each card: Priority number, Category, Action, Rationale
  - Ordered by priority (1 = highest priority)

- **Study Plan Preview Card:** Bottom of page
  - Heading: "Your 6-Week Study Plan"
  - Preview: Week 1 focus, key activities (first 2-3)
  - "View Full Study Plan" button (links to `/study-plan/:diagnosticId`)
  - **Note:** For guest users, study plan is viewable but not saved until account is created

**Components:**
- **Save Results Banner** (guest mode only) - NEW
- Overall performance card
- JAMB score projection card
- Topic breakdown table/card grid
- Status badge component (Weak/Developing/Strong)
- Root cause analysis chart component
- Recommendations list component
- Study plan preview card

**State Logic:**
- **Check if guest mode:** `isGuest: boolean` (true if no auth token)
- **Show "Save Results" banner if guest mode**
- Store diagnostic results in localStorage (for guest users)
- **After registration/login:** Check for unsaved diagnostic, prompt to save

**Visual Design:**
- Color-coded topic statuses (red/yellow/green)
- Charts (pie chart for error distribution, bar chart for topic accuracy)
- Large, readable numbers for scores
- Clear visual hierarchy (most important info at top)

---

### 5. Study Plan Viewer (`/study-plan/:diagnosticId`)

**Layout:**
- **Header:** "Your 6-Week Study Plan" heading, "Adjust Plan" button (top right)

- **Week Selector:** Tabs or accordion (Weeks 1-6)
  - Active week: Blue underline or background
  - Inactive weeks: Gray text

- **Weekly Schedule Card:** Large card for selected week
  - Week number (large, bold)
  - Focus topic(s) (heading)
  - Study hours (e.g., "10 hours/week")
  - Key activities list (bulleted list)
    - Each activity: Checkbox (mark as complete), activity text
  - Progress indicator (e.g., "3 of 5 activities complete")

- **Resources Section:** Below weekly schedule
  - Heading: "Recommended Resources for [Topic]"
  - Resource cards grid:
    - Each card: Resource type icon (video/practice), title, source, duration (for videos), difficulty badge, "View Resource" button
  - Filter by resource type (All, Videos, Practice Sets)

- **Progress Tracker:** Sidebar or bottom section
  - Overall progress: "Week X of 6"
  - Completion percentage
  - Topics completed list

**Components:**
- Week selector tabs/accordion
- Weekly schedule card
- Activity checklist component
- Resource card component
- Progress tracker component
- Adjust plan modal (optional)

**Visual Design:**
- Clear week separation (tabs or accordion)
- Checkboxes for activities (completed = checked, green)
- Resource cards with icons (video icon, practice icon)
- Progress indicators (progress bars, percentages)

---

### 6. Progress Tracker Dashboard (`/progress`)

**Layout:**
- **Header:** "Your Progress" heading, filter buttons (All Time, This Month, This Week)

- **Progress Summary Cards:** Grid (3 columns on desktop, 1 on mobile)
  - Total Quizzes: Number, icon
  - Average Score: Percentage, trend arrow (up/down)
  - Topics Mastered: Number, list of topics

- **Quiz History Section:** List or table
  - Each row: Date, Subject, Score, Accuracy, Link to diagnostic
  - Sortable by date, score
  - Pagination (if many quizzes)

- **Topic Mastery Chart:** Large chart section
  - Line chart or bar chart showing topic mastery over time
  - X-axis: Time (dates)
  - Y-axis: Mastery percentage
  - Multiple lines/bars for different topics

- **Recent Activity Feed:** Sidebar or bottom section
  - Recent activities: "Completed Week 1", "Took Quiz", "Viewed Resource"
  - Timestamp for each activity

**Components:**
- Progress summary cards
- Quiz history list/table
- Topic mastery chart component
- Recent activity feed component
- Filter buttons component

**Visual Design:**
- Charts (line chart for trends, bar chart for comparisons)
- Color-coded scores (green for high, yellow for medium, red for low)
- Clear date formatting
- Trend indicators (arrows for up/down)

---

### 7. Resource Viewer (`/resources/:topicId`)

**Layout:**
- **Header:** Topic name heading (e.g., "Algebra Resources"), back button

- **Resource Filters:** Top section
  - Filter by type: All, Videos, Practice Sets
  - Filter by difficulty: All, Easy, Medium, Hard
  - Sort by: Relevance, Upvotes, Duration

- **Resource List:** Grid (2 columns on desktop, 1 on mobile)
  - Each resource card:
    - Resource type icon (video/practice)
    - Title (bold, large)
    - Source (e.g., "Khan Academy")
    - Duration (for videos, e.g., "20 min")
    - Difficulty badge (Easy/Medium/Hard, color-coded)
    - Upvotes count (if available)
    - "View Resource" button (opens external link in new tab)
    - "Mark as Viewed" button (optional)

- **Empty State:** If no resources found
  - Message: "No resources available for this topic"
  - Icon or illustration

**Components:**
- Resource filter component
- Resource card component
- Difficulty badge component
- Empty state component

**Visual Design:**
- Clear resource type icons (video icon, practice icon)
- Color-coded difficulty badges (green for easy, yellow for medium, red for hard)
- External link indicator (arrow icon)
- Hover states on resource cards

---

### 8. Dashboard (Post-Authentication, `/dashboard`)

**Layout:**
- **Welcome Section:** Personalized greeting, user name
- **Quick Actions:** Grid of action cards
  - "Take Diagnostic Quiz" (primary CTA)
  - "View Study Plan" (if exists)
  - "View Progress" (link to progress page)
  - "Browse Resources" (link to resources)

- **Recent Activity:** List of recent activities (quizzes, study plan progress)
- **Upcoming Study Plan:** Preview of next week's study plan (if exists)

**Components:**
- Welcome section
- Quick actions grid
- Recent activity component
- Study plan preview component

---

## Navigation Structure

### Main Navigation (Sticky Header)
- **Logo:** "StudyGapAI" (left side)
- **Navigation Links:** (center, hidden on mobile, hamburger menu on mobile)
  - Home
  - Dashboard (if authenticated)
  - Progress (if authenticated)
  - Resources (if authenticated)
- **User Menu:** (right side, if authenticated)
  - User avatar/name dropdown
  - Profile
  - Settings
  - Logout
- **Auth Buttons:** (right side, if not authenticated)
  - Login
  - Register

### Mobile Navigation
- **Hamburger Menu:** (mobile only)
  - Collapsible menu with all navigation links
  - User menu
  - Auth buttons

### Footer Navigation
- **Links:** About, Contact, Privacy Policy, Terms of Service
- **Social Media:** (optional) Twitter, Facebook, Instagram
- **Copyright:** "© 2025 StudyGapAI. All rights reserved."

---

## Component Specifications

### Buttons
- **Primary Button:** Blue background (#3b82f6), white text, rounded-md, padding-4 py-2, hover: darker blue
- **Secondary Button:** Outline, blue border, blue text, white background
- **Danger Button:** Red background (#ef4444), white text
- **Disabled State:** Gray background, gray text, cursor-not-allowed
- **Loading State:** Spinner icon, disabled state

### Input Fields
- **Text Input:** White background, border-gray-300, rounded-md, padding-3, focus: blue border
- **Textarea:** Same as text input, multi-line, min-height
- **Select/Dropdown:** Same as text input, dropdown arrow
- **Checkbox:** Square, blue when checked
- **Radio Button:** Circle, blue when selected
- **Slider:** Track (gray), thumb (blue), active (blue)

### Cards
- **Card Container:** White background, rounded-lg, shadow-md, padding-6
- **Card Header:** Bold heading, optional subtitle
- **Card Body:** Content area
- **Card Footer:** (optional) Actions, buttons

### Badges
- **Status Badge:** Rounded-full, padding-x-3 py-1, small text
  - Weak: Red background, red text
  - Developing: Yellow background, yellow text
  - Strong: Green background, green text
- **Difficulty Badge:** Same as status badge
  - Easy: Green
  - Medium: Yellow
  - Hard: Red

### Progress Bars
- **Progress Bar:** Gray background, blue fill, rounded-full, height-2
- **Progress Percentage:** Display percentage text

### Charts
- **Chart Container:** White background, rounded-lg, padding-4
- **Chart Title:** Bold, centered
- **Chart Legend:** (if needed) Color-coded labels

### Modals
- **Modal Overlay:** Dark background (rgba(0,0,0,0.5)), centered
- **Modal Container:** White background, rounded-lg, max-width-md, padding-6
- **Modal Header:** Heading, close button (X)
- **Modal Body:** Content area
- **Modal Footer:** Action buttons (Cancel, Confirm)

---

## Responsive Design

### Mobile (375px - 640px)
- Single column layout
- Stacked cards
- Hamburger menu
- Full-width buttons
- Larger touch targets (minimum 48px)
- Reduced padding (16px instead of 24px)

### Tablet (641px - 1023px)
- 2-column grid where appropriate
- Expanded navigation
- Medium-sized cards
- Side-by-side buttons

### Desktop (1024px+)
- 3-column grid where appropriate
- Full navigation bar
- Larger cards
- Sidebar layouts (if needed)
- Hover states

---

## Accessibility Requirements

- **Keyboard Navigation:** All interactive elements accessible via keyboard
- **Screen Readers:** Proper ARIA labels, alt text for images
- **Color Contrast:** WCAG AA compliant (4.5:1 for text)
- **Focus States:** Visible focus indicators (blue outline)
- **Text Size:** Minimum 16px for body text
- **Touch Targets:** Minimum 44x44px for mobile

---

## Loading States

- **Spinner:** Circular spinner, blue color, centered
- **Skeleton Screens:** Gray placeholder boxes, animated pulse
- **Progress Indicators:** Progress bars, percentage display
- **Button Loading:** Spinner inside button, disabled state

---

## Error States

- **Error Message:** Red text, error icon, clear message
- **Empty State:** Illustration, message, CTA button
- **404 Page:** "Page not found" message, back button
- **Network Error:** "Connection failed" message, retry button

---

## Success States

- **Success Message:** Green text, checkmark icon
- **Success Animation:** (optional) Fade-in, checkmark animation
- **Confirmation:** Modal or toast notification

---

## Animation & Transitions

- **Page Transitions:** Smooth fade-in (300ms)
- **Button Hover:** Color transition (200ms)
- **Card Hover:** Shadow increase, slight scale (200ms)
- **Modal Open/Close:** Fade and scale animation (300ms)
- **Loading Spinner:** Rotate animation (infinite)
- **Progress Bar:** Smooth fill animation (500ms)

---

## Data Visualization

### Charts to Include
1. **Error Distribution Pie Chart:** Show breakdown of error types
2. **Topic Accuracy Bar Chart:** Horizontal bars showing accuracy per topic
3. **Fluency Index Progress Bars:** Vertical or horizontal progress bars
4. **Topic Mastery Line Chart:** Show mastery over time
5. **Score Trends Line Chart:** Show score improvements over time

### Chart Libraries (Suggestions)
- Recharts (React)
- Chart.js with react-chartjs-2
- Victory (React)

---

## Additional Design Notes

- **Icons:** Use Heroicons or Lucide React (consistent icon set)
- **Images:** Placeholder images for now (can be replaced later)
- **Illustrations:** Simple, educational illustrations (optional)
- **Branding:** StudyGapAI logo (text-based for now, can add icon later)
- **Favicon:** Education/book icon

---

## Export Requirements

- Export as React + TypeScript components
- Use TailwindCSS for styling
- Component structure should match the project structure specified
- Include placeholder data for mockups
- Make components reusable and modular

---

## Notes for Implementation

- **API Integration Points:** Mark with comments where API calls will be made
- **State Management:** Indicate where React Query hooks will be used
- **Routing:** Indicate which pages correspond to which routes
- **Authentication:** Indicate protected routes (require authentication)
- **Caching:** Indicate where data will be cached (React Query + LocalStorage)

---

## Final Checklist

- [ ] All 8 pages designed (Landing, Auth, Quiz, Diagnostic, Study Plan, Progress, Resources, Dashboard)
- [ ] Mobile-first responsive design
- [ ] Color-coded topic statuses (red/yellow/green)
- [ ] Charts for data visualization
- [ ] Loading states for all async operations
- [ ] Error states for all error cases
- [ ] Empty states for empty data
- [ ] Navigation structure (header, footer, mobile menu)
- [ ] Accessibility features (keyboard navigation, ARIA labels)
- [ ] Component library (buttons, inputs, cards, badges, modals)
- [ ] Animation and transitions
- [ ] Export as React + TypeScript + TailwindCSS

---

**This design should be production-ready and serve as the complete visual foundation for the StudyGapAI frontend application.**


