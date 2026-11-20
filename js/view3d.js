/* ============ GRÁFICO 3D (proyección ortográfica en SVG) ============ */
let lastC=null, yaw=-0.7, pitch=0.35;
// Rota un punto normalizado [-1,1]³ y lo proyecta a pantalla
function proj(p){
  const cy=Math.cos(yaw),sy=Math.sin(yaw),cp=Math.cos(pitch),sp=Math.sin(pitch);
  const x=p[0]*cy+p[2]*sy, z0=-p[0]*sy+p[2]*cy;
  const y=p[1]*cp-z0*sp;
  return [380+x*185, 235-y*185];
}
function draw3D(c){
  const svg=$('g3d'); if(!svg||!c) return;
  if(view3d==='s') return drawSurface(c);
  const w=state.w, nw=c.nw;
  const pts=[...state.hist,w,nw,[0,0,0]];
  const lo=[0,1,2].map(i=>Math.min(...pts.map(p=>p[i]))), hi=[0,1,2].map(i=>Math.max(...pts.map(p=>p[i])));
  const ctr=lo.map((v,i)=>(v+hi[i])/2), half=Math.max(1,...lo.map((v,i)=>(hi[i]-v)/2))*1.15;
  const N=p=>p.map((v,i)=>(v-ctr[i])/half);   // escala uniforme
  const P=p=>proj(N(p));
  const line=(A,B,st,sw,ex='')=>`<line x1="${A[0]}" y1="${A[1]}" x2="${B[0]}" y2="${B[1]}" stroke="${st}" stroke-width="${sw}" ${ex}/>`;
  let h=`<defs><marker id="mr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="#ef4444"/></marker><marker id="mg" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="#22c55e"/></marker></defs>`;
  // cubo de referencia
  for(let i=0;i<8;i++){const a=[i&1?1:-1,i&2?1:-1,i&4?1:-1];for(let j=0;j<3;j++)if(!(i&(1<<j))){const b=[...a];b[j]=1;h+=line(proj(a),proj(b),'#334155',1);}}
  // ejes que pasan por el origen (w=0)
  const o=N([0,0,0]), cols=['#60a5fa','#a78bfa','#fbbf24'], names=['w₁','w₂','w₃'];
  [0,1,2].forEach(i=>{ const a=[...o],b=[...o]; a[i]=-1; b[i]=1; const B=proj(b),A=proj(a);
    h+=line(A,B,cols[i],2)+`<text x="${B[0]+6}" y="${B[1]-4}" fill="${cols[i]}" font-weight="700" font-size="15">${names[i]} (${f(ctr[i]+half,1)})</text><text x="${A[0]}" y="${A[1]+14}" fill="${cols[i]}" font-size="11" opacity=".7">${f(ctr[i]-half,1)}</text>`; });
  // trayectoria del entrenamiento
  if(state.hist.length>1) h+=`<polyline fill="none" stroke="#c4b5fd" stroke-width="2" points="${state.hist.map(p=>P(p).join(',')).join(' ')}"/>`;
  const s0=P(state.hist[0]); h+=`<circle cx="${s0[0]}" cy="${s0[1]}" r="5" fill="#3b82f6"/><text x="${s0[0]+8}" y="${s0[1]+4}" fill="#93c5fd" font-size="11">inicio</text>`;
  // vectores: gradiente (rojo) y descenso −∇L (verde), longitud visual fija
  const gn=Math.hypot(...c.g)||1, base=N(w), d=c.g.map(v=>v/gn*0.5/1);
  const up=proj(base.map((v,i)=>v+d[i])), dn=proj(base.map((v,i)=>v-d[i])), W=proj(base), NW=P(nw);
  h+=line(W,up,'#ef4444',4,'marker-end="url(#mr)"')+line(W,dn,'#22c55e',4,'marker-end="url(#mg)"');
  h+=`<text x="${up[0]+6}" y="${up[1]}" fill="#fca5a5" font-size="12" font-weight="700">∇L (error sube)</text><text x="${dn[0]+6}" y="${dn[1]+12}" fill="#86efac" font-size="12" font-weight="700">−∇L (descenso)</text>`;
  // siguiente punto real tras la actualización
  h+=line(W,NW,'#22c55e',1.5,'stroke-dasharray="4 4"')+`<circle cx="${NW[0]}" cy="${NW[1]}" r="7" fill="none" stroke="#22c55e" stroke-width="3"/><text x="${NW[0]+10}" y="${NW[1]+18}" fill="#86efac" font-size="11">w nuevo</text>`;
  // punto actual
  h+=`<circle cx="${W[0]}" cy="${W[1]}" r="9" fill="#8b5cf6" stroke="#fff" stroke-width="3"/><text x="${W[0]+12}" y="${W[1]-10}" fill="#fff" font-size="12" font-weight="700">w actual (${w.map(v=>f(v,2)).join(', ')})</text>`;
  svg.innerHTML=h;
  // tabla: gradiente del ejemplo y promedio del dataset
  const rows=[0,1,2].map(i=>`<tr><td style="color:${cols[i]}">∂L/∂${names[i]}</td><td>(${f(c.yh,3)}−${state.y})·${state.x[i]} = <b style="color:#fca5a5">${f(c.gs[i],3)}</b></td><td>${f(c.ds.g[i],3)}</td></tr>`).join('');
  $('leg3d').innerHTML=`<table><tr><th>Gradiente</th><th>Ejemplo actual</th><th>Prom. dataset</th></tr>${rows}<tr><td style="color:#4ade80">∂L/∂b</td><td>${f(c.yh,3)}−${state.y} = <b style="color:#fca5a5">${f(c.e,3)}</b></td><td>${f(c.ds.gb,3)}</td></tr></table>
  <div style="line-height:1.6"><b style="color:#f87171">Cómo leerlo:</b> el error local (ŷ−y) = ${f(c.e,3)} multiplica cada entrada y da la flecha roja ∇L = (∂L/∂w₁, ∂L/∂w₂, ∂L/∂w₃). Los pesos se mueven en sentido contrario (flecha verde) con paso η = ${state.eta}, hacia el punto verde hueco. ${c.useData?'Con «Dataset completo» el paso usa el gradiente promedio.':'Con «Solo el ejemplo» el paso usa el gradiente del ejemplo.'}<br><span style="color:#94a3b8">Las flechas tienen longitud visual fija: solo indican dirección.</span></div>`;
}
/* ============ SUPERFICIE DE PÉRDIDA DENTRO DEL CUBO ============
   Eje x = w₁, eje z = w₃, altura = pérdida L (w₂ y b quedan fijos en su valor actual).
   Es un corte 3D de la función de pérdida, que en realidad depende de 4 parámetros. */
