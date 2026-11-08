# Lessons

- Non far passare per `tail` un comando di verifica: l'exit code si perde. Redirigi su file o usa `set -o pipefail`.
- Su macOS `sed -i` vuole l'argomento del backup: controlla il diff prima del commit, così una cancellazione fallita non diventa un secondo commit.
- Prima di riscrivere la correzione di una voce di un documento di review, controlla che il codice abbia ancora quel problema.
- `prettier --check .` segnala anche file ignorati da git: distinguili dai file tracciati prima di dichiarare rosso il gate.
