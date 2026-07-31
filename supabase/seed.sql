-- Seed data generated from src/data

truncate post_comments, posts, events, plan_stops, favorites, places restart identity cascade;

insert into places (
  id, name, category, neighborhood, area, image, images, rating, review_count,
  price_range, currency, tags, open_until, open_now, description, amenities,
  address, phone, lat, lng, hours, special, reviews, slots, slot_label
) values (
  'sugarcane', 'Sugarcane Rooftop', 'restaurant', 'New Kingston', 'Kingston',
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80', '["https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80","https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=800&q=80","https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80"]', 4.7, 1284, 3, 'JMD',
  '["Open now","Live music tonight","Rooftop views"]', '11:00 PM', true, 'An elevated rooftop dining experience in the heart of New Kingston. Sugarcane serves modern Caribbean plates with an emphasis on local produce, jerk-spiced small plates and a rum-forward cocktail list, all under the string lights with a skyline view.', '["Rooftop seating","Full bar","Live music","Reservations","Vegan options","Parking"]',
  '17 Knutsford Blvd, New Kingston', '+1 876-555-0142', 18.0075, -76.789, '[{"day":"Mon","open":"4:00 PM","close":"11:00 PM","closed":true},{"day":"Tue","open":"4:00 PM","close":"11:00 PM","closed":false},{"day":"Wed","open":"4:00 PM","close":"11:00 PM","closed":false},{"day":"Thu","open":"4:00 PM","close":"11:00 PM","closed":false},{"day":"Fri","open":"4:00 PM","close":"11:00 PM","closed":false},{"day":"Sat","open":"4:00 PM","close":"11:00 PM","closed":false},{"day":"Sun","open":"4:00 PM","close":"11:00 PM","closed":false}]',
  'Happy hour 5–7 PM: 2-for-1 rum punch',
  '[{"id":"r1","source":"outyah","author":"Kimberly A.","avatar":"https://api.dicebear.com/7.x/avataaars/svg?seed=Kimberly","rating":5,"date":"2 days ago","text":"The jerk lamb chops were unreal and the sunset from the rooftop is worth it alone. Book ahead on weekends.","businessReply":"Give thanks Kimberly! The lamb is our chef''s pride. See you again soon."},{"id":"r2","source":"google","author":"Andre M.","avatar":"https://api.dicebear.com/7.x/avataaars/svg?seed=Andre","rating":4,"date":"1 week ago","text":"Great vibes and cocktails. Service was a touch slow when the band started but food made up for it."}]', null, null
);

insert into places (
  id, name, category, neighborhood, area, image, images, rating, review_count,
  price_range, currency, tags, open_until, open_now, description, amenities,
  address, phone, lat, lng, hours, special, reviews, slots, slot_label
) values (
  'scotchies', 'Scotchies Jerk Centre', 'restaurant', 'Drax Hall', 'Ocho Rios',
  'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80', '["https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80","https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80"]', 4.8, 3120, 2, 'JMD',
  '["Open now","Local favorite","Cash & card"]', '10:00 PM', true, 'The legendary open-air jerk pit. Everything is smoked over pimento wood — jerk chicken, pork and festival — served on foil with a side of roasted breadfruit. A proper Jamaican institution.', '["Outdoor seating","Takeout","Cash & card","Family friendly"]',
  'Drax Hall, St. Ann', '+1 876-555-0187', 18.4105, -77.0998, '[{"day":"Mon","open":"11:00 AM","close":"10:00 PM","closed":false},{"day":"Tue","open":"11:00 AM","close":"10:00 PM","closed":false},{"day":"Wed","open":"11:00 AM","close":"10:00 PM","closed":false},{"day":"Thu","open":"11:00 AM","close":"10:00 PM","closed":false},{"day":"Fri","open":"11:00 AM","close":"10:00 PM","closed":false},{"day":"Sat","open":"11:00 AM","close":"10:00 PM","closed":false},{"day":"Sun","open":"11:00 AM","close":"10:00 PM","closed":false}]',
  null,
  '[{"id":"r1","source":"google","author":"Trevor B.","avatar":"https://api.dicebear.com/7.x/avataaars/svg?seed=Trevor","rating":5,"date":"3 days ago","text":"Best jerk on the north coast, no debate. Get the quarter chicken with festival."}]', null, null
);

