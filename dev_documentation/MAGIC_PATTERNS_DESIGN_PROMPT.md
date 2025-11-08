# Magic Patterns Design Prompt

**Purpose:** Paste this prompt into Magic Patterns to generate complete UI mockups for StudyGapAI frontend  
**Focus:** Visual design, layout, components, and user interface structure  
**Note:** This focuses on design only - API integration details are in FRONTEND_TECHNICAL_SPECIFICATION.md

---

## 🎨 Design System

### Color Palette
- **Primary Blue:** `#2563eb` (dark blue for headers, primary actions)
- **Primary Orange:** `#f97316` (orange for CTAs, progress indicators)
- **Success Green:** `#10b981` (green for completed tasks, strong topics)
- **Warning Yellow:** `#f59e0b` (yellow for developing topics, warnings)
- **Error Red:** `#ef4444` (red for weak topics, errors)
- **Background:** `#f9fafb` (light gray for page backgrounds)
- **Card Background:** `#ffffff` (white for cards)
- **Text Primary:** `#111827` (dark gray for headings)
- **Text Secondary:** `#6b7280` (medium gray for body text)
- **Text Light:** `#9ca3af` (light gray for labels)

### Typography
- **Headings:** Bold, 24px-32px, dark gray
- **Body Text:** Regular, 16px, medium gray
- **Small Text:** Regular, 14px, light gray
- **Button Text:** Medium, 16px, white or dark

### Spacing
- **Container Padding:** 24px-32px
- **Card Padding:** 20px-24px
- **Element Spacing:** 16px-24px
- **Section Spacing:** 32px-48px

### Components
- **Cards:** White background, rounded corners (8px-12px), subtle shadow
- **Buttons:** Rounded corners (6px-8px), padding 12px-16px
- **Input Fields:** Rounded corners (6px-8px), border 1px solid light gray
- **Progress Bars:** Rounded, height 8px-12px
- **Badges/Tags:** Rounded pill shape, padding 6px-12px

---

## 📱 Page 1: Landing Page (`/`)

### Layout
- Full-width header at top
- Hero section in center
- Feature highlights below
- Footer at bottom

### Header
- **Left:** StudyGapAI logo (dark blue book icon + text)
- **Right:** Navigation links - "Login" (text link) and "Get Started" (orange button)

### Hero Section
- **Main Heading:** "AI-Powered Diagnostic Tool for JAMB Mathematics" (large, bold, dark blue)
- **Subheading:** "Discover your knowledge gaps and get a personalized 6-week study plan"
- **CTA Buttons:** 
  - Primary: "Get Started" (orange button, large)
  - Secondary: "Learn More" (outline button)
- **Hero Image/Illustration:** (optional) Mathematics-themed illustration

### Feature Highlights (3 columns)
- **Card 1:** Diagnostic Test icon + "Take Diagnostic" + "Identify your weak areas"
- **Card 2:** Study Plan icon + "Personalized Plan" + "6-week customized schedule"
- **Card 3:** Progress Tracking icon + "Track Progress" + "Monitor your improvement"

### Footer
- **4 Columns:**
  - Column 1: StudyGapAI branding + description
  - Column 2: Quick Links (About Us, How It Works, FAQ)
  - Column 3: Legal (Privacy Policy, Terms of Service, Contact Us)
  - Column 4: Social Media icons (Twitter, Facebook, Instagram)
- **Copyright:** "© 2024 StudyGapAI. Built in Nigeria 🇳🇬. All rights reserved."

---

## 📱 Page 2: Login Page (`/login`)

### Layout
- Centered login card on light gray background
- Header with logo and navigation (same as landing page)

### Header
- **Left:** StudyGapAI logo
- **Right:** "Login" (text link) and "Get Started" (orange button)

### Login Card (Centered)
- **Tabs:** "Login" (active, orange underline) and "Create Account" (inactive)
- **Email Field:**
  - Label: "Email Address"
  - Input: Text field with envelope icon on left
  - Placeholder: "your.email@example.com"
