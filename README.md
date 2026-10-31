# Forma3D — Frontend (React)

Estructura base de la tienda de impresión 3D en React + Vite + React Router.

## Instalación

```bash
npm install
npm run dev
```

## Estructura

```
src/
  components/       Navbar, Footer, HeroVideo, ProductCard
  pages/            Home, Categorias, ProductoDetalle, Carrito,
                     Checkout, PagoRetorno, Cotizacion
  pages/admin/       AdminLayout, Dashboard, Pedidos, Productos,
                     Inventario, Cotizaciones
  context/          CartContext (estado global del carrito)
  services/         api.js (cliente HTTP), payment.js (TUU)
  data/             products.js (datos mock, mientras no hay backend)
  styles/           global.css (tokens de diseño: color, tipografía)
```

## Rutas

| Ruta | Página |
|---|---|
| `/` | Home con video hero |
| `/categorias` | Catálogo filtrable |
| `/producto/:id` | Detalle de producto |
| `/carrito` | Carrito de compras |
| `/checkout` | Datos de envío + pago |
| `/pago/retorno` | Confirmación tras TUU |
| `/cotizar` | Formulario de cotización con imagen |
| `/admin` | Dashboard |
| `/admin/pedidos` | Pedidos |
| `/admin/productos` | Productos |
| `/admin/inventario` | Inventario |
| `/admin/cotizaciones` | Revisión de cotizaciones |


     y su equipo puedan entrar.

4. **Video del Home**
   - Colocar los archivos en `public/media/`:
     `hero-print-timelapse.mp4`, `hero-print-timelapse.webm` y
     `hero-poster.jpg` (imagen de respaldo mientras carga).

5. **Subir Cambios al front de produccion**
   - en la terminal de v2network (usando cpanel):
       - git pull
       - rm -rf dist (para eliminar el dist anterior)
       - npm run build
       - cp -r dist/* ~/public_html (actualiza el dist)
