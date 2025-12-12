# Testing Guide - Fein Booking Application

## How to Run the Application

### Step 1: Install Dependencies
Open your terminal in the project directory and run:
```bash
npm install
```

### Step 2: Start the Development Server
```bash
npm run dev
```

The application will start on `http://localhost:3000` (or the next available port).

### Step 3: Open in Browser
The browser should open automatically. If not, navigate to the URL shown in the terminal.

---

## Testing the Navigation

### Testing the Sidebar Buttons

1. **Login/Sign Up Page** (Initial State)
   - When you first open the app, you'll see the Auth page
   - Test the **Sign In** tab:
     - Enter any email and password
     - Click "Sign In" button
     - You should be redirected to the Dashboard
   
   - Test the **Sign Up** tab:
     - Click "Create Account" tab
     - Fill in Business Name, Email, and Password
     - Click "Create Account" button
     - You should be redirected to the Onboarding wizard, then to Dashboard

2. **Dashboard Navigation**
   - Once logged in, you'll see the sidebar on the left
   - Click each button to test navigation:
     - **Dashboard** - Shows analytics and KPIs
     - **Calendar** - Shows the calendar view with bookings
     - **Bookings** - Shows list of all bookings
     - **Reviews** - Shows customer reviews
     - **Content** - Shows content management
     - **Automations** - Shows automation settings
     - **Settings** - Shows application settings

3. **Visual Feedback**
   - The active page button should be highlighted in blue
   - The header title should change to match the current page
   - The page content should update when you click different buttons

4. **Sign Out**
   - Click the "Sign Out" button at the bottom of the sidebar
   - You should be redirected back to the Login/Sign Up page

---

## Testing Checklist

### ✅ Navigation Tests
- [ ] Dashboard button navigates to Dashboard page
- [ ] Calendar button navigates to Calendar page
- [ ] Bookings button navigates to Bookings page
- [ ] Reviews button navigates to Reviews page
- [ ] Content button navigates to Content page
- [ ] Automations button navigates to Automations page
- [ ] Settings button navigates to Settings page
- [ ] Sign Out button returns to Auth page
- [ ] Active page is highlighted in sidebar
- [ ] Header title updates correctly

### ✅ Authentication Tests
- [ ] Sign In form works
- [ ] Sign Up form works
- [ ] Can switch between Sign In and Sign Up tabs
- [ ] After login, redirected to Dashboard

### ✅ Mobile Responsiveness
- [ ] Sidebar menu button appears on mobile
- [ ] Sidebar opens/closes on mobile
- [ ] Navigation works on mobile devices

---

## Troubleshooting

### If buttons don't work:
1. Check browser console for errors (F12 → Console tab)
2. Make sure you're logged in (not on Auth page)
3. Try refreshing the page
4. Check that `npm run dev` is running

### If page doesn't load:
1. Check terminal for errors
2. Make sure all dependencies are installed (`npm install`)
3. Check that port 3000 is not in use

### Common Issues:
- **Port already in use**: Change the port in `vite.config.ts` or kill the process using port 3000
- **Module not found**: Run `npm install` again
- **Build errors**: Check that all TypeScript types are correct

---

## Quick Test Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

---

## Expected Behavior

1. **Initial Load**: Shows Login/Sign Up page
2. **After Login**: Shows Dashboard with sidebar navigation
3. **Sidebar Click**: Changes page content and highlights active button
4. **Sign Out**: Returns to Login/Sign Up page

The navigation is already functional in the code - all sidebar buttons call the `onNavigate` function which updates the current page state.