- **Password Field:**
  - Label: "Password"
  - Input: Password field with lock icon on left
  - Placeholder: "Enter your password"
  - Show/Hide password toggle
- **Login Button:** Large orange button, full width, "Login" text
- **Forgot Password Link:** Centered below button, orange text
- **Error Message Area:** Red text below form (if error occurs)
- **Loading State:** Spinner on button when submitting

### Design Notes
- Clean, minimalist design
- White card with subtle shadow
- Form fields with icons
- Orange primary button

---

## 📱 Page 3: Register Page (`/register`)

### Layout
- Same as Login page, but with registration form

### Registration Card
- **Tabs:** "Login" (inactive) and "Create Account" (active, orange underline)
- **Name Field:**
  - Label: "Full Name"
  - Input: Text field with user icon
  - Placeholder: "John Doe"
- **Email Field:**
  - Label: "Email Address"
  - Input: Text field with envelope icon
  - Placeholder: "your.email@example.com"
- **Password Field:**
  - Label: "Password"
  - Input: Password field with lock icon
  - Placeholder: "Create a password"
  - Show/Hide password toggle
- **Confirm Password Field:**
  - Label: "Confirm Password"
  - Input: Password field with lock icon
  - Placeholder: "Confirm your password"
- **Phone Field (Optional):**
  - Label: "Phone Number (Optional)"
  - Input: Text field with phone icon
  - Placeholder: "+2341234567890"
- **Target Score Field (Optional):**
  - Label: "Target JAMB Score (Optional)"
  - Input: Number field
  - Placeholder: "250"
- **Register Button:** Large orange button, full width, "Create Account" text
- **Error Message Area:** Red text below form (if error occurs)
- **Loading State:** Spinner on button when submitting

---

## 📱 Page 4: Dashboard (`/dashboard`)

### Layout
- Header with navigation
- Welcome section
- Grid of cards (2-3 columns)
- Quick Actions section

### Header
- **Left:** StudyGapAI logo
- **Right:** Navigation links - "Dashboard" (active, dark text), "Study Plan" (inactive), "Profile" (inactive with user icon)

### Welcome Section
- **Heading:** "Welcome back, [User Name]!" 👋 (large, bold, dark blue)
- **Subheading:** "Here is your learning progress and performance overview" (medium gray)

### Main Content Grid (2-3 columns, responsive)

#### Card 1: Diagnostic Status
- **Title:** "Diagnostic Status" (dark blue, with bar chart icon)
- **Content:**
  - Label: "Progress" (light gray)
  - Progress bar: Orange, 100% filled
  - Percentage: "100%" (dark blue, bold)
- **Button:** "View Report" (dark blue button, white text)

#### Card 2: Your Study Plan
- **Title:** "Your Study Plan" (dark blue, with book icon)
- **Content:**
  - Text: "Week 2 of 6" (light gray)
  - Text: "65% completed this week" (light gray)
  - Progress bar: Orange, 65% filled
- **Button:** "Continue Learning" (orange button, white text)

#### Card 3: Performance
- **Title:** "Performance" (dark blue, with trend line icon)
- **Content:**
  - Label: "Projected Score" (light gray)
  - Score: "165/400" (large, bold, dark blue)
  - Label: "Target Score" (light gray)
  - Score: "250/400" (large, bold, orange)
  - Text: "You need 85 more points to reach your goal" (light gray)

#### Card 4: Your Strengths
- **Title:** "Your Strengths" (dark blue, with upward arrow icon)
- **Content:**
  - Topic tags: "Algebra" and "Trigonometry" (green pills with green borders, white text)

#### Card 5: Areas to Improve
- **Title:** "Areas to Improve" (dark blue, with downward arrow icon)
- **Content:**
  - Topic tags: "Calculus", "Statistics", "Geometry" (red/gray pills with red borders, dark text)

