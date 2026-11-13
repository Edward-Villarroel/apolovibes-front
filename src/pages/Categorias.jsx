import { useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard.jsx'
import { useProductos } from '../context/ProductContext.jsx'
import { mediaPath } from '../utils/media.js'

const CATEGORIAS_UI = [
  { slug: 'videojuegos-y-cine', img: 'cat-videojuegos.webp', desc: 'Tus personajes favoritos' },
  { slug: 'articulados',        img: 'cat-articulados.webp', desc: 'Arma, exhibe y disfruta' },
  { slug: 'llaveros',           img: 'cat-llaveros.webp',    desc: 'Llévalos siempre contigo' },
  { slug: 'animales',           img: 'cat-animales.webp',    desc: 'Tus animales favoritos' },
  { slug: 'accesorios',         img: 'cat-accesorios.webp',  desc: 'Detalles que hacen la diferencia' },
  { slug: 'disenos-a-medida',   img: 'cat-medida.webp',      desc: 'Convierte tu idea en una creación 3D', ancha: true },
]

const slugify = (texto) =>
  texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

function TarjetaCategoria({ img, desc, titulo, activa, ancha, onClick, deshabilitada }) {
  return (
    <button
      type="button"
      className={`cat-card${activa ? ' activa' : ''}${ancha ? ' ancha' : ''}`}
      onClick={onClick}
      disabled={deshabilitada}
      aria-pressed={activa}
    >
      <img src={mediaPath(img)} alt="" width="64" height="64" decoding="async" />
      <span className="cat-txt">
        {titulo ? <strong>{titulo}</strong> : <strong className="cat-skel" />}
        <small>{desc}</small>
      </span>
      <span className="cat-go">›</span>
    </button>
  )
}

export default function Categorias() {
  const { productos, categorias, cargando, error } = useProductos()
  const [params, setParams] = useSearchParams()
  const productosRef = useRef(null)

  const slugActivo = params.get('cat')
  const catActiva = categorias.find(
    (c) => slugify(c.nombre) === slugActivo || c.id === slugActivo
  )
  const activa = catActiva ? catActiva.id : null

  const seleccionar = (cat) => {
    if (cat) setParams({ cat: slugify(cat.nombre) })
    else setParams({})
    requestAnimationFrame(() =>
      productosRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    )
  }

  const filtrados = activa ? productos.filter((p) => p.categoria_id === activa) : productos

  return (
    <section className="wrap section-py-mobile" style={{ paddingTop: '48px', paddingBottom: '80px' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30, marginBottom: 24, textAlign: 'center', color: 'var(--text-on-bg)' }}>
        Catálogo
      </h1>

      <div className="cat-grid">
        <TarjetaCategoria
          img="cat-todas.webp"
          titulo="Todas"
          desc="Ver todos los productos"
          activa={activa == null}
          onClick={() => seleccionar(null)}
        />
        {CATEGORIAS_UI.map((ui) => {
          const cat = categorias.find((c) => slugify(c.nombre) === ui.slug)
          if (!cat && !cargando) return null
          return (
            <TarjetaCategoria
              key={ui.slug}
              {...ui}
              titulo={cat?.nombre}
              activa={!!cat && activa === cat.id}
              deshabilitada={!cat}
              onClick={() => seleccionar(cat)}
            />
          )
        })}
      </div>

      <div ref={productosRef} style={{ scrollMarginTop: 80 }} />

      {cargando ? (
        <p style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '4px 0' }}>
          Cargando productos…
        </p>
      ) : error ? (
        <p style={{ textAlign: 'center', color: '#ef4444', padding: '4px 0' }}>
          Error al cargar productos: {error}
        </p>
      ) : filtrados.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <img
            src={mediaPath('sinproductos.webp')}
            alt="Logo"
            loading="lazy"
            decoding="async"
            width="512"
            height="512"
            style={{ display: 'block', height: 100, width: 'auto', margin: '0 auto' }}
          />
          <p style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '15px 0' }}>
            No hay productos en esta categoría todavía.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}>
          {filtrados.map((p, i) => (
            <ProductCard key={p.id} producto={p} index={i} />
          ))}
        </div>
      )}
    </section>
  )
}