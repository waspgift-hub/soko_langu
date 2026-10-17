/* Soko Langu Phase 7 UI enhancements: date reports + TV dashboard. */
const phase7Date = d => d.toISOString().slice(0,10);
function phase7Range(kind){
  const now=new Date(); const to=phase7Date(now); let from=new Date(now);
  if(kind==='today'){} else if(kind==='week') from.setDate(now.getDate()-6);
  else if(kind==='month') from.setDate(1);
  else if(kind==='year'){from.setMonth(0,1)}
  return {from:phase7Date(from),to};
}
async function reports(){
  const today=phase7Range('today');
  layout('Reports & Analytics',`<div class="panel"><div class="toolbar">
    <button onclick="reportPreset('today')">Leo</button><button onclick="reportPreset('week')">Wiki</button><button onclick="reportPreset('month')">Mwezi</button><button onclick="reportPreset('year')">Mwaka</button><button onclick="reportPreset('custom')">Custom</button>
  </div><form id="reportFilter" onsubmit="filterReports(event)"><div class="formgrid"><label>Kuanzia<input id="reportFrom" name="from" type="date" value="${today.from}"></label><label>Mpaka<input id="reportTo" name="to" type="date" value="${today.to}"></label><button>Onyesha Ripoti</button></div></form></div><div id="reportBody" class="grid"></div><div id="reportDaily" class="panel" style="margin-top:15px"></div>`);
  await filterReports();
}
async function reportPreset(kind){if(kind==='custom')return;const r=phase7Range(kind);document.getElementById('reportFrom').value=r.from;document.getElementById('reportTo').value=r.to;await filterReports();}
async function filterReports(e){if(e?.preventDefault)e.preventDefault();const from=document.getElementById('reportFrom')?.value||'';const to=document.getElementById('reportTo')?.value||'';const r=await api('/api/reports?from='+encodeURIComponent(from)+'&to='+encodeURIComponent(to));if(r.error){alert(r.error);return}document.getElementById('reportBody').innerHTML=`<div class="card">Mauzo<div class="metric">${money(r.sales)}</div></div><div class="card">Expenses<div class="metric">${money(r.expenses)}</div></div><div class="card">Purchases<div class="metric">${money(r.purchases)}</div></div><div class="card">Returns<div class="metric">${money(r.returns)}</div></div><div class="card">Net<div class="metric">${money(r.net)}</div></div><div class="card">Stock Value<div class="metric">${money(r.stockValue)}</div></div>`;const daily=await api('/api/reports/daily');document.getElementById('reportDaily').innerHTML='<h2>Mauzo kwa siku</h2><table><tr><th>Tarehe</th><th>Mauzo</th></tr>'+daily.map(x=>`<tr><td>${esc(x.day)}</td><td>${money(x.sales)}</td></tr>`).join('')+'</table>'}
async function tvDashboard(){
 document.body.classList.add('tv');
 const d=await api('/api/dashboard');
 const s=await api('/api/sales');
 const p=await api('/api/products');
 const low=p.filter(x=>Number(x.stock)<=Number(x.min_stock));
 layout('Soko Langu • TV Dashboard',`<div class="tv-grid"><div class="tv-card"><span>MAUZO LEO</span><strong>${money(d.sales)}</strong></div><div class="tv-card"><span>CASH</span><strong>${money(d.cash)}</strong></div><div class="tv-card"><span>BIDHAA</span><strong>${d.products}</strong></div><div class="tv-card"><span>LOW STOCK</span><strong>${d.low}</strong></div></div><div class="tv-columns"><div class="panel"><h2>Mauzo ya Karibuni</h2><table><tr><th>Bidhaa</th><th>Qty</th><th>Amount</th></tr>${s.slice(0,8).map(x=>`<tr><td>${esc(x.product||'-')}</td><td>${x.qty}</td><td>${money(x.amount)}</td></tr>`).join('')}</table></div><div class="panel"><h2>Low Stock</h2>${low.length?low.slice(0,8).map(x=>`<div class="tv-row"><b>${esc(x.name)}</b><span>${x.stock} / min ${x.min_stock}</span></div>`).join(''):'<p class="muted">Hakuna bidhaa zenye stock ndogo.</p>'}</div></div><p class="muted tv-clock" id="tvClock"></p>`);
 const tick=()=>{const e=document.getElementById('tvClock');if(e)e.textContent='Imesasishwa '+new Date().toLocaleString('sw-TZ')};tick();clearInterval(window.tvTimer);window.tvTimer=setInterval(tvDashboard,30000);
}
function exitTv(){document.body.classList.remove('tv');clearInterval(window.tvTimer);show('home')}