let view3d='w', surfCache={key:'',T:null};
function setView(v){ view3d=v; $('vbW').classList.toggle('p',v==='w'); $('vbS').classList.toggle('p',v==='s'); draw3D(lastC); }
function drawSurface(c){
  const svg=$('g3d'), M=20, R=5, w=state.w, b=state.b, one=state.mode!=='data';
  const a0=w[0], k0=w[2];
  const key=JSON.stringify([w,b,one,state.x,state.y]);
  const pred=(a,k,x)=>sigmoid(a*x[0]+w[1]*x[1]+k*x[2]+b);
  // cada celda guarda [pérdida, |ŷ−y| promedio]
  const cell=(a,k)=>{ if(one){const yh=pred(a,k,state.x);return [lossOf(yh,state.y),Math.abs(yh-state.y)];}
    let L=0,E=0; DATA.forEach(d=>{const yh=pred(a,k,d.x);L+=lossOf(yh,d.y);E+=Math.abs(yh-d.y);}); return [L/DATA.length,E/DATA.length]; };
  if(surfCache.key!==key){ const T=[]; for(let i=0;i<=M;i++){T.push([]);for(let j=0;j<=M;j++)T[i].push(cell(a0-R+2*R*i/M,k0-R+2*R*j/M));} surfCache={key,T}; }
  const T=surfCache.T; let Lmax=0,im=0,jm=0;
  T.forEach((r,i)=>r.forEach((v,j)=>{ if(v[0]>Lmax)Lmax=v[0]; if(v[0]<T[im][jm][0]){im=i;jm=j;} }));
  Lmax=Lmax||1;
  const V=(i,j)=>[(i/M)*2-1,(T[i][j][0]/Lmax)*1.6-0.8,(j/M)*2-1];
  const depth=p=>-p[0]*Math.sin(yaw)+p[2]*Math.cos(yaw);
  const line=(A,B,st,sw,ex='')=>`<line x1="${A[0]}" y1="${A[1]}" x2="${B[0]}" y2="${B[1]}" stroke="${st}" stroke-width="${sw}" ${ex}/>`;
  const txt=(p,t,col,sz=12,anchor='start')=>`<text x="${p[0]}" y="${p[1]}" fill="${col}" font-size="${sz}" font-weight="700" text-anchor="${anchor}" style="paint-order:stroke;stroke:#0f172a;stroke-width:4px">${t}</text>`;
  let h='';
  // cubo de referencia
  for(let i=0;i<8;i++){const a=[i&1?1:-1,i&2?1:-1,i&4?1:-1];for(let j=0;j<3;j++)if(!(i&(1<<j))){const bb=[...a];bb[j]=1;h+=line(proj(a),proj(bb),'#334155',1);}}
  // superficie (algoritmo del pintor: lo lejano primero), verde = poco error, rojo = mucho error
  const quads=[];
  for(let i=0;i<M;i++)for(let j=0;j<M;j++){ const q=[V(i,j),V(i+1,j),V(i+1,j+1),V(i,j+1)];
    const t=(T[i][j][0]+T[i+1][j][0]+T[i+1][j+1][0]+T[i][j+1][0])/4/Lmax;
    quads.push({q,d:q.reduce((s,p)=>s+depth(p),0),t}); }
  quads.sort((p,q)=>p.d-q.d).forEach(o=>{ h+=`<polygon points="${o.q.map(p=>proj(p).slice(0,2).join(',')).join(' ')}" fill="hsl(${Math.round(125*(1-Math.sqrt(o.t)))},70%,${42+8*(1-o.t)}%)" fill-opacity=".88" stroke="#0f172a" stroke-opacity=".35" stroke-width=".6"/>`; });
  // etiquetas de ejes
  h+=txt(proj([1.05,-1,-1]),`w₁ (${f(a0-R,1)} → ${f(a0+R,1)})`,'#60a5fa',12)+txt(proj([-1,-1,1.08]),`w₃ (${f(k0-R,1)} → ${f(k0+R,1)})`,'#fbbf24',12)+txt(proj([-1,1.1,-1]),`L (pico = ${f(Lmax,1)})`,'#fca5a5',12);
  // mínimo de la superficie
  const Pm=V(im,jm), pm=proj(Pm), pf=proj([Pm[0],-1,Pm[2]]), mn=T[im][jm];
  h+=line(pm,pf,'#fde047',2,'stroke-dasharray="4 4"')+`<circle cx="${pm[0]}" cy="${pm[1]}" r="10" fill="#fde047" stroke="#0f172a" stroke-width="3"/>`+txt([pm[0],pm[1]-18],`★ MÍNIMO  L = ${f(mn[0],4)}  ·  (ŷ−y) ≈ ${f(mn[1],3)}`,'#fde047',13,'middle');
  // punto actual y camino hacia el mínimo
  const Pc=V(M/2,M/2), pc=proj(Pc);
  if(im!==M/2||jm!==M/2) h+=line(pc,pm,'#fff',2,'stroke-dasharray="6 5"');
  h+=`<circle cx="${pc[0]}" cy="${pc[1]}" r="9" fill="#8b5cf6" stroke="#fff" stroke-width="3"/>`+txt([pc[0]+12,pc[1]-10],`w actual  L = ${f(T[M/2][M/2][0],4)}`,'#fff',12);
  svg.innerHTML=h;
  const cur=T[M/2][M/2];
  $('leg3d').innerHTML=`<div style="line-height:1.65"><b style="color:#fde047">★ ¿Qué es el mínimo?</b><br>Es el punto más bajo de la superficie: la combinación de pesos donde la pérdida L es la menor posible. Ahí la predicción coincide con la realidad: <b style="color:#86efac">ŷ ≈ y, o sea (ŷ − y) ≈ 0.000</b>. En este corte vale <b>${f(mn[1],3)}</b> (error medio) con L = ${f(mn[0],4)}. Hoy estás en L = ${f(cur[0],4)}, con error medio ${f(cur[1],3)}.</div>
  <div style="line-height:1.65"><b style="color:#f87171">¿Por qué es importante?</b><br>• Como ∂L/∂wᵢ = (ŷ − y)·xᵢ, cuando (ŷ − y) = 0 el gradiente es 0 y wᵢ nuevo = wᵢ: <b>el aprendizaje se detiene porque ya no hay nada que corregir</b>.<br>• Es el objetivo del entrenamiento: pesos que predicen bien si la persona concluirá o no la tarea.<br>• Lejos del mínimo (zona roja) el error es grande y los pesos se equivocan.<br><span style="color:#94a3b8">Nota: w₂ y b están fijos; la superficie completa tiene 4 parámetros. Con datos separables L sigue acercándose a 0 al crecer los pesos, así que el «mejor» punto es el más bajo de esta ventana.</span></div>`;
}
// Arrastrar para girar
(()=>{ const s=$('g3d'); let drag=null;
  s.addEventListener('pointerdown',e=>{drag=[e.clientX,e.clientY]; s.setPointerCapture(e.pointerId);});
  s.addEventListener('pointermove',e=>{ if(!drag) return; yaw+=(e.clientX-drag[0])*0.01; pitch=Math.max(-1.4,Math.min(1.4,pitch+(e.clientY-drag[1])*0.01)); drag=[e.clientX,e.clientY]; draw3D(lastC); });
  s.addEventListener('pointerup',()=>drag=null);
})();
