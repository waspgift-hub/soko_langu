module.exports = function registerAccounting(app, db){
  const q=(sql,p=[])=>db.prepare(sql).all(p);
  const g=(sql,p=[])=>db.prepare(sql).get(p);
  const r=(sql,p=[])=>db.prepare(sql).run(p);

  const defaults=[
    ['1000','Cash','asset'],['1100','Accounts Receivable','asset'],['1200','Inventory','asset'],
    ['2000','Accounts Payable','liability'],['3000','Owner Equity','equity'],
    ['4000','Sales Revenue','income'],['4100','Other Income','income'],
    ['5000','Cost of Goods Sold','expense'],['5100','Operating Expenses','expense']
  ];
  const seed= db.transaction(()=>defaults.forEach(x=>r('INSERT OR IGNORE INTO accounts(code,name,type) VALUES(?,?,?)',x)));
  seed();

  app.get('/api/accounting/accounts',(req,res)=>res.json(q('SELECT * FROM accounts ORDER BY code')));

  app.post('/api/accounting/accounts',(req,res)=>{
    const {code,name,type}=req.body;
    if(!code||!name||!['asset','liability','equity','income','expense'].includes(type)) return res.status(400).json({error:'code, name and valid type required'});
    try{r('INSERT INTO accounts(code,name,type) VALUES(?,?,?)',[code,name,type]);res.json({ok:true});}
    catch(e){res.status(400).json({error:e.message});}
  });

  app.get('/api/accounting/journal',(req,res)=>res.json(q(`SELECT e.*,COALESCE(SUM(l.debit),0) debit,COALESCE(SUM(l.credit),0) credit FROM journal_entries e LEFT JOIN journal_lines l ON l.entry_id=e.id GROUP BY e.id ORDER BY e.id DESC LIMIT 500`)));

  app.post('/api/accounting/journal',(req,res)=>{
    const {title,reference,entry_date,lines=[]}=req.body;
    if(!title||!Array.isArray(lines)||lines.length<2) return res.status(400).json({error:'Journal requires at least two lines'});
    const clean=lines.map(x=>({account_id:Number(x.account_id),debit:Number(x.debit)||0,credit:Number(x.credit)||0})).filter(x=>x.account_id&&(x.debit>0||x.credit>0));
    const debit=clean.reduce((a,x)=>a+x.debit,0),credit=clean.reduce((a,x)=>a+x.credit,0);
    if(!clean.length||Math.abs(debit-credit)>0.005)return res.status(400).json({error:'Debits and credits must balance'});
    const tx=db.transaction(()=>{const e=r('INSERT INTO journal_entries(reference,title,entry_date,user_id) VALUES(?,?,COALESCE(?,CURRENT_TIMESTAMP),?)',[reference||'',title,entry_date||null,req.user?.id||null]);for(const x of clean)r('INSERT INTO journal_lines(entry_id,account_id,debit,credit) VALUES(?,?,?,?)',[e.lastInsertRowid,x.account_id,x.debit,x.credit]);return e.lastInsertRowid;});
    res.json({ok:true,id:tx(),debit,credit});
  });

  app.get('/api/accounting/trial-balance',(req,res)=>{
    const rows=q(`SELECT a.code,a.name,a.type,COALESCE(SUM(l.debit),0) debit,COALESCE(SUM(l.credit),0) credit FROM accounts a LEFT JOIN journal_lines l ON l.account_id=a.id GROUP BY a.id ORDER BY a.code`);
    res.json(rows.map(x=>({...x,balance:x.debit-x.credit})));
  });

  app.get('/api/accounting/pnl',(req,res)=>{
    const from=req.query.from||'1970-01-01',to=req.query.to||'9999-12-31';
    const rows=q(`SELECT a.code,a.name,a.type,COALESCE(SUM(l.debit),0) debit,COALESCE(SUM(l.credit),0) credit FROM accounts a LEFT JOIN journal_lines l ON l.account_id=a.id LEFT JOIN journal_entries e ON e.id=l.entry_id AND date(e.entry_date) BETWEEN date(?) AND date(?) WHERE a.type IN ('income','expense') GROUP BY a.id ORDER BY a.code`,[from,to]);
    const income=rows.filter(x=>x.type==='income').reduce((s,x)=>s+x.credit-x.debit,0);
    const expenses=rows.filter(x=>x.type==='expense').reduce((s,x)=>s+x.debit-x.credit,0);
    res.json({from,to,income,expenses,profit:income-expenses,accounts:rows});
  });

  app.get('/api/accounting/balance-sheet',(req,res)=>{
    const rows=q(`SELECT a.code,a.name,a.type,COALESCE(SUM(l.debit),0) debit,COALESCE(SUM(l.credit),0) credit FROM accounts a LEFT JOIN journal_lines l ON l.account_id=a.id GROUP BY a.id ORDER BY a.code`);
    const assets=rows.filter(x=>x.type==='asset').reduce((s,x)=>s+x.debit-x.credit,0);
    const liabilities=rows.filter(x=>x.type==='liability').reduce((s,x)=>s+x.credit-x.debit,0);
    const equity=rows.filter(x=>x.type==='equity').reduce((s,x)=>s+x.credit-x.debit,0);
    const retained=rows.filter(x=>x.type==='income').reduce((s,x)=>s+x.credit-x.debit,0)-rows.filter(x=>x.type==='expense').reduce((s,x)=>s+x.debit-x.credit,0);
    res.json({assets,liabilities,equity,retainedEarnings:retained,totalLiabilitiesEquity:liabilities+equity+retained,accounts:rows});
  });

  app.get('/api/accounting/cash-flow',(req,res)=>{
    const from=req.query.from||'1970-01-01',to=req.query.to||'9999-12-31';
    const rows=q(`SELECT type,COALESCE(SUM(amount),0) amount FROM cashbook WHERE date(created_at) BETWEEN date(?) AND date(?) GROUP BY type`,[from,to]);
    const cashIn=(rows.find(x=>x.type==='in')||{}).amount||0,cashOut=(rows.find(x=>x.type==='out')||{}).amount||0;
    res.json({from,to,cashIn,cashOut,netCash:cashIn-cashOut});
  });
};
