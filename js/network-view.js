/* ============ DIAGRAMA SVG ============ */
const IN_Y=[70,165,260], NEU={x:390,y:165}, OUT=[{x:690,y:90},{x:690,y:240}];
function buildNodes(){
  const names=['x₁ Cuestionario','x₂ Sueño','x₃ Social'];
  let h='';
  IN_Y.forEach((y,i)=>{ h+=`<circle cx="70" cy="${y}" r="30" fill="#3b82f6" stroke="#93c5fd" stroke-width="3"/>
   <text x="70" y="${y+5}" text-anchor="middle" fill="#fff" font-weight="700" font-size="15" id="nx${i}"></text>
   <text x="70" y="${y-38}" text-anchor="middle" fill="#93c5fd" font-size="12">${names[i]}</text>`;});
  h+=`<circle cx="${NEU.x}" cy="${NEU.y}" r="55" fill="#8b5cf6" stroke="#c4b5fd" stroke-width="4"/>
   <text x="${NEU.x}" y="${NEU.y-8}" text-anchor="middle" fill="#fff" font-weight="700">Σ  →  σ</text>
   <text x="${NEU.x}" y="${NEU.y+14}" text-anchor="middle" fill="#ede9fe" font-size="12" id="nz"></text>
   <text x="${NEU.x}" y="${NEU.y+80}" text-anchor="middle" fill="#c4b5fd" font-size="12" id="nb"></text>`;
  OUT.forEach((o,i)=>{ h+=`<circle cx="${o.x}" cy="${o.y}" r="38" fill="${i?'#fecaca':'#bbf7d0'}" stroke="#fff" stroke-width="3"/>
   <text x="${o.x}" y="${o.y+5}" text-anchor="middle" fill="#0f172a" font-weight="800" font-size="14" id="no${i}"></text>
   <text x="${o.x}" y="${o.y-46}" text-anchor="middle" fill="${i?'#fca5a5':'#86efac'}" font-size="12">${i?'No concluirá':'Concluirá'}</text>`;});
  $('nodes').innerHTML=h;
}
function drawConnections(c){
  let h='';
  IN_Y.forEach((y,i)=>{
    const w=state.w[i], col=w>=0?'#38bdf8':'#fb923c', sw=Math.min(1.5+Math.abs(w)*1.3,16);
    const mx=(100+NEU.x-55)/2+10, my=(y+NEU.y)/2+(i===1?-14:0);
    h+=`<line class="conn flow" x1="100" y1="${y}" x2="${NEU.x-58}" y2="${NEU.y+(i-1)*22}" stroke="${col}" stroke-width="${sw}" marker-end="url(#ar)"/>
     <rect x="${mx-34}" y="${my-24}" width="68" height="20" rx="6" fill="#0f172a" opacity=".9"/>
     <text class="wl" x="${mx}" y="${my-9}" text-anchor="middle">w${sub[i]}=${f(w,2)}</text>`;
    if(state.last){ h+=`<text class="dl" x="${mx}" y="${my+8}" text-anchor="middle">Δw=${f(state.last.dw[i],3)}</text>
     <text class="dl" x="${mx}" y="${my+21}" text-anchor="middle">${f(state.last.old[i],2)}→${f(state.last.nw[i],2)}</text>`; }
  });
  OUT.forEach((o,i)=>{ const v=i?1-c.yh:c.yh;
    h+=`<line class="conn flow" x1="${NEU.x+58}" y1="${NEU.y}" x2="${o.x-42}" y2="${o.y}" stroke="${i?'#f87171':'#4ade80'}" stroke-width="${2+v*8}" marker-end="url(#ar)"/>`;});
  $('conns').innerHTML=h;
}
function buildNodesValues(c){
  [0,1,2].forEach(i=>$('nx'+i).textContent=state.x[i]);
  $('nz').textContent='z='+f(c.z,2); $('nb').textContent='b='+f(state.b,2);
  $('no0').textContent=(c.yh*100).toFixed(0)+'%'; $('no1').textContent=((1-c.yh)*100).toFixed(0)+'%';
}