### Quick Actions Section
- **Title:** "Quick Actions" (dark blue, bold)
- **Buttons (3, horizontal):**
  1. "Take New Diagnostic" (white button, dark blue border, play icon)
  2. "View Study Plan" (orange button, white text, book icon)
  3. "Track Progress" (white button, dark blue border, bar chart icon)

### Empty States (if no diagnostic)
- **Message:** "You haven't taken a diagnostic test yet"
- **CTA:** "Take New Diagnostic" (orange button)

---

## 📱 Page 5: Quiz Interface (`/quiz`) ⭐ **NEW - MISSING FROM CURRENT MOCKUP**

### Layout
- Header with navigation
- Progress bar at top
- Question card in center
- Navigation buttons at bottom

### Header
- **Left:** StudyGapAI logo
- **Right:** Navigation - "Dashboard", "Study Plan", "Profile"

### Progress Section
- **Progress Bar:** Horizontal bar showing "Question 5 of 30" (orange filled portion)
- **Timer:** "Time: 15:30" (countdown or elapsed time, dark blue)

### Question Card (Centered)
- **Question Number:** "Question 5 of 30" (light gray, top)
- **Question Text:** Large, bold, dark blue (e.g., "What is the derivative of x²?")
- **Answer Options (A, B, C, D):**
  - Radio buttons or selectable buttons
  - Each option: Letter (A, B, C, D) + option text
  - Selected: Orange border/background
  - Hover: Light orange background
- **Confidence Slider (Optional):**
  - Label: "How confident are you in this answer?" (light gray)
  - Slider: 1-5 scale (1 = Not confident, 5 = Very confident)
  - Current value: "3" (orange, bold)
- **Explanation Field (Optional):**
  - Label: "Explain your reasoning (optional)" (light gray)
  - Textarea: Multi-line text input
  - Placeholder: "I thought..."

### Navigation Buttons (Bottom)
- **Previous Button:** "← Previous" (outline button, left)
- **Next Button:** "Next →" (orange button, right)
- **Submit Button:** "Submit Quiz" (large orange button, center, only shown on last question)

### Loading State (After Submit)
- **Loading Card:**
  - Large spinner
  - Text: "Analyzing your responses..."
  - Subtext: "This may take 10-30 seconds"
  - Progress indicator

### Design Notes
- Clean, focused design
- Large, readable question text
- Clear answer selection
- Optional fields should be visually de-emphasized
- Timer should be prominent

---

## 📱 Page 6: Diagnostic Results (`/diagnostic/:diagnosticId`)

### Layout
- Header with navigation
- Main title section
- Score summary cards (2 columns)
- Topic breakdown cards (2 columns)
- Root cause analysis section
- Recommendations section
- Study plan preview
- CTA buttons

### Header
- **Left:** StudyGapAI logo
- **Right:** Navigation - "Dashboard", "Study Plan", "Profile"

### Main Title Section
- **Icon:** Sparkle/star icon (large, centered)
- **Heading:** "Your Diagnostic Results Are Ready!" (large, bold, dark blue)
- **Subheading:** "Here is what our AI discovered about your knowledge gaps" (medium gray)

### Score Summary Cards (2 columns)

#### Left Card: Projected Score
- **Title:** "Projected JAMB Score" (dark gray)
- **Score:** "165" (very large, bold, dark gray)
- **Total:** "/400" (small, light gray)
- **Description:** "Based on current performance" (light gray)

#### Right Card: Target Score
- **Title:** "Target Score" (dark gray)
- **Score:** "250" (very large, bold, dark gray)
- **Total:** "/400" (small, light gray)
- **Description:** "Gap: 85 points" (light gray)

### Overall Performance Card (Full Width)
- **Title:** "Overall Performance" (dark blue, bold)
- **Metrics (4 columns):**
  - Accuracy: "65.5%" (large, bold, dark blue)
  - Correct Answers: "20/30" (large, bold, dark blue)
  - Avg Confidence: "3.2/5" (large, bold, dark blue)
  - Time per Question: "90s" (large, bold, dark blue)