insert into places (
  id, name, category, neighborhood, area, image, images, rating, review_count,
  price_range, currency, tags, open_until, open_now, description, amenities,
  address, phone, lat, lng, hours, special, reviews, slots, slot_label
) values (
  'ricks', 'Cliffside at Rick''s', 'bar', 'West End', 'Negril',
  'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=80', '["https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=80","https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80"]', 4.5, 2045, 3, 'USD',
  '["Open now","Sunset spot","Cliff diving"]', '12:00 AM', true, 'Perched on the Negril cliffs, this is the island''s most famous sunset bar. Watch cliff divers leap into the Caribbean while you sip a Bob Marley cocktail and the sky turns to fire.', '["Ocean views","Full bar","Live music","Cliff diving","Swimming"]',
  'Lighthouse Rd, West End, Negril', '+1 876-555-0110', 18.2508, -78.3742, '[{"day":"Mon","open":"11:00 AM","close":"12:00 AM","closed":false},{"day":"Tue","open":"11:00 AM","close":"12:00 AM","closed":false},{"day":"Wed","open":"11:00 AM","close":"12:00 AM","closed":false},{"day":"Thu","open":"11:00 AM","close":"12:00 AM","closed":false},{"day":"Fri","open":"11:00 AM","close":"12:00 AM","closed":false},{"day":"Sat","open":"11:00 AM","close":"12:00 AM","closed":false},{"day":"Sun","open":"11:00 AM","close":"12:00 AM","closed":false}]',
  'Sunset session with live band daily from 5 PM',
  '[{"id":"r1","source":"instagram","author":"@islandhopper","avatar":"https://api.dicebear.com/7.x/avataaars/svg?seed=Island","rating":5,"date":"4 days ago","text":"That sunset hits different. Touristy but 100% worth it once."}]', null, null
);

insert into places (
  id, name, category, neighborhood, area, image, images, rating, review_count,
  price_range, currency, tags, open_until, open_now, description, amenities,
  address, phone, lat, lng, hours, special, reviews, slots, slot_label
) values (
  'pier-one', 'Pier One Waterfront', 'bar', 'Howard Cooke Blvd', 'Montego Bay',
  'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=800&q=80', '["https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=800&q=80"]', 4.3, 1567, 3, 'JMD',
  '["Open now","Fri Night Fever","Waterfront"]', '2:00 AM', true, 'MoBay''s iconic waterfront bar and party spot. By day it''s laid-back seafood and cocktails over the water; by Friday night it''s the biggest party on the strip.', '["Waterfront","Full bar","DJ","Seafood","Boat dock"]',
  '1 Howard Cooke Blvd, Montego Bay', '+1 876-555-0155', 18.4762, -77.9205, '[{"day":"Mon","open":"11:00 AM","close":"2:00 AM","closed":false},{"day":"Tue","open":"11:00 AM","close":"2:00 AM","closed":false},{"day":"Wed","open":"11:00 AM","close":"2:00 AM","closed":false},{"day":"Thu","open":"11:00 AM","close":"2:00 AM","closed":false},{"day":"Fri","open":"11:00 AM","close":"2:00 AM","closed":false},{"day":"Sat","open":"11:00 AM","close":"2:00 AM","closed":false},{"day":"Sun","open":"11:00 AM","close":"2:00 AM","closed":false}]',
  'Friday Night Fever — no cover before 10 PM',
  '[{"id":"r1","source":"outyah","author":"Dwayne C.","avatar":"https://api.dicebear.com/7.x/avataaars/svg?seed=Dwayne","rating":4,"date":"1 week ago","text":"Friday nights are a movie. Get there early to grab a spot by the water."}]', null, null
);

