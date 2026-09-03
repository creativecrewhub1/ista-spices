-- Item names were unique per lower(name) among active items, so "Turmeric
-- Powder" and "turmeric powder" collided but "Turmeric  Powder" — with two
-- spaces — did not. Padding and repeated spaces are not what makes two
-- products different either.
--
-- normaliseName() in items.repo.ts applies the same rule, so what the add
-- form calls a duplicate and what the database refuses are the same thing.
-- Deliberately no fuzzy rule here: Turmeric, Turmeric Fingers, Turmeric
-- Powder and Turmeric Soap Bars are four real products. Near matches are
-- warned about in the form, never blocked.

create unique index products_active_name_norm_unique_idx
  on products (lower(btrim(regexp_replace(name, '\s+', ' ', 'g'))))
  where is_active;

drop index products_active_name_unique_idx;
