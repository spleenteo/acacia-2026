# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Turisti, soprattutto stranieri**, che scelgono un appartamento a Firenze per un soggiorno e prenotano. Arrivano in inglese o in italiano; il sito è bilingue con URL prefissati (`/en/...`, `/it/...`).
- **Ospiti già in casa**, che usano il sito dopo la prenotazione: consigli sul quartiere, FAQ, guestbook, punti di interesse.

Non sono un pubblico confermato i proprietari che vogliono affidare l'immobile.

## Product Purpose

Sito pubblico di Acacia Firenze: presenta gli appartamenti, i quartieri di Firenze e i "mood" con cui scegliere dove stare, e porta alla prenotazione. Dopo l'arrivo resta un riferimento per l'ospite (FAQ, guestbook, blog, ricerca). Successo = una prenotazione avviata e un ospite che trova da solo le risposte che cerca.

## Positioning

Si sceglie un'atmosfera e una zona di Firenze, non solo un letto: mood e quartieri sono la chiave di scelta. A questo si somma l'ospitalità diretta dei gestori, che un operatore generico non potrebbe copiare in modo credibile.

## Operating Context

- Tutti i contenuti vivono in DatoCMS (GraphQL CDA); gli editor lavorano con anteprima in bozza e overlay click-to-edit.
- Ogni stringa dell'interfaccia passa dal modello `Translation` di DatoCMS (EN/IT), nessun testo cablato nel codice.
- Deploy su Vercel; analytics con GA4 e PostHog (in prova).

## Capabilities and Constraints

- La prenotazione avviene solo tramite il widget Beddy (`<beddy-bar>`); non esiste un checkout proprio.
- Niente prezzi sul sito, nemmeno "a partire da": Beddy non li fornisce e la tariffa reale cambia per periodo, numero di persone e pulizie. Il tentativo con il prezzo di partenza si è rivelato fuorviante, perché gli ospiti si aspettavano di pagare la cifra mostrata. Il prezzo vero si vede nel widget di prenotazione.
- Sezioni: home, appartamenti, quartieri, mood, blog, guestbook, FAQ, ricerca.
- Percorsi URL tradotti per lingua (`florence`/`firenze`, `accommodations`/`appartamenti`, `districts`/`quartieri`).
- Contenuti sempre da CMS, EN e IT in parità.

## Brand Commitments

Nome: Acacia Firenze. Il sistema visivo esistente ("Japan Fish", descritto in CLAUDE.md) è l'incumbent; la decisione su mantenerlo, espanderlo o sostituirlo spetta al passo successivo, non a questo file.

## Evidence on Hand

Solo ciò che è nel CMS. Non vanno inventati recensioni, valutazioni, numero di appartamenti, anni di attività o testimonianze: se un dato non è nel CMS, non esiste per il design.

Eccezione confermata: i badge delle piattaforme (punteggio medio Booking.com, Airbnb Superhost) sono dati reali, aggiornati a mano dal proprietario quando serve, perché le piattaforme non offrono dati aggiornati in modo affidabile. Oggi sono immagini statiche in `public/` (nome file `placeholder-*`, fuorviante). Obiettivo dichiarato: un punteggio per appartamento, non una media unica.

## Product Principles

1. Prima l'impatto, poi la verifica: la prima cosa che chi cerca casa guarda sono le foto, e devono piacere a colpo d'occhio; solo dopo controlla i fatti. Mood e quartiere sono una chiave di scelta per chi arriva senza averla fatta, non un passaggio obbligato: l'ospite può arrivare già deciso.
2. EN e IT sono pari: nessuna lingua è la traduzione dell'altra.
3. Il CMS è la fonte unica: niente testo, numero o prova che l'editor non possa cambiare.
4. Nessuna prova inventata: la fiducia si costruisce con ciò che esiste davvero.
5. Il sito serve anche dopo la prenotazione, non solo prima.
6. Ogni criterio di design è rivedibile se aumenta la prenotazione diretta (disintermediazione rispetto alle piattaforme) e la qualità della scelta dell'ospite. Il proprietario lo ha dichiarato esplicitamente.

## Accessibility & Inclusion

Non c'è uno standard formale richiesto. La direzione voluta è avvicinarsi a WCAG AA senza rinunciare all'impatto grafico: contrasto, focus visibile e movimento ridotto sono da trattare come obiettivi, non come vincolo che appiattisce il design.
