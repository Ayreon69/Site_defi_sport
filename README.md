# Sport Chart

Application de suivi de performance sportive construite à partir d'un Excel non normalisé.

## Livrables réalisés

- Parser Excel robuste: `scripts/parse_excel.py`
- Données normalisées générées:
  - `data/clean_data.csv`
  - `data/clean_data.json`
- Architecture web moderne (Next.js 14 + TypeScript + Tailwind + Recharts):
  - `app/`
  - `components/`
  - `lib/`
  - `data/`
  - `public/`
  - `styles/`
- API route: `GET /api/metrics`
- Dashboard principal:
  - filtres personnes
  - toggle réalisation/prévisionnel
  - filtres période
  - KPI cards
  - graphiques interactifs
- Page détail personne:
  - stats actuelles
  - progression %
  - record personnel
  - projection linéaire
  - badges automatiques

## Prérequis

- Node.js 18+
- npm 9+
- Python 3.9+
- `openpyxl` (et optionnellement `pandas`, `numpy`)

## Exécution locale

1. Générer/mettre à jour les données propres

```bash
python scripts/parse_excel.py
```

2. Installer les dépendances

```bash
npm install
```

3. Démarrer le site

```bash
npm run dev
```

4. Ouvrir `http://localhost:3000`

## Build production

```bash
npm run build
npm run start
```

## Déploiement Vercel

1. Pousser le repo sur GitHub.
2. Importer le projet dans Vercel.
3. Build command: `npm run build`
4. Output: `.next`
5. Variable d'env spécifique non requise.

## Données

Format normalisé:

| personne | date | type | dips | pompes | traction_pro | traction_sup | planche_sec | superman_sec | sprint_100m_sec | run_5km_sec | poids |
|---|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|

- `date` convertie en `YYYY-MM-01`
- formats de temps convertis en secondes
- sections `COEFFICIENTS` exclues

## Notes

Dans cet environnement, l'installation npm est offline/cache-only, donc le bootstrap/runtime Next.js ne peut pas être lancé ici sans cache npm disponible.
