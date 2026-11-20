import { useRef, useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import ProductCard from '../components/ProductCard.jsx'
import { useProductos } from '../context/ProductContext.jsx'
import { mediaPath } from '../utils/media.js'

const FILAS_POR_PAGINA = 5

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
    .replace(/[̀-ͯ]/g, '')
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
  const gridRef = useRef(null)

  const [pagina, setPagina] = useState(1)
  const [columnas, setColumnas] = useState(4)

  const slugActivo = params.get('cat')
  const catActiva = categorias.find(
    (c) => slugify(c.nombre) === slugActivo || c.id === slugActivo
  )
  const activa = catActiva ? catActiva.id : null

  const filtrados = activa ? productos.filter((p) => p.categoria_id === activa) : productos

  const hayGrid = !cargando && !error && filtrados.length > 0

  useEffect(() => {
    const el = gridRef.current
    if (!el) return undefined
    const medir = () => {
      const n = getComputedStyle(el).gridTemplateColumns.split(' ').filter(Boolean).length
      if (n > 0) setColumnas(n)
    }
    medir()
    const ro = new ResizeObserver(medir)
    ro.observe(el)
    return () => ro.disconnect()
  }, [hayGrid])

  const productosPorPagina = columnas * FILAS_POR_PAGINA
  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / productosPorPagina))

  useEffect(() => {
    setPagina(1)
  }, [activa])

  useEffect(() => {
    if (pagina > totalPaginas) setPagina(totalPaginas)
  }, [pagina, totalPaginas])

  const productosPagina = useMemo(() => {
    const inicio = (pagina - 1) * productosPorPagina
    return filtrados.slice(inicio, inicio + productosPorPagina)
  }, [pagina, productosPorPagina, filtrados])

  const seleccionar = (cat) => {
    if (cat) setParams({ cat: slugify(cat.nombre) })
    else setParams({})
    setPagina(1)

    const esMovil = window.matchMedia('(max-width: 768px)').matches
    requestAnimationFrame(() => {
      if (esMovil) {
        productosRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    })
  }

  const cambiarPagina = (nueva) => {
    setPagina(nueva)
    requestAnimationFrame(() => {
      productosRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

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

      <div ref={productosRef} style={{ scrollMarginTop: 120 }} />

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
        <>
          <div
            ref={gridRef}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}
          >
            {productosPagina.map((p, i) => (
              <ProductCard key={p.id} producto={p} index={i} />
            ))}
          </div>

          {totalPaginas > 1 && (
            <div
              style={{
                position: 'sticky', bottom: 0, zIndex: 10,
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: 8, padding: '20px 16px 12px', marginTop: 24,
                background: 'var(--bg)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-dim)' }}>
                <button
                  onClick={() => cambiarPagina(Math.max(1, pagina - 1))}
                  disabled={pagina === 1}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: 30, height: 30, borderRadius: 8, border: '1px solid var(--surface-3)',
                    background: 'transparent', color: 'var(--text-dim)',
                    cursor: pagina === 1 ? 'not-allowed' : 'pointer',
                    opacity: pagina === 1 ? 0.4 : 1,
                  }}
                  aria-label="Página anterior"
                >
                  <ChevronLeft size={15} />
                </button>

                <span style={{ padding: '0 8px', fontFamily: 'var(--font-mono)' }}>
                  {pagina} / {totalPaginas}
                </span>

                <button
                  onClick={() => cambiarPagina(Math.min(totalPaginas, pagina + 1))}
                  disabled={pagina === totalPaginas}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: 30, height: 30, borderRadius: 8, border: '1px solid var(--surface-3)',
                    background: 'transparent', color: 'var(--text-dim)',
                    cursor: pagina === totalPaginas ? 'not-allowed' : 'pointer',
                    opacity: pagina === totalPaginas ? 0.4 : 1,
                  }}
                  aria-label="Página siguiente"
                >
                  <ChevronRight size={15} />
                </button>
              </div>

              <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>
                Mostrando {(pagina - 1) * productosPorPagina + 1}
                –{Math.min(pagina * productosPorPagina, filtrados.length)} de {filtrados.length}
              </span>
            </div>
          )}
        </>
      )}
    </section>
  )
}