-- Recovered from the remote migration history on 2026-09-03.
-- Applied 2026-08-29.

insert into products (id, name, category, description, discount_percent, spice_level, batch_capacity, units_packed_this_batch, stock_state, is_active) values
('p-1','Turmeric Powder','spice-powder','Sun-dried turmeric, stone-ground fresh every batch',10,null,60,38,'packing',true),
('p-2','Kashmiri Red Chilli Powder','spice-powder','Deep colour, mild heat — for gravies and tadka',0,'mild',50,46,'ready',true),
('p-3','Guntur Chilli Powder','spice-powder','High-heat chilli powder from Guntur stock',5,'hot',40,24,'ready',true),
('p-4','Coriander Powder','spice-powder','Freshly roasted and ground coriander seeds',0,null,55,14,'processing',true),
('p-5','Garam Masala','spice-powder','House blend of 12 whole spices, small-batch ground',0,'medium',35,32,'ready',true),
('p-6','Sambar Powder','spice-powder','South-Indian style lentil & spice blend',15,'medium',45,27,'processing',true),
('p-7','Rasam Powder','spice-powder','Tangy, peppery blend for classic South-Indian rasam',0,'medium',30,6,'processing',true),
('p-8','Cold-Pressed Groundnut Oil','cooking-oil','Wood-pressed groundnut oil, unrefined',0,null,40,26,'ready',true),
('p-9','Virgin Coconut Oil','cooking-oil','Cold-pressed from fresh coconut milk, no heat used',10,null,35,21,'packing',true),
('p-10','Extra Virgin Olive Oil','cooking-oil','Imported first cold-press olive oil',0,null,20,4,'processing',true),
('p-11','Cold-Pressed Sesame Oil','cooking-oil','Traditional wood-pressed gingelly oil',0,null,25,16,'ready',true),
('p-12','Black Pepper Powder','spice-powder','Single-origin Malabar pepper, freshly ground',0,'hot',30,19,'ready',true);

insert into product_pack_sizes (product_id, size, price) values
('p-1','250g',90),('p-1','500g',171),('p-1','1kg',324),('p-1','2kg',612),
('p-2','250g',130),('p-2','500g',247),('p-2','1kg',468),('p-2','2kg',884),
('p-3','250g',140),('p-3','500g',266),('p-3','1kg',504),('p-3','2kg',952),
('p-4','250g',85),('p-4','500g',162),('p-4','1kg',306),('p-4','2kg',578),
('p-5','250g',160),('p-5','500g',304),('p-5','1kg',576),('p-5','2kg',1088),
('p-6','250g',120),('p-6','500g',228),('p-6','1kg',432),('p-6','2kg',816),
('p-7','250g',110),('p-7','500g',209),('p-7','1kg',396),('p-7','2kg',748),
('p-8','250g',150),('p-8','500g',285),('p-8','1kg',540),('p-8','2kg',1020),
('p-9','250g',170),('p-9','500g',323),('p-9','1kg',612),('p-9','2kg',1156),
('p-10','250g',320),('p-10','500g',608),('p-10','1kg',1152),('p-10','2kg',2176),
('p-11','250g',180),('p-11','500g',342),('p-11','1kg',648),('p-11','2kg',1224),
('p-12','250g',150),('p-12','500g',285),('p-12','1kg',540),('p-12','2kg',1020);

insert into customers (id, name, phone, initials, address, joined_at, plan_status, segment) values
('c-1','Ananya Sharma','+91 98765 43210','AS','B-204, Lotus Residency, Andheri East','2026-03-12','active','vip'),
('c-2','Rohan Mehta','+91 91234 56780','RM','14, Green Park Society, Baner','2026-05-02','active','regular'),
('c-3','Priya Nair','+91 90909 12121','PN','Flat 12A, Sea Breeze Apts, Kochi','2026-08-01','none','new'),
('c-4','Farhan Sheikh','+91 99887 66554','FS','221, Model Colony, Pune','2026-01-20','paused','regular'),
('c-5','Kavya Reddy','+91 93456 12378','KR','9, Jubilee Hills, Hyderabad','2026-06-15','active','regular'),
('c-6','Aditya Verma','+91 98123 45670','AV','H-56, Sector 21, Noida','2026-08-10','none','new');
;
