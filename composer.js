(() => {
  const STOP=new Set("the a an and or but to of in on at for from with is was are were be been being it this that i you we they he she my your our their one what where when how as not do did does into out up down just very today thing something this that have has had".split(" "));
  const $=id=>document.getElementById(id);
  const esc=v=>typeof escapeHtml==="function"?escapeHtml(v):String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
  const norm=v=>String(v??"").trim().toLowerCase().replace(/\s+/g," ");
  const stateKey=()=>`dvote.${campaign.id}.composer.decisions`;

  function decisions(){
    try{return JSON.parse(localStorage.getItem(stateKey())||"[]");}
    catch{return [];}
  }

  function saveDecisions(value){
    localStorage.setItem(stateKey(),JSON.stringify(value.slice(-100)));
  }

  function add(map,type,key,label,receipt){
    if(!key)return;
    const fp=type+":"+key;
    if(!map.has(fp))map.set(fp,{fingerprint:fp,type,key,label,count:0,receiptIds:[],days:[]});
    const item=map.get(fp);
    item.count+=1;
    if(receipt.id&&!item.receiptIds.includes(receipt.id))item.receiptIds.push(receipt.id);
    if(receipt.day&&!item.days.includes(receipt.day))item.days.push(receipt.day);
  }

  function candidates(){
    const map=new Map();
    store.receipts.forEach(receipt=>{
      const text=((receipt.note||"")+" "+(receipt.object||"")).toLowerCase();
      const words=new Set((text.match(/[a-z']{3,}/g)||[]).filter(w=>!STOP.has(w)));
      words.forEach(word=>add(map,"word",word,word,receipt));

      if(receipt.object){
        const key=norm(receipt.object);
        add(map,"object",key,receipt.object.trim(),receipt);
      }

      if(receipt.door){
        const key=norm(receipt.door);
        add(map,"door",key,receipt.door.trim(),receipt);
      }
    });

    const released=new Map();
    decisions().filter(d=>d.action==="RELEASE").forEach(d=>{
      const prior=released.get(d.fingerprint);
      if(!prior||d.count>prior)released.set(d.fingerprint,d.count);
    });

    return [...map.values()]
      .filter(x=>x.count>1)
      .filter(x=>x.count>(released.get(x.fingerprint)||0))
      .sort((a,b)=>
        b.count-a.count ||
        b.days.length-a.days.length ||
        a.type.localeCompare(b.type) ||
        a.label.localeCompare(b.label)
      );
  }

  function current(){
    return candidates()[0]||null;
  }

  function latestFor(fp){
    return decisions().filter(d=>d.fingerprint===fp).slice(-1)[0]||null;
  }

  function prompt(candidate,action){
    const subject='“'+candidate.label+'”';
    if(action==="KEEP")return `Carry ${subject} forward as an unresolved thread. Add no meaning yet.`;
    if(action==="RELEASE")return `Stop surfacing ${subject} at this evidence count. It may return only if new evidence changes the count.`;
    return `Look for one concrete instance related to ${subject} without trying to prove a pattern. If nothing happens, that is evidence too.`;
  }

  function choose(action){
    const candidate=current();
    if(!candidate)return;

    const record={
      id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),
      selectedAt:new Date().toISOString(),
      campaignId:campaign.id,
      fingerprint:candidate.fingerprint,
      type:candidate.type,
      label:candidate.label,
      count:candidate.count,
      days:candidate.days.slice(),
      receiptIds:candidate.receiptIds.slice(),
      action,
      prompt:prompt(candidate,action)
    };

    const history=decisions();
    history.push(record);
    saveDecisions(history);
    render();

    if(action==="RELEASE"){
      const next=current();
      const status=$("composer-status");
      if(status)status.textContent=next
        ? `Released ${record.label} at ×${record.count}. A different recurrence is now available.`
        : `Released ${record.label} at ×${record.count}. Nothing else repeats strongly enough yet.`;
    }
  }

  function evidence(candidate){
    const days=candidate.days.slice().sort((a,b)=>a-b).map(d=>"Day "+String(d).padStart(3,"0")).join(" · ");
    return `${candidate.type.toUpperCase()} · ×${candidate.count}${days?" · "+days:""}`;
  }

  function renderHistory(){
    const el=$("composer-history");
    if(!el)return;
    const history=decisions().slice(-5).reverse();
    el.innerHTML=history.length
      ? history.map(d=>`<div class="composer-history-row"><strong>${esc(d.action)}</strong><span>${esc(d.label)} ×${d.count}</span></div>`).join("")
      : '<p class="composer-empty">No selections yet.</p>';
  }

  function render(){
    const card=$("composer-card");
    if(!card)return;
    const candidate=current();

    if(!candidate){
      card.innerHTML=`
        <div class="composer-head"><div><div class="tiny-label">COMPOSER 001</div><h2>No recommendation yet.</h2></div><div class="composer-mark">∴</div></div>
        <p>Nothing repeats strongly enough to surface, or the repeated traces have been released at their current evidence counts.</p>
        <p class="composer-law">OMISSION ≠ NONEXISTENCE. RECURRENCE ≠ MEANING.</p>
        <div id="composer-history" class="composer-history"></div>
      `;
      renderHistory();
      return;
    }

    const latest=latestFor(candidate.fingerprint);
    card.innerHTML=`
      <div class="composer-head">
        <div><div class="tiny-label">COMPOSER 001 · CURRENT ARCHIVE</div><h2>${esc(candidate.label)}</h2></div>
        <div class="composer-mark">×${candidate.count}</div>
      </div>
      <div class="composer-evidence">${esc(evidence(candidate))}</div>
      <p class="composer-copy">This is evidence of recurrence only. Composer can propose nearby doors; it cannot decide what the recurrence means or which door you should cross.</p>
      <div class="composer-doors">
        <button data-composer-action="KEEP"><strong>KEEP</strong><span>Carry it forward unresolved.</span></button>
        <button data-composer-action="RELEASE"><strong>RELEASE</strong><span>Stop surfacing it at this count.</span></button>
        <button data-composer-action="INVESTIGATE"><strong>INVESTIGATE</strong><span>Make one bounded observation.</span></button>
      </div>
      <p id="composer-status" class="composer-status">${latest?esc("Last selection: "+latest.action+". "+latest.prompt):"No selection has been made."}</p>
      <p class="composer-law">RECOMMENDATION ≠ SELECTION · RECURRENCE ≠ AUTHORITY</p>
      <div class="composer-history-title">RECENT SELECTIONS</div>
      <div id="composer-history" class="composer-history"></div>
    `;

    card.querySelectorAll("[data-composer-action]").forEach(button=>{
      button.addEventListener("click",()=>choose(button.dataset.composerAction));
    });
    renderHistory();
  }

  function exportState(){
    return {
      schema:"dvote.composer.v1",
      generatedAt:new Date().toISOString(),
      currentCandidate:current(),
      decisions:decisions()
    };
  }

  function install(){
    const milestones=$("memento-milestones");
    if(!milestones)return;

    const card=document.createElement("section");
    card.id="composer-card";
    card.className="composer-card";
    milestones.after(card);
    card.innerHTML='<div class="tiny-label">COMPOSER 001</div><p class="composer-empty">Composer wakes when MEMENTO opens.</p>';
    if(typeof campaign!=="undefined"&&campaign)render();

    const open=$("open-memento");
    if(open)open.addEventListener("click",()=>setTimeout(render,0));
  }

  window.DVOTEComposer={render,exportState};
  install();
})();