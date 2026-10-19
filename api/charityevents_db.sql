

-- 1. Categories table
CREATE TABLE categories (
    category_id INT PRIMARY KEY AUTO_INCREMENT,
    category_name VARCHAR(50) NOT NULL UNIQUE,
    category_desc VARCHAR(200)
);

-- 2. Organisations table
CREATE TABLE organisations (
    org_id INT PRIMARY KEY AUTO_INCREMENT,
    org_name VARCHAR(100) NOT NULL,
    org_description TEXT,
    contact_email VARCHAR(100),
    contact_phone VARCHAR(20),
    address VARCHAR(200)
);

-- 3. Events table (updated with latitude/longitude for weather API)
CREATE TABLE events (
    event_id INT PRIMARY KEY AUTO_INCREMENT,
    event_name VARCHAR(100) NOT NULL,
    category_id INT NOT NULL,
    org_id INT NOT NULL,
    event_date DATETIME NOT NULL,
    location VARCHAR(200) NOT NULL,
    latitude DECIMAL(10,7) DEFAULT -33.8688,
    longitude DECIMAL(10,7) DEFAULT 151.2093,
    short_desc VARCHAR(300) NOT NULL,
    full_desc TEXT,
    ticket_price DECIMAL(10,2) DEFAULT 0.00,
    fundraising_goal DECIMAL(12,2) NOT NULL,
    current_funds DECIMAL(12,2) DEFAULT 0.00,
    status ENUM('upcoming', 'ongoing', 'past', 'suspended') DEFAULT 'upcoming',
    event_image VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(category_id),
    FOREIGN KEY (org_id) REFERENCES organisations(org_id)
);

-- 4. Registrations table (NEW for A3)
CREATE TABLE registrations (
    registration_id INT PRIMARY KEY AUTO_INCREMENT,
    event_id INT NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    ticket_count INT NOT NULL DEFAULT 1,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE RESTRICT,
    UNIQUE KEY unique_event_email (event_id, email)
);

-- Insert sample categories
INSERT INTO categories (category_name, category_desc) VALUES
('Fun Run', 'Outdoor running events to raise funds through entry fees'),
('Gala Dinner', 'Formal charity dinner with auction and guest speakers'),
('Silent Auction', 'Art and item auction with online and offline bidding'),
('Concert', 'Live music performances with all proceeds donated'),
('Community Fair', 'Local market and family day for community fundraising');

-- Insert sample organisation
INSERT INTO organisations (org_name, org_description, contact_email, contact_phone, address) VALUES
('Hope Foundation', 'A local non-profit organisation focused on community support, child welfare and animal rescue.', 'info@hopefoundation.org', '02-1234-5678', '123 Main St, Sydney NSW 2000');