### Topic Breakdown Cards (2 columns)

#### Left Card: Strong Topics
- **Title:** "Strong Topics" (dark gray, with green upward arrow icon)
- **Topics List:**
  - Each topic: Topic name (dark gray) + "Strong" badge (green pill, white text)
  - Topics: "Algebra", "Trigonometry"

#### Right Card: Weak Topics
- **Title:** "Weak Topics" (dark gray, with red downward arrow icon)
- **Topics List:**
  - Each topic: Topic name (dark gray) + "Needs Work" badge (red pill, white text)
  - Topics: "Calculus", "Statistics", "Geometry"

### Topic Breakdown Table (Full Width)
- **Table Headers:** Topic | Accuracy | Fluency Index | Status | Severity | Error Type
- **Rows:**
  - Algebra: 80% | 75 | Strong (green badge) | Mild (yellow badge) | Careless Mistake
  - Trigonometry: 75% | 70 | Strong (green badge) | Mild (yellow badge) | None
  - Calculus: 45% | 40 | Weak (red badge) | Critical (red badge) | Conceptual Gap
  - Statistics: 50% | 45 | Weak (red badge) | Moderate (orange badge) | Knowledge Gap
  - Geometry: 55% | 50 | Developing (yellow badge) | Moderate (orange badge) | Procedural Error

### Root Cause Analysis Section
- **Title:** "Root Cause Analysis" (dark blue, bold)
- **Primary Weakness:** "Conceptual Gap" (large, bold, red)
- **Error Distribution Chart:**
  - Pie chart or bar chart
  - Categories: Conceptual Gap, Procedural Error, Careless Mistake, Knowledge Gap, Misinterpretation
  - Colors: Different colors for each category
  - Values: Show percentages or counts

### Recommendations Section
- **Title:** "Recommendations" (dark blue, bold)
- **Recommendation Cards (List):**
  - Each card: Priority number + Category + Action + Rationale
  - Priority 1: "Topic Focus" - "Focus on Calculus fundamentals" - "Strong conceptual gaps identified"
  - Priority 2: "Practice" - "Complete more practice problems" - "Improve procedural fluency"
  - Priority 3: "Review" - "Review basic concepts" - "Address knowledge gaps"

### Study Plan Preview Section
- **Title:** "Your 6-Week Study Plan" (dark blue, bold)
- **Preview Card:**
  - Week 1: "Foundations of Calculus" - "10 hours" - Key activities preview
  - Show first week only as preview
- **Button:** "View Full Study Plan" (orange button, white text)

### CTA Buttons (Bottom)
- **Primary:** "View Study Plan" (orange button, large)
- **Secondary:** "Download Report" (outline button)
- **Secondary:** "Share Results" (outline button)

### Design Notes
- Use color coding: Green for strong, Yellow for developing, Red for weak
- Charts should be clear and easy to read
- Badges should be visually distinct
- Overall layout should be scannable

---

## 📱 Page 7: Study Plan Viewer (`/study-plan/:diagnosticId`)

### Layout
- Header with navigation
- Main title section
- Overall progress bar
- Week cards (expandable)
- CTA button

### Header
- **Left:** StudyGapAI logo
- **Right:** Navigation - "Dashboard", "Study Plan" (active), "Profile"

### Main Title Section
- **Heading:** "Your 6-Week Study Plan is Ready!" 🎯 (large, bold, dark blue)
- **Subheading:** "Follow this personalized plan to improve your weak topics and reach your target score" (medium gray)

### Overall Progress Section
- **Card:**
  - **Left:** "Overall Progress" (dark gray)
  - **Center:** Progress bar (orange, partially filled, e.g., 25%)
  - **Right:** "Week 1 of 6" (light gray)

### Week Cards (6 weeks, stacked vertically)