insert into places (
  id, name, category, neighborhood, area, image, images, rating, review_count,
  price_range, currency, tags, open_until, open_now, description, amenities,
  address, phone, lat, lng, hours, special, reviews, slots, slot_label
) values (
  'cafe-blue', 'Cafe Blue', 'cafe', 'Irish Town', 'Kingston',
  'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80', '["https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80"]', 4.6, 690, 2, 'JMD',
  '["Closes soon","Blue Mountain coffee","Mountain view"]', '5:00 PM', true, 'Nestled in Irish Town on the way up to the Blue Mountains, Cafe Blue roasts some of the finest Blue Mountain coffee in the world. Come for a flat white and stay for the misty mountain views.', '["Mountain view","Free WiFi","Pastries","Outdoor seating"]',
  'Irish Town, St. Andrew', '+1 876-555-0164', 18.0702, -76.7204, '[{"day":"Mon","open":"7:00 AM","close":"5:00 PM","closed":false},{"day":"Tue","open":"7:00 AM","close":"5:00 PM","closed":false},{"day":"Wed","open":"7:00 AM","close":"5:00 PM","closed":false},{"day":"Thu","open":"7:00 AM","close":"5:00 PM","closed":false},{"day":"Fri","open":"7:00 AM","close":"5:00 PM","closed":false},{"day":"Sat","open":"7:00 AM","close":"5:00 PM","closed":false},{"day":"Sun","open":"7:00 AM","close":"5:00 PM","closed":false}]',
  null,
  '[{"id":"r1","source":"google","author":"Patrice W.","avatar":"https://api.dicebear.com/7.x/avataaars/svg?seed=Patrice","rating":5,"date":"6 days ago","text":"The drive up is gorgeous and the coffee is the real thing. Grab beans for home."}]', null, null
);

insert into places (
  id, name, category, neighborhood, area, image, images, rating, review_count,
  price_range, currency, tags, open_until, open_now, description, amenities,
  address, phone, lat, lng, hours, special, reviews, slots, slot_label
) values (
  'deaf-can', 'Deaf Can! Coffee', 'cafe', 'Manor Park', 'Kingston',
  'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80', '["https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80"]', 4.9, 512, 2, 'JMD',
  '["Open now","Community","20% off today"]', '6:00 PM', true, 'A social-enterprise cafe training and employing deaf baristas. Beautiful espresso, homemade treats and one of the warmest rooms in Kingston.', '["Free WiFi","Pastries","Community","Card accepted"]',
  'Manor Park Plaza, Kingston 8', '+1 876-555-0173', 18.0355, -76.7902, '[{"day":"Mon","open":"7:30 AM","close":"6:00 PM","closed":false},{"day":"Tue","open":"7:30 AM","close":"6:00 PM","closed":false},{"day":"Wed","open":"7:30 AM","close":"6:00 PM","closed":false},{"day":"Thu","open":"7:30 AM","close":"6:00 PM","closed":false},{"day":"Fri","open":"7:30 AM","close":"6:00 PM","closed":false},{"day":"Sat","open":"7:30 AM","close":"6:00 PM","closed":false},{"day":"Sun","open":"7:30 AM","close":"6:00 PM","closed":true}]',
  '20% off all pour-overs today only',
  '[{"id":"r1","source":"outyah","author":"Simone R.","avatar":"https://api.dicebear.com/7.x/avataaars/svg?seed=Simone","rating":5,"date":"2 days ago","text":"Best flat white in Kingston and the mission behind it makes it even sweeter."}]', null, null
);

insert into places (
  id, name, category, neighborhood, area, image, images, rating, review_count,
  price_range, currency, tags, open_until, open_now, description, amenities,
  address, phone, lat, lng, hours, special, reviews, slots, slot_label
) values (
  'palace-cineplex', 'Palace Cineplex', 'movies', 'Sovereign Centre', 'Kingston',
  'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80', '["https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80"]', 4.2, 980, 2, 'JMD',
  '["Open now","New releases","IMAX"]', '1:00 AM', true, 'Kingston''s premier multiplex at Sovereign Centre with the island''s largest screens, recliner seating and a full snack bar.', '["IMAX","Recliners","Snack bar","Parking"]',
  'Sovereign Centre, Hope Rd, Kingston 6', '+1 876-555-0199', 18.012, -76.765, '[{"day":"Mon","open":"12:00 PM","close":"1:00 AM","closed":false},{"day":"Tue","open":"12:00 PM","close":"1:00 AM","closed":false},{"day":"Wed","open":"12:00 PM","close":"1:00 AM","closed":false},{"day":"Thu","open":"12:00 PM","close":"1:00 AM","closed":false},{"day":"Fri","open":"12:00 PM","close":"1:00 AM","closed":false},{"day":"Sat","open":"12:00 PM","close":"1:00 AM","closed":false},{"day":"Sun","open":"12:00 PM","close":"1:00 AM","closed":false}]',
  null,
  '[{"id":"r1","source":"google","author":"Kevon H.","avatar":"https://api.dicebear.com/7.x/avataaars/svg?seed=Kevon","rating":4,"date":"1 week ago","text":"Comfortable recliners and good sound. Book online to skip the queue on Fridays."}]', '[{"time":"1:30 PM","label":"Dune: Part Two","available":true},{"time":"4:15 PM","label":"Dune: Part Two","available":true},{"time":"7:00 PM","label":"Kingston Nights (Premiere)","available":false},{"time":"7:45 PM","label":"The Comeback","available":true},{"time":"10:30 PM","label":"Dune: Part Two","available":true}]', 'Today''s showtimes'
);

