# Database

Every schema change to the Supabase project lives here. Before this folder
existed the schema was applied straight to the live database, so part of the
history had to be recovered rather than written down as it happened.

```
db/
  baseline.sql   snapshot of the current schema
  migrations/    one file per change, applied in filename order
```

## What is actually recorded

`migrations/` is **not** a complete replay of how the database got here.

- `20260829*` – `20260901*` were recovered from the remote migration history
  (`supabase_migrations.schema_migrations`), which stores the SQL that was run.
- `20260903000000` onwards were written here first, as changes should be.
- **The gap in between is not in any file.** A large amount of work — the units
  table, the stock movement ledger, `item_category`, the split of stock and
  sales units — was applied by hand through the CLI and was never captured.

`baseline.sql` closes that gap. It was reconstructed on 2026-09-03 by
introspecting the live catalogue, so it describes the schema as it stands
whether or not a migration file explains how it got that way. Read it as the
current truth; read `migrations/` for the story since.

## Adding a change

1. Write `migrations/<UTC timestamp>_<snake_case_name>.sql`. Timestamps order
   the folder, so keep the format `YYYYMMDDHHMMSS`.
2. Say in a comment *why*, not just what. The SQL already says what.
3. Apply it (below), then refresh the baseline:

```sh
supabase db dump --linked -s public -f db/baseline.sql   # needs Docker running
```

## Applying a change

Paste the file into the Supabase dashboard SQL editor. It is the only route
here that handles a multi-statement file correctly.

`supabase db query --linked -f <file>` works **only for a single-statement
file**. It flattens the SQL onto one line before sending it, which silently
truncates a `--` comment into the rest of the statement and splits a function
body at the first `;`. A migration mangled this way can half-apply without
reporting an error — that is how every manufactured item briefly ended up
measured in litres on 2026-09-03. If you use it, send one statement per file
and verify the result.

`supabase db push` is the tool built for this, but it only reads
`supabase/migrations/`. Moving this folder there would buy automatic
apply-and-record at the cost of the name; it also expects to own the history
table, which already has hand-applied entries in it.

## Deploying the Edge Function

`supabase functions deploy api --project-ref <ref>` has, twice now (2026-09-03),
silently deployed a version that 404s on routes that exist in the source —
confirmed via `curl` immediately after, then fixed by running the exact same
deploy command again with no code changes. Treat a fresh 404 on a route that
demonstrably exists in the deployed source as "deploy didn't propagate," not
as a code bug — redeploy once before spending time debugging the code.

## Pending

`20260903010000_drop_superseded_pack_size_columns.sql` has **not** been
applied. It drops the old pack-size label columns, which are backfilled,
unused and nullable. Irreversible, so it is waiting on a decision.