#### Week 1 Card (Expanded Example)
- **Week Badge:** "W1" (dark blue square, white text, top left)
- **Module Title:** "Foundations of Calculus" (large, bold, dark gray)
- **Progress Indicator:** "Progress 40%" (top right, dark blue, with expand/collapse icon)
- **Sub-topics/Tags:**
  - "Limits and Continuity" (gray pill)
  - "Basic Derivatives" (gray pill)
  - "Introduction to Integration" (gray pill)
- **Study Hours:** "10 hours this week" (light gray)
- **Daily Tasks (Expandable List):**
  - Day 1: ✅ "Watch: Understanding Limits" (green checkmark) + YouTube icon + Document icon
  - Day 2: ✅ "Practice: Limit Problems" (green checkmark) + YouTube icon + Document icon
  - Day 3: ⭕ "Watch: Derivative Basics" (empty circle) + YouTube icon + Document icon
  - Day 4: ⭕ "Practice: Simple Derivatives" (empty circle) + YouTube icon + Document icon
  - Day 5: ⭕ "Review Week 1 Concepts" (empty circle) + YouTube icon + Document icon
- **Resources Section (Expandable):**
  - "View Resources" link
  - Resource list: Video links, practice sets, etc.

#### Week 2 Card (Collapsed Example)
- **Week Badge:** "W2" (dark blue square, white text)
- **Module Title:** "Probability Fundamentals" (large, bold, dark gray)
- **Progress Indicator:** "Progress 0%" (top right, dark blue, with expand/collapse icon)
- **Sub-topics/Tags:**
  - "Basic Probability" (gray pill)
  - "Conditional Probability" (gray pill)
  - "Probability Distributions" (gray pill)
- **Study Hours:** "10 hours this week" (light gray)
- **Collapsed State:** Click to expand and see daily tasks

#### Weeks 3-6 (Similar Structure)
- Same structure as Week 1 and Week 2
- Collapsed by default
- Can be expanded to show daily tasks

### CTA Section (Bottom)
- **Button:** "Update My Plan" (orange button, large)
- **Subtext:** "Take a mini-quiz to refresh your study plan based on new progress" (light gray)

### Design Notes
- Week cards should be visually distinct
- Completed tasks should have green checkmarks
- Incomplete tasks should have empty circles
- Resources should be easily accessible
- Progress should be clearly visible

---

## 📱 Page 8: Resource Viewer (`/resources/:topicId`) ⭐ **NEW - MISSING FROM CURRENT MOCKUP**

### Layout
- Header with navigation
- Topic title section
- Filter section
- Resource list
- Pagination (if needed)

### Header
- **Left:** StudyGapAI logo
- **Right:** Navigation - "Dashboard", "Study Plan", "Profile"

### Topic Title Section
- **Breadcrumb:** "Dashboard > Study Plan > Resources" (light gray, clickable)
- **Topic Name:** "Algebra" (large, bold, dark blue)
- **Description:** "Linear equations, quadratic equations, polynomials" (medium gray)

### Filter Section
- **Resource Type Filter:**
  - Buttons: "All" (active, orange), "Videos" (inactive), "Practice Sets" (inactive)
- **Difficulty Filter:**
  - Buttons: "All" (active), "Easy" (inactive), "Medium" (inactive), "Hard" (inactive)

### Resource List

#### Video Resource Card
- **Thumbnail:** Video thumbnail image (left)
- **Title:** "Algebra Basics - Introduction to Linear Equations" (bold, dark blue)
- **Source:** "Khan Academy" (light gray)
- **Duration:** "20 min" (light gray, with clock icon)
- **Difficulty:** "Easy" (green badge)
- **Description:** "Learn the fundamentals of linear equations..." (medium gray)
- **Actions:**
  - "Watch Video" button (orange, opens in new tab)
  - "Mark as Viewed" button (outline, optional)

#### Practice Set Resource Card
- **Icon:** Document/worksheet icon (left)
- **Title:** "Algebra Practice Problems - Set 1" (bold, dark blue)
- **Source:** "StudyGapAI" (light gray)
- **Problems:** "50 problems" (light gray, with document icon)
- **Difficulty:** "Medium" (yellow badge)
- **Description:** "Practice problems covering linear equations..." (medium gray)
- **Actions:**
  - "Start Practice" button (orange, opens in new tab)
  - "Mark as Viewed" button (outline, optional)

