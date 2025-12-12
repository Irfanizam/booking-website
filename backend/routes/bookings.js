// backend/routes/bookings.js
const express = require('express');
const Database = require('better-sqlite3');
const path = require('path');

const router = express.Router();
const bookingDb = new Database(path.join(__dirname, '../BookingDb/bookings.db'));
const merchantDb = new Database(path.join(__dirname, '../Merchantdb/merchant.db'));

// Get all bookings for a merchant
router.get('/', (req, res) => {
  try {
    const { merchant_id, date, status } = req.query;
    
    let query = 'SELECT * FROM bookings WHERE 1=1';
    const params = [];
    
    if (merchant_id) {
      query += ' AND merchant_id = ?';
      params.push(merchant_id);
    }
    
    if (date) {
      query += ' AND booking_date = ?';
      params.push(date);
    }
    
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY booking_date DESC, booking_time DESC';
    
    const bookings = bookingDb.prepare(query).all(...params);
    
    // Enrich with service and merchant info
    const enrichedBookings = bookings.map(booking => {
      const service = merchantDb.prepare('SELECT * FROM services WHERE id = ?').get(booking.service_id);
      const merchant = merchantDb.prepare('SELECT name FROM merchants WHERE id = ?').get(booking.merchant_id);
      
      return {
        ...booking,
        service: service ? {
          id: service.id,
          name: service.name,
          duration: service.duration,
          price: service.price
        } : null,
        merchant_name: merchant ? merchant.name : null
      };
    });
    
    res.json(enrichedBookings);
  } catch (err) {
    console.error('Error fetching bookings:', err);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Get single booking
router.get('/:id', (req, res) => {
  try {
    const booking = bookingDb.prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    const service = merchantDb.prepare('SELECT * FROM services WHERE id = ?').get(booking.service_id);
    const merchant = merchantDb.prepare('SELECT * FROM merchants WHERE id = ?').get(booking.merchant_id);
    
    res.json({
      ...booking,
      service,
      merchant
    });
  } catch (err) {
    console.error('Error fetching booking:', err);
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
});

// Create booking
router.post('/', (req, res) => {
  try {
    const {
      merchant_id,
      service_id = 1, // Default to service_id 1 if not provided
      customer_name,
      customer_phone,
      customer_email,
      booking_date,
      booking_time,
      party_size,
      total_price,
      notes,
      staff_name
    } = req.body;

    if (!merchant_id || !customer_name || !customer_phone || !booking_date || !booking_time) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // If no service_id provided, try to get first service for merchant, or use 1 as default
    let finalServiceId = service_id;
    if (!finalServiceId) {
      const firstService = merchantDb.prepare('SELECT id FROM services WHERE merchant_id = ? LIMIT 1').get(merchant_id);
      finalServiceId = firstService ? firstService.id : 1;
    }

    // Check if slot is already booked
    const existing = bookingDb.prepare(`
      SELECT * FROM bookings 
      WHERE merchant_id = ? AND booking_date = ? AND booking_time = ? AND status != 'cancelled'
    `).get(merchant_id, booking_date, booking_time);
    
    if (existing) {
      return res.status(400).json({ error: 'Time slot already booked' });
    }

    const stmt = bookingDb.prepare(`
      INSERT INTO bookings (
        merchant_id, service_id, customer_name, customer_phone,
        customer_email, booking_date, booking_time,
        party_size, total_price, notes, status, staff_name
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed', ?)
    `);

    const info = stmt.run(
      merchant_id,
      finalServiceId,
      customer_name,
      customer_phone,
      customer_email || null,
      booking_date,
      booking_time,
      party_size || 1,
      total_price || null,
      notes || null,
      staff_name || null
    );

    const newBooking = bookingDb.prepare('SELECT * FROM bookings WHERE id = ?').get(info.lastInsertRowid);
    
    res.json({ success: true, booking: newBooking });
  } catch (err) {
    console.error('Error creating booking:', err);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// Update booking
router.put('/:id', (req, res) => {
  try {
    const {
      customer_name,
      customer_phone,
      customer_email,
      booking_date,
      booking_time,
      party_size,
      total_price,
      notes,
      status,
      staff_name
    } = req.body;

    const booking = bookingDb.prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // If date/time changed, check for conflicts
    if ((booking_date && booking_date !== booking.booking_date) || 
        (booking_time && booking_time !== booking.booking_time)) {
      const existing = bookingDb.prepare(`
        SELECT * FROM bookings 
        WHERE merchant_id = ? AND booking_date = ? AND booking_time = ? 
        AND status != 'cancelled' AND id != ?
      `).get(
        booking.merchant_id,
        booking_date || booking.booking_date,
        booking_time || booking.booking_time,
        req.params.id
      );
      
      if (existing) {
        return res.status(400).json({ error: 'Time slot already booked' });
      }
    }

    const updates = [];
    const params = [];

    if (customer_name !== undefined) { updates.push('customer_name = ?'); params.push(customer_name); }
    if (customer_phone !== undefined) { updates.push('customer_phone = ?'); params.push(customer_phone); }
    if (customer_email !== undefined) { updates.push('customer_email = ?'); params.push(customer_email); }
    if (booking_date !== undefined) { updates.push('booking_date = ?'); params.push(booking_date); }
    if (booking_time !== undefined) { updates.push('booking_time = ?'); params.push(booking_time); }
    if (party_size !== undefined) { updates.push('party_size = ?'); params.push(party_size); }
    if (total_price !== undefined) { updates.push('total_price = ?'); params.push(total_price); }
    if (notes !== undefined) { updates.push('notes = ?'); params.push(notes); }
    if (status !== undefined) { updates.push('status = ?'); params.push(status); }
    if (staff_name !== undefined) { updates.push('staff_name = ?'); params.push(staff_name); }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    params.push(req.params.id);
    const query = `UPDATE bookings SET ${updates.join(', ')} WHERE id = ?`;
    
    bookingDb.prepare(query).run(...params);
    
    const updatedBooking = bookingDb.prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id);
    res.json({ success: true, booking: updatedBooking });
  } catch (err) {
    console.error('Error updating booking:', err);
    res.status(500).json({ error: 'Failed to update booking' });
  }
});

// Delete/Cancel booking
router.delete('/:id', (req, res) => {
  try {
    const booking = bookingDb.prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Soft delete by setting status to cancelled
    bookingDb.prepare('UPDATE bookings SET status = ? WHERE id = ?').run('cancelled', req.params.id);
    
    res.json({ success: true, message: 'Booking cancelled' });
  } catch (err) {
    console.error('Error cancelling booking:', err);
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
});

// Export bookings to CSV
router.get('/export/csv', (req, res) => {
  try {
    const { merchant_id, start_date, end_date } = req.query;
    
    let query = 'SELECT * FROM bookings WHERE 1=1';
    const params = [];
    
    if (merchant_id) {
      query += ' AND merchant_id = ?';
      params.push(merchant_id);
    }
    
    if (start_date) {
      query += ' AND booking_date >= ?';
      params.push(start_date);
    }
    
    if (end_date) {
      query += ' AND booking_date <= ?';
      params.push(end_date);
    }
    
    query += ' ORDER BY booking_date, booking_time';
    
    const bookings = bookingDb.prepare(query).all(...params);
    
    // Convert to CSV
    const headers = ['ID', 'Merchant ID', 'Service ID', 'Customer Name', 'Phone', 'Email', 
                     'Date', 'Time', 'Party Size', 'Price', 'Status', 'Notes', 'Created At'];
    const rows = bookings.map(b => [
      b.id,
      b.merchant_id,
      b.service_id,
      b.customer_name,
      b.customer_phone,
      b.customer_email || '',
      b.booking_date,
      b.booking_time,
      b.party_size,
      b.total_price || '',
      b.status,
      (b.notes || '').replace(/,/g, ';'), // Replace commas in notes
      b.created_at
    ]);
    
    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=bookings.csv');
    res.send(csv);
  } catch (err) {
    console.error('Error exporting bookings:', err);
    res.status(500).json({ error: 'Failed to export bookings' });
  }
});

module.exports = router;