-- Insert 9 sample events (with coordinates for weather API)
INSERT INTO events (event_name, category_id, org_id, event_date, location, latitude, longitude, short_desc, full_desc, ticket_price, fundraising_goal, current_funds, status, event_image) VALUES
('2026 City Charity 5K Fun Run', 1, 1, '2026-10-15 08:00:00', 'Sydney Olympic Park', -33.8470, 151.0652, 'Family-friendly fun run supporting the School Lunch Program.', 'This 5km fun run is open to all ages and fitness levels, with both competitive and casual categories. 100% of entry fees go towards providing nutritious school lunches for children in rural areas.', 35.00, 15000.00, 8200.00, 'upcoming', 'funrun1.jpg'),
('Starlight Charity Gala 2026', 2, 1, '2026-11-05 18:30:00', 'Hilton Sydney Grand Ballroom', -33.8688, 151.2093, 'Annual flagship gala dinner with live auction and guest speakers.', 'The Starlight Charity Gala is Hope Foundation\'s premier annual event, hosted with special guests from business and the arts. The evening features a three-course dinner, live jazz performance and luxury silent auction.', 299.00, 50000.00, 32500.00, 'upcoming', 'gala1.jpg'),
('Autumn Art Silent Auction', 3, 1, '2026-10-22 10:00:00', 'Sydney Contemporary Art Centre', -33.8810, 151.2120, 'Artworks donated by local artists, online and live bidding available.', 'This auction features over 30 original works from leading Australian artists, including paintings, sculptures and photography. All proceeds will fund the expansion of the city\'s stray animal rescue centre.', 0.00, 20000.00, 11200.00, 'upcoming', 'auction1.jpg'),
('Warm Voices Charity Concert', 4, 1, '2026-12-02 19:30:00', 'Sydney Opera House Concert Hall', -33.8568, 151.2153, 'All-star line-up supporting the Winter Warmth Appeal.', 'Featuring top Australian musicians across classical, pop and folk genres, this concert brings the community together for a great cause. All ticket revenue funds winter care packages for people experiencing homelessness.', 89.00, 35000.00, 18700.00, 'upcoming', 'concert1.jpg'),
('Community Charity Fair', 5, 1, '2026-09-30 09:00:00', 'Newtown Community Square', -33.8970, 151.1790, 'Market stalls, food vendors and kids activities supporting elderly outreach.', 'With over 50 handmade craft stalls, gourmet food vendors and free kids activities, this fair is a fun day out for the whole family. All stall fees and on-the-day donations support our weekly visiting program for isolated elderly residents.', 0.00, 5000.00, 3200.00, 'upcoming', 'fair1.jpg'),
('2025 Christmas Fun Run', 1, 1, '2025-12-20 07:30:00', 'Melbourne Central Park', -37.8136, 144.9631, 'Past event – Christmas themed charity run.', 'Our 2025 Christmas themed fun run saw over 800 participants raise $12,800 for the Children\'s Christmas Gift Program.', 30.00, 10000.00, 12800.00, 'past', 'funrun_past.jpg'),
('Policy Violation Event', 2, 1, '2026-11-20 19:00:00', 'TBD Venue', 0, 0, 'Suspended event – not visible to public.', 'This event has been suspended due to a breach of platform policy and is not displayed to users.', 99.00, 10000.00, 0.00, 'suspended', 'suspended.jpg'),
('Spring Bushwalking Challenge', 1, 1, '2026-10-08 07:00:00', 'Blue Mountains National Park', -33.7000, 150.3000, '10km hike to raise money for rural school libraries.', 'This scenic 10km trail walk through the Blue Mountains is suitable for moderately fit participants. Each participant is encouraged to raise a minimum of $200.', 45.00, 18000.00, 9600.00, 'upcoming', 'hike1.jpg'),
('Jazz Charity Night', 4, 1, '2026-11-12 20:00:00', 'The Basement Jazz Club', -33.8720, 151.2080, 'Top local jazz bands, 20% of bar proceeds donated.', 'Three of Sydney\'s best jazz ensembles perform back-to-back sets for one night only. 20% of all bar sales will be donated directly to the Music Education Program.', 55.00, 8000.00, 3400.00, 'upcoming', 'jazz1.jpg');

-- Insert 11 sample registrations (NEW for A3)
INSERT INTO registrations (event_id, full_name, email, phone, ticket_count) VALUES
(1, 'James Smith', 'james.smith@email.com', '0412 345 678', 2),
(1, 'Emma Wilson', 'emma.w@email.com', '0423 456 789', 1),
(1, 'Michael Brown', 'michael.b@email.com', '0434 567 890', 4),
(2, 'Sarah Davis', 'sarah.d@email.com', '0445 678 901', 2),
(2, 'David Miller', 'david.m@email.com', '0456 789 012', 1),
(3, 'Lisa Taylor', 'lisa.t@email.com', '0467 890 123', 1),
(4, 'Robert Anderson', 'robert.a@email.com', '0478 901 234', 3),
(4, 'Jennifer Thomas', 'jennifer.t@email.com', '0489 012 345', 2),
(5, 'William Jackson', 'william.j@email.com', '0490 123 456', 2),
(8, 'Olivia White', 'olivia.w@email.com', '0401 234 567', 1),
(8, 'Daniel Harris', 'daniel.h@email.com', '0412 345 678', 2);