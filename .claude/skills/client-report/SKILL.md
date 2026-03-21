---
name: client-report
description: Generate a daily progress report for the client (Diana) summarizing today's work. Use this skill when the user asks for a client update, progress report, daily summary, "aggiornamento per Diana", "report cliente", "cosa ho fatto oggi", or any variation of "prepare an update for the client". Also trigger when the user says "report", "aggiornamento", or "riassunto giornata".
---

# Client Report

Generate a concise, non-technical daily progress report for the client Diana, summarizing development work done today.

## Step 1 — Gather today's work

Run these git commands to understand what was done today:

```bash
# All commits from today across all local branches
git log --all --oneline --after="$(date +%Y-%m-%d) 00:00" --before="$(date -v+1d +%Y-%m-%d) 00:00" --format="%h %s (%an, %ar) [%D]"

# Files changed today (stat view)
git diff --stat $(git log --all --oneline --after="$(date +%Y-%m-%d) 00:00" --format="%H" | tail -1)^..HEAD
```

Also read:

- `docs/change-log.md` — check for entries dated today
- Recent documentation updates (`git diff` on `docs/` files)
- Any shaping docs updated today

If there are no commits today, tell the user there's nothing to report.

## Step 2 — Categorize the work

Group changes into user-visible categories:

- **Nuove funzionalita** — things Diana can see or use on the site
- **Miglioramenti** — refinements to existing features
- **Correzioni** — bug fixes
- **Lavoro tecnico** — infrastructure that enables future work (mention only if significant)

Drop anything purely internal (code refactors, dependency updates, dev tooling) unless it has a visible impact.

## Step 3 — Write the report

### Voice and tone

- **First person singular**: "Ho completato...", "Ho aggiunto...", "Ho corretto..."
- **"Noi" / "possiamo" / "dobbiamo"**: use ONLY when something requires Diana's input, a shared decision, or a next step that involves her. Example: "Dobbiamo decidere se aggiungere anche la sezione blog" or "Possiamo valutare insieme il testo della homepage"
- **Language**: Italian
- **Tone**: Conversational but professional — like a WhatsApp update to a client you have a good working relationship with. Not formal, not sloppy.
- **No technical jargon**: Never mention components, middleware, GraphQL, fragments, metadata, tokens, rewrite, canonical paths, builds, or any code concept. Translate everything into what it means for the site and its users.
- **No file paths or code references**
- **No version numbers** unless Diana specifically cares about releases

### Translation guide (tech → human)

| Technical concept             | How to say it                                                              |
| ----------------------------- | -------------------------------------------------------------------------- |
| Middleware rewrite            | "Gli indirizzi web ora sono tradotti"                                      |
| SEO metadata / canonical URLs | "I motori di ricerca vedono correttamente le pagine in entrambe le lingue" |
| GraphQL schema update         | "Ho allineato il sito con le ultime modifiche ai contenuti"                |
| Component refactor            | Don't mention it                                                           |
| Cache invalidation            | "Le modifiche ai contenuti si aggiornano subito sul sito"                  |
| Build passes                  | Don't mention it                                                           |
| Sitemap updated               | "La mappa del sito per Google e stato aggiornata"                          |
| Bug fix (internal)            | Don't mention unless it affected something visible                         |

### Format

Keep it short — ideally 3-6 sentences. One paragraph, no bullet points unless there are 4+ distinct items. Start directly with what was done, no greetings or preamble.

**Example output:**

> Oggi ho completato la localizzazione degli indirizzi web del sito. Ora chi naviga in italiano vede percorsi come `/it/firenze/appartamenti/abaco`, mentre la versione inglese resta invariata. Ho aggiornato tutti i link interni, i menu e la mappa del sito per Google. Anche i bottoni collegati ai contenuti nel CMS generano ora i percorsi corretti nella lingua appropriata.

### What NOT to include

- Implementation details ("ho usato un middleware", "ho creato un file paths.ts")
- Developer workflow changes (pre-commit hooks, linting, type generation)
- Internal documentation updates (changelog, how-to, project structure) — these are for us, not for Diana
- Test results or build status
- Git branch names or commit hashes

## Step 4 — Check for open questions

If during today's work there were decisions deferred, things that need Diana's input, or visible changes she should review, add a brief note at the end using "noi" form:

> Da valutare insieme: [cosa]

Ask the user to describe the "what" if not clear form the chats.

Only add this if there's genuinely something to discuss. Don't invent questions.

## Step 5 — Present to the user

Show the report text directly. The user will copy-paste it to Diana (likely via WhatsApp or email). Don't wrap it in markdown code blocks — just output the plain text.
