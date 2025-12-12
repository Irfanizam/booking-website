# Quick Start Guide - Fein Booking

## 🚀 Quick Setup (5 minutes)

### Step 1: Start Backend
```bash
cd backend
npm install
npm run db:init
node BookingDb/init_booking.js
npm start
```
✅ Backend running on http://localhost:5000

### Step 2: Start Frontend
```bash
cd "Merchant Portal Design"
npm install
npm run dev
```
✅ Frontend running on http://localhost:5173

### Step 3: Test the Application

1. **Sign Up:**
   - Go to http://localhost:5173
   - Click "Create Account"
   - Enter: Email, Password, Business Name (optional)
   - Click "Create Account"

2. **Login:**
   - Use the credentials you just created
   - Click "Sign In"
   - You'll be redirected to Dashboard

3. **Create a Booking:**
   - Go to Calendar page
   - Click "+ Add Booking"
   - Fill in customer details and select service
   - Click "Create Booking"

4. **View Bookings:**
   - Go to Bookings page
   - See all your bookings in a table
   - Use filters to search/filter

5. **Export:**
   - On Bookings page, click "Export"
   - CSV file will download

## 📋 Testing Checklist

- [ ] Sign up with new account
- [ ] Login with credentials
- [ ] Navigate to Calendar page
- [ ] Add a new booking
- [ ] Edit an existing booking
- [ ] Cancel a booking
- [ ] Navigate to Bookings page
- [ ] Filter bookings by status
- [ ] Search for a booking
- [ ] Export bookings to CSV
- [ ] View booking details
- [ ] Use sidebar navigation

## 🐛 Common Issues

**Backend won't start:**
- Check if port 5000 is available
- Run `npm install` again

**Frontend can't connect:**
- Make sure backend is running
- Check browser console for errors

**No bookings showing:**
- Create a merchant first (via onboarding)
- Then create bookings

**Can't login:**
- Make sure you signed up first
- Check email/password are correct

## 📞 Need Help?

See `IMPLEMENTATION_GUIDE.md` for detailed documentation.
