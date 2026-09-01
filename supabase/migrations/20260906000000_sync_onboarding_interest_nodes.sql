-- Sync interest_nodes table with exact onboarding Q6 chip options.
-- ON CONFLICT (id) DO UPDATE guarantees exact name, parent_id, path and approved status match.

insert into interest_nodes (id, parent_id, name, path, approved) values
  -- Top level categories
  (1, null, 'Food & Dining', 'food', true),
  (2, null, 'Active & Fitness', 'active', true),
  (3, null, 'Arts & Culture', 'culture', true),
  (4, null, 'Creative & Making', 'creative', true),
  (5, null, 'Outdoors & Nature', 'outdoors', true),
  (6, null, 'Games & Tech', 'gaming', true),

  -- Exact Onboarding Q6 Option Nodes (101..115)
  (101, 1, 'Coffee & wandering', 'food.coffee_wandering', true),
  (102, 1, 'Brunch', 'food.brunch', true),
  (103, 4, 'Workshops', 'creative.workshops', true),
  (104, 1, 'Food hunting', 'food.food_hunting', true),
  (105, 3, 'Bookshops', 'culture.bookshops', true),
  (106, 3, 'Museums & galleries', 'culture.museums_galleries', true),
  (107, 3, 'Live music', 'culture.live_music', true),
  (108, 1, 'Quiet drinks', 'food.quiet_drinks', true),
  (109, 5, 'Outdoor walks & nature', 'outdoors.walks_nature', true),
  (110, 2, 'Bouldering / movement', 'active.bouldering_movement', true),
  (111, 6, 'Board games', 'gaming.board_games', true),
  (112, 1, 'Cooking / dining at home', 'food.cooking_dining', true),
  (113, 4, 'Pottery / ceramics', 'creative.pottery_ceramics', true),
  (114, 1, 'Natural wine', 'food.natural_wine', true),
  (115, 3, 'Film & cinema', 'culture.film_cinema', true)
on conflict (id) do update set
  parent_id = excluded.parent_id,
  name = excluded.name,
  path = excluded.path,
  approved = excluded.approved;

-- Reset sequence to continue after id 115
select setval('interest_nodes_id_seq', (select max(id) from interest_nodes));
