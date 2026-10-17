/* Final UI fixes: invoice printing, sale actions and resilient navigation. */
async function sales(){
  const [p,s]=await Promise.all([api('/api/products'),api('/api/sales')]);
  layout('Mauzo / POS',`<div class="panel"><form onsubmit="sell(event)"><div class="formgrid"><select name="product_id">${p.filter(x=>x.stock>0).map(x=>`<option value="${x.id}">${esc(x.name)} — ${money(x.price)} — stock ${x.stock}</option>`).join('')}</select><input name="qty" type="number" min="1" value="1"><input name="customer" placeholder="Mteja"></div><button>Uza</button></form></div><div class="panel" style="margin-top:15px"><div class="toolbar"><button onclick="show('sales')">↻ Refresh</button></div><table><tr><th>ID</th><th>Bidhaa</th><th>Qty</th><th>Amount</th><th>Tarehe</th><th>Receipt</th></tr>${s.map(x=>`<tr><td>${x.id}</td><td>${esc(x.product||'-')}</td><td>${x.qty}</td><td>${money(x.amount)}</td><td>${esc(x.created_at)}</td><td><button onclick="printInvoice(${x.id})">🧾 Print</button></td></tr>`).join('')}</table></div>`)
}
function goHomeOnError(message){if(message)alert(message);show('home')}
