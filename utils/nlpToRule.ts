export async function generateRuleFromText(text:string,tasks:any[],clients:any[],workers:any[]){
  try{
    const r=await fetch('/api/nlp-rule',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({text,tasks,clients,workers})});
    const j=await r.json(); return j.rule;
  }catch{return null;}
}
