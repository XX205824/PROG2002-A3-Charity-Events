# PROG2002 Assessment 3 - Hope Foundation Charity Event Management System

## Project Overview
This is a full-stack dynamic charity event management system developed for PROG2002 Web Development II Assessment 3. It includes a public client-side website for event browsing and registration, and an admin-side dashboard for event CRUD management, backed by Node.js RESTful APIs and MySQL database.

## Tech Stack
- **Frontend**: HTML, CSS, Vanilla JavaScript, DOM
- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Deployment**: SCU cPanel

## Core Features

### Client-side Website
- Home page: display all upcoming charity events in card layout
- Search & filter page: filter events by date, location keyword and category
- Event detail page: show event information, fundraising progress bar, and full registration list sorted by date
- Dedicated registration page: form with client-side validation, submit registration and show success confirmation
- Shared global navigation bar across all pages

### Admin-side Dashboard
- Event list: view all events with all statuses
- Create event: add new charity event with form validation
- Edit event: modify existing event details, view associated registrations
- Delete event: delete event with data integrity check (blocked if registrations exist)

### Backend RESTful API
- `GET /api/events` - list all events, support filtering
- `GET /api/events/:id` - get single event with full registration list
- `POST /api/events` - create new event
- `PUT /api/events/:id` - update event by ID
- `DELETE /api/events/:id` - delete event with data integrity check
- `POST /api/events/:id/registrations` - submit new event registration

## Database Schema
- `events` table: stores event basic information, primary key `event_id`
- `registrations` table: stores user registration records, primary key `registration_id`, foreign key `event_id` references events table

## Live Deployment
- Client-side: https://24832931.it.scu.edu.au/
- API Base URL: https://24832931.it.scu.edu.au/api/

## How to Run Locally
1. Import `charityevents_db.sql` into your local MySQL database
2. Configure database connection in `api/event_db.js`
3. Go to `api` folder, run `npm install` then `node server.js`
4. Open frontend html files in browser

## GenAI Declaration
I acknowledge that I have used GenAI tools to complete this assessment. I used Doubao to check grammar, optimise code structure and debug runtime issues within the parameters outlined in the Assessment Brief.

## Academic Integrity Declaration
I declare that I have read and understood SCU's Academic Integrity policies and referencing guidelines. I am aware of the consequences of academic misconduct and confirm that this submission is my own original work, referenced appropriately, and has not been previously submitted.