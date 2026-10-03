(() => {
  const milestones=[7,21,42];
  let edition="current";
  const $=id=>document.getElementById(id);
  const esc=v=>typeof escapeHtml==="function"?escapeHtml(v):String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
  const slug=v=>String(v||"dvote").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
  const all=()=>store.receipts.slice().sort((a,b)=>new Date(a.date)-new Date(b.date));
  const chosen=()=>edition==="current"?all():all().slice(0,Number(edition));
  const echoes=r=>typeof topEchoes==="function"?topEchoes(r):[];
  const inventory=r=>r.filter(x=>x.object).map(x=>({day:x.day,object:x.object,encounter:x.encounter}));
  const label=n=>edition==="current"?`Current Edition · ${n} receipt${n===1?"":"s"}`:`${edition}-Receipt Edition`;

  function payload(){
    const r=chosen();
    return {
      schema:"dvote.memento.v1",
      generatedAt:new Date().toISOString(),
      campaign:{id:campaign.id,title:campaign.title,subtitle:campaign.subtitle||null,author:campaign.author||null,version:campaign.version||null},
      edition:{type:edition==="current"?"current":"milestone",target:edition==="current"?r.length:Number(edition),receiptCount:r.length,label:label(r.length)},
      enteredAt:store.enteredAt||null,
      receipts:r,
      inventory:inventory(r),
      echoes:echoes(r).map(([word,count])=>({word,count})),
      law:"Receipt = what happened, not what DVOTE claims it meant."
    };
  }

  function receiptPage(x,i){
    const d=typeof formatReceiptDate==="function"?formatReceiptDate(x.date):x.date;
    return `<article class="memo-page memo-receipt">
      <div class="memo-folio">RECEIPT ${String(i+1).padStart(3,"0")}</div>
      <div class="memo-day">DAY ${String(x.day||1).padStart(3,"0")}</div>
      <h2>${esc(x.encounter||"Encounter")}</h2>
      <div class="memo-crossed"><span>CROSSED</span>${esc(x.door||"Door")}</div>
      <p class="memo-note">${x.note?esc(x.note):"<em>No note. The crossing itself was kept.</em>"}</p>
      ${x.object?`<div class="memo-object"><span>CARRIED</span>${esc(x.object)}</div>`:""}
      <footer><span>${esc(x.weather||"weather unmarked")}</span><span>${esc(d||"")}</span></footer>
    </article>`;
  }

  function pages(){
    const p=payload();
    if(!p.receipts.length) return `<div class="memo-empty"><div class="tiny-label">NO MATERIAL YET</div><p>MEMENTO begins after the first witnessed crossing.</p></div>`;
    const inv=p.inventory.length?p.inventory.map(x=>`<li><strong>Day ${String(x.day).padStart(3,"0")}</strong> — ${esc(x.object)}</li>`).join(""):"<li>Nothing was deliberately carried forward.</li>";
    const ech=p.echoes.length?p.echoes.map(x=>`<li>${esc(x.word)} ×${x.count}</li>`).join(""):"<li>No word repeated strongly enough to register.</li>";
    return `<article class="memo-page memo-cover">
      <div class="memo-kicker">DVOTE / MEMENTO</div><div class="memo-sigil">${p.receipts.length}</div>
      <h2>What Survived</h2><p class="memo-campaign">${esc(p.campaign.title)}</p>
      <p class="memo-edition">${esc(p.edition.label)}</p><p class="memo-law">A book made only from witnessed crossings.</p>
    </article>
    ${p.receipts.map(receiptPage).join("")}
    <article class="memo-page memo-index"><div class="memo-folio">WHAT WAS CARRIED</div><h2>Inventory</h2><ul>${inv}</ul></article>
    <article class="memo-page memo-index"><div class="memo-folio">WHAT REPEATED</div><h2>Echoes</h2><ul>${ech}</ul><p class="memo-law">Recurrence is shown, not interpreted.</p></article>
    <article class="memo-page memo-colophon"><div class="memo-sigil">◇</div><h2>Held.</h2><p>These pages preserve what the reader witnessed. They do not decide what any trace meant.</p><p class="memo-law">Receipt = what happened, not what DVOTE claims it meant.</p></article>`;
  }

  function render(){
    const n=store.receipts.length;
    $("memento-milestones").innerHTML=
      `<button class="memento-chip ${edition==="current"?"selected":""}" data-edition="current" ${n?"":"disabled"}>NOW <span>${n}</span></button>`+
      milestones.map(m=>`<button class="memento-chip ${edition===String(m)?"selected":""}" data-edition="${m}" ${n>=m?"":"disabled"}>${m} <span>${n>=m?"OPEN":n+"/"+m}</span></button>`).join("");
    document.querySelectorAll("[data-edition]").forEach(b=>b.addEventListener("click",()=>{if(!b.disabled){edition=b.dataset.edition;render();}}));
    $("memento-preview").innerHTML=pages();
    const has=chosen().length>0;
    ["memento-print","memento-html","memento-json"].forEach(id=>$(id).disabled=!has);
  }

  function standalone(){
    const p=payload();
    return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>MEMENTO — ${esc(p.campaign.title)}</title>
<style>:root{--ink:#1d1912;--muted:#726955;--line:#cfc4aa;--accent:#8a6b27;--paper:#f6f0e3}*{box-sizing:border-box}body{margin:0;background:#d8d0c0;color:var(--ink);font-family:Georgia,"Times New Roman",serif}.book{width:min(100%,760px);margin:auto;padding:24px}.memo-page{position:relative;min-height:9in;margin:0 auto 24px;padding:.65in;background:var(--paper);border:1px solid #bfb49b;box-shadow:0 14px 32px #0002;page-break-after:always}.memo-cover,.memo-colophon{display:flex;flex-direction:column;justify-content:flex-end}.memo-kicker,.memo-folio,.memo-day,.memo-crossed span,.memo-object span,footer{font-family:Arial,sans-serif;text-transform:uppercase;letter-spacing:.14em;font-size:10px;font-weight:700;color:var(--muted)}.memo-cover h2{font-size:52px;line-height:.95;margin:18px 0}.memo-receipt h2,.memo-index h2,.memo-colophon h2{font-size:34px;line-height:1;margin:14px 0 28px}.memo-sigil{width:110px;height:110px;border:1px solid var(--accent);border-radius:50%;display:grid;place-items:center;color:var(--accent);font-size:32px;margin:0 0 42px}.memo-campaign{font-size:20px;margin:0 0 8px}.memo-edition,.memo-law{color:var(--muted);font-style:italic}.memo-day{color:var(--accent);margin-top:30px}.memo-crossed,.memo-object{border-left:3px solid var(--accent);padding:14px 16px;margin:18px 0;background:#8a6b270d}.memo-crossed span,.memo-object span{display:block;margin-bottom:6px}.memo-note{font-size:20px;line-height:1.55;margin:28px 0}footer{position:absolute;left:.65in;right:.65in;bottom:.5in;display:flex;justify-content:space-between;border-top:1px solid var(--line);padding-top:12px}ul{font-size:18px;line-height:1.7;padding-left:22px}@media print{body{background:white}.book{width:auto;padding:0}.memo-page{margin:0;border:0;box-shadow:none;min-height:100vh}}</style>
</head><body><main class="book">${pages()}</main></body></html>`;
  }

  function download(name,type,text){
    const blob=new Blob([text],{type}),url=URL.createObjectURL(blob),a=document.createElement("a");
    a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  const base=()=>slug(campaign.id)+"-memento-"+chosen().length;
  const exportHtml=()=>download(base()+".html","text/html;charset=utf-8",standalone());
  const exportJson=()=>download(base()+".json","application/json;charset=utf-8",JSON.stringify(payload(),null,2));
  function printEdition(){const w=window.open("","_blank");if(!w){exportHtml();return;}w.document.open();w.document.write(standalone());w.document.close();w.addEventListener("load",()=>{w.focus();w.print();},{once:true});}

  function install(){
    const rv=$("receipts"),list=$("receipt-list"),remember=$("remember");
    if(!rv||!list||!remember)return;
    const call=document.createElement("div");call.className="memento-callout";
    call.innerHTML=`<div><div class="tiny-label">MEMENTO</div><strong>Bind what survived into a little book.</strong></div><button id="open-memento" class="secondary">MAKE A MEMENTO</button>`;
    list.before(call);
    const view=document.createElement("section");view.id="memento";view.className="view";
    view.innerHTML=`<button id="memento-back" class="text-button back-button">← field archive</button><div class="kicker">MEMENTO</div><h1>What Survived</h1><p class="muted">A book composed only from your receipts. No new meaning is added.</p><div id="memento-milestones" class="memento-milestones"></div><div class="memento-actions"><button id="memento-print" class="primary">PRINT / SAVE PDF</button><button id="memento-html" class="secondary">EXPORT HTML</button><button id="memento-json" class="secondary">EXPORT DATA</button></div><div id="memento-preview" class="memento-preview"></div>`;
    remember.before(view);
    $("open-memento").addEventListener("click",()=>{edition="current";render();showView("memento");});
    $("memento-back").addEventListener("click",()=>showView("receipts"));
    $("memento-print").addEventListener("click",printEdition);
    $("memento-html").addEventListener("click",exportHtml);
    $("memento-json").addEventListener("click",exportJson);
  }
  install();
})();