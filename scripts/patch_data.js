const fs = require("fs");
const path = require("path");

const data = JSON.parse(fs.readFileSync(path.join(__dirname, "../data/clean_data.json"), "utf8"));

// [personne, metric, date, newValue]
const overrides = [
  // ABDOU — traction_pro stagne à 3-4
  ["Abdou","traction_pro","2025-08-01",4],["Abdou","traction_pro","2025-09-01",4],
  ["Abdou","traction_pro","2025-10-01",3],["Abdou","traction_pro","2025-11-01",3],
  ["Abdou","traction_pro","2025-12-01",3],["Abdou","traction_pro","2026-01-01",3],
  ["Abdou","traction_pro","2026-02-01",3],["Abdou","traction_pro","2026-03-01",3],
  ["Abdou","traction_pro","2026-04-01",4],["Abdou","traction_pro","2026-05-01",4],
  ["Abdou","traction_pro","2026-06-01",4],
  // ABDOU — traction_sup stagne à 3-5
  ["Abdou","traction_sup","2025-08-01",4],["Abdou","traction_sup","2025-09-01",4],
  ["Abdou","traction_sup","2025-10-01",3],["Abdou","traction_sup","2025-11-01",3],
  ["Abdou","traction_sup","2025-12-01",3],["Abdou","traction_sup","2026-01-01",3],
  ["Abdou","traction_sup","2026-02-01",3],["Abdou","traction_sup","2026-03-01",4],
  ["Abdou","traction_sup","2026-04-01",4],["Abdou","traction_sup","2026-05-01",5],
  ["Abdou","traction_sup","2026-06-01",5],
  // ABDOU — dips plafonne à 9-12 (pas les 20 du prévisionnel)
  ["Abdou","dips","2025-08-01",9],["Abdou","dips","2025-09-01",9],
  ["Abdou","dips","2025-10-01",9],["Abdou","dips","2025-11-01",9],
  ["Abdou","dips","2025-12-01",8],["Abdou","dips","2026-01-01",8],
  ["Abdou","dips","2026-02-01",9],["Abdou","dips","2026-03-01",10],
  ["Abdou","dips","2026-04-01",10],["Abdou","dips","2026-05-01",11],
  ["Abdou","dips","2026-06-01",12],
  // ABDOU — 100m stagne autour de 15.5
  ["Abdou","sprint_100m_sec","2025-07-01",15.80],["Abdou","sprint_100m_sec","2025-08-01",15.65],
  ["Abdou","sprint_100m_sec","2025-09-01",15.40],["Abdou","sprint_100m_sec","2025-10-01",15.60],
  ["Abdou","sprint_100m_sec","2025-11-01",15.50],["Abdou","sprint_100m_sec","2025-12-01",15.70],
  ["Abdou","sprint_100m_sec","2026-01-01",15.55],["Abdou","sprint_100m_sec","2026-02-01",15.80],
  ["Abdou","sprint_100m_sec","2026-03-01",15.60],["Abdou","sprint_100m_sec","2026-04-01",15.70],
  ["Abdou","sprint_100m_sec","2026-05-01",15.45],["Abdou","sprint_100m_sec","2026-06-01",15.50],

  // YOUCEF — superman stagne autour de 60-64
  ["Youcef","superman_sec","2025-07-01",62],["Youcef","superman_sec","2025-08-01",61],
  ["Youcef","superman_sec","2025-09-01",63],["Youcef","superman_sec","2025-10-01",60],
  ["Youcef","superman_sec","2025-11-01",62],["Youcef","superman_sec","2025-12-01",60],
  ["Youcef","superman_sec","2026-01-01",58],["Youcef","superman_sec","2026-02-01",61],
  ["Youcef","superman_sec","2026-03-01",63],["Youcef","superman_sec","2026-04-01",60],
  ["Youcef","superman_sec","2026-05-01",62],["Youcef","superman_sec","2026-06-01",64],
  // YOUCEF — planche régresse légèrement
  ["Youcef","planche_sec","2025-07-01",88],["Youcef","planche_sec","2025-08-01",85],
  ["Youcef","planche_sec","2025-09-01",82],["Youcef","planche_sec","2025-10-01",80],
  ["Youcef","planche_sec","2025-11-01",83],["Youcef","planche_sec","2025-12-01",81],
  ["Youcef","planche_sec","2026-01-01",79],["Youcef","planche_sec","2026-02-01",82],
  ["Youcef","planche_sec","2026-03-01",84],["Youcef","planche_sec","2026-04-01",83],
  ["Youcef","planche_sec","2026-05-01",86],["Youcef","planche_sec","2026-06-01",85],
  // YOUCEF — 5km stagne autour de 1760-1830
  ["Youcef","run_5km_sec","2025-07-01",1780],["Youcef","run_5km_sec","2025-08-01",1800],
  ["Youcef","run_5km_sec","2025-09-01",1760],["Youcef","run_5km_sec","2025-10-01",1790],
  ["Youcef","run_5km_sec","2025-11-01",1810],["Youcef","run_5km_sec","2025-12-01",1780],
  ["Youcef","run_5km_sec","2026-01-01",1830],["Youcef","run_5km_sec","2026-02-01",1800],
  ["Youcef","run_5km_sec","2026-03-01",1750],["Youcef","run_5km_sec","2026-04-01",1790],
  ["Youcef","run_5km_sec","2026-05-01",1820],["Youcef","run_5km_sec","2026-06-01",1760],

  // RAYAN — dips plafonne à 10-13
  ["Rayan","dips","2025-08-01",10],["Rayan","dips","2025-09-01",10],
  ["Rayan","dips","2025-10-01",10],["Rayan","dips","2025-11-01",11],
  ["Rayan","dips","2025-12-01",11],["Rayan","dips","2026-01-01",11],
  ["Rayan","dips","2026-02-01",11],["Rayan","dips","2026-03-01",12],
  ["Rayan","dips","2026-04-01",12],["Rayan","dips","2026-05-01",12],
  ["Rayan","dips","2026-06-01",13],
  // RAYAN — superman régresse après bon début
  ["Rayan","superman_sec","2025-08-01",110],["Rayan","superman_sec","2025-09-01",100],
  ["Rayan","superman_sec","2025-10-01",88],["Rayan","superman_sec","2025-11-01",85],
  ["Rayan","superman_sec","2025-12-01",88],["Rayan","superman_sec","2026-01-01",86],
  ["Rayan","superman_sec","2026-02-01",90],["Rayan","superman_sec","2026-03-01",92],
  ["Rayan","superman_sec","2026-04-01",90],["Rayan","superman_sec","2026-05-01",94],
  ["Rayan","superman_sec","2026-06-01",98],
  // RAYAN — 5km amélioration très lente
  ["Rayan","run_5km_sec","2025-08-01",1990],["Rayan","run_5km_sec","2025-09-01",2010],
  ["Rayan","run_5km_sec","2025-10-01",1970],["Rayan","run_5km_sec","2025-11-01",1960],
  ["Rayan","run_5km_sec","2025-12-01",1950],["Rayan","run_5km_sec","2026-01-01",1940],
  ["Rayan","run_5km_sec","2026-02-01",1900],["Rayan","run_5km_sec","2026-03-01",1880],
  ["Rayan","run_5km_sec","2026-04-01",1870],["Rayan","run_5km_sec","2026-05-01",1840],
  ["Rayan","run_5km_sec","2026-06-01",1820],

  // AYLAN — traction_pro stagne à 6-7
  ["Aylan","traction_pro","2025-07-01",6],["Aylan","traction_pro","2025-08-01",6],
  ["Aylan","traction_pro","2025-09-01",6],["Aylan","traction_pro","2025-10-01",7],
  ["Aylan","traction_pro","2025-11-01",6],["Aylan","traction_pro","2025-12-01",6],
  ["Aylan","traction_pro","2026-01-01",6],["Aylan","traction_pro","2026-02-01",7],
  ["Aylan","traction_pro","2026-03-01",7],["Aylan","traction_pro","2026-04-01",7],
  ["Aylan","traction_pro","2026-05-01",7],["Aylan","traction_pro","2026-06-01",7],
  // AYLAN — traction_sup stagne à 8-10
  ["Aylan","traction_sup","2025-07-01",8],["Aylan","traction_sup","2025-08-01",8],
  ["Aylan","traction_sup","2025-09-01",8],["Aylan","traction_sup","2025-10-01",9],
  ["Aylan","traction_sup","2025-11-01",9],["Aylan","traction_sup","2025-12-01",9],
  ["Aylan","traction_sup","2026-01-01",9],["Aylan","traction_sup","2026-02-01",9],
  ["Aylan","traction_sup","2026-03-01",9],["Aylan","traction_sup","2026-04-01",10],
  ["Aylan","traction_sup","2026-05-01",10],["Aylan","traction_sup","2026-06-01",10],
  // AYLAN — dips progression très lente
  ["Aylan","dips","2025-07-01",15],["Aylan","dips","2025-08-01",15],
  ["Aylan","dips","2025-09-01",16],["Aylan","dips","2025-10-01",16],
  ["Aylan","dips","2025-11-01",17],["Aylan","dips","2025-12-01",17],
  ["Aylan","dips","2026-01-01",17],["Aylan","dips","2026-02-01",18],
  ["Aylan","dips","2026-03-01",18],["Aylan","dips","2026-04-01",18],
  ["Aylan","dips","2026-05-01",19],["Aylan","dips","2026-06-01",20],
  // AYLAN — pompes plateau
  ["Aylan","pompes","2025-07-01",17],["Aylan","pompes","2025-08-01",18],
  ["Aylan","pompes","2025-09-01",18],["Aylan","pompes","2025-10-01",19],
  ["Aylan","pompes","2025-11-01",19],["Aylan","pompes","2025-12-01",20],
  ["Aylan","pompes","2026-01-01",20],["Aylan","pompes","2026-02-01",21],
  ["Aylan","pompes","2026-03-01",22],["Aylan","pompes","2026-04-01",22],
  ["Aylan","pompes","2026-05-01",23],["Aylan","pompes","2026-06-01",24],

  // FABIEN — 100m stagne autour de 14.45-14.80
  ["Fabien","sprint_100m_sec","2025-07-01",14.55],["Fabien","sprint_100m_sec","2025-08-01",14.70],
  ["Fabien","sprint_100m_sec","2025-09-01",14.80],["Fabien","sprint_100m_sec","2025-10-01",14.60],
  ["Fabien","sprint_100m_sec","2025-11-01",14.65],["Fabien","sprint_100m_sec","2025-12-01",14.50],
  ["Fabien","sprint_100m_sec","2026-01-01",14.70],["Fabien","sprint_100m_sec","2026-02-01",14.55],
  ["Fabien","sprint_100m_sec","2026-03-01",14.60],["Fabien","sprint_100m_sec","2026-04-01",14.48],
  ["Fabien","sprint_100m_sec","2026-05-01",14.52],["Fabien","sprint_100m_sec","2026-06-01",14.45],
  // FABIEN — traction_pro plafonne à 19-22
  ["Fabien","traction_pro","2025-07-01",19],["Fabien","traction_pro","2025-08-01",19],
  ["Fabien","traction_pro","2025-09-01",20],["Fabien","traction_pro","2025-10-01",19],
  ["Fabien","traction_pro","2025-11-01",20],["Fabien","traction_pro","2025-12-01",20],
  ["Fabien","traction_pro","2026-01-01",20],["Fabien","traction_pro","2026-02-01",20],
  ["Fabien","traction_pro","2026-03-01",21],["Fabien","traction_pro","2026-04-01",21],
  ["Fabien","traction_pro","2026-05-01",21],["Fabien","traction_pro","2026-06-01",22],
  // FABIEN — traction_sup pareil
  ["Fabien","traction_sup","2025-07-01",15],["Fabien","traction_sup","2025-08-01",15],
  ["Fabien","traction_sup","2025-09-01",15],["Fabien","traction_sup","2025-10-01",15],
  ["Fabien","traction_sup","2025-11-01",15],["Fabien","traction_sup","2025-12-01",16],
  ["Fabien","traction_sup","2026-01-01",16],["Fabien","traction_sup","2026-02-01",16],
  ["Fabien","traction_sup","2026-03-01",16],["Fabien","traction_sup","2026-04-01",17],
  ["Fabien","traction_sup","2026-05-01",17],["Fabien","traction_sup","2026-06-01",17],
  // FABIEN — planche stagne autour de 238-258
  ["Fabien","planche_sec","2025-07-01",240],["Fabien","planche_sec","2025-08-01",238],
  ["Fabien","planche_sec","2025-09-01",245],["Fabien","planche_sec","2025-10-01",243],
  ["Fabien","planche_sec","2025-11-01",241],["Fabien","planche_sec","2025-12-01",248],
  ["Fabien","planche_sec","2026-01-01",245],["Fabien","planche_sec","2026-02-01",250],
  ["Fabien","planche_sec","2026-03-01",248],["Fabien","planche_sec","2026-04-01",252],
  ["Fabien","planche_sec","2026-05-01",255],["Fabien","planche_sec","2026-06-01",258],
];

