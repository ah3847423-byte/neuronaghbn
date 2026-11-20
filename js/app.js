/* ============ RENDER GENERAL ============ */
function render(){
  const c=compute(), pYes=c.yh, cls=pYes>=0.5?1:0;
  buildNodesValues(c); drawConnections(c); renderPhases(c);
  $('pYes').textContent=(pYes*100).toFixed(1)+'%'; $('pNo').textContent=((1-pYes)*100).toFixed(1)+'%';
  $('bYes').style.width=pYes*100+'%'; $('bNo').style.width=(1-pYes)*100+'%';
  $('oYes').classList.toggle('win',cls===1); $('oNo').classList.toggle('win',cls===0);
  const items=[['Epoch',state.epoch],['Iteración',state.iter],['Loss',f(c.L,4)],['Accuracy inst.',(cls===state.y?100:0)+'%'],['Accuracy dataset',f(c.ds.acc,1)+'%'],['Loss promedio',f(c.ds.L,4)],
   ['ŷ',f(c.yh,4)],['Clase',cls?'Concluirá':'No concluirá'],['w₁',f(state.w[0],3)],['w₂',f(state.w[1],3)],['w₃',f(state.w[2],3)],['bias',f(state.b,3)],['η',state.eta]];
  $('stat').innerHTML=items.map(([k,v])=>`<div>${k}<b>${v}</b></div>`).join('');
  [0,1,2].forEach(i=>$('vx'+i).textContent=state.x[i]);
  $('warn').innerHTML = Math.abs(c.z)>8 ? `⚠️ <b>Neurona saturada:</b> z = ${f(c.z,2)} → σ(z) ≈ ${c.z>0?'1':'0'}. No es un error de cálculo: con los pesos iniciales (3, 5, 6), todos positivos, casi cualquier entrada da una z enorme y la red <u>todavía no ha aprendido</u>. Entrena con «Dataset completo» (Entrenamiento Continuo o 100 epochs) para que aprenda que puntaje bajo o mucha actividad social reducen la probabilidad.` : '';
  lastC=c; draw3D(c);
  if(chart) chart.update();
  $('veta').textContent=state.eta; $('vb').textContent=f(state.b,1);
}

/* ============ LOG PEDAGÓGICO ============ */
function log(html){ const d=document.createElement('div'); d.innerHTML=html; $('log').prepend(d); }

