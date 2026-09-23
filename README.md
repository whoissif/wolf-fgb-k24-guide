# Guía formativa WOLF FGB-K-24

Sitio estático en español para estudiar la puesta en marcha, los parámetros HG y el menú de regulación de la caldera mixta WOLF FGB-K-24. El contenido está asociado al manual del instalador WOLF, edición ES 3066484_202209.

## Contenido

- Lista de puesta en marcha en ocho etapas, con casillas y notas guardadas localmente en el navegador.
- Tabla interactiva de parámetros HG con búsqueda, filtro por combustible, valores de fábrica de 24 kW, unidades, límites, explicaciones y condiciones de visualización.
- Valores de CO₂/O₂ y presión de conexión presentados por combustible, estado de medida y categoría del aparato.
- Navegación del menú técnico, curva H54 y diagramas funcionales propios en SVG.
- Diseño adaptable, impresión y despliegue automático en GitHub Pages.

No necesita Node, compilación, servidor ni dependencias externas. El JavaScript, los estilos y los SVG están en este repositorio.

## Vista previa local

Abre `index.html` directamente en un navegador. La foto de producto se sirve desde el CDN oficial de WOLF y necesita conexión a Internet; el resto del sitio funciona sin conexión.

## Publicar en GitHub Pages

1. Crea un repositorio GitHub vacío y copia en su raíz el contenido de esta carpeta, incluida `.github/workflows/pages.yml`.
2. Usa `main` como rama predeterminada (el flujo de despliegue escucha `main`).
3. En **Settings → Pages**, selecciona **GitHub Actions** como fuente de publicación.
4. Sube los cambios a `main`. La acción **Deploy static site to GitHub Pages** publicará el sitio; el enlace aparece en el resumen del job y en el entorno `github-pages`.

También puedes ejecutar el flujo desde **Actions → Deploy static site to GitHub Pages → Run workflow**.

No he subido el proyecto a GitHub: este paquete queda preparado para que lo incorpores al repositorio que elijas.

## Estructura

```text
index.html                 Interfaz y secciones
styles.css                 Diseño adaptable e impresión
src/app.js                 Navegación, filtros y estado de la lista
src/data.js                Pasos y datos HG con referencias de página
assets/*.svg               Diagramas explicativos originales
.github/workflows/pages.yml Despliegue automático a Pages
ATTRIBUTION.md             Fuentes y alcance
```

## Límites de uso

Este material es una ayuda docente. No sustituye el manual íntegro, la normativa local, la formación, los instrumentos calibrados ni la aprobación de un instalador autorizado. Los trabajos en gas, electricidad, conversión de combustible y análisis/ajuste de combustión son para personal cualificado. Los valores de fábrica y rangos pueden depender de firmware, país, tipo de gas y variante de equipo; confirmar siempre placa y documentación aplicable antes de actuar.

No se incluye un archivo de licencia. Añade una licencia al repositorio si quieres permitir usos o redistribución concretos.