insert into places (
  id, name, category, neighborhood, area, image, images, rating, review_count,
  price_range, currency, tags, open_until, open_now, description, amenities,
  address, phone, lat, lng, hours, special, reviews, slots, slot_label
) values (
  'level-up', 'Level Up Gaming Lounge', 'gaming', 'Half Way Tree', 'Kingston',
  'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80', '["https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80"]', 4.6, 430, 2, 'JMD',
  '["Open now","Tournaments","Student rates"]', '12:00 AM', true, 'Half Way Tree''s home base for gamers — PS5, Xbox Series X, high-spec gaming PCs and VR. Book a station by the hour or join a FIFA tournament.', '["PS5 & Xbox","Gaming PCs","VR","Snacks","Private rooms"]',
  'Twin Gates Plaza, Half Way Tree', '+1 876-555-0128', 18.0125, -76.798, '[{"day":"Mon","open":"12:00 PM","close":"12:00 AM","closed":false},{"day":"Tue","open":"12:00 PM","close":"12:00 AM","closed":false},{"day":"Wed","open":"12:00 PM","close":"12:00 AM","closed":false},{"day":"Thu","open":"12:00 PM","close":"12:00 AM","closed":false},{"day":"Fri","open":"12:00 PM","close":"12:00 AM","closed":false},{"day":"Sat","open":"12:00 PM","close":"12:00 AM","closed":false},{"day":"Sun","open":"12:00 PM","close":"12:00 AM","closed":false}]',
  'Students: 30% off weekdays with valid ID',
  '[{"id":"r1","source":"outyah","author":"Rohan G.","avatar":"https://api.dicebear.com/7.x/avataaars/svg?seed=Rohan","rating":5,"date":"3 days ago","text":"Clean setups, fast internet and the FIFA nights are a vibe."}]', '[{"time":"2:00 PM","label":"PC Station","available":true},{"time":"3:00 PM","label":"PS5 Booth","available":true},{"time":"4:00 PM","label":"Squad Room","available":false},{"time":"5:00 PM","label":"PC Station","available":true},{"time":"6:00 PM","label":"VR Bay","available":true}]', 'Book a station'
);

insert into places (
  id, name, category, neighborhood, area, image, images, rating, review_count,
  price_range, currency, tags, open_until, open_now, description, amenities,
  address, phone, lat, lng, hours, special, reviews, slots, slot_label
) values (
  'seven-mile', 'Seven Mile Beach', 'beach', 'Long Bay', 'Negril',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', '["https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80"]', 4.8, 4200, 1, 'JMD',
  '["Open now","Free entry","Sunset spot"]', 'Open 24 hrs', true, 'Seven miles of powder-white sand and impossibly clear turquoise water. Lined with beach bars, water sports and the best sunsets on the island.', '["Free entry","Beach bars","Water sports","Swimming","Sunset views"]',
  'Norman Manley Blvd, Negril', '—', 18.32, -78.338, '[{"day":"Mon","open":"12:00 AM","close":"11:59 PM","closed":false},{"day":"Tue","open":"12:00 AM","close":"11:59 PM","closed":false},{"day":"Wed","open":"12:00 AM","close":"11:59 PM","closed":false},{"day":"Thu","open":"12:00 AM","close":"11:59 PM","closed":false},{"day":"Fri","open":"12:00 AM","close":"11:59 PM","closed":false},{"day":"Sat","open":"12:00 AM","close":"11:59 PM","closed":false},{"day":"Sun","open":"12:00 AM","close":"11:59 PM","closed":false}]',
  null,
  '[{"id":"r1","source":"instagram","author":"@wanderlust.ja","avatar":"https://api.dicebear.com/7.x/avataaars/svg?seed=Wander","rating":5,"date":"1 day ago","text":"Paradise. Grab a beach chair, order a Red Stripe and don''t move till sunset."}]', null, null
);