/* ============ ACCIONES ============ */
function doForward(){
  const c=compute();
  log(`<b style="color:#60a5fa">Forward:</b> z = ${f(c.z,3)}. <b style="color:#a78bfa">Sigmoide:</b> ŷ = ${f(c.yh,4)} (${(c.yh*100).toFixed(1)}% de concluir). <b style="color:#fbbf24">Error:</b> L = ${f(c.L,4)} frente a y = ${state.y}.`);
  render();
}
// Aplica la actualización de pesos (descenso por gradiente)
function applyUpdate(){
  const c=compute();
  state.last={ old:[...state.w], nw:c.nw, dw:c.nw.map((v,i)=>v-state.w[i]) };
  addPoint(c.useData?c.ds.L:c.L);
  state.w=c.nw; state.b=c.nb; state.iter++; state.epoch++;
  state.hist.push([...state.w]); if(state.hist.length>400) state.hist.shift();
  return c;
}
// Retropropagación animada: pulso rojo hacia atrás y luego verde al actualizar
function doBackprop(){
  if(state.busy) return; state.busy=true;
  const c=compute(), net=$('net');
  log(`<b style="color:#f87171">Backprop:</b> (ŷ−y) = ${f(c.e,4)}. Gradientes: ∂L/∂w₁=${f(c.g[0],3)}, ∂L/∂w₂=${f(c.g[1],3)}, ∂L/∂w₃=${f(c.g[2],3)}, ∂L/∂b=${f(c.gb,3)}.`);
  net.classList.add('bp'); render();
  setTimeout(()=>{
    applyUpdate(); net.classList.replace('bp','upd');
    log(`<b style="color:#4ade80">Actualización:</b> w = (${state.w.map(v=>f(v,3)).join(', ')}), b = ${f(state.b,3)}. Los pesos se movieron contra el gradiente para reducir L.`);
    render();
    setTimeout(()=>{ net.classList.remove('upd'); state.busy=false; },900);
  },900);
}
// Entrenamiento rápido sin animación larga
function trainEpochs(n,quiet){
  for(let i=0;i<n;i++) applyUpdate();
  if(!quiet){ const cc=compute(); log(`<b style="color:#4ade80">Entrenadas ${n} epoch(s).</b> Loss promedio = ${f(cc.ds.L,4)}, accuracy del dataset = ${f(cc.ds.acc,1)}%.`); }
  const net=$('net'); net.classList.add('upd'); render(); setTimeout(()=>net.classList.remove('upd'),600);
}
function startContinuous(){ if(state.timer) return; state.timer=setInterval(()=>trainEpochs(25,true),400); }
function stopContinuous(){ clearInterval(state.timer); state.timer=null; }
function randomWeights(){ stopContinuous(); state.w=state.w.map(()=>+(Math.random()*10-5).toFixed(2)); state.last=null; state.hist=[[...state.w]]; log('Pesos aleatorios generados.'); render(); }
function resetAll(){ stopContinuous(); Object.assign(state,{w:[...INITIAL.w],b:INITIAL.b,eta:INITIAL.eta,epoch:0,iter:0,last:null,hist:[[...INITIAL.w]]}); syncControls(); clearChart(); $('log').innerHTML=''; render(); }
function loadExample(i){ state.x=[...EXAMPLES[i].x]; state.y=EXAMPLES[i].y; syncControls(); log(`Ejemplo ${i+1} cargado: x=(${state.x}), y=${state.y}.`); render(); }
function syncControls(){ [0,1,2].forEach(i=>$('x'+i).value=state.x[i]); $('y').value=state.y; $('eta').value=state.eta; $('b').value=state.b; }

/* ============ EVENTOS ============ */
[0,1,2].forEach(i=>$('x'+i).oninput=e=>{state.x[i]=+e.target.value;render();});
$('y').onchange=e=>{state.y=+e.target.value;render();};
$('eta').oninput=e=>{state.eta=+e.target.value;render();};
$('b').oninput=e=>{state.b=+e.target.value;render();};
$('mode').onchange=e=>{state.mode=e.target.value;render();};

/* ============ GRÁFICA ============ */
let chart=null;
try{
  chart=new Chart($('chart'),{type:'line',data:{labels:[],datasets:[{label:'Loss',data:[],borderColor:'#ef4444',backgroundColor:'#ef444433',fill:true,tension:.3,pointRadius:2}]},
   options:{responsive:true,maintainAspectRatio:false,animation:{duration:400},
    scales:{x:{title:{display:true,text:'Iteración',color:'#e2e8f0'},ticks:{color:'#94a3b8'},grid:{color:'#334155'}},
            y:{title:{display:true,text:'Loss',color:'#e2e8f0'},ticks:{color:'#94a3b8'},grid:{color:'#334155'},beginAtZero:true}},
    plugins:{legend:{labels:{color:'#e2e8f0'}}}}});
}catch(e){ console.error('Chart.js no disponible',e); }
function addPoint(loss){ if(!chart) return; chart.data.labels.push(state.iter+1); chart.data.datasets[0].data.push(+loss.toFixed(4)); }
function clearChart(){ if(!chart) return; chart.data.labels=[]; chart.data.datasets[0].data=[]; chart.update(); }

/* ============ INICIO ============ */
buildNodes(); syncControls(); render();
log('Listo. Ajusta x₁, x₂, x₃ (0–9), pulsa <b>Backpropagation</b> o <b>Entrenamiento Continuo</b> y observa cada fase.');
