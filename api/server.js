const express = require('express');
const cors = require('cors');
const db = require('./event_db');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// ==================== API Endpoints ====================

// ========== A2 Existing Endpoints ==========

// 1. Get all event categories
app.get('/api/categories', (req, res) => {
    const sql = 'SELECT * FROM categories';
    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch categories', detail: err.message });
        }
        res.status(200).json({ success: true, data: results });
    });
});

// 2. Homepage: Get all active and upcoming events
app.get('/api/events/home', (req, res) => {
    const sql = `
        SELECT e.event_id, e.event_name, e.event_date, e.location, e.short_desc, 
               e.ticket_price, e.fundraising_goal, e.current_funds, e.status, e.event_image,
               c.category_name
        FROM events e
        JOIN categories c ON e.category_id = c.category_id
        WHERE e.status IN ('upcoming', 'ongoing')
        ORDER BY e.event_date ASC
    `;
    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch events', detail: err.message });
        }
        res.status(200).json({ success: true, count: results.length, data: results });
    });
});

// 3. Search events by date, location and category
app.get('/api/events/search', (req, res) => {
    const { date, location, category_id } = req.query;
    let sql = `
        SELECT e.event_id, e.event_name, e.event_date, e.location, e.short_desc,
               e.ticket_price, e.status, e.event_image, c.category_name
        FROM events e
        JOIN categories c ON e.category_id = c.category_id
        WHERE e.status IN ('upcoming', 'ongoing')
    `;
    const params = [];

    if (date) {
        sql += ' AND DATE(e.event_date) = ?';
        params.push(date);
    }
    if (location) {
        sql += ' AND e.location LIKE ?';
        params.push(`%${location}%`);
    }
    if (category_id) {
        sql += ' AND e.category_id = ?';
        params.push(category_id);
    }

    sql += ' ORDER BY e.event_date ASC';

    db.query(sql, params, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Event search failed', detail: err.message });
        }
        res.status(200).json({ success: true, count: results.length, data: results });
    });
});

// 4. Get single event details WITH registrations (UPDATED for A3)
app.get('/api/events/:id', (req, res) => {
    const eventId = req.params.id;
    
    const eventSql = `
        SELECT e.*, c.category_name, o.org_name, o.org_description, o.contact_email
        FROM events e
        JOIN categories c ON e.category_id = c.category_id
        JOIN organisations o ON e.org_id = o.org_id
        WHERE e.event_id = ?
    `;
    
    db.query(eventSql, [eventId], (err, eventResults) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch event details', detail: err.message });
        }
        if (eventResults.length === 0) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        const regSql = `
            SELECT * FROM registrations 
            WHERE event_id = ? 
            ORDER BY registration_date DESC
        `;
        
        db.query(regSql, [eventId], (regErr, regResults) => {
            if (regErr) {
                return res.status(500).json({ error: 'Failed to fetch registrations', detail: regErr.message });
            }
            
            res.status(200).json({
                success: true,
                data: {
                    ...eventResults[0],
                    registrations: regResults
                }
            });
        });
    });
});

// ========== A3 New Endpoints - Event CRUD ==========

