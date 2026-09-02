# Storefront photography

Drop image files in here, then point `src/storefront/data/images.ts` at them.
Nothing is wired by filename — the registry file is the only source of truth,
so you can name files however you like.

    public/images/products/turmeric.jpg
      -> 'sun-dried-turmeric-powder': '/images/products/turmeric.jpg'

Anything left as `null` in the registry keeps the painted spice-colour tile, and
a path that 404s falls back to the same tile at runtime. A half-finished photo
set never breaks a page.

## Slots

| Registry key                  | Where it shows                              | Suggested crop |
| ----------------------------- | ------------------------------------------- | -------------- |
| `productImages[slug]`         | Product cards, PDP gallery, cart, search    | Square, packshot |
| `categoryImages[id]`          | "Shop by category" tiles                    | 4:3 |
| `siteImages.heroLineup`       | Home hero, on the teal band                 | Wide, transparent PNG ideal |
| `siteImages.story`            | "Our story" section + About page            | 4:3 |
| `siteImages.popular[0..2]`    | "Shop Most Popular" row                     | 4:3 lifestyle |
| `siteImages.recipes[0..3]`    | Recipe cards                                | 4:3 food |

## Shooting the packshots

This is the part that makes the storefront look expensive:

- One flat colour sheet behind every product — teal, deep saffron or clay.
  The same sheet for the whole set.
- Same angle, same distance, same light for every shot.
- Leave a little shadow under the jar so it sits on a surface rather than floats.
- Do NOT cut the product out onto white. The coloured backdrop is the look.

A phone camera against a taped-up sheet of craft paper beats stock photography
here, because the consistency across the set is what reads as a real brand.
