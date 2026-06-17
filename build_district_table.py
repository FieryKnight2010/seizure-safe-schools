#!/usr/bin/env python3
"""Build a map-free, searchable district TABLE for the Find Your District page.
Outputs textbook/docs/find-your-district/district_table.html (no choropleth)."""
import csv, os, html

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, "..", "data")
OUT = os.path.join(HERE, "docs", "find-your-district", "district_table.html")
CHECK_DATE = "June 2026"

def clean_isd(s):
    s = str(s).replace("ISD ", "").replace("MN-", "").strip()
    return (s[-4:].lstrip("0") or "0") if (s.startswith("0") or len(s) > 4) else (s.lstrip("0") or "0")

ev = {}
for fn in ["audit_results_pilot.csv", "audit_results_census.csv"]:
    p = os.path.join(DATA, fn)
    if os.path.exists(p):
        for r in csv.DictReader(open(p)):
            ev[clean_isd(r["isd"])] = r.get("evidence_url", "")

LABEL = {
    "FOUND_SEIZURE_SPECIFIC": ("Seizure plan posted", "#1a9850"),
    "FOUND_MED_POLICY_ONLY": ("Medication policy only", "#e08e0b"),
    "NOT_FOUND": ("Nothing found online", "#d73027"),
    "NOT_VERIFIABLE": ("Could not check", "#999999"),
}

rows = sorted(csv.DictReader(open(os.path.join(DATA, "audit_full.csv"))), key=lambda r: r["district"].title())
trs = []
for r in rows:
    isd = str(r["isd"])
    label, color = LABEL.get(r["classification"], ("Unknown", "#999"))
    url = ev.get(isd, "")
    link = f'<a href="{html.escape(url)}" target="_blank" rel="noopener">source</a>' if url.startswith("http") else "&mdash;"
    name = html.escape(r["district"].title()); county = html.escape((r.get("county") or "").replace(" County", ""))
    trs.append(
        f'<tr data-s="{html.escape((name+" "+county+" "+isd).lower())}">'
        f'<td>{name}</td><td>{county}</td><td>{html.escape(r.get("locale",""))}</td>'
        f'<td><span class="dot" style="background:{color}"></span>{label}</td>'
        f'<td>{link}</td></tr>')
n = len(rows)
n_plan = sum(1 for r in rows if r["classification"] == "FOUND_SEIZURE_SPECIFIC")

page = f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>All Minnesota districts</title>
<style>
 body{{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;margin:0;color:#1a1a1a}}
 .wrap{{max-width:820px;margin:0 auto;padding:6px}}
 #q{{width:100%;padding:10px 12px;font-size:1rem;border:1px solid #bbb;border-radius:8px}}
 .legend{{font-size:.82rem;color:#444;margin:8px 0}}
 .legend span{{margin-right:14px;white-space:nowrap}}
 table{{border-collapse:collapse;width:100%;font-size:.9rem;margin-top:6px}}
 th,td{{text-align:left;padding:7px 8px;border-bottom:1px solid #eee}}
 th{{position:sticky;top:0;background:#fafafa}}
 .dot{{display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:7px;vertical-align:middle}}
 .muted{{color:#666;font-size:.82rem}} a{{color:#b3202c}}
</style></head><body><div class="wrap">
<p class="muted">All {n} Minnesota districts. {n_plan} post a seizure plan publicly online (as of {CHECK_DATE}).
"Not found" does not mean a district has no plan, always contact your school.</p>
<input id="q" placeholder="Filter by district or county..." onkeyup="filt()">
<div class="legend">
 <span><span class="dot" style="background:#1a9850"></span>Plan posted</span>
 <span><span class="dot" style="background:#e08e0b"></span>Medication policy only</span>
 <span><span class="dot" style="background:#d73027"></span>Nothing found</span>
 <span><span class="dot" style="background:#999999"></span>Could not check</span>
</div>
<p class="muted" id="cnt"></p>
<table><thead><tr><th>District</th><th>County</th><th>Type</th><th>Seizure plan posted?</th><th>Source</th></tr></thead>
<tbody id="tb">
{chr(10).join(trs)}
</tbody></table>
<script>
function filt(){{
 var q=document.getElementById('q').value.toLowerCase().trim(), rows=document.querySelectorAll('#tb tr'), n=0;
 rows.forEach(function(r){{var m=r.getAttribute('data-s').indexOf(q)>-1;r.style.display=m?'':'none';if(m)n++;}});
 document.getElementById('cnt').textContent=n+' districts shown';
}}
filt();
</script>
</div></body></html>"""
open(OUT, "w").write(page)
print("wrote", os.path.relpath(OUT, HERE), "with", n, "districts (no map)")
