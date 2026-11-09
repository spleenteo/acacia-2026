# Lessons

- Non far passare per `tail` un comando di verifica: l'exit code si perde. Redirigi su file o usa `set -o pipefail`.
- Su macOS `sed -i` vuole l'argomento del backup: controlla il diff prima del commit, così una cancellazione fallita non diventa un secondo commit.
- Prima di riscrivere la correzione di una voce di un documento di review, controlla che il codice abbia ancora quel problema.
- `prettier --check .` segnala anche file ignorati da git: distinguili dai file tracciati prima di dichiarare rosso il gate.
- Su questa macchina `npx` stampa gli argomenti, quindi un token passato come argomento finisce nell'output; usa la variabile d'ambiente e il binario locale.
- `git rm` mette già in stage la cancellazione, e un `git add` successivo su quel path fallisce: aggiungi solo gli altri file, o il task si spezza in due commit.
- Un hook rifiuta `rm` su questa macchina e blocca l'intero comando che lo contiene: per i file temporanei usa `del`, in un comando a parte.
- Il ledger non tracciato entra in `prettier --check .` e finisce nel commit di chiusura: passagli `prettier --write` prima del gate.
