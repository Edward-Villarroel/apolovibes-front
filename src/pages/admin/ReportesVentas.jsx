import { useState, useEffect, useMemo } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { ventasApi } from '../../services/ventas.js';

function capitalizar(texto) {
  return texto ? texto.charAt(0).toUpperCase() + texto.slice(1) : '';
}

function formatearFecha(iso) {
  try {
    return capitalizar(new Date(iso).toLocaleDateString('es-CL', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    }));
  } catch {
    return '';
  }
}

function formatearHora(iso) {
  try {
    return new Date(iso).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

function totalVenta(venta) {
  const items = venta.items || [];
  if (items.length) return items.reduce((s, i) => s + Number(i.cantidad) * Number(i.precio_unitario), 0);
  return Number(venta.total) || 0;
}

function normalizarReporte(r) {
  const ventas = r.ventas || [];
  const suma = (medio) => ventas
    .filter(v => (v.medio_pago || '').toLowerCase() === medio)
    .reduce((s, v) => s + totalVenta(v), 0);
  return {
    ...r,
    n_ventas: r.n_ventas ?? ventas.length,
    total_efectivo: r.total_efectivo ?? suma('efectivo'),
    total_tuu: r.total_tuu ?? suma('tuu'),
    total: r.total ?? ventas.reduce((s, v) => s + totalVenta(v), 0),
  };
}

export default function ReporteVentas() {
  const [reportes, setReportes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState(null);
  const [detalle, setDetalle] = useState(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [pagina, setPagina] = useState(1);
  const [filasPorPagina, setFilasPorPagina] = useState(6);

  useEffect(() => {
    let activo = true;
    (async () => {
      try {
        const res = await ventasApi.listarReportes();
        if (activo) setReportes(res.reportes || []);
      } catch (err) {
        if (activo) setMensaje({ tipo: 'error', texto: err.message });
      } finally {
        if (activo) setCargando(false);
      }
    })();
    return () => { activo = false; };
  }, []);


  useEffect(() => {
    const calcularFilas = () => {
      const disponible = window.innerHeight - 340;
      const base = Math.floor(disponible / 60);
      const maximo = window.innerWidth < 768 ? 5 : 12;
      setFilasPorPagina(Math.max(3, Math.min(base, maximo)));
    };
    calcularFilas();
    window.addEventListener('resize', calcularFilas);
    return () => window.removeEventListener('resize', calcularFilas);
  }, []);

  const totalPaginas = Math.max(1, Math.ceil(reportes.length / filasPorPagina));

  useEffect(() => {
    if (pagina > totalPaginas) setPagina(totalPaginas);
  }, [totalPaginas, pagina]);

  const reportesPagina = useMemo(() => {
    const inicio = (pagina - 1) * filasPorPagina;
    return reportes.slice(inicio, inicio + filasPorPagina);
  }, [reportes, pagina, filasPorPagina]);

  async function abrirDetalle(reporte) {
    setCargandoDetalle(true);
    setMensaje(null);
    try {
      const res = await ventasApi.detalleReporte(reporte.id);
      setDetalle(normalizarReporte(res.reporte || res));
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.message });
    } finally {
      setCargandoDetalle(false);
    }
  }

  return (
    <>
      <div className="admin-page-header">
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--text-on-bg)' }}>Reporte de Ventas</h1>
      </div>

      {cargando ? (
        <p style={{ color: 'var(--text-on-bg)' }}>Cargando…</p>
      ) : (
        <>
          {mensaje && (
            <p style={{ color: mensaje.tipo === 'ok' ? 'var(--green, #22c55e)' : 'var(--red, #ef4444)', margin: '0 0 16px', fontSize: 13 }}>
              {mensaje.texto}
            </p>
          )}

          {reportes.length === 0 ? (
            <p style={{ color: 'var(--text-on-bg)' }}>Aún no hay reportes guardados.</p>
          ) : (
            <div className="admin-table-wrap">
            <table className="admin-table admin-table--reportes">
              <thead>
                <tr style={{ color: 'var(--text-on-bg)', textAlign: 'left', fontSize: 11, textTransform: 'uppercase' }}>
                  <th style={{ padding: '0 10px 12px' }}>Lugar</th>
                  <th style={{ padding: '0 10px 12px' }}>Fecha</th>
                  <th style={{ padding: '0 10px 12px' }}>Ventas</th>
                  <th style={{ padding: '0 10px 12px' }}>Efectivo</th>
                  <th style={{ padding: '0 10px 12px' }}>TUU</th>
                  <th style={{ padding: '0 10px 12px' }}>Total</th>
                  <th style={{ padding: '0 10px 12px' }}></th>
                </tr>
              </thead>
              <tbody>
                {reportesPagina.map((r) => {
                  const n = normalizarReporte(r);
                  return (
                    <tr
                      key={r.id}
                      style={{ borderTop: '1px solid var(--surface-3)', cursor: 'pointer' }}
                      onClick={() => abrirDetalle(r)}
                    >
                      <td style={{ padding: '13px 10px', color: 'var(--text-on-bg)' }}>{r.lugar}</td>
                      <td style={{ padding: '13px 10px', color: 'var(--text-on-bg)' }}>{formatearFecha(r.fecha)}</td>
                      <td style={{ padding: '13px 10px', fontFamily: 'var(--font-mono)', color: 'var(--text-on-bg)' }}>{n.n_ventas}</td>
                      <td style={{ padding: '13px 10px', fontFamily: 'var(--font-mono)', color: 'var(--text-on-bg)' }}>
                        ${Number(n.total_efectivo || 0).toLocaleString('es-CL')}
                      </td>
                      <td style={{ padding: '13px 10px', fontFamily: 'var(--font-mono)', color: 'var(--text-on-bg)' }}>
                        ${Number(n.total_tuu || 0).toLocaleString('es-CL')}
                      </td>
                      <td style={{ padding: '13px 10px', fontFamily: 'var(--font-mono)', color: 'var(--green)' }}>
                        ${Number(n.total || 0).toLocaleString('es-CL')}
                      </td>
                      <td style={{ padding: '13px 10px', color: 'var(--text-on-bg)' }}>Detalles</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
          )}
        </>
      )}

      {!cargando && reportes.length > 0 && (
        <div
          style={{
            position: 'sticky', bottom: 0, zIndex: 10,
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            marginTop: 'auto', gap: 8, padding: '20px 16px 12px',
            background: 'var(--bg)', borderTop: '1px solid var(--surface-3)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-on-bg)' }}>
            <button
              onClick={() => setPagina(p => Math.max(1, p - 1))}
              disabled={pagina === 1}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 30, height: 30, borderRadius: 8, border: '1px solid var(--surface-3)',
                background: 'transparent', color: 'var(--text-on-bg)',
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
              onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
              disabled={pagina === totalPaginas}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 30, height: 30, borderRadius: 8, border: '1px solid var(--surface-3)',
                background: 'transparent', color: 'var(--text-on-bg)',
                cursor: pagina === totalPaginas ? 'not-allowed' : 'pointer',
                opacity: pagina === totalPaginas ? 0.4 : 1,
              }}
              aria-label="Página siguiente"
            >
              <ChevronRight size={15} />
            </button>
          </div>

          <span style={{ fontSize: 11, color: 'var(--text-on-bg)' }}>
            Mostrando {(pagina - 1) * filasPorPagina + 1}
            –{Math.min(pagina * filasPorPagina, reportes.length)} de {reportes.length}
          </span>
        </div>
      )}

      {detalle && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.49)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999, backdropFilter: 'blur(4px)', padding: 24,
          }}
          onClick={() => setDetalle(null)}
        >
          <div
            style={{
              background: 'var(--surface)', borderRadius: 16, padding: '28px',
              width: '100%', maxWidth: 560, maxHeight: '80vh', overflowY: 'auto',
              boxShadow: '0 20px 60px rgba(0,0,0,.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 18 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>{detalle.lugar}</h3>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text)' }}>{formatearFecha(detalle.fecha)}</p>
              </div>
              <button
                onClick={() => setDetalle(null)}
                aria-label="Cerrar detalle"
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 4 }}
              >
                <X size={18} color="var(--text)" />
              </button>
            </div>

            {cargandoDetalle ? (
              <p style={{ color: 'var(--text)', fontSize: 13 }}>Cargando detalle…</p>
            ) : (
              <>
                {(detalle.ventas || []).length === 0 ? (
                  <p style={{ color: 'var(--text)', fontSize: 13 }}>Este reporte no tiene ventas.</p>
                ) : (
                  detalle.ventas.map((venta, i) => (
                    <div
                      key={venta.id || i}
                      style={{ borderTop: '1px solid var(--surface-3)', padding: '14px 0' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, marginBottom: 8 }}>
                        <span style={{ color: 'var(--text)' }}>
                          {formatearHora(venta.creado_en)} · {capitalizar(venta.medio_pago)}
                        </span>
                        <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text)', fontWeight: 600 }}>
                          ${totalVenta(venta).toLocaleString('es-CL')}
                        </span>
                      </div>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                        <tbody>
                          {(venta.items || []).map((item) => (
                            <tr key={item.producto_id}>
                              <td style={{ padding: '2px 8px 2px 0', color: 'var(--text)' }}>{item.nombre}</td>
                              <td style={{ padding: '2px 8px', color: 'var(--text)', textAlign: 'right' }}>
                                {item.cantidad} × ${Number(item.precio_unitario).toLocaleString('es-CL')}
                              </td>
                              <td style={{ padding: '2px 0 2px 8px', fontFamily: 'var(--font-mono)', color: 'var(--text)', textAlign: 'right' }}>
                                ${Number(item.subtotal ?? item.cantidad * item.precio_unitario).toLocaleString('es-CL')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))
                )}

                <div
                  style={{
                    borderTop: '1px solid var(--surface-3)', marginTop: 8, paddingTop: 14,
                    display: 'flex', justifyContent: 'flex-end', gap: 18, flexWrap: 'wrap', fontSize: 13,
                  }}
                >
                  <span style={{ color: 'var(--text)' }}>
                    Efectivo <strong style={{ color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>${Number(detalle.total_efectivo || 0).toLocaleString('es-CL')}</strong>
                  </span>
                  <span style={{ color: 'var(--text)' }}>
                    TUU <strong style={{ color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>${Number(detalle.total_tuu || 0).toLocaleString('es-CL')}</strong>
                  </span>
                  <span style={{ color: 'var(--text)' }}>
                    Total <strong style={{ color: 'var(--green)', fontFamily: 'var(--font-mono)' }}>${Number(detalle.total || 0).toLocaleString('es-CL')}</strong>
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}