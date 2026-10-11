// Scoreboard-Widget für Scriptable (iPhone). Als neues Skript einfügen,
// dann Widget (mittel) auf den Home-Screen legen -> Skript auswählen.
const URL_BASE = "https://dswuwwmkrjwhyzbnyvvi.supabase.co";
const KEY = "sb_publishable_tGL-gO7-zsiQw5jwyzeUEA_ef_Cduao";
const APP_URL = "https://tammojb.com";
const PLAYERS = [
  { id: "p1", name: "Tammo",   color: "#4C6FFF" },
  { id: "p2", name: "Joshua",  color: "#E8B93F" },
  { id: "p3", name: "Lennart", color: "#3FBF7F" },
];

const now = new Date();
const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

let rows = [];
let failed = false;
try {
  const req = new Request(`${URL_BASE}/rest/v1/entries?select=player_id,points,created_at&created_at=gte.${monthStart.toISOString()}&limit=10000`);
  req.headers = { apikey: KEY, Authorization: `Bearer ${KEY}` };
  rows = await req.loadJSON();
  if (!Array.isArray(rows)) { failed = true; rows = []; }
} catch (e) { failed = true; }

const total = {}, today = {};
for (const p of PLAYERS) { total[p.id] = 0; today[p.id] = 0; }
for (const r of rows) {
  if (!(r.player_id in total)) continue;
  total[r.player_id] += r.points;
  if (new Date(r.created_at) >= dayStart) today[r.player_id] += r.points;
}
const ranked = [...PLAYERS].sort((a, b) => total[b.id] - total[a.id]);
const max = Math.max(1, ...ranked.map(p => total[p.id]));

const w = new ListWidget();
w.backgroundColor = new Color("#16171A");
w.url = APP_URL;
w.setPadding(14, 14, 12, 14);

const head = w.addStack();
const title = head.addText("Scoreboard");
title.font = Font.boldSystemFont(14);
title.textColor = new Color("#EDEDEC");
head.addSpacer();
const month = head.addText(now.toLocaleDateString("de-DE", { month: "short" }));
month.font = Font.systemFont(11);
month.textColor = new Color("#9B9EA6");
w.addSpacer(8);

if (failed) {
  const t = w.addText("Keine Verbindung");
  t.font = Font.systemFont(12);
  t.textColor = new Color("#E2584D");
} else {
  ranked.forEach((p, i) => {
    const line = w.addStack();
    line.centerAlignContent();
    const medal = ["🥇", "🥈", "🥉"][i];
    const n = line.addText(`${medal} ${p.name}`);
    n.font = Font.mediumSystemFont(13);
    n.textColor = new Color(p.color);
    line.addSpacer();
    if (today[p.id] > 0) {
      const t = line.addText(`+${today[p.id]}  `);
      t.font = Font.systemFont(11);
      t.textColor = new Color("#9B9EA6");
    }
    const s = line.addText(String(total[p.id]));
    s.font = Font.boldSystemFont(15);
    s.textColor = new Color("#EDEDEC");
    w.addSpacer(2);

    const bar = w.addStack();
    bar.size = new Size(0, 4);
    const fill = bar.addStack();
    fill.backgroundColor = new Color(p.color);
    fill.cornerRadius = 2;
    fill.size = new Size(Math.max(4, Math.round(290 * total[p.id] / max)), 4);
    w.addSpacer(5);
  });
}

if (config.runsInWidget) Script.setWidget(w);
else await w.presentMedium();
Script.complete();
