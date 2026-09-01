-- Seed interest_nodes table with top-level categories and children using proper ltree paths.
-- Idempotent upsert on id conflict.

insert into interest_nodes (id, parent_id, name, path, approved) values
  -- Top Level Categories
  (1, null, 'Food & Dining', 'food', true),
  (2, null, 'Active & Fitness', 'active', true),
  (3, null, 'Arts & Culture', 'culture', true),
  (4, null, 'Creative & Making', 'creative', true),
  (5, null, 'Outdoors & Nature', 'outdoors', true),
  (6, null, 'Games & Tech', 'gaming', true),

  -- Food Children
  (7, 1, 'Coffee & Cafes', 'food.coffee', true),
  (8, 1, 'Dining & Food', 'food.dining', true),
  (9, 1, 'Specialty Coffee', 'food.specialty_coffee', true),
  (10, 1, 'Hawker Exploration', 'food.hawker', true),
  (11, 1, 'Natural Wine', 'food.wine', true),
  (12, 1, 'Baking & Pastry', 'food.baking', true),

  -- Active Children
  (13, 2, 'Fitness & Movement', 'active.movement', true),
  (14, 2, 'Bouldering & Climbing', 'active.climbing', true),
  (15, 2, 'Trail Running', 'active.running', true),
  (16, 2, 'Yoga & Pilates', 'active.yoga', true),

  -- Culture Children
  (17, 3, 'Arts & Museums', 'culture.museums', true),
  (18, 3, 'Books & Literature', 'culture.books', true),
  (19, 3, 'Music & Gigs', 'culture.music', true),
  (20, 3, 'Photography & Film', 'culture.film', true),
  (21, 3, 'Philosophy & Ideas', 'culture.philosophy', true),

  -- Creative Children
  (22, 4, 'Pottery & Craft', 'creative.ceramics', true),
  (23, 4, 'Woodworking', 'creative.woodworking', true),
  (24, 4, 'Analog Photography', 'creative.film_photo', true),

  -- Outdoors Children
  (25, 5, 'Hiking & Outdoors', 'outdoors.hiking', true),
  (26, 5, 'Cycling (East Coast)', 'outdoors.cycling', true),

  -- Gaming Children
  (27, 6, 'Boardgames & Gaming', 'gaming.boardgames', true)
on conflict (id) do update set
  name = excluded.name,
  path = excluded.path,
  approved = excluded.approved;

-- Reset sequence to continue after id 27
select setval('interest_nodes_id_seq', (select max(id) from interest_nodes));