#### More Resources (Similar Structure)
- Repeat resource cards for all resources
- Group by type (Videos first, then Practice Sets)

### Empty State (If No Resources)
- **Message:** "No resources available for this topic yet"
- **Icon:** Book/document icon
- **CTA:** "Browse Other Topics" (outline button)

### Design Notes
- Resources should be clearly categorized
- Thumbnails/icons should be consistent
- Difficulty badges should use color coding (green/yellow/red)
- Actions should be prominent
- Layout should be scannable

---

## 📱 Page 9: Progress Tracker (`/progress`)

### Layout
- Header with navigation
- Welcome section
- Progress summary cards
- Quiz history section
- Topic mastery chart
- Recent activity feed

### Header
- **Left:** StudyGapAI logo
- **Right:** Navigation - "Dashboard", "Study Plan", "Profile"

### Welcome Section
- **Heading:** "Track Your Progress" (large, bold, dark blue)
- **Subheading:** "Monitor your improvement over time" (medium gray)

### Progress Summary Cards (3 columns)

#### Card 1: Total Quizzes
- **Title:** "Total Quizzes" (dark gray)
- **Number:** "5" (very large, bold, dark blue)
- **Label:** "Quizzes completed" (light gray)

#### Card 2: Average Score
- **Title:** "Average Score" (dark gray)
- **Number:** "175/400" (very large, bold, orange)
- **Label:** "Across all quizzes" (light gray)

#### Card 3: Topics Mastered
- **Title:** "Topics Mastered" (dark gray)
- **Number:** "8" (very large, bold, green)
- **Label:** "Out of 15 topics" (light gray)

### Quiz History Section
- **Title:** "Quiz History" (dark blue, bold)
- **Table:**
  - Headers: Date | Subject | Score | Status | Actions
  - Rows:
    - 2025-01-27 | Mathematics | 165/400 | Completed | "View Results" link
    - 2025-01-20 | Mathematics | 150/400 | Completed | "View Results" link
    - 2025-01-15 | Mathematics | 140/400 | Completed | "View Results" link

### Topic Mastery Chart
- **Title:** "Topic Mastery Over Time" (dark blue, bold)
- **Chart:** Line chart or bar chart
  - X-axis: Time (dates)
  - Y-axis: Mastery percentage (0-100%)
  - Lines/Bars: Different colors for different topics
  - Legend: Topic names with colors

### Recent Activity Feed
- **Title:** "Recent Activity" (dark blue, bold)
- **Activity Items:**
  - "Completed Algebra practice set" (green checkmark, timestamp)
  - "Took diagnostic quiz" (blue icon, timestamp)
  - "Marked Calculus as in-progress" (yellow icon, timestamp)
  - "Viewed Limits and Continuity resources" (gray icon, timestamp)

### Design Notes
- Charts should be clear and easy to read
- Progress should be visually prominent
- Activity feed should be scannable
- Use color coding for status (completed/in-progress/not-started)

---

## 📱 Page 10: Profile Page (`/profile`)

### Layout
- Header with navigation
- Profile section
- Settings section
- Account section

### Header
- **Left:** StudyGapAI logo
- **Right:** Navigation - "Dashboard", "Study Plan", "Profile" (active)

### Profile Section
- **Avatar:** User avatar/initials (large circle)
- **Name:** User name (large, bold, dark blue)
- **Email:** User email (medium gray)
- **Phone:** User phone (medium gray, if available)

### Settings Section
- **Title:** "Settings" (dark blue, bold)
- **Target Score:**
  - Label: "Target JAMB Score"
  - Input: Number field, current value displayed
  - Button: "Update" (orange button)

### Account Section
- **Title:** "Account" (dark blue, bold)
- **Buttons:**
  - "Change Password" (outline button)
  - "Delete Account" (red button, with confirmation)