// 5. Create new event (POST)
app.post('/api/events', (req, res) => {
    const { 
        event_name, category_id, org_id, event_date, location, 
        latitude, longitude, short_desc, full_desc, 
        ticket_price, fundraising_goal, current_funds, status 
    } = req.body;

    const sql = `
        INSERT INTO events 
        (event_name, category_id, org_id, event_date, location, latitude, longitude, short_desc, full_desc, ticket_price, fundraising_goal, current_funds, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
        event_name, category_id, org_id || 1, event_date, location,
        latitude || -33.8688, longitude || 151.2093,
        short_desc, full_desc, ticket_price || 0,
        fundraising_goal, current_funds || 0, status || 'upcoming'
    ];

    db.query(sql, params, (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to create event', detail: err.message });
        }
        res.status(201).json({
            success: true,
            message: 'Event created successfully',
            event_id: result.insertId
        });
    });
});

// 6. Update existing event (PUT)
app.put('/api/events/:id', (req, res) => {
    const eventId = req.params.id;
    const { 
        event_name, category_id, org_id, event_date, location,
        latitude, longitude, short_desc, full_desc,
        ticket_price, fundraising_goal, current_funds, status
    } = req.body;

    const sql = `
        UPDATE events SET
            event_name = ?, category_id = ?, org_id = ?, event_date = ?,
            location = ?, latitude = ?, longitude = ?, short_desc = ?,
            full_desc = ?, ticket_price = ?, fundraising_goal = ?,
            current_funds = ?, status = ?
        WHERE event_id = ?
    `;
    
    const params = [
        event_name, category_id, org_id, event_date, location,
        latitude, longitude, short_desc, full_desc,
        ticket_price, fundraising_goal, current_funds, status,
        eventId
    ];

    db.query(sql, params, (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to update event', detail: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }
        res.status(200).json({
            success: true,
            message: 'Event updated successfully'
        });
    });
});

// 7. Delete event (DELETE) - blocked if registrations exist
app.delete('/api/events/:id', (req, res) => {
    const eventId = req.params.id;

    const checkSql = 'SELECT COUNT(*) AS reg_count FROM registrations WHERE event_id = ?';
    db.query(checkSql, [eventId], (err, checkResult) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to check registrations', detail: err.message });
        }

        if (checkResult[0].reg_count > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete event: existing registrations found. Please cancel registrations first.'
            });
        }

        const deleteSql = 'DELETE FROM events WHERE event_id = ?';
        db.query(deleteSql, [eventId], (deleteErr, deleteResult) => {
            if (deleteErr) {
                return res.status(500).json({ error: 'Failed to delete event', detail: deleteErr.message });
            }
            if (deleteResult.affectedRows === 0) {
                return res.status(404).json({ success: false, message: 'Event not found' });
            }
            res.status(200).json({
                success: true,
                message: 'Event deleted successfully'
            });
        });
    });
});

// ========== A3 New Endpoints - Registrations ==========

// 8. Create new registration
app.post('/api/events/:id/registrations', (req, res) => {
    const eventId = req.params.id;
    const { full_name, email, phone, ticket_count } = req.body;

    if (!full_name || !email || !ticket_count || ticket_count < 1) {
        return res.status(400).json({
            success: false,
            message: 'Please provide all required fields and at least 1 ticket.'
        });
    }

        const sql = `
        INSERT INTO registrations (event_id, full_name, email, phone, ticket_count, registration_date)
        VALUES (?, ?, ?, ?, ?, NOW())
    `;
    
    db.query(sql, [eventId, full_name, email, phone || null, ticket_count], (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({
                    success: false,
                    message: 'You have already registered for this event with this email.'
                });
            }
            return res.status(500).json({ error: 'Failed to create registration', detail: err.message });
        }

        const updateFundsSql = `
            UPDATE events 
            SET current_funds = current_funds + (SELECT ticket_price FROM events WHERE event_id = ?) * ?
            WHERE event_id = ?
        `;
        db.query(updateFundsSql, [eventId, ticket_count, eventId]);

        res.status(201).json({
            success: true,
            message: 'Registration successful!',
            registration_id: result.insertId
        });
    });
});

// ========== Admin: Get ALL events (all statuses) ==========
app.get('/api/admin/events', (req, res) => {
    const sql = `
        SELECT e.event_id, e.event_name, e.event_date, e.location, e.status,
               e.ticket_price, e.fundraising_goal, e.current_funds,
               c.category_name,
               (SELECT COUNT(*) FROM registrations r WHERE r.event_id = e.event_id) AS registration_count
        FROM events e
        JOIN categories c ON e.category_id = c.category_id
        ORDER BY e.event_date DESC
    `;
    
    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch events', detail: err.message });
        }
        res.status(200).json({ success: true, count: results.length, data: results });
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`API server running at http://localhost:${PORT}`);
});