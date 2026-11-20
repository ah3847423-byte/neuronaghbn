/* ============ ESTADO DEL MODELO ============ */
const INITIAL = { w:[3,5,6], b:0, eta:0.05 };
const EXAMPLES = [ {x:[8,7,5], y:1}, {x:[2,1,8], y:0} ];
const state = { w:[...INITIAL.w], b:INITIAL.b, eta:INITIAL.eta, x:[8,7,5], y:1,
                epoch:0, iter:0, last:null, timer:null, busy:false, mode:'data', hist:[[3,5,6]] };

/* ============ MATEMÁTICA ============ */
const sigmoid = z => 1/(1+Math.exp(-z));
/* Dataset sintético de 80 casos. Regla: ayudan puntaje y sueño, perjudica la actividad social excesiva.
   (0.6·x₁ + 0.4·x₂ − 0.3·x₃ > 4.2  →  concluye) */
const DATA = (()=>{ const d=[]; for(const a of [1,3,5,7,9]) for(const s of [2,4,6,8]) for(const k of [1,4,7,9]) d.push({x:[a,s,k], y:(0.6*a+0.4*s-0.3*k>4.2)?1:0}); return d; })();
function lossOf(yh,y){ const eps=1e-12,p=Math.min(Math.max(yh,eps),1-eps); return -(y*Math.log(p)+(1-y)*Math.log(1-p)); }
function forwardOf(x){ return sigmoid(state.w[0]*x[0]+state.w[1]*x[1]+state.w[2]*x[2]+state.b); }
// Pérdida media, accuracy y gradiente promedio sobre todo el dataset
function datasetStats(){ let L=0,ok=0,g=[0,0,0],gb=0; DATA.forEach(d=>{const yh=forwardOf(d.x),e=yh-d.y; L+=lossOf(yh,d.y); if((yh>=.5?1:0)===d.y)ok++; d.x.forEach((xi,i)=>g[i]+=e*xi); gb+=e;}); const n=DATA.length; return {L:L/n, acc:ok/n*100, g:g.map(v=>v/n), gb:gb/n, n}; }
// Calcula todo: forward, pérdida, gradientes y pesos nuevos (vista previa)
function compute(){
  const {w,b,x,y,eta} = state;
  const z = w[0]*x[0]+w[1]*x[1]+w[2]*x[2]+b;
  const yh = sigmoid(z);
  const eps = 1e-12, p = Math.min(Math.max(yh,eps),1-eps);
  const L = -(y*Math.log(p)+(1-y)*Math.log(1-p));
  const e = yh-y;
  const gs = x.map(xi=>e*xi), ds = datasetStats(), useData = state.mode==='data';
  const g = useData?ds.g:gs, gb = useData?ds.gb:e;
  return { z, yh, L, e, gs, ds, useData, g, gb, nw:w.map((wi,i)=>wi-eta*g[i]), nb:b-eta*gb };
}