insert into places (
  id, name, category, neighborhood, area, image, images, rating, review_count,
  price_range, currency, tags, open_until, open_now, description, amenities,
  address, phone, lat, lng, hours, special, reviews, slots, slot_label
) values (
  'doctors-cave', 'Doctor''s Cave Beach', 'beach', 'Gloucester Ave', 'Montego Bay',
  'https://images.unsplash.com/photo-1559827260-dc66d52bef19?auto=format&fit=crop&w=800&q=80', '["https://images.unsplash.com/photo-1559827260-dc66d52bef19?auto=format&fit=crop&w=800&q=80"]', 4.5, 2890, 2, 'JMD',
  '["Open now","Crystal water","Family friendly"]', '6:00 PM', true, 'MoBay''s famous spa beach with calm, crystal-clear water. Small entry fee, chairs and umbrellas for rent, and a snack bar on the sand.', '["Changing rooms","Snack bar","Chair rental","Lifeguard"]',
  'Gloucester Ave, Montego Bay', '+1 876-555-0133', 18.486, -77.927, '[{"day":"Mon","open":"8:30 AM","close":"6:00 PM","closed":false},{"day":"Tue","open":"8:30 AM","close":"6:00 PM","closed":false},{"day":"Wed","open":"8:30 AM","close":"6:00 PM","closed":false},{"day":"Thu","open":"8:30 AM","close":"6:00 PM","closed":false},{"day":"Fri","open":"8:30 AM","close":"6:00 PM","closed":false},{"day":"Sat","open":"8:30 AM","close":"6:00 PM","closed":false},{"day":"Sun","open":"8:30 AM","close":"6:00 PM","closed":false}]',
  null,
  '[{"id":"r1","source":"google","author":"Maria L.","avatar":"https://api.dicebear.com/7.x/avataaars/svg?seed=Maria","rating":5,"date":"5 days ago","text":"Water is unreal. Arrive early for a good spot on weekends."}]', null, null
);

insert into places (
  id, name, category, neighborhood, area, image, images, rating, review_count,
  price_range, currency, tags, open_until, open_now, description, amenities,
  address, phone, lat, lng, hours, special, reviews, slots, slot_label
) values (
  'dunns-river', 'Dunn''s River Falls', 'attraction', 'Ocho Rios', 'Ocho Rios',
  'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=800&q=80', '["https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=800&q=80"]', 4.7, 8500, 2, 'USD',
  '["Open now","Must-do","Guided climb"]', '4:00 PM', true, 'Jamaica''s most iconic waterfall. Climb the terraced limestone falls hand-in-hand with a guide, swim in the pools, and take in the north-coast views.', '["Guided climb","Changing rooms","Gift shop","Parking"]',
  'Dunn''s River Falls, Ocho Rios', '+1 876-555-0101', 18.4127, -77.1392, '[{"day":"Mon","open":"8:30 AM","close":"4:00 PM","closed":false},{"day":"Tue","open":"8:30 AM","close":"4:00 PM","closed":false},{"day":"Wed","open":"8:30 AM","close":"4:00 PM","closed":false},{"day":"Thu","open":"8:30 AM","close":"4:00 PM","closed":false},{"day":"Fri","open":"8:30 AM","close":"4:00 PM","closed":false},{"day":"Sat","open":"8:30 AM","close":"4:00 PM","closed":false},{"day":"Sun","open":"8:30 AM","close":"4:00 PM","closed":false}]',
  null,
  '[{"id":"r1","source":"outyah","author":"Andre M.","avatar":"https://api.dicebear.com/7.x/avataaars/svg?seed=Andre2","rating":5,"date":"1 week ago","text":"Bucket list done. Wear water shoes and go early before the tour buses arrive."}]', null, null
);

