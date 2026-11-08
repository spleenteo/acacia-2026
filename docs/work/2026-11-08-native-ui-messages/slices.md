---
shaping: true
---

# Label UI native — Slices

Le label UI passano dal modello `Translation` di DatoCMS a file JSON annidati nel repo, letti da next-intl. Formato scelto con l'owner il 2026-11-08: JSON (nativo per next-intl, chiavi tipizzabili con `typeof`), non YAML.

Lavoro tecnico: niente frame, shaping, breadboard e design. Per i visitatori non cambia nulla.

## V1 — Le label vengono dai file del repo

**Dentro**

- `src/messages/en.json` e `src/messages/it.json`, annidati, generati una volta dai record pubblicati con `npm run export-translations` e da lì in poi mantenuti a mano.
- `src/i18n/request.ts` carica il JSON della lingua richiesta al posto di `fetchTranslations`.
- Chiavi tipizzate con l'`AppConfig` di next-intl (`Messages: typeof en`).
- Rimozione di `src/lib/datocms/fetchTranslations.ts`.

**Fuori**

- Modello `Translation` su DatoCMS, script `export-translations`, sezione di `CLAUDE.md`: tutto in V2.
- Riscrittura o riorganizzazione delle chiavi e dei testi.

**Done**

- Gate verde.
- `en.json` e `it.json` hanno lo stesso insieme di chiavi, 134 ciascuno, e i valori coincidono con i record pubblicati su DatoCMS al momento del controllo.
- Una chiave inesistente passata a `t()` fa fallire `npx tsc --noEmit`.
- In dev, home e pagina di un appartamento mostrano le stesse label di prima in `/en` e `/it`.

**Attenzione**

- I `t()` con chiave calcolata (es. la mappa in `src/lib/search/searchType.ts`) e i `useTranslations()` senza namespace possono non superare la tipizzazione stretta: vanno tipizzati, non aggirati con cast generici.
- La tipizzazione può far emergere chiavi usate nel codice e assenti su DatoCMS: oggi falliscono solo a runtime. Vanno segnalate, non inventate.
- Il dump va rifatto o riconfrontato subito prima del deploy, altrimenti le modifiche fatte nel CMS nel frattempo vanno perse.
- `src/messages/*.json` oggi è descritto da `CLAUDE.md` come da non committare: in questo work diventa sorgente.

## V2 — Il modello Translation sparisce da DatoCMS

**Precondizione**: V1 è in produzione. Fino ad allora il codice deployato interroga `allTranslations`.

**Dentro**

- Migration `datocms migrations:new` che cancella il modello `Translation`, eseguita su un environment sandbox forkato dal primary e poi promossa. Permesso di creare la sandbox dato dall'owner il 2026-11-08.
- `npm run codegen` sul nuovo primary: `schema.graphql`, `graphql-env.d.ts` e `cma-types.ts` non contengono più `Translation`.
- Rimozione di `scripts/export-translations.ts` e del suo script in `package.json`.
- `CLAUDE.md`, sezione "UI translations": la fonte di verità diventa `src/messages/`, con il modo di aggiungere una stringa.

**Fuori**

- Qualsiasi altro modello o campo DatoCMS.

**Done**

- Gate verde.
- `npx datocms schema:inspect` sul nuovo primary non elenca `Translation`.
- `rg -i 'allTranslations|fetchTranslations|export-translations' src scripts package.json CLAUDE.md` non trova nulla, a parte i file generati se ancora non rigenerati.
- Il sito di produzione mostra le label in entrambe le lingue dopo la promozione.

**Attenzione**

- Il webhook di invalidazione scatta solo per eventi sul primary: dopo la promozione serve l'invalidazione manuale.
- `DATOCMS_ENVIRONMENT` su Vercel e in locale deve puntare al primary giusto dopo la promozione: se è valorizzato col vecchio nome, il sito legge l'environment sbagliato senza errori.
- Cancellare il modello è irreversibile sul nuovo primary: il vecchio environment resta come copia finché l'owner non decide di rimuoverlo.
