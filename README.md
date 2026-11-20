# Neurona logística: aprendizaje paso a paso

Simulador interactivo de una **neurona logística con 3 entradas** que predice si una persona **concluirá una tarea**. Muestra, con los números en vivo, cada fase del entrenamiento: propagación hacia adelante, activación sigmoide, cálculo del error, retropropagación y actualización de pesos por **descenso por gradiente**.

**Demo en línea:** https://program040.github.io/neurona-logistica/

## Qué permite hacer

- Ajustar las tres entradas (de 0 a 9), la etiqueta real `y`, la tasa de aprendizaje `η` y el sesgo `b`.
- Ejecutar un paso de *forward*, una retropropagación animada, o entrenar 1, 10, 100 *epochs* o de forma continua.
- Ver las fórmulas de cada fase reemplazadas con los valores actuales (z, ŷ, L, gradientes y pesos nuevos).
- Seguir la pérdida en una gráfica y el recorrido de los pesos en un **espacio 3D** (w₁, w₂, w₃) que se puede girar arrastrando.
- Ver una **superficie de pérdida** 3D con su mínimo señalado.
- Entrenar con el dataset completo (80 casos) o solo con el ejemplo actual.

## El modelo

Para una entrada $x = (x_1, x_2, x_3)$ con pesos $w = (w_1, w_2, w_3)$ y sesgo $b$:

1. **Propagación hacia adelante:** $z = w_1 x_1 + w_2 x_2 + w_3 x_3 + b$
2. **Activación sigmoide:** $\hat{y} = \sigma(z) = \dfrac{1}{1 + e^{-z}}$, interpretada como la probabilidad de concluir la tarea.
3. **Error (entropía cruzada binaria):** $L = -\left[\, y \ln \hat{y} + (1 - y)\ln(1 - \hat{y}) \,\right]$
4. **Retropropagación:** $\dfrac{\partial L}{\partial w_i} = (\hat{y} - y)\, x_i \qquad \dfrac{\partial L}{\partial b} = \hat{y} - y$
5. **Actualización:** $w_i \leftarrow w_i - \eta \dfrac{\partial L}{\partial w_i} \qquad b \leftarrow b - \eta \dfrac{\partial L}{\partial b}$

Con el modo «Dataset completo», el gradiente que se usa es el **promedio sobre los 80 casos** (descenso por gradiente por lotes completos). Con «Solo el ejemplo actual», se usa el gradiente de ese único ejemplo.

## Dataset

El dataset es **sintético**: se genera en el propio código (`js/math.js`) combinando todos los valores de tres listas, 5 × 4 × 4 = 80 casos:

- Puntaje del cuestionario `x₁`: 1, 3, 5, 7, 9
- Horas de sueño `x₂`: 2, 4, 6, 8
- Actividad social `x₃`: 1, 4, 7, 9

La etiqueta se asigna con una regla fija: concluye (`y = 1`) si `0.6·x₁ + 0.4·x₂ − 0.3·x₃ > 4.2`. Es decir, el puntaje y el sueño ayudan, y la actividad social excesiva perjudica. No son datos reales de personas.

## Notas sobre el comportamiento

- Los pesos iniciales (3, 5, 6) son todos positivos, así que al inicio la neurona queda **saturada** (σ(z) ≈ 1 para casi cualquier entrada). La página lo avisa; entrenando con el dataset completo la red aprende que un puntaje bajo o mucha actividad social reducen la probabilidad.
- Un «epoch» en este simulador equivale a **una actualización** de pesos (con el dataset completo o con el ejemplo actual, según el modo).
- La superficie de pérdida 3D es un **corte** de la función de pérdida, que en realidad depende de cuatro parámetros: varía w₁ y w₃, y deja fijos w₂ y b en su valor actual.
- Como los datos son separables, la pérdida sigue acercándose a 0 al crecer los pesos; por eso el «mínimo» que se marca es el punto más bajo dentro de la ventana mostrada.

## Estructura del proyecto

```
neurona-logistica/
├── index.html           # estructura de la página
├── css/
│   └── styles.css       # estilos
├── js/
│   ├── utils.js         # utilidades: acceso al DOM y formato de números
│   ├── math.js          # estado, sigmoide, pérdida, gradientes y dataset
│   ├── network-view.js  # diagrama SVG de la neurona
│   ├── phases.js        # fórmulas de cada fase con valores en vivo
│   ├── view3d.js        # espacio de pesos y superficie de pérdida en 3D
│   └── app.js           # render, acciones, eventos, gráfica e inicio
└── README.md
```

Los scripts son archivos normales (no módulos ES) y se cargan en el orden en que aparecen en `index.html`; cada uno usa lo definido en los anteriores. El modelo matemático vive en `js/math.js`, sin código de interfaz.

## Cómo ejecutarlo en tu computador

No necesita instalación ni servidor: descarga el repositorio y abre `index.html` en el navegador. Requiere conexión a internet solo para cargar Chart.js desde su CDN; sin ella, todo funciona excepto la gráfica de pérdida.

## Tecnologías

HTML, CSS y JavaScript sin frameworks. Gráfica de pérdida con [Chart.js](https://www.chartjs.org/) 4.4.1. Los gráficos de la red y del espacio 3D están dibujados directamente en SVG con una proyección ortográfica propia.

## Autor

[Program040](https://github.com/Program040)
