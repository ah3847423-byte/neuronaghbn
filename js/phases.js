/* ============ FÓRMULAS (HTML) ============ */
const fr=(n,d)=>`<span class="fr"><span>${n}</span><span>${d}</span></span>`;
const S=t=>`<span class="sym">${t}</span>`, N=t=>`<span class="num">${t}</span>`, R=t=>`<span class="res">${t}</span>`;
function renderPhases(c){
  const {w,b,x,y,eta}=state, sg=n=>n<0?`(${f(n,2)})`:f(n,2);
  const ph=(col,title,text,eqs)=>`<div class="ph" style="--c:${col}"><h3>${title}</h3><p>${text}</p>${eqs.map(e=>`<div class="eq">${e}</div>`).join('')}</div>`;
  $('phases').innerHTML=
  ph('#60a5fa','1. Propagación hacia adelante','Se reciben x₁, x₂ y x₃; cada entrada se multiplica por su peso y se suma el sesgo para obtener z.',[
    `${S('z')} = ${S('w₁x₁ + w₂x₂ + w₃x₃ + b')}`,
    `${S('z')} = ${N(`${sg(w[0])}·${x[0]} + ${sg(w[1])}·${x[1]} + ${sg(w[2])}·${x[2]} + ${sg(b)}`)}`,
    `${S('z')} = ${N(`${f(w[0]*x[0],2)} + ${f(w[1]*x[1],2)} + ${f(w[2]*x[2],2)} + ${sg(b)}`)}`,
    `${S('z')} = ${R(f(c.z,3))}`])+
  ph('#a78bfa','2. Activación','La sigmoide convierte z en ŷ, un valor entre 0 y 1 que interpretamos como la probabilidad estimada de concluir la tarea.',[
    `${S('ŷ')} = ${S('σ(z)')} = ${fr(S('1'),S('1 + e<sup>−z</sup>'))}`,
    `${S('ŷ')} = ${fr(N('1'),N(`1 + e<sup>${f(-c.z,2)}</sup>`))}`,
    `${S('e<sup>−z</sup>')} = ${N(Math.exp(-c.z).toExponential(3))}`,
    `${S('ŷ')} = ${R(f(c.yh,4))} &nbsp;→ ${N(f(c.yh*100,1)+'%')}`])+
  ph('#fbbf24','3. Cálculo del error','Se compara ŷ con la etiqueta real y mediante la entropía cruzada binaria. Una predicción segura pero equivocada recibe una penalización alta.',[
    `${S('L')} = −[ ${S('y·ln ŷ')} + ${S('(1−y)·ln(1−ŷ)')} ]`,
    `${S('L')} = −[ ${N(`${y}·ln(${f(c.yh,4)}) + ${1-y}·ln(${f(1-c.yh,4)})`)} ]`,
    `${S('L')} = ${R(f(c.L,4))}`,
    ...(c.useData?[`${S('L̄')} = ${N('promedio de '+c.ds.n+' ejemplos')} = ${R(f(c.ds.L,4))}`]:[])])+
  ph('#f87171','4. Retropropagación','El término (ŷ − y) cuantifica el error local. Al multiplicarlo por cada entrada obtenemos el gradiente de su peso; para el sesgo, el gradiente es ŷ − y.',[
    `${fr(S('∂L'),S('∂wᵢ'))} = ${S('(ŷ − y)·xᵢ')} &nbsp;&nbsp; ${fr(S('∂L'),S('∂b'))} = ${S('ŷ − y')}`,
    ...[0,1,2].map(i=>`${fr(S('∂L'),S('∂w'+sub[i]))} = ${N(`(${f(c.yh,3)} − ${y})·${x[i]}`)} = ${R(f(c.gs[i],4))}`),
    `${fr(S('∂L'),S('∂b'))} = ${N(`${f(c.yh,3)} − ${y}`)} = ${R(f(c.e,4))}`,
    ...(c.useData?[`${S('Gradiente promedio del dataset')} = ${N(`∂w=(${c.g.map(v=>f(v,3)).join(', ')})  ∂b=${f(c.gb,3)}`)}`]:[])])+
  ph('#4ade80','5. Actualización','Cada parámetro se mueve en dirección opuesta a su gradiente, escalado por η. Así, el siguiente paso tiende a reducir la pérdida.',[
    `${S('wᵢ')} ← ${S('wᵢ − η·∂L/∂wᵢ')} &nbsp; ${S('b')} ← ${S('b − η·∂L/∂b')}`,
    ...[0,1,2].map(i=>`${S('w'+sub[i]+' nuevo')} = ${N(`${sg(w[i])} − ${eta}·${sg(c.g[i])}`)} = ${R(f(c.nw[i],4))}`),
    `${S('b nuevo')} = ${N(`${sg(b)} − ${eta}·${sg(c.gb)}`)} = ${R(f(c.nb,4))}`]);
}
