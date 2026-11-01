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
       - cp -a dist/. ~/public_html/   (actualiza el dist)
   - `cp -r dist/*` NO copia `.htaccess` (los comodines no incluyen archivos que
     empiezan con punto): usar `cp -a dist/. ~/public_html/`. Ese `.htaccess`
     (vive en `public/`) es obligatorio: sin él, rutas como `/admin` o
     `/producto/<id>` recargan a un 503/404 del hosting y parece que la sesión
     se cerró sola.
   - El build de producción necesita `VITE_API_URL=https://api.apolovibes3d.cl`.
     Ya está en `.env.production`, que Vite lee solo en `npm run build`. Si falta,
     el build aborta con un error explícito (guardia en `vite.config.js`):
     sin esa URL las imágenes de producto y el refresh de sesión se piden al
     dominio del hosting estático, donde no hay API.