insert into places (
  id, name, category, neighborhood, area, image, images, rating, review_count,
  price_range, currency, tags, open_until, open_now, description, amenities,
  address, phone, lat, lng, hours, special, reviews, slots, slot_label
) values (
  'reggae-museum', 'Trench Town Culture Yard', 'attraction', 'Trench Town', 'Kingston',
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=800&q=80', '["https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=800&q=80"]', 4.6, 1340, 2, 'JMD',
  '["Open now","History","Guided tour"]', '5:00 PM', true, 'The birthplace of reggae and ska. Walk the yard where legends grew up, see original instruments and hear the stories that shaped Jamaican music.', '["Guided tour","Gift shop","Live music","Photo spots"]',
  '6-10 Lower First St, Trench Town', '+1 876-555-0146', 17.978, -76.804, '[{"day":"Mon","open":"9:00 AM","close":"5:00 PM","closed":false},{"day":"Tue","open":"9:00 AM","close":"5:00 PM","closed":false},{"day":"Wed","open":"9:00 AM","close":"5:00 PM","closed":false},{"day":"Thu","open":"9:00 AM","close":"5:00 PM","closed":false},{"day":"Fri","open":"9:00 AM","close":"5:00 PM","closed":false},{"day":"Sat","open":"9:00 AM","close":"5:00 PM","closed":false},{"day":"Sun","open":"9:00 AM","close":"5:00 PM","closed":false}]',
  null,
  '[{"id":"r1","source":"google","author":"Leroy S.","avatar":"https://api.dicebear.com/7.x/avataaars/svg?seed=Leroy","rating":5,"date":"2 weeks ago","text":"Powerful, authentic tour. The guides bring the history to life."}]', null, null
);

insert into events (
  id, title, type, date_label, time_label, venue_name, place_id, area, image,
  description, going, interested, price, attendees
) values (
  'reggae-sundays', 'Reggae Sundays: Live at the Rooftop', 'Live Music', 'Sun, Jul 26', '6:00 PM', 'Sugarcane Rooftop',
  'sugarcane', 'Kingston', 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=800&q=80', 'Weekly live reggae with Kingston''s finest bands. Doors 6 PM, band on at 7. Rum specials all night.', 142, 318,
  'Free before 7 PM', '[{"name":"Kimberly","avatar":"https://api.dicebear.com/7.x/avataaars/svg?seed=Kimberly"},{"name":"Andre","avatar":"https://api.dicebear.com/7.x/avataaars/svg?seed=Andre"},{"name":"Simone","avatar":"https://api.dicebear.com/7.x/avataaars/svg?seed=Simone"}]'
);

insert into events (
  id, title, type, date_label, time_label, venue_name, place_id, area, image,
  description, going, interested, price, attendees
) values (
  'trivia-night', 'Thursday Trivia Night', 'Trivia', 'Thu, Jul 23', '7:30 PM', 'Deaf Can! Coffee',
  'deaf-can', 'Kingston', 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80', 'Teams of up to 6. Five rounds, prizes for winners. Free to enter.', 48, 96,
  'Free', '[{"name":"Simone","avatar":"https://api.dicebear.com/7.x/avataaars/svg?seed=Simone"},{"name":"Rohan","avatar":"https://api.dicebear.com/7.x/avataaars/svg?seed=Rohan"}]'
);

insert into events (
  id, title, type, date_label, time_label, venue_name, place_id, area, image,
  description, going, interested, price, attendees
) values (
  'fifa-cup', 'Level Up FIFA Cup', 'Gaming Tournament', 'Sat, Jul 25', '2:00 PM', 'Level Up Gaming Lounge',
  'level-up', 'Kingston', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80', '32-player FIFA tournament. J$2,000 entry — winner takes the pot.', 64, 120,
  'J$2,000 entry', '[{"name":"Rohan","avatar":"https://api.dicebear.com/7.x/avataaars/svg?seed=Rohan"},{"name":"Dwayne","avatar":"https://api.dicebear.com/7.x/avataaars/svg?seed=Dwayne"}]'
);

