import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { CreditCard, FileText, Package, ChevronRight } from 'lucide-react'
import { productoApi } from '../../services/products.js'
import { reportesApi } from '../../services/reportes.js'

const RUTAS = {
  pedidos: '/admin/pedidos',
  cotizaciones: '/admin/cotizaciones',
};

function capitalizar(texto) {
  return texto ? texto.charAt(0).toUpperCase() + texto.slice(1) : '';
}

function formatoPesos(valor) {
  return `$${Number(valor || 0).toLocaleString('es-CL')}`;
}

function formatoDiaMes(iso) {
  const partes = String(iso || '').slice(0, 10).split('-');
  if (partes.length !== 3) return '';
  const [anio, mes, dia] = partes;
  if (!anio || !mes || !dia) return '';
  return `${dia}/${mes}`;
}

function aFecha(valor) {
  if (!valor) return null;
  const s = String(valor);
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const [y, m, d] = s.split('-').map(Number);
    return new Date(y, m - 1, d);
  }
  const f = new Date(s);
  return Number.isNaN(f.getTime()) ? null : f;
}

const DIAS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

function etiquetaDia(f) {
  return `${capitalizar(DIAS[f.getDay()])} ${f.getDate()} ${MESES[f.getMonth()]}`;
}

function claveDia(f) {
  return `${f.getFullYear()}-${f.getMonth()}-${f.getDate()}`;
}

function nombrePropio(texto) {
  const t = String(texto || '').replace(/\s+\.\s+/g, ' ').trim();
  if (!t) return '';
  if (t !== t.toLowerCase() && t !== t.toUpperCase()) return t;
  return t.toLowerCase().replace(/(^|\s)(\S)/g, (_, sp, c) => sp + c.toUpperCase());
}

const ETIQUETAS_ESTADO = {
  pendiente: 'Pendiente',
  en_produccion: 'En preparación',
  enviado: 'Enviado',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
};

const CLASE_ESTADO = {
  pendiente: 'pend',
  en_produccion: 'prod',
  enviado: 'env',
  entregado: 'ok',
  cancelado: 'err',
};

// ---------- gráfico de ventas (SVG puro, tamaño 1:1 con el contenedor) ----------

function escalaNice(max) {
  if (max <= 0) return 1;
  const exp = Math.pow(10, Math.floor(Math.log10(max)));
  const f = max / exp;
  const nice = f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10;
  return nice * exp;
}

function etiquetaEje(v) {
  if (v === 0) return '0';
  if (v >= 1000) return `${(v / 1000).toLocaleString('es-CL', { maximumFractionDigits: 1 })} k`;
  return String(v);
}

// Mide el ancho real (px) del elemento y se actualiza al redimensionar.
function useAncho(ref) {
  const [ancho, setAncho] = useState(0);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    const medir = () => setAncho(Math.floor(el.getBoundingClientRect().width));
    medir();

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', medir);
      return () => window.removeEventListener('resize', medir);
    }

    const ro = new ResizeObserver(entries => {
      const w = entries[0]?.contentRect?.width;
      if (w) setAncho(Math.floor(w));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);

  return ancho;
}

function GraficoVentas({ data }) {
  const ref = useRef(null);
  const ancho = useAncho(ref);

  // 1 unidad del viewBox = 1 px real, así el texto siempre mide lo mismo.
  const W = Math.max(ancho, 200);
  const H = Math.round(Math.min(Math.max(W * 0.3, 168), 240));
  const xIni = 52, xFin = W - 32;
  const yTop = 22, yBase = H - 38;

  const max = Math.max(...data.map(d => d.valor), 0);
  const techo = escalaNice(max);
  const n = data.length;
  const stepX = n > 1 ? (xFin - xIni) / (n - 1) : 0;

  const puntos = data.map((d, i) => ({
    ...d,
    x: n > 1 ? xIni + i * stepX : (xIni + xFin) / 2,
    y: yBase - (d.valor / techo) * (yBase - yTop),
  }));

  const idxPico = max > 0 ? data.findIndex(d => d.valor === max) : -1;
  const pico = idxPico >= 0 ? puntos[idxPico] : null;

  const linea = puntos.map(p => `${p.x},${p.y}`).join(' ');
  const area = `${puntos[0].x},${yBase} ${linea} ${puntos[n - 1].x},${yBase}`;
  const ticks = [0, techo / 2, techo];

  const pillAncho = 72;
  const pillX = pico ? Math.min(Math.max(pico.x - pillAncho / 2, 2), W - pillAncho - 2) : 0;
  const pillY = pico ? Math.max(pico.y - 26, 1) : 0;

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%', height: H }}>
      {ancho > 0 && (
        <svg
          className="db-chart"
          viewBox={`0 0 ${W} ${H}`}
          width={W}
          height={H}
          style={{ position: 'absolute', left: 0, top: 0, width: W, height: H }}
          role="img"
          aria-label={`Ventas por semana. ${n} semanas, máximo ${formatoPesos(max)}.`}
        >
          <defs>
            <linearGradient id="dbVentasFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.28" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {ticks.map((t, i) => {
            const y = yBase - (t / techo) * (yBase - yTop);
            return (
              <g key={i}>
                <line className="db-chart__grid" x1="40" y1={y} x2={W - 6} y2={y} />
                <text className="db-chart__eje" x="32" y={y + 4} textAnchor="end">{etiquetaEje(t)}</text>
              </g>
            );
          })}

          <polygon points={area} fill="url(#dbVentasFill)" />
          <polyline points={linea} fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {puntos.map((p, i) => (
            i === idxPico ? null : (
              <circle key={i} className="db-chart__punto" cx={p.x} cy={p.y} r="4" />
            )
          ))}

          {pico && (
            <>
              <circle className="db-chart__pico" cx={pico.x} cy={pico.y} r="6" />
              <rect className="db-chart__pill" x={pillX} y={pillY} width={pillAncho} height="20" rx="10" />
              <text className="db-chart__pill-txt" x={pillX + pillAncho / 2} y={pillY + 14} textAnchor="middle">
                {formatoPesos(pico.valor)}
              </text>
            </>
          )}

          {puntos.map((p, i) => (
            <text
              key={i}
              className={`db-chart__eje db-chart__fecha${i === idxPico ? ' pico' : ''}`}
              x={p.x}
              y={H - 15}
              textAnchor="middle"
            >
              {p.label}
            </text>
          ))}
        </svg>
      )}
    </div>
  );
}

