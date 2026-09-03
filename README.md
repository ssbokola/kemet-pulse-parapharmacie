# Kemet Pulse — Pôle Parapharmacie (dépôt de publication)

Ce dépôt ne contient **que l'application publiable** : `index.html`, sa configuration Vercel et
le dossier `guide/` (captures du guide de collecte, floutées, recopiées depuis le dépôt Achat).
Il est volontairement minimal, comme ceux des trois autres applications.

## Ce que c'est

Le pôle Parapharmacie : quatre indicateurs — le poids de la para dans le CA, ce qui reste après
achat (marge théorique), le stock para qui dort et les périmés en para. Les deux derniers
RÉPUBLIENT ce que le pôle Achat & Stock calcule sur les mêmes fichiers ; ils ne recalculent
rien. Tout est lu dans le navigateur, rien n'est téléversé.

## La source de vérité

`index.html` est une **copie** produite par `..\deployer-parapharmacie.ps1`. Et ce fichier est
lui-même **produit** par `..\construire-parapharmacie.py` : ne jamais éditer
`kemet-pulse-parapharmacie.html` à la main. Les seules sources à modifier sont
`..\_parapharmacie\*` et les noyaux de `..\kemet-pulse-achat.html`.

## Publier

```
powershell -File ..\deployer-parapharmacie.ps1 "ce qui a change"
```