insert into events (
  id, title, type, date_label, time_label, venue_name, place_id, area, image,
  description, going, interested, price, attendees
) values (
  'kingston-nights-premiere', '''Kingston Nights'' Movie Premiere', 'Movie Premiere', 'Fri, Jul 24', '7:00 PM', 'Palace Cineplex',
  'palace-cineplex', 'Kingston', 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80', 'Red-carpet premiere of the Jamaican feature ''Kingston Nights''. Cast Q&A after.', 210, 540,
  'J$3,500', '[{"name":"Kimberly","avatar":"https://api.dicebear.com/7.x/avataaars/svg?seed=Kimberly"},{"name":"Camille","avatar":"https://api.dicebear.com/7.x/avataaars/svg?seed=Camille"}]'
);

insert into events (
  id, title, type, date_label, time_label, venue_name, place_id, area, image,
  description, going, interested, price, attendees
) values (
  'negril-sunset-session', 'Sunset Session on the Cliffs', 'Party', 'Sat, Jul 25', '5:00 PM', 'Cliffside at Rick''s',
  'ricks', 'Negril', 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=80', 'Sundowners, cliff divers and a live band as the sun drops into the sea.', 88, 176,
  'Free entry', '[{"name":"Nadia","avatar":"https://api.dicebear.com/7.x/avataaars/svg?seed=Nadia"},{"name":"Andre","avatar":"https://api.dicebear.com/7.x/avataaars/svg?seed=Andre"}]'
);

insert into posts (
  id, place_id, username, user_avatar, caption, media_url, media_type, permalink,
  posted_at, like_count, comments_count
) values (
  'ig-sugarcane-1', 'sugarcane', 'sugarcane.kingston', 'https://api.dicebear.com/7.x/avataaars/svg?seed=sugarcane', 'Sunset service on the roof. Jerk lamb + rum punch under the string lights. Book ahead this weekend. #Kingston #OutYah',
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80', 'IMAGE', 'https://www.instagram.com/', '2026-07-18T22:14:00Z',
  842, 36
);

insert into post_comments (id, post_id, username, body, posted_at) values (
  'ig-sugarcane-1-c1', 'ig-sugarcane-1', 'kimberly.eats', 'Those lamb chops look deadly. Table for 2 Sat?', '2026-07-18T22:40:00Z'
);

insert into post_comments (id, post_id, username, body, posted_at) values (
  'ig-sugarcane-1-c2', 'ig-sugarcane-1', 'damar_yaad', 'Rooftop never misses. See unnu later.', '2026-07-18T23:05:00Z'
);

insert into post_comments (id, post_id, username, body, posted_at) values (
  'ig-sugarcane-1-c3', 'ig-sugarcane-1', 'jade.ja', 'Is the band still on Fridays?', '2026-07-19T01:12:00Z'
);

insert into posts (
  id, place_id, username, user_avatar, caption, media_url, media_type, permalink,
  posted_at, like_count, comments_count
) values (
  'ig-scotchies-1', 'scotchies', 'scotchiesjerk', 'https://api.dicebear.com/7.x/avataaars/svg?seed=scotchies', 'Pit smoke rolling in Drax Hall. Come early — the line moves but the chicken goes fast.',
  'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80', 'IMAGE', 'https://www.instagram.com/', '2026-07-17T16:02:00Z',
  2104, 88
);

insert into post_comments (id, post_id, username, body, posted_at) values (
  'ig-scotchies-1-c1', 'ig-scotchies-1', 'mobayfoodie', 'Best jerk on the north coast, no debate.', '2026-07-17T16:20:00Z'
);

insert into post_comments (id, post_id, username, body, posted_at) values (
  'ig-scotchies-1-c2', 'ig-scotchies-1', 'tour.crew', 'Grabbing a pound after the falls.', '2026-07-17T17:01:00Z'
);

insert into posts (
  id, place_id, username, user_avatar, caption, media_url, media_type, permalink,
  posted_at, like_count, comments_count
) values (
  'ig-ricks-1', 'ricks', 'rickscafenegril', 'https://api.dicebear.com/7.x/avataaars/svg?seed=ricks', 'Cliff jumps, cold Red Stripe, and that Negril sunset. West End magic tonight.',
  'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=80', 'IMAGE', 'https://www.instagram.com/', '2026-07-16T23:48:00Z',
  5621, 214
);

insert into post_comments (id, post_id, username, body, posted_at) values (
  'ig-ricks-1-c1', 'ig-ricks-1', 'sunset.chaser', 'Bucket list every time I land in Negril.', '2026-07-17T00:10:00Z'
);

insert into post_comments (id, post_id, username, body, posted_at) values (
  'ig-ricks-1-c2', 'ig-ricks-1', 'andre.g', 'Careful on the rocks after dark!', '2026-07-17T00:22:00Z'
);

insert into posts (
  id, place_id, username, user_avatar, caption, media_url, media_type, permalink,
  posted_at, like_count, comments_count
) values (
  'ig-dunns-1', 'dunns-river', 'visitjamaica', 'https://api.dicebear.com/7.x/avataaars/svg?seed=dunns', 'Climbing Dunn''s River with the morning crowd. Wear shoes with grip.',
  'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=800&q=80', 'IMAGE', 'https://www.instagram.com/', '2026-07-15T11:30:00Z',
  9802, 412
);

insert into post_comments (id, post_id, username, body, posted_at) values (
  'ig-dunns-1-c1', 'ig-dunns-1', 'family.trips', 'Kids loved it. Go early before the cruise ships.', '2026-07-15T12:05:00Z'
);

insert into post_comments (id, post_id, username, body, posted_at) values (
  'ig-dunns-1-c2', 'ig-dunns-1', 'ochi.local', 'Still the one attraction visitors ask for first.', '2026-07-15T13:40:00Z'
);

insert into posts (
  id, place_id, username, user_avatar, caption, media_url, media_type, permalink,
  posted_at, like_count, comments_count
) values (
  'ig-cafeblue-1', 'cafe-blue', 'cafeblueja', 'https://api.dicebear.com/7.x/avataaars/svg?seed=cafeblue', 'Blue Mountain mist + a flat white in Irish Town. Slow mornings hit different up here.',
  'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80', 'IMAGE', 'https://www.instagram.com/', '2026-07-14T09:18:00Z',
  1266, 54
);

insert into post_comments (id, post_id, username, body, posted_at) values (
  'ig-cafeblue-1-c1', 'ig-cafeblue-1', 'bean.there', 'Worth the drive from Kingston every time.', '2026-07-14T09:45:00Z'
);

insert into posts (
  id, place_id, username, user_avatar, caption, media_url, media_type, permalink,
  posted_at, like_count, comments_count
) values (
  'ig-doctors-1', 'doctors-cave', 'doctorscavebeach', 'https://api.dicebear.com/7.x/avataaars/svg?seed=doctors', 'Doctor''s Cave looking glass-clear this morning. MoBay water therapy.',
  'https://images.unsplash.com/photo-1559827260-dc66d52bef19?auto=format&fit=crop&w=800&q=80', 'IMAGE', 'https://www.instagram.com/', '2026-07-13T14:02:00Z',
  3340, 97
);

insert into post_comments (id, post_id, username, body, posted_at) values (
  'ig-doctors-1-c1', 'ig-doctors-1', 'beachbum.ja', 'Softest sand on the hip strip.', '2026-07-13T14:30:00Z'
);

insert into post_comments (id, post_id, username, body, posted_at) values (
  'ig-doctors-1-c2', 'ig-doctors-1', 'kayla.m', 'Any chairs left after 11?', '2026-07-13T15:00:00Z'
);

insert into posts (
  id, place_id, username, user_avatar, caption, media_url, media_type, permalink,
  posted_at, like_count, comments_count
) values (
  'ig-pier-1', 'pier-one', 'pieroneja', 'https://api.dicebear.com/7.x/avataaars/svg?seed=pierone', 'Waterfront selectors loading up. Pier One Friday energy is unmatched.',
  'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=800&q=80', 'IMAGE', 'https://www.instagram.com/', '2026-07-12T21:00:00Z',
  1890, 73
);

insert into post_comments (id, post_id, username, body, posted_at) values (
  'ig-pier-1-c1', 'ig-pier-1', 'dancehall.diary', 'Who''s on the decks tonight?', '2026-07-12T21:20:00Z'
);

insert into posts (
  id, place_id, username, user_avatar, caption, media_url, media_type, permalink,
  posted_at, like_count, comments_count
) values (
  'ig-sevenmile-1', 'seven-mile', 'negrilvibes', 'https://api.dicebear.com/7.x/avataaars/svg?seed=sevenmile', 'Seven Mile stretch forever. Soft sand, cold coconut, no rush.',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', 'IMAGE', 'https://www.instagram.com/', '2026-07-11T17:44:00Z',
  4512, 156
);

insert into post_comments (id, post_id, username, body, posted_at) values (
  'ig-sevenmile-1-c1', 'ig-sevenmile-1', 'travel.twin', 'This photo sold me on Negril.', '2026-07-11T18:02:00Z'
);