function VentasChart({ data }) {
  if (!data || data.length === 0) {
    return <p className="db-vacio">Sin datos de ventas todavía.</p>;
  }
  return <GraficoVentas data={data} />;
}

// ---------- panel base ----------

function Panel({ title, sub, to, children }) {
  return (
    <section className="db-card">
      <div className="db-card__head">
        <div>
          <h2 className="db-card__title">{title}</h2>
          {sub && <div className="db-card__sub">{sub}</div>}
        </div>
        {to && (
          <Link to={to} className="db-more">
            Ver todo <ChevronRight size={14} aria-hidden="true" />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

export default function Dashboard() {
  const [topProductos, setTopProductos] = useState([]);
  const [errorTopProductos, setErrorTopProductos] = useState(null);

  const [reporte, setReporte] = useState(null);
  const [cargandoReporte, setCargandoReporte] = useState(true);
  const [errorReporte, setErrorReporte] = useState(null);

  useEffect(() => {
    let vigente = true;
    productoApi.masVendidos('todo', 5)
      .then(res => {
        if (!vigente) return;
        setTopProductos(res.productos ?? []);
      })
      .catch(err => {
        if (!vigente) return;
        setErrorTopProductos(err.message);
      });
    return () => { vigente = false; };
  }, []);

  useEffect(() => {
    let vigente = true;
    (async () => {
      try {
        const res = await reportesApi.resumen();
        if (!vigente) return;
        setReporte(res.reporte || res || {});
      } catch (err) {
        if (!vigente) return;
        setErrorReporte(err.message);
      } finally {
        if (vigente) setCargandoReporte(false);
      }
    })();
    return () => { vigente = false; };
  }, []);

  const ventas = reporte?.ventas || {};
  const pedidos = reporte?.pedidos || {};
  const cotizaciones = reporte?.cotizaciones || {};

  const totalMes = formatoPesos(ventas.mes?.total ?? 0);
  const totalHoy = formatoPesos(ventas.hoy?.total ?? 0);
  const nPendientes = (pedidos.pendientes || []).length;
  const nSinRevisar = (cotizaciones.sin_revisar || []).length;

  const ventasSemana = (ventas.semanas || []).map(w => ({
    label: formatoDiaMes(w.desde),
    valor: Number(w.total) || 0,
  }));

  const pedidosRecientes = (pedidos.recientes || []).map(p => ({
    key: p.id,
    id: `#${String(p.id || '').slice(0, 8)}`,
    cliente: nombrePropio(p.cliente) || '—',
    monto: formatoPesos(p.total),
    estado: p.estado,
    etiqueta: ETIQUETAS_ESTADO[p.estado] || p.estado,
  }));

  
  const eventos = [
    ...(pedidos.recientes || []).slice(0, 2).map(p => ({
      Icono: CreditCard,
      tipo: 'pago',
      cuerpo: <>Pago registrado en el pedido <b className="db-mono">#{String(p.id || '').slice(0, 8)}</b></>,
      fecha: aFecha(p.fecha),
    })),
    ...(cotizaciones.sin_revisar || []).slice(0, 2).map(c => ({
      Icono: FileText,
      tipo: 'cotizacion',
      cuerpo: <>Nueva cotización{c.nombre ? <> de <b>{nombrePropio(c.nombre)}</b></> : ''}</>,
      fecha: aFecha(c.creado_en),
    })),
  ].sort((a, b) => (b.fecha?.getTime() ?? -Infinity) - (a.fecha?.getTime() ?? -Infinity));

  const grupos = [];
  eventos.forEach(ev => {
    const clave = ev.fecha ? claveDia(ev.fecha) : 'sin-fecha';
    const ultimo = grupos[grupos.length - 1];
    if (ultimo && ultimo.clave === clave) ultimo.items.push(ev);
    else grupos.push({ clave, etiqueta: ev.fecha ? etiquetaDia(ev.fecha) : '', items: [ev] });
  });

  const maxIngresos = Math.max(...topProductos.map(p => Number(p.ingresos) || 0), 1);
  const fechaHoy = capitalizar(new Date().toLocaleDateString('es-CL', {
    weekday: 'long', day: 'numeric', month: 'long',
  }));

  return (
    <div className="db-root">
      <header className="db-head">
        <h1 className="admin-page-title" style={{ marginBottom: 0 }}>Dashboard</h1>
        <div className="db-fecha">{fechaHoy}</div>
      </header>

      {errorReporte && (
        <p className="db-error" role="alert">No se pudo cargar el reporte de ventas: {errorReporte}</p>
      )}

      {/* Resumen: ingresos + pendientes */}
      <div className="db-top">
        {cargandoReporte ? (
          <p className="db-cargando" style={{ gridColumn: '1 / -1' }}>Cargando…</p>
        ) : (
          <>
            <section className="db-hero">
              <div>
                <div className="db-hero__label">Ingresos del mes</div>
                <div className="db-hero__valor">{totalMes}</div>
              </div>
              <div className="db-hero__hoy">
                <span>Ventas hoy</span>
                <strong>{totalHoy}</strong>
              </div>
            </section>

            <Link to={RUTAS.pedidos} className="db-act">
              <div className="db-act__top">
                <span className="db-ic"><Package size={20} aria-hidden="true" /></span>
                <ChevronRight size={18} className="db-act__chev" aria-hidden="true" />
              </div>
              <div className="db-act__num">{nPendientes}</div>
              <div className="db-act__lab">Pedidos pendientes</div>
            </Link>

            <Link to={RUTAS.cotizaciones} className="db-act">
              <div className="db-act__top">
                <span className="db-ic azul"><FileText size={20} aria-hidden="true" /></span>
                <ChevronRight size={18} className="db-act__chev" aria-hidden="true" />
              </div>
              <div className="db-act__num">{nSinRevisar}</div>
              <div className="db-act__lab">Cotizaciones sin revisar</div>
            </Link>
          </>
        )}
      </div>

      {/* Ventas + productos */}
      <div className="db-row">
        <Panel title="Ventas por semana" sub={ventasSemana.length ? `Últimas ${ventasSemana.length} semanas` : undefined}>
          {cargandoReporte ? (
            <p className="db-cargando">Cargando…</p>
          ) : errorReporte ? (
            <p className="db-error">No se pudo cargar el resumen de ventas.</p>
          ) : (
            <VentasChart data={ventasSemana} />
          )}
        </Panel>

        <Panel title="Productos más vendidos" sub="Ingresos en CLP">
          {errorTopProductos ? (
            <p className="db-error">No se pudo cargar el ranking: {errorTopProductos}</p>
          ) : topProductos.length === 0 ? (
            <p className="db-vacio">Todavía no hay ventas registradas.</p>
          ) : (
            <ol className="db-rank">
              {topProductos.map((p, i) => {
                const ingresos = Number(p.ingresos) || 0;
                return (
                  <li key={p.id}>
                    <div className="db-rank__fila">
                      <span className="db-rank__n">{i + 1}</span>
                      <span className="db-rank__nombre">{p.nombre}</span>
                      <span className="db-mono">{formatoPesos(ingresos)}</span>
                    </div>
                    <div className="db-track" aria-hidden="true">
                      <div className="db-fill" style={{ width: `${(ingresos / maxIngresos) * 100}%` }} />
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </Panel>
      </div>

      {/* Pedidos + actividad */}
      <div className="db-row">
        <Panel title="Pedidos recientes" to={RUTAS.pedidos}>
          {cargandoReporte ? (
            <p className="db-cargando">Cargando…</p>
          ) : pedidosRecientes.length === 0 ? (
            <p className="db-vacio">Todavía no hay pedidos registrados.</p>
          ) : (
            <ul className="db-lista">
              {pedidosRecientes.map(p => (
                <li key={p.key} className="db-ord">
                  <div className="db-ord__info">
                    <div className="db-ord__cliente">{p.cliente}</div>
                    <div className="db-mono db-ord__id">{p.id}</div>
                  </div>
                  <div className="db-ord__der">
                    <span className="db-mono">{p.monto}</span>
                    <span className={`db-badge ${CLASE_ESTADO[p.estado] || ''}`}><i />{p.etiqueta}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Actividad reciente">
          {grupos.length === 0 ? (
            <p className="db-vacio">Sin actividad reciente.</p>
          ) : (
            grupos.map(g => (
              <div key={g.clave}>
                {g.etiqueta && <div className="db-dia">{g.etiqueta}</div>}
                {g.items.map((ev, i) => {
                  const Icono = ev.Icono;
                  return (
                    <div key={i} className="db-ev">
                      <span className={`db-ic${ev.tipo === 'cotizacion' ? ' azul' : ''}`}>
                        <Icono size={18} aria-hidden="true" />
                      </span>
                      <p>{ev.cuerpo}</p>
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </Panel>
      </div>
    </div>
  );
}