---
shaping: true
---

# Label UI native — Slices

Le label UI passano dal modello `Translation` di DatoCMS a file JSON annidati nel repo, letti da next-intl. Formato scelto con l'owner il 2026-11-08: JSON (nativo per next-intl, chiavi tipizzabili con `typeof`), non YAML.

Lavoro tecnico: niente frame, shaping, breadboard e design. Per i visitatori non cambia nulla.

## V1 — Le label vengono dai file del repo

**Dentro**

- Creazione di `src/messages/`: oggi non esiste e `export-translations` fallisce con ENOENT.
- `src/messages/en.json` e `src/messages/it.json`, annidati, generati una volta dai record pubblicati con `npm run export-translations` lanciato esplicitamente su `activities-01` (il primary), e da lì in poi mantenuti a mano.
- `src/i18n/request.ts` carica il JSON della lingua richiesta al posto di `fetchTranslations`.
- Chiavi tipizzate con l'`AppConfig` di next-intl (`Messages: typeof en`).
- Asserzione di tipo reciproca tra `en.json` e `it.json`, così una chiave presente in una sola lingua fa fallire `tsc`.
- Le due mappe di chiavi calcolate, `src/lib/search/searchType.ts` e `src/components/FilterBar/masonryFilters.ts`, tipizzate con `as const satisfies`, senza cast su `t`.
- Rimozione di `src/lib/datocms/fetchTranslations.ts` e dell'opzione `noStore` di `executeQuery`, che resta senza chiamanti.
- Documenti che diventano falsi: `CLAUDE.md` righe 34 (i JSON ora si committano) e 76-79 (fonte di verità e come aggiungere una stringa), `PRODUCT.md:27`, il commento in `ApartmentDetailContent.tsx:180`, e `docs/pre-launch-review.md` righe 17, 25, 50, 101, 120, 121.

**Fuori**

- Modello `Translation` su DatoCMS e script `export-translations`: tutto in V2.
- Riscrittura o riorganizzazione delle chiavi e dei testi. Restano anche le 17 chiavi inutilizzate e le 20 con italiano uguale all'inglese: possibile work successivo.
- Tipizzazione dei parametri ICU.

**Done**

- Gate verde.
- `en.json` e `it.json` hanno lo stesso insieme di chiavi, in numero pari ai record pubblicati al momento del dump, e i valori coincidono con quei record, a chiavi ordinate.
- Una chiave inesistente passata a `t()` fa fallire `npx tsc --noEmit`, e così una chiave presente in un solo JSON.
- In dev, in `/en` e `/it`, mostrano le stesse label di prima: home, dettaglio appartamento, `/search` con i tipi di risultato, dettaglio mood e dettaglio quartiere con i filtri, `/guestbook`, e il `DraftModeToggler`.

**Attenzione**

- Il dump si rifà o si riconfronta subito prima del deploy di V1, altrimenti le modifiche fatte nel CMS nel frattempo vanno perse. Dopo il deploy non va più rilanciato: sovrascriverebbe i JSON modificati a mano.
- Dal deploy di V1 in poi il modello `Translation` resta modificabile ma non ha più effetto, senza alcun segnale: stop alle modifiche delle label sul CMS, e intervallo breve tra V1 e V2.
- `src/messages/*.json` oggi è descritto da `CLAUDE.md` come da non committare: in questo work diventa sorgente.

**Deviations found while planning V1**

- `CLAUDE.md:38` va corretta anche se non era nel mandato: cita `noStore: true`, che V1 rimuove.
- `docs/pre-launch-review.md:21` e il commento in `src/components/BookingModal/index.tsx:20` vanno corretti anche se non erano nel mandato: indicano ancora DatoCMS come destinazione del testo.

**V1 — done on 2026-11-08**

Le label arrivano da `src/messages/{en,it}.json`, 134 chiavi per lingua, generate una volta dai record pubblicati di `activities-01` e ricontrollate alla chiusura. `request.ts` importa il JSON della lingua richiesta, in chunk separati per lingua; `fetchTranslations` e `noStore` non esistono più; `AppConfig` tipizza le chiavi e `appConfig.ts` fa fallire `tsc` su una chiave inesistente o presente in una sola lingua. Ruling: T6 è rimasta in due commit, perché un `sed` fallito su macOS ha lasciato un bullet e unirli avrebbe riscritto la storia. Ruling: il gate era rosso su Prettier per due artefatti locali di `.impeccable/`, risolto con `.prettierignore` su ok dell'owner. Controlli manuali fatti sul testo server-rendered contro la produzione: clic sui filtri e resa nel browser non provati. La review finale ha lasciato un'osservazione bassa: le voci 17, 21 e 25 di `docs/pre-launch-review.md` descrivono fix già fatti nel codice.

## V2 — Il modello Translation sparisce da DatoCMS

**Precondizione**: V1 è in produzione. Fino ad allora il codice deployato interroga `allTranslations`.

**Dentro**

- Confronto tra CMS e JSON prima della promozione, per recuperare eventuali modifiche arrivate dopo il dump.
- Migration `datocms migrations:new` che cancella il modello `Translation`, eseguita su un environment sandbox forkato dal primary e poi promossa. Permesso di creare la sandbox dato dall'owner il 2026-11-08.
- `maintenance:on` dal fork alla promozione, con un ok dell'owner al momento di V2.
- `npm run codegen` e `npx tsc --noEmit` con `DATOCMS_ENVIRONMENT` sulla sandbox prima di promuovere; i file generati si committano prima del gate.
- Rimozione di `scripts/export-translations.ts`, del suo script in `package.json` e della sua citazione in `CLAUDE.md:34`.

**Fuori**

- Qualsiasi altro modello o campo DatoCMS.

**Done**

- Gate verde.
- `npx datocms schema:inspect` sul nuovo primary non elenca `Translation`.
- `rg -i 'allTranslations|fetchTranslations|export-translations' src scripts package.json CLAUDE.md` non trova nulla.
- Il sito di produzione mostra le label in entrambe le lingue dopo la promozione.

**Attenzione**

- Il webhook di invalidazione scatta solo per eventi sul primary: dopo la promozione serve l'invalidazione manuale.
- `DATOCMS_ENVIRONMENT` su Vercel e in locale deve puntare al primary giusto dopo la promozione: se è valorizzato col vecchio nome, il sito legge l'environment sbagliato senza errori. Il valore su Vercel non è stato verificato.
- Esistono già 6 sandbox e il limite del piano non è leggibile: il fork potrebbe trovare un tetto.
- Cancellare il modello è irreversibile sul nuovo primary: il vecchio environment resta come copia finché l'owner non decide di rimuoverlo.
- Dopo V2, tornare a un deploy precedente a V1 richiede di ripromuovere il vecchio environment: quel codice interroga `allTranslations`.
