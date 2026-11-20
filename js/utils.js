/* ============ UTILIDADES ============
   Funciones auxiliares sin lógica del modelo: acceso al DOM y formato de números. */
const $ = id => document.getElementById(id);
const f = (n,d=3) => (Math.abs(n)>=1e5||(n!==0&&Math.abs(n)<1e-4)) ? n.toExponential(2) : n.toFixed(d);
const sub = ['₁','₂','₃'];