const overrideMap = new Map();
for (const [p, m, d, v] of overrides) {
  overrideMap.set(`${p}|${m}|${d}`, v);
}

const updated = data.map((row) => {
  if (row.type !== "realisation") return row;
  const newRow = { ...row };
  for (const metric of Object.keys(newRow)) {
    const key = `${row.personne}|${metric}|${row.date}`;
    if (overrideMap.has(key)) {
      newRow[metric] = overrideMap.get(key);
    }
  }
  return newRow;
});

fs.writeFileSync(path.join(__dirname, "../data/clean_data.json"), JSON.stringify(updated, null, 2));
console.log("Données mises à jour.");

// Vérifications rapides
const checks = [
  ["Abdou","traction_sup"],["Abdou","dips"],["Abdou","sprint_100m_sec"],
  ["Youcef","superman_sec"],["Youcef","planche_sec"],["Youcef","run_5km_sec"],
  ["Rayan","dips"],["Rayan","superman_sec"],["Rayan","run_5km_sec"],
  ["Aylan","traction_pro"],["Aylan","pompes"],
  ["Fabien","sprint_100m_sec"],["Fabien","planche_sec"],
];
for (const [p, m] of checks) {
  const rows = updated.filter(r => r.personne === p && r.type === "realisation").sort((a,b)=>a.date.localeCompare(b.date));
  const vals = rows.map(r => r.date.slice(0,7)+":"+r[m]).join(" | ");
  console.log(`${p} ${m}: ${vals}`);
}
