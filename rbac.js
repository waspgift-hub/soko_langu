module.exports=function registerRBAC(app,db){
  const g=(sql,p=[])=>db.prepare(sql).get(p);
  const roles={
    admin:['*'],
    manager:['dashboard','products:read','products:write','sales:read','sales:write','buyer:read','buyer:write','customers:read','customers:write','suppliers:read','suppliers:write','purchases:read','purchases:write','stock:read','stock:write','returns:read','returns:write','cash:read','cash:write','expenses:read','expenses:write','reports:read','accounting:read','accounting:write','users:read','users:write','settings:read','settings:write','audit:read','backup:read'],
    cashier:['dashboard','products:read','sales:read','sales:write','buyer:read','buyer:write','customers:read','customers:write','returns:read','returns:write','cash:read','cash:write','reports:read'],
    staff:['dashboard','products:read','sales:read','buyer:read','customers:read','stock:read','reports:read']
  };
  app.use((req,res,next)=>{
    if(!req.path.startsWith('/api/')||req.path==='/api/auth/login'||req.path==='/api/health')return next();
    const publicRead=['/api/dashboard','/api/products','/api/buyer-requests','/api/customers','/api/suppliers','/api/categories','/api/brands','/api/sales','/api/purchases','/api/stock/movements','/api/returns','/api/cashbook','/api/reports','/api/reports/daily','/api/settings'];
    if(!req.user){ if(req.method==='GET'&&publicRead.includes(req.path)) return next(); return res.status(401).json({error:'Login required'}); }
    const role=req.user.role||'staff';
    if(role==='admin')return next();
    const permission=permissionFor(req);
    if(!roles[role]?.includes(permission))return res.status(403).json({error:'Permission denied',required:permission,role});
    next();
  });
  function permissionFor(req){
    const p=req.path;
    if(p.startsWith('/api/products'))return req.method==='GET'?'products:read':'products:write';
    if(p.startsWith('/api/sales'))return req.method==='GET'?'sales:read':'sales:write';
    if(p.startsWith('/api/buyer-requests'))return req.method==='GET'?'buyer:read':'buyer:write';
    if(p.startsWith('/api/customers'))return req.method==='GET'?'customers:read':'customers:write';
    if(p.startsWith('/api/suppliers'))return req.method==='GET'?'suppliers:read':'suppliers:write';
    if(p.startsWith('/api/purchases'))return req.method==='GET'?'purchases:read':'purchases:write';
    if(p.startsWith('/api/stock'))return req.method==='GET'?'stock:read':'stock:write';
    if(p.startsWith('/api/returns'))return req.method==='GET'?'returns:read':'returns:write';
    if(p.startsWith('/api/cashbook'))return req.method==='GET'?'cash:read':'cash:write';
    if(p.startsWith('/api/expenses'))return req.method==='GET'?'expenses:read':'expenses:write';
    if(p.startsWith('/api/reports'))return 'reports:read';
    if(p.startsWith('/api/accounting'))return req.method==='GET'?'accounting:read':'accounting:write';
    if(p.startsWith('/api/users'))return req.method==='GET'?'users:read':'users:write';
    if(p.startsWith('/api/settings'))return req.method==='GET'?'settings:read':'settings:write';
    if(p.startsWith('/api/audit'))return 'audit:read';
    if(p==='/api/backup')return 'backup:read';
    return 'dashboard';
  }
};