### Design Notes
- Clean, simple layout
- Focus on user information
- Settings should be easy to update
- Destructive actions should be clearly marked

---

## 🎨 Component Library

### Buttons
- **Primary:** Orange background, white text, rounded corners
- **Secondary:** White background, dark blue border, dark blue text
- **Outline:** Transparent background, dark blue border, dark blue text
- **Danger:** Red background, white text (for destructive actions)

### Cards
- **Standard:** White background, rounded corners (8px-12px), subtle shadow
- **Hover:** Slightly elevated shadow
- **Selected:** Orange border

### Badges/Tags
- **Success:** Green background, white text (for strong topics, completed tasks)
- **Warning:** Yellow background, dark text (for developing topics)
- **Error:** Red background, white text (for weak topics, errors)
- **Info:** Blue background, white text (for informational)

### Progress Bars
- **Standard:** Light gray background, orange fill
- **Success:** Light gray background, green fill
- **Warning:** Light gray background, yellow fill
- **Error:** Light gray background, red fill

### Input Fields
- **Standard:** White background, light gray border, rounded corners
- **Focus:** Orange border
- **Error:** Red border, error message below
- **Disabled:** Light gray background, disabled cursor

### Icons
- **Book:** Study plan, resources
- **Bar Chart:** Progress, diagnostics
- **Play:** Videos, start actions
- **Checkmark:** Completed tasks, correct answers
- **X/Circle:** Incomplete tasks, wrong answers
- **Arrow Up:** Strong topics, improvement
- **Arrow Down:** Weak topics, decline
- **User:** Profile, account
- **Clock:** Time, duration
- **Document:** Resources, practice sets

---

## 📐 Responsive Design

### Mobile (< 640px)
- Single column layout
- Stacked cards
- Hamburger menu for navigation
- Touch-friendly buttons (min 44px height)
- Larger text for readability

### Tablet (640px - 1024px)
- 2-column layout for cards
- Side navigation (optional)
- Medium-sized buttons

### Desktop (> 1024px)
- 3-column layout for cards
- Full navigation bar
- Hover effects
- Larger spacing

---

## 🎯 Design Principles

1. **Clarity:** Information should be easy to scan and understand
2. **Consistency:** Use consistent colors, spacing, and components
3. **Feedback:** Provide visual feedback for user actions (hover, loading, success, error)
4. **Hierarchy:** Use size, color, and spacing to establish visual hierarchy
5. **Accessibility:** Ensure sufficient color contrast and readable fonts
6. **Mobile-First:** Design for mobile, then scale up for larger screens

---

## 📝 Notes for Magic Patterns

1. **Use the color palette consistently** across all pages
2. **Maintain spacing** - use consistent padding and margins
3. **Use the component library** - buttons, cards, badges should look the same everywhere
4. **Add hover states** - buttons and interactive elements should have hover effects
5. **Include loading states** - show spinners/skeletons for async operations
6. **Show empty states** - what the page looks like when there's no data
7. **Include error states** - what error messages look like
8. **Make it responsive** - show mobile, tablet, and desktop views
9. **Add icons** - use consistent iconography throughout
10. **Use real content** - avoid "Lorem Ipsum", use realistic data

---

## ✅ Final Checklist for Design

- [ ] All 10 pages designed
- [ ] Consistent color palette used
- [ ] Consistent typography used
- [ ] Consistent spacing used
- [ ] All components from library used
- [ ] Responsive design implemented
- [ ] Hover states added
- [ ] Loading states shown
- [ ] Empty states shown
- [ ] Error states shown
- [ ] Icons used consistently
- [ ] Real content used (not Lorem Ipsum)
- [ ] Navigation flow makes sense
- [ ] All interactive elements are clear
- [ ] Accessibility considered (color contrast, readable fonts)

---

**Once you have the mockups, refer to FRONTEND_TECHNICAL_SPECIFICATION.md for API integration details.**

