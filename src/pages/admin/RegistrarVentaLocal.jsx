import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Minus, Plus } from 'lucide-react';
import { useProductos } from '../../context/ProductContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { ventasApi } from '../../services/ventas.js';

const MEDIOS = ['Efectivo', 'TUU'];
const clp = (n) => `$${Math.round(Number(n) || 0).toLocaleString('es-CL')}`;

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

function totalVenta(venta) {
  const items = venta.items || [];
  if (items.length) return items.reduce((s, i) => s + Number(i.cantidad) * Number(i.precio_unitario), 0);
  return Number(venta.total) || 0;
}


export default function RegistrarVentaLocal() {
  const { productos, categorias, actualizarLocal } = useProductos();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sesion, setSesion] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [abriendo, setAbriendo] = useState(false);
  const [registrando, setRegistrando] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [lugar, setLugar] = useState('');
  const [categoriaActual, setCategoriaActual] = useState('');
  const [productoActual, setProductoActual] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [medioPago, setMedioPago] = useState('');
  const [ticket, setTicket] = useState([]);
  const [ventasDia, setVentasDia] = useState([]);
  const [mostrarCierre, setMostrarCierre] = useState(false);
  const [cerrandoSesion, setCerrandoSesion] = useState(false);

  const fechaHoy = capitalizar(new Date().toLocaleDateString('es-CL', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  }));

  useEffect(() => {
    let activo = true;
    (async () => {
      try {
        const res = await ventasApi.sesionActual();
        if (activo && res) {
          setSesion(res.sesion || null);
          setVentasDia(res.ventas || []);
        }
      } catch (err) {
        if (activo) setMensaje({ tipo: 'error', texto: err.message });
      } finally {
        if (activo) setCargando(false);
      }
    })();
    return () => { activo = false; };
  }, []);

  async function abrirSesion() {
    setMensaje(null);
    if (!lugar.trim()) {
      setMensaje({ tipo: 'error', texto: 'Indica el lugar de la venta.' });
      return;
    }
    setAbriendo(true);
    try {
      const res = await ventasApi.abrirSesion(lugar.trim());
      const s = res.sesion || null;
      if (!s) throw new Error('No se pudo abrir la sesión.');
      setSesion(s);
      setVentasDia([]);
      setLugar('');
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.message });
    } finally {
      setAbriendo(false);
    }
  }

  function agregarAlTicket() {
    setMensaje(null);
    const producto = productos.find(p => p.id === productoActual);
    if (!producto) {
      setMensaje({ tipo: 'error', texto: 'Elige un producto.' });
      return;
    }
    const cant = Number(cantidad);
    if (!cant || cant < 1 || cant > producto.stock) {
      setMensaje({ tipo: 'error', texto: `La cantidad debe estar entre 1 y ${producto.stock}.` });
      return;
    }
    const existente = ticket.find(t => t.producto_id === producto.id);
    if (existente) {
      if (existente.cantidad + cant > producto.stock) {
        setMensaje({ tipo: 'error', texto: `El stock disponible es ${producto.stock}.` });
        return;
      }
      setTicket(ticket.map(t => t.producto_id === producto.id ? { ...t, cantidad: t.cantidad + cant } : t));
    } else {
      setTicket([...ticket, {
        producto_id: producto.id,
        nombre: producto.nombre,
        precio: Number(producto.precio),
        cantidad: cant,
      }]);
    }
    setProductoActual('');
    setCantidad(1);
  }

  function quitarDelTicket(productoId) {
    setTicket(ticket.filter(t => t.producto_id !== productoId));
  }

  async function registrarVenta() {
    setMensaje(null);
    if (!medioPago) {
      setMensaje({ tipo: 'error', texto: 'Elige el medio de pago.' });
      return;
    }
    if (ticket.length === 0) {
      setMensaje({ tipo: 'error', texto: 'Agrega al menos un producto al carrito.' });
      return;
    }
    setRegistrando(true);
    try {
      if (!sesion || !sesion.id) {
        throw new Error('No hay una sesión de venta activa. Inicia la sesión primero.');
      }
      const items = ticket.map(t => ({ producto_id: t.producto_id, cantidad: t.cantidad }));
      const res = await ventasApi.registrarVenta(sesion.id, medioPago.toLowerCase(), items);
      const venta = res.venta || res;
      setVentasDia(prev => [...prev, venta]);
      ticket.forEach(t => {
        const producto = productos.find(p => p.id === t.producto_id);
        if (producto) {
          actualizarLocal({ id: t.producto_id, stock: Number(producto.stock) - t.cantidad });
        }
      });
      setTicket([]);
      setProductoActual('');
      setCantidad(1);
      setMedioPago('');
      setMensaje({ tipo: 'ok', texto: 'Venta registrada.' });
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.message });
    } finally {
      setRegistrando(false);
    }
  }

  async function confirmarCierre() {
    setCerrandoSesion(true);
    setMensaje(null);
    try {
      await ventasApi.cerrarSesion(sesion.id);
      navigate(user?.rol === 'empleado' ? '/admin/venta' : '/admin/reportes');
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.message });
      setMostrarCierre(false);
      setCerrandoSesion(false);
    }
  }

  const totalTicket = ticket.reduce((s, t) => s + t.cantidad * t.precio, 0);
  const ivaTicket = Math.round(totalTicket * 0.19);
  const totalConIva = Math.round(totalTicket * 1.19);
  const unidadesTicket = ticket.reduce((s, t) => s + t.cantidad, 0);
  const totalEfectivo = ventasDia
    .filter(v => (v.medio_pago || '').toLowerCase() === 'efectivo')
    .reduce((s, v) => s + totalVenta(v), 0);
  const totalTuu = ventasDia
    .filter(v => (v.medio_pago || '').toLowerCase() === 'tuu')
    .reduce((s, v) => s + totalVenta(v), 0);
  const totalGeneral = ventasDia.reduce((s, v) => s + totalVenta(v), 0);

  const Mensaje = () => mensaje && (
    <p className={`rv-msg ${mensaje.tipo === 'ok' ? 'ok' : 'error'}`} role="status">{mensaje.texto}</p>
  );

  /* ───────── Sin sesión: iniciar venta ───────── */
  if (!sesion) {
    return (
      <div className="rv-root">
        <div className="rv-wrap">
          <header className="rv-head">
            <div>
                            <h1 className="rv-title">Registrar venta</h1>
            </div>
          </header>
          <Mensaje />
          <div className="rv-card rv-card-estrecho">
            <h2 className="rv-h2">Iniciar sesión de venta</h2>
            <label className="rv-lbl" htmlFor="rv-lugar">Lugar de la venta</label>
            <input
              id="rv-lugar"
              className="rv-fld"
              value={lugar}
              onChange={(e) => setLugar(e.target.value)}
              placeholder="Ej: Feria de Alameda"
            />
            <p className="rv-fecha">{fechaHoy}</p>
            <button className="rv-btn rv-pri" onClick={abrirSesion} disabled={abriendo || cargando}>
              {abriendo ? 'Iniciando…' : 'Iniciar venta'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ───────── Sesión abierta ───────── */
  const fechaSesion = formatearFecha(sesion.fecha || sesion.creado_en || new Date().toISOString());
  const productosDisponibles = productos.filter(p => !p.sinStock);
  const productosFiltrados = categoriaActual
    ? productosDisponibles.filter(p => p.categoria_id === categoriaActual)
    : productosDisponibles;
  const productoSel = productos.find(p => p.id === productoActual);
  const maxCant = productoSel ? Number(productoSel.stock) : 1;
  const subtotalLinea = productoSel ? Number(productoSel.precio) * (Number(cantidad) || 0) : 0;

  function cambiarCantidad(delta) {
    const nueva = Math.min(maxCant, Math.max(1, (Number(cantidad) || 1) + delta));
    setCantidad(nueva);
  }

  return (
    <div className="rv-root">
      <div className="rv-wrap">

        <header className="rv-head">
          <div>
                        <h1 className="rv-title">Registrar venta</h1>
          </div>
          <div className="rv-session">
            <div>
              <div className="rv-lugar">{sesion.lugar}</div>
              <div className="rv-meta">{fechaSesion}</div>
            </div>
            <span className="rv-badge"><i />Sesión abierta</span>
            <button className="rv-danger" onClick={() => setMostrarCierre(true)}>Cerrar ventas</button>
          </div>
        </header>

        <Mensaje />

        <section className="rv-grid">
          {/* Nueva venta */}
          <div className="rv-card">
            <h2 className="rv-h2">Nueva venta</h2>

            <div className="rv-field">
              <label className="rv-lbl" htmlFor="rv-cat">Categoría</label>
              <select
                id="rv-cat"
                className="rv-fld"
                value={categoriaActual}
                onChange={(e) => { setCategoriaActual(e.target.value); setProductoActual(''); }}
              >
                <option value="">Todas las categorías</option>
                {categorias.filter(c => c.cantidad > 0).map(c => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>

            <div className="rv-field">
              <label className="rv-lbl" htmlFor="rv-prod">Producto</label>
              <select
                id="rv-prod"
                className="rv-fld"
                value={productoActual}
                onChange={(e) => { setProductoActual(e.target.value); setCantidad(1); }}
              >
                <option value="">Selecciona un producto</option>
                {productosFiltrados.map(p => (
                  <option key={p.id} value={p.id}>{p.nombre} — {clp(p.precio)}</option>
                ))}
              </select>
              {productoSel && (
                <div className="rv-meta rv-stock">
                  Stock disponible: {productoSel.stock} {Number(productoSel.stock) === 1 ? 'unidad' : 'unidades'}
                </div>
              )}
            </div>

            <div className="rv-field-qty">
              <label className="rv-lbl" htmlFor="rv-qty">Cantidad</label>
              <div className="rv-stepper">
                <button type="button" className="rv-step" aria-label="Disminuir cantidad" onClick={() => cambiarCantidad(-1)}>
                  <Minus size={18} />
                </button>
                <input
                  id="rv-qty"
                  className="rv-fld rv-qty"
                  type="number"
                  min={1}
                  max={maxCant}
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                />
                <button type="button" className="rv-step" aria-label="Aumentar cantidad" onClick={() => cambiarCantidad(1)}>
                  <Plus size={18} />
                </button>
                <div className="rv-subtotal">
                  <div className="rv-meta">Subtotal línea</div>
                  <div className="rv-mono rv-subtotal-val">{clp(subtotalLinea)}</div>
                </div>
              </div>
            </div>

            <button className="rv-btn rv-pri" onClick={agregarAlTicket}>+ Agregar al carrito</button>
          </div>

          {/* Carrito */}
          <div className="rv-card">
            <div className="rv-card-head">
              <h2 className="rv-h2">Carrito</h2>
              {ticket.length > 0 && (
                <span className="rv-count">
                  {ticket.length} {ticket.length === 1 ? 'producto' : 'productos'} · {unidadesTicket} u.
                </span>
              )}
            </div>

            {ticket.length === 0 ? (
              <p className="rv-vacio">
                Aún no hay productos. Elige uno a la izquierda y agrégalo.
              </p>
            ) : (
              <>
                {ticket.map((t) => (
                  <div className="rv-row" key={t.producto_id}>
                    <div className="rv-item">
                      <div className="rv-item-name">
                        {t.nombre} <span className="rv-item-x">× {t.cantidad}</span>
                      </div>
                      <div className="rv-meta">{clp(t.precio)} c/u</div>
                    </div>
                    <div className="rv-mono">{clp(t.cantidad * t.precio)}</div>
                    <button className="rv-icon" onClick={() => quitarDelTicket(t.producto_id)} aria-label={`Quitar ${t.nombre}`}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}

                <div className="rv-totales">
                  <div className="rv-total-row">
                    <span>Subtotal</span><span className="rv-mono">{clp(totalTicket)}</span>
                  </div>
                  <div className="rv-total-row">
                    <span>IVA (19%)</span><span className="rv-mono">{clp(ivaTicket)}</span>
                  </div>
                  <div className="rv-total-final">
                    <span className="rv-total-label">Total</span>
                    <span className="rv-total-valor">
                      {clp(totalConIva)}
                    </span>
                  </div>
                </div>

                <div className="rv-pago">
                  <div className="rv-lbl">Medio de pago</div>
                  <div className="rv-chips">
                    {MEDIOS.map((medio) => (
                      <button
                        key={medio}
                        className={`rv-chip${medioPago === medio ? ' on' : ''}`}
                        aria-pressed={medioPago === medio}
                        onClick={() => setMedioPago(medio)}
                      >
                        {medio}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <button
              className="rv-btn rv-pri rv-btn-lg"
              onClick={registrarVenta}
              disabled={registrando || ticket.length === 0}
            >
              {registrando ? 'Registrando…' : ticket.length ? `Registrar venta · ${clp(totalConIva)}` : 'Registrar venta'}
            </button>
          </div>
        </section>

        {/* Ventas del día */}
        <section className="rv-card rv-card-ventas">
          <h2 className="rv-h2">Ventas del día</h2>
          {ventasDia.length === 0 ? (
            <p className="rv-vacio rv-vacio-flush">Aún no hay ventas registradas hoy.</p>
          ) : (
            <>
              <div className="rv-tiles">
                <div className="rv-tile"><div className="rv-tl">N° de ventas</div><div className="rv-tv">{ventasDia.length}</div></div>
                <div className="rv-tile"><div className="rv-tl">Efectivo</div><div className="rv-tv">{clp(totalEfectivo)}</div></div>
                <div className="rv-tile"><div className="rv-tl">TUU</div><div className="rv-tv">{clp(totalTuu)}</div></div>
                <div className="rv-tile rv-tile-accent">
                  <div className="rv-tl">Total general</div>
                  <div className="rv-tv">{clp(totalGeneral)}</div>
                </div>
              </div>

              <div className="rv-table-wrap">
                <table className="rv-table">
                  <thead>
                    <tr>
                      <th className="rv-th">Hora</th>
                      <th className="rv-th">Medio de pago</th>
                      <th className="rv-th rv-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ventasDia.map((venta, i) => {
                      const medio = (venta.medio_pago || '').toLowerCase();
                      return (
                        <tr key={venta.id || i}>
                          <td className="rv-td">
                            {new Date(venta.creado_en).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="rv-td">
                            <span className={`rv-pill${medio === 'tuu' ? ' tuu' : ''}`}>
                              {medio === 'tuu' ? 'TUU' : capitalizar(venta.medio_pago)}
                            </span>
                          </td>
                          <td className="rv-td rv-mono rv-right">{clp(totalVenta(venta))}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>
      </div>

      {/* Modal de cierre */}
      {mostrarCierre && (
        <div className="rv-overlay" onClick={() => !cerrandoSesion && setMostrarCierre(false)}>
          <div className="rv-modal" role="dialog" aria-modal="true" aria-labelledby="rv-cierre-t" onClick={(e) => e.stopPropagation()}>
            <h3 id="rv-cierre-t" className="rv-modal-title">
              Cerrar sesión de venta
            </h3>
            <p className="rv-modal-text">
              Se guardará el reporte de ventas y no podrás registrar más ventas en esta sesión. ¿Seguro?
            </p>
            <div className="rv-modal-actions">
              <button
                className="rv-btn rv-btn-cancel"
                onClick={() => setMostrarCierre(false)}
                disabled={cerrandoSesion}
              >
                Cancelar
              </button>
              <button
                className="rv-btn rv-btn-confirm"
                onClick={confirmarCierre}
                disabled={cerrandoSesion}
              >
                {cerrandoSesion ? 'Cerrando…' : 'Sí, cerrar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}