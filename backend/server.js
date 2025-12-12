const express = require('express');
const cors = require('cors');
const path = require('path');
const Database = require('better-sqlite3'); 
const onboardRoutes = require('./routes/onboard');
const authRoutes = require('./routes/auth');
const bookingRoutes = require('./routes/bookings');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration - allow requests from frontend
app.use(cors({
  origin: process.env.FRONTEND_URL || '*', // Allow all origins in development
  credentials: true
}));
app.use(express.json());

// 1. Serve Images Publicly
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 2. Onboarding Routes (Write)
app.use('/api/onboard', onboardRoutes);

// 3. Authentication Routes
app.use('/api/auth', authRoutes);

// 4. Booking Routes
app.use('/api/bookings', bookingRoutes);

// 3. Marketplace Routes (Read - Merchant DB)
const merchantDb = new Database(path.join(__dirname, 'Merchantdb/merchant.db'));

// --- [NEW] 4. Connect to Booking DB ---
const bookingDb = new Database(path.join(__dirname, 'BookingDb/bookings.db'));
// --------------------------------------

// A. Get All Merchants
app.get('/api/merchants', (req, res) => {
    try {
        const merchants = merchantDb.prepare(`
            SELECT m.*, 
                   MIN(s.price) as min_price, 
                   MAX(s.price) as max_price,
                   (
                       SELECT json_group_array(json_object(
                           'day', day_of_week, 
                           'open', open_time, 
                           'close', close_time, 
                           'isOpen', is_open
                       ))
                       FROM working_hours wh 
                       WHERE wh.merchant_id = m.id
                   ) as hours_json
            FROM merchants m
            LEFT JOIN services s ON m.id = s.merchant_id
            GROUP BY m.id
            ORDER BY m.created_at DESC
        `).all();
        res.json(merchants);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch merchants" });
    }
});

// B. Get Single Merchant Details
app.get('/api/merchants/:slug', (req, res) => {
    try {
        const slug = req.params.slug;
        const merchant = merchantDb.prepare('SELECT * FROM merchants WHERE slug = ?').get(slug);

        if (!merchant) {
            return res.status(404).json({ error: 'Merchant not found' });
        }

        const services = merchantDb.prepare('SELECT * FROM services WHERE merchant_id = ?').all(merchant.id);
        const staff = merchantDb.prepare('SELECT * FROM staff WHERE merchant_id = ?').all(merchant.id);
        const hours = merchantDb.prepare('SELECT * FROM working_hours WHERE merchant_id = ?').all(merchant.id);

        const cleanedStaff = staff.map(s => ({
            ...s,
            specialties: s.specialties ? JSON.parse(s.specialties) : []
        }));

        res.json({
            ...merchant,
            services,
            staff: cleanedStaff,
            hours
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch merchant details" });
    }
});

// --- [LEGACY] Get Booked Slots Endpoint (for compatibility) ---
app.get('/api/bookings/slots', (req, res) => {
    try {
        const { merchant_id, date } = req.query;
        if (!merchant_id || !date) {
            return res.status(400).json({ error: "Missing merchant_id or date" });
        }

        // Fetch all confirmed bookings for this merchant & date
        const bookings = bookingDb.prepare(`
            SELECT booking_time 
            FROM bookings 
            WHERE merchant_id = ? AND booking_date = ? AND status != 'cancelled'
        `).all(merchant_id, date);

        // Return array of times, e.g. ["2:00 PM", "4:30 PM"]
        res.json(bookings.map(b => b.booking_time));
    } catch (err) {
        console.error("Error fetching bookings:", err);
        res.status(500).json({ error: "Failed to fetch bookings" });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Backend Server is running on port ${PORT}`);
    console.log(`📍 Accessible at: http://localhost:${PORT}`);
    if (process.env.RAILWAY_PUBLIC_DOMAIN) {
        console.log(`🌐 Public URL: https://${process.env.RAILWAY_PUBLIC_DOMAIN}`);
    }
});