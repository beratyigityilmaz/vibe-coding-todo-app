# Todo List Application - Design Guidelines

## Design Approach
**Design System Approach**: Drawing from modern productivity apps like Things, Todoist, and Linear. Focus on clarity, efficiency, and minimal visual noise. This is a utility-first application where function drives form.

## Layout System

**Container Strategy:**
- Main app: `max-w-2xl mx-auto px-4 py-8`
- Single-column layout (productivity tools should have laser focus)
- No multi-column needed - tasks displayed in vertical list
- Generous vertical spacing between task items for easy scanning

**Spacing Primitives:**
Use Tailwind units of **2, 4, 6, and 8** for consistency:
- Component padding: `p-4` to `p-6`
- List item spacing: `space-y-2` to `space-y-3`
- Section margins: `my-6` to `my-8`

## Typography

**Font Family:**
- Primary: 'Inter' or 'SF Pro Display' via Google Fonts
- Monospace for timestamps (if added): 'JetBrains Mono'

**Hierarchy:**
- App Title: `text-2xl font-semibold`
- Task Text: `text-base font-normal`
- Task Text (Completed): `text-base line-through opacity-60`
- Input Placeholder: `text-sm opacity-50`
- Secondary Text: `text-sm opacity-75`

## Component Library

### Header Section
- App title centered or left-aligned at top
- Minimal, clean presentation
- Subtle divider or spacing below

### Input Area
- Full-width input field with rounded corners (`rounded-lg`)
- Medium height (`h-12`) for comfortable interaction
- Inline "Add Task" button or Enter-to-submit pattern
- Clear placeholder text: "Add a new task..."
- Focus state with subtle border emphasis

### Task List Container
- Clean list with proper spacing between items
- Each task item in card-like container with `rounded-lg`
- Subtle borders or background differentiation
- Hover state: slight background shift for interactivity
- Empty state: Centered message "No tasks yet. Add one above!"

### Task Item Structure
Each task card contains:
- Checkbox (left): Custom-styled, `h-5 w-5`, rounded corners
- Task text (center): Flexible width, proper line height
- Edit button: Icon button (pencil icon from Heroicons)
- Delete button: Icon button (trash icon from Heroicons)
- All controls aligned in single row with `items-center`

**Task States:**
- Default: Clean, readable
- Completed: Checkbox filled, text with line-through + reduced opacity
- Editing: Input field replaces text, focus state active
- Hover: Subtle background change, action buttons more visible

### Icons
Use **Heroicons** (outline style) via CDN:
- Check icon for completed tasks
- Pencil icon for edit action
- Trash icon for delete action
- Plus icon for add button (if separate)

### Button Styles
- Primary (Add): Medium size `px-6 py-2.5`, rounded `rounded-lg`
- Icon buttons: `p-2`, subtle hover background
- Focus rings on all interactive elements for accessibility

## Responsive Design

**Mobile (base):**
- Full-width layout with `px-4` padding
- Touch-friendly targets (min 44px)
- Stack edit/delete icons if needed

**Desktop (md:):**
- Constrained width container
- Show edit/delete on hover for cleaner look
- Slightly larger spacing

## Interactions & Animations

**Keep minimal - use sparingly:**
- Checkbox toggle: Quick scale animation on check
- Task completion: Smooth fade + strikethrough transition
- Delete: Fast fade-out before removal
- Add task: Quick fade-in for new items
- All transitions: `transition-all duration-200`

## Accessibility

- Semantic HTML: `<input>`, `<button>`, `<ul>`, `<li>`
- ARIA labels on icon buttons
- Keyboard navigation: Tab through all controls
- Enter to submit, Escape to cancel edit
- Focus indicators on all interactive elements
- Proper contrast ratios for all text

## Images
**No images required** - This is a utility application focused purely on task management functionality.

## Key Principles
1. **Minimal distraction** - Let users focus on their tasks
2. **Instant feedback** - Clear visual response to every action
3. **Scannable hierarchy** - Easy to distinguish completed from pending
4. **Efficient workflow** - Minimal clicks to accomplish any action
5. **Persistent clarity** - Clean interface that doesn't fatigue with extended use