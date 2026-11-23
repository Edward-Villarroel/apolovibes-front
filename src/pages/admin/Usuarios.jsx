import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, ChevronLeft, ChevronRight, FileText, Plus, RefreshCw, Search, ShoppingBag, Trash2, Users } from 'lucide-react'
import { usuariosApi } from '../../services/usuarios.js'
import ConfirmModal from '../../components/ConfirmModal.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

function numero(valor) {
  return Number(valor || 0).toLocaleString('es-CL')
}

// ---------- tarjeta de resumen ----------

function TarjetaResumen({ icon: Icon, label, valor, detalle, children }) {
  return (
    <div style={{
      background: 'var(--surface-3)', border: '1px solid var(--line)', borderRadius: 12,
      padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{
          width: 36, height: 36, borderRadius: '50%', background: 'rgba(250,127,25,.14)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Icon size={18} style={{ color: 'var(--accent)' }} aria-hidden="true" />
        </span>
        <span style={{ fontSize: 13, color: 'var(--text-on-bg)', opacity: 0.8 }}>{label}</span>
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 36, fontWeight: 600, lineHeight: 1, color: 'var(--text-on-bg)' }}>
        {valor}
      </div>
      {detalle && (
        <div style={{ fontSize: 13, color: 'var(--text-on-bg)', opacity: 0.8 }}>{detalle}</div>
      )}
      {children}
    </div>
  )
}

// ---------- barra de cotizaciones ----------

function BarraCotizaciones({ total, aprobadas, rechazadas }) {
  if (!total) return null
  const pendientes = Math.max(0, total - aprobadas - rechazadas)
  const pct = (n) => `${(n / total) * 100}%`
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div
        role="img"
        aria-label={`${aprobadas} aprobadas, ${rechazadas} rechazadas, ${pendientes} pendientes`}
        style={{ display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden', gap: 2 }}
      >
        <span style={{ width: pct(aprobadas), background: 'var(--green, #22c55e)' }} />
        <span style={{ width: pct(rechazadas), background: 'var(--red, #ef4444)' }} />
        <span style={{ width: pct(pendientes), background: 'var(--line)' }} />
      </div>
      <div style={{ fontSize: 13, color: 'var(--text-on-bg)', opacity: 0.8 }}>
        {numero(aprobadas)} aprobadas · {numero(rechazadas)} rechazadas · {numero(pendientes)} pendientes
      </div>
    </div>
  )
}

// ---------- celda numerica ----------

function CeldaNumero({ valor, color, titulo }) {
  return (
    <td
      title={titulo}
      style={{ padding: '13px 10px', fontFamily: 'var(--font-mono)', color: color || 'var(--text-on-bg)', whiteSpace: 'nowrap', textAlign: 'center' }}
    >
      {numero(valor)}
    </td>
  )
}

// ---------- badge de estado ----------

function BadgeEstado({ activo }) {
  const estiloActiva = {
    color: 'var(--green, #22c55e)',
    background: 'rgba(34, 197, 94, .16)',
  }
  const estiloBloqueada = {
    color: 'var(--red, #ef4444)',
    background: 'rgba(239, 68, 68, .16)',
  }
  const estilo = activo ? estiloActiva : estiloBloqueada
  const texto = activo ? 'Activa' : 'Bloqueada'
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.4px',
      padding: '2px 8px', borderRadius: 20,
      color: estilo.color, background: estilo.background,
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: '50%',
        background: estilo.color,
        display: 'inline-block',
      }} />
      {texto}
    </span>
  )
}

// ---------- modal alta usuario ----------

function ModalAltaUsuario({ abierto, onCerrar, onGuardar, guardando, error }) {
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    rol: 'cliente',
  })

  useEffect(() => {
    if (abierto) {
      setForm({ nombre: '', apellido: '', email: '', password: '', rol: 'cliente' })
    }
  }, [abierto])

  if (!abierto) return null

  const cambiar = (campo, valor) => setForm(f => ({ ...f, [campo]: valor }))

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,.49)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999, backdropFilter: 'blur(4px)',
    }} onClick={onCerrar}>
      <div style={{
        background: 'var(--surface)', borderRadius: 16, padding: '32px 28px',
        width: '100%', maxWidth: 440, boxShadow: '0 20px 60px rgba(0,0,0,.3)',
        textAlign: 'center', maxHeight: '90vh', overflowY: 'auto',
      }} onClick={e => e.stopPropagation()}>
        <h3 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>
          Crear usuario
        </h3>
        <p style={{ margin: '0 0 20px', fontSize: 13, color: 'var(--text)' }}>
          El usuario podrá iniciar sesión con los datos que definas.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left' }}>
          <input
            value={form.nombre}
            onChange={e => cambiar('nombre', e.target.value)}
            placeholder="Nombre"
            aria-label="Nombre"
            style={{
              width: '100%', padding: '9px 10px', borderRadius: 8, border: '1px solid var(--line)',
              background: 'var(--bg)', color: 'var(--text-on-bg)', fontSize: 13, boxSizing: 'border-box',
            }}
          />
          <input
            value={form.apellido}
            onChange={e => cambiar('apellido', e.target.value)}
            placeholder="Apellido (obligatorio para clientes)"
            aria-label="Apellido"
            style={{
              width: '100%', padding: '9px 10px', borderRadius: 8, border: '1px solid var(--line)',
              background: 'var(--bg)', color: 'var(--text-on-bg)', fontSize: 13, boxSizing: 'border-box',
            }}
          />
          <input
            value={form.email}
            onChange={e => cambiar('email', e.target.value)}
            placeholder="Correo electrónico"
            type="email"
            aria-label="Correo electrónico"
            style={{
              width: '100%', padding: '9px 10px', borderRadius: 8, border: '1px solid var(--line)',
              background: 'var(--bg)', color: 'var(--text-on-bg)', fontSize: 13, boxSizing: 'border-box',
            }}
          />
          <input
            value={form.password}
            onChange={e => cambiar('password', e.target.value)}
            placeholder="Contraseña (mínimo 8 caracteres)"
            type="password"
            aria-label="Contraseña"
            style={{
              width: '100%', padding: '9px 10px', borderRadius: 8, border: '1px solid var(--line)',
              background: 'var(--bg)', color: 'var(--text-on-bg)', fontSize: 13, boxSizing: 'border-box',
            }}
          />
          <div>
            <p style={{ margin: '0 0 6px', fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>Rol inicial</p>
            <select
              value={form.rol}
              onChange={e => cambiar('rol', e.target.value)}
              aria-label="Rol inicial"
              style={{
                width: '100%', padding: '9px 10px', borderRadius: 8, border: '1px solid var(--line)',
                background: 'var(--bg)', color: 'var(--text-on-bg)', fontSize: 13, boxSizing: 'border-box',
              }}
            >
              <option value="cliente">Cliente</option>
              <option value="empleado">Empleado</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => onGuardar(form)}
            disabled={guardando}
            style={{
              marginTop: 8, padding: '10px 0', borderRadius: 10, border: 'none',
              background: 'var(--accent)', color: '#fff', fontSize: 13, fontWeight: 600,
              cursor: guardando ? 'not-allowed' : 'pointer', opacity: guardando ? 0.7 : 1,
            }}
          >
            {guardando ? 'Creando...' : 'Crear usuario'}
          </button>

          {error && (
            <p style={{ margin: 0, padding: '0 20px 12px', color: 'var(--red)', fontSize: 13 }}>{error}</p>
          )}
        </div>
      </div>
    </div>
  )
}

// ---------- componente principal ----------

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const [filtroRol, setFiltroRol] = useState('todos')
  const [filtroCuenta, setFiltroCuenta] = useState('empresa')
  const [pagina, setPagina] = useState(1)
  const [recarga, setRecarga] = useState(0)
  const [filasPorPagina, setFilasPorPagina] = useState(6)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [errorAlta, setErrorAlta] = useState(null)
  const [usuarioEliminar, setUsuarioEliminar] = useState(null)
  const [eliminando, setEliminando] = useState(false)

  const { user: usuarioActual } = useAuth()
  const esAdminActual = usuarioActual?.rol === 'admin'

  useEffect(() => {
    let vigente = true
    setCargando(true)
    setError(null)
    usuariosApi.listar()
      .then(res => {
        if (!vigente) return
        setUsuarios(res.usuarios ?? [])
      })
      .catch(err => {
        if (!vigente) return
        setError(err.message)
      })
      .finally(() => {
        if (vigente) setCargando(false)
      })
    return () => { vigente = false }
  }, [recarga])

  useEffect(() => {
    const calcularFilas = () => {
      // el encabezado y las tarjetas ocupan más alto que en Inventario
      const disponible = window.innerHeight - 560
      const base = Math.floor(disponible / 56)
      const maximo = window.innerWidth < 768 ? 6 : 10
      setFilasPorPagina(Math.max(3, Math.min(base, maximo)))
    }
    calcularFilas()
    window.addEventListener('resize', calcularFilas)
    return () => window.removeEventListener('resize', calcularFilas)
  }, [])

  const filtrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase()
    const esEmpresa = (u) => String(u.email || '').toLowerCase().endsWith('@apolovibes.cl')
    return usuarios.filter(u => {
      const nombre = `${u.nombre_completo || ''} ${u.nombre || ''} ${u.apellido || ''}`
      const coincideBusqueda = !termino
        || nombre.toLowerCase().includes(termino)
        || (u.email || '').toLowerCase().includes(termino)
      const coincideRol = filtroRol === 'todos' || u.rol === filtroRol
      const coincideCuenta =
        filtroCuenta === 'todos'
        || (filtroCuenta === 'empresa' && esEmpresa(u))
        || (filtroCuenta === 'personal' && !esEmpresa(u))
      return coincideBusqueda && coincideRol && coincideCuenta
    })
  }, [usuarios, busqueda, filtroRol, filtroCuenta])

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / filasPorPagina))

  useEffect(() => {
    if (pagina > totalPaginas) setPagina(totalPaginas)
  }, [totalPaginas, pagina])

  const usuariosPagina = useMemo(() => {
    const inicio = (pagina - 1) * filasPorPagina
    return filtrados.slice(inicio, inicio + filasPorPagina)
  }, [filtrados, pagina, filasPorPagina])

  const resumen = useMemo(() => usuarios.reduce((acc, u) => ({
    productos: acc.productos + Number(u.productos_comprados || 0),
    pedidas: acc.pedidas + Number(u.cotizaciones_pedidas || 0),
    aprobadas: acc.aprobadas + Number(u.cotizaciones_aprobadas || 0),
    rechazadas: acc.rechazadas + Number(u.cotizaciones_rechazadas || 0),
    activos: acc.activos + (u.activo ? 1 : 0),
  }), { productos: 0, pedidas: 0, aprobadas: 0, rechazadas: 0, activos: 0 }), [usuarios])

  function refrescar() {
    setRecarga(n => n + 1)
  }

  async function guardarUsuario(form) {
    setGuardando(true)
    setErrorAlta(null)
    try {
      await usuariosApi.crear(form)
      setModalAbierto(false)
      refrescar()
    } catch (err) {
      setErrorAlta(err.message)
    } finally {
      setGuardando(false)
    }
  }

  async function confirmarEliminar() {
    if (!usuarioEliminar) return
    setEliminando(true)
    try {
      await usuariosApi.eliminar(usuarioEliminar.id)
      setUsuarioEliminar(null)
      refrescar()
    } catch (err) {
      setErrorAlta(err.message)
    } finally {
      setEliminando(false)
    }
  }

  async function toggleEstado(u) {
    try {
      await usuariosApi.cambiarEstado(u.id, !u.activo)
      refrescar()
    } catch (err) {
      setErrorAlta(err.message)
    }
  }

  async function cambiarRol(u, rol) {
    try {
      await usuariosApi.cambiarRol(u.id, rol)
      refrescar()
    } catch (err) {
      setErrorAlta(err.message)
    }
  }

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 24 }}>
        {/* Fila 1: título + acción principal */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, margin: 0, color: 'var(--text-on-bg)' }}>Usuarios</h1>
          </div>
          <button
            type="button"
            onClick={() => { setErrorAlta(null); setModalAbierto(true) }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, minHeight: 44, padding: '0 20px',
              borderRadius: 10, border: 'none', background: 'var(--surface)', color: '#fff',
              fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}
          >
            <Plus size={16} aria-hidden="true" />
            Agregar usuario
          </button>
        </div>

        {/* Fila 2: barra de filtros */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
          background: 'var(--line)', border: '1px solid var(--line)', borderRadius: 12, padding: 12,
        }}>
          <div style={{ position: 'relative', flex: '1 1 320px' }}>
            <Search
              size={16}
              aria-hidden="true"
              style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-on-bg)', pointerEvents: 'none' }}
            />
            <input
              type="search"
              value={busqueda}
              onChange={(e) => { setBusqueda(e.target.value); setPagina(1) }}
              placeholder="Buscar por nombre o correo..."
              aria-label="Buscar usuarios"
              style={{
                width: '100%', minHeight: 44, padding: '0 12px 0 38px', borderRadius: 10,
                border: '1px solid var(--line)', background: 'var(--input-bg)',
                color: 'var(--text-on-bg)', fontSize: 14, boxSizing: 'border-box',
              }}
            />
          </div>
          <select
            value={filtroRol}
            onChange={(e) => { setFiltroRol(e.target.value); setPagina(1) }}
            aria-label="Filtrar por tipo de usuario"
            style={{
              flex: '0 1 220px', minHeight: 44, padding: '0 12px', borderRadius: 10,
              border: '1px solid var(--line)', background: 'var(--input-bg)',
              color: 'var(--text-on-bg)', fontSize: 14, boxSizing: 'border-box',
            }}
          >
            <option value="todos">Todos los usuarios</option>
            <option value="cliente">Cliente</option>
            <option value="empleado">Empleado</option>
            <option value="admin">Administrador</option>
          </select>
          <select
            value={filtroCuenta}
            onChange={(e) => { setFiltroCuenta(e.target.value); setPagina(1) }}
            aria-label="Filtrar por tipo de cuenta"
            style={{
              flex: '0 1 280px', minHeight: 44, padding: '0 12px', borderRadius: 10,
              border: '1px solid var(--line)', background: 'var(--input-bg)',
              color: 'var(--text-on-bg)', fontSize: 14, boxSizing: 'border-box',
            }}
          >
            <option value="todos">Todas las cuentas</option>
            <option value="empresa">Cuenta de empresa</option>
            <option value="personal">Cuenta personal</option>
          </select>
        </div>
      </div>

      {cargando && usuarios.length === 0 ? (
        <p style={{ color: 'var(--text-on-bg)' }}>Cargando usuarios…</p>
      ) : error ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--red, #ef4444)', fontSize: 13, flexWrap: 'wrap' }}>
          <AlertTriangle size={16} />
          No se pudo cargar el listado de usuarios: {error}
          <button
            type="button"
            onClick={() => setRecarga(n => n + 1)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px',
              borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface-3)',
              color: 'var(--text-on-bg)', fontSize: 12.5, cursor: 'pointer',
            }}
          >
            <RefreshCw size={13} />
            Reintentar
          </button>
        </div>
      ) : usuarios.length === 0 ? (
        <p style={{ color: 'var(--text-on-bg)' }}>Todavía no hay usuarios registrados.</p>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 24 }}>
            <TarjetaResumen
              icon={Users}
              label="Usuarios registrados"
              valor={numero(usuarios.length)}
              detalle={`${numero(resumen.activos)} activos · ${numero(usuarios.length - resumen.activos)} bloqueados`}
            />
            <TarjetaResumen
              icon={ShoppingBag}
              label="Productos comprados"
              valor={numero(resumen.productos)}
              detalle="Unidades en pedidos pagados"
            />
            <TarjetaResumen
              icon={FileText}
              label="Cotizaciones pedidas"
              valor={numero(resumen.pedidas)}
            >
              <BarraCotizaciones
                total={resumen.pedidas}
                aprobadas={resumen.aprobadas}
                rechazadas={resumen.rechazadas}
              />
            </TarjetaResumen>
          </div>

          {filtrados.length === 0 ? (
            <p style={{ color: 'var(--text-on-bg)' }}>
              {!busqueda && filtroRol === 'todos' && filtroCuenta === 'todos'
                ? 'No hay usuarios registrados.'
                : `No hay usuarios que coincidan con${busqueda ? ` "${busqueda}"` : ''}${filtroRol !== 'todos' ? ` y rol "${filtroRol}"` : ''}${filtroCuenta !== 'todos' ? ` y cuenta "${filtroCuenta === 'empresa' ? 'empresa' : 'personal'}"` : ''}`}
            </p>
          ) : (
            <>
              <div className="admin-table-wrap">
                <table className="admin-table admin-table--usuarios">
                  <thead>
                    <tr style={{ color: 'var(--text-on-bg)', textAlign: 'left', fontSize: 11, textTransform: 'uppercase' }}>
                      <th style={{ padding: '0 10px 12px' }}>Nombre</th>
                      <th style={{ padding: '0 10px 12px' }}>Correo</th>
                      <th style={{ padding: '0 10px 12px', textAlign: 'center' }}>Productos comprados</th>
                      <th style={{ padding: '0 10px 12px', textAlign: 'center' }}>Cotizaciones pedidas</th>
                      <th style={{ padding: '0 10px 12px', textAlign: 'center' }}>Aprobadas</th>
                      <th style={{ padding: '0 10px 12px', textAlign: 'center' }}>Rechazadas</th>
                      <th style={{ padding: '0 10px 12px' }}>Estado</th>
                      <th style={{ padding: '0 10px 12px', textAlign: 'right' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuariosPagina.map(u => {
                      const esPropia = esAdminActual && String(u.id) === String(usuarioActual?.id)
                      const esEmpresa = String(u.email || '').toLowerCase().endsWith('@apolovibes.cl')
                      return (
                        <tr key={u.id} style={{ borderTop: '1px solid var(--surface-3)' }}>
                          <td style={{ padding: '13px 10px', color: 'var(--text-on-bg)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span>{u.nombre_completo || '—'}</span>
                            </div>
                          </td>
                          <td style={{ padding: '13px 10px', color: 'var(--text-on-bg)' }}>{u.email}</td>
                          <CeldaNumero
                            valor={u.productos_comprados}
                            titulo={`${numero(u.pedidos_pagados)} ${Number(u.pedidos_pagados) === 1 ? 'pedido pagado' : 'pedidos pagados'}`}
                          />
                          <CeldaNumero valor={u.cotizaciones_pedidas} />
                          <CeldaNumero valor={u.cotizaciones_aprobadas} color="var(--green, #22c55e)" />
                          <CeldaNumero valor={u.cotizaciones_rechazadas} color="var(--red, #ef4444)" />
                          <td style={{ padding: '13px 10px' }}>
                            <BadgeEstado activo={u.activo} />
                          </td>
                          <td style={{ padding: '13px 10px', textAlign: 'right' }}>
                            {esPropia ? (
                              <span style={{ fontSize: 11.5, color: 'var(--text-on-bg)' }}>Tu cuenta</span>
                            ) : (
                              <div style={{ display: 'inline-flex', gap: 6, justifyContent: 'flex-end' }}>
                                <button
                                  type="button"
                                  onClick={() => toggleEstado(u)}
                                  title={u.activo ? 'Bloquear cuenta' : 'Desbloquear cuenta'}
                                  style={{
                                    padding: '6px 10px', borderRadius: 8, border: '1px solid var(--line)',
                                    background: 'var(--input-bg)', color: 'var(--text-on-bg)', fontSize: 11.5, cursor: 'pointer',
                                  }}
                                >
                                  {u.activo ? 'Bloquear' : 'Desbloquear'}
                                </button>
                                {u.rol === 'admin' ? (
                                  <button
                                    type="button"
                                    onClick={() => cambiarRol(u, 'cliente')}
                                    title="Quitar permisos de administrador"
                                    style={{
                                      padding: '6px 10px', borderRadius: 8, border: '1px solid var(--line)',
                                      background: 'var(--input-bg)', color: 'var(--text-on-bg)', fontSize: 11.5, cursor: 'pointer',
                                    }}
                                  >
                                    Quitar admin
                                  </button>
                                ) : u.rol === 'empleado' ? (
                                  <button
                                    type="button"
                                    onClick={() => cambiarRol(u, 'cliente')}
                                    title="Quitar rol de empleado"
                                    style={{
                                      padding: '6px 10px', borderRadius: 8, border: '1px solid var(--line)',
                                      background: 'var(--input-bg)', color: 'var(--text-on-bg)', fontSize: 11.5, cursor: 'pointer',
                                    }}
                                  >
                                    Quitar empleado
                                  </button>
                                ) : esEmpresa ? (
                                  <button
                                    type="button"
                                    onClick={() => cambiarRol(u, 'empleado')}
                                    title="Otorgar rol de empleado"
                                    style={{
                                      padding: '6px 10px', borderRadius: 8, border: '1px solid var(--line)',
                                      background: 'var(--input-bg)', color: 'var(--text-on-bg)', fontSize: 11.5, cursor: 'pointer',
                                    }}
                                  >
                                    Dar empleado
                                  </button>
                                ) : null}
                                <button
                                  type="button"
                                  onClick={() => { setErrorAlta(null); setUsuarioEliminar(u) }}
                                  title="Eliminar usuario"
                                  aria-label="Eliminar usuario"
                                  style={{
                                    padding: '6px 10px', borderRadius: 8, border: '1px solid var(--line)',
                                    background: 'var(--input-bg)', color: 'var(--red, #ef4444)', fontSize: 11.5, cursor: 'pointer',
                                  }}
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

            </>
          )}

          {filtrados.length > 0 && (
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
                –{Math.min(pagina * filasPorPagina, filtrados.length)} de {filtrados.length}
              </span>
            </div>
          )}
        </>
      )}

      {errorAlta && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,.49)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, backdropFilter: 'blur(4px)',
        }} onClick={() => setErrorAlta(null)}>
          <div style={{
            background: 'var(--surface)', borderRadius: 16, padding: '32px 28px',
            width: '100%', maxWidth: 420, boxShadow: '0 20px 60px rgba(0,0,0,.3)', textAlign: 'center',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 10 }}>
              <AlertTriangle size={32} style={{ color: 'var(--red, #ef4444)' }} />
            </div>
            <h3 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>
              Error
            </h3>
            <p style={{ margin: '0 0 22px', fontSize: 13, color: 'var(--text)' }}>
              {errorAlta}
            </p>
            <button
              type="button"
              onClick={() => setErrorAlta(null)}
              style={{
                width: '100%', padding: '10px 0', borderRadius: 10, border: '1px solid var(--line)',
                background: 'transparent', color: 'var(--text)', fontSize: 13, fontWeight: 500, cursor: 'pointer',
              }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {usuarioEliminar && (
        <ConfirmModal
          titulo="Eliminar usuario"
          mensaje={`¿Seguro que querés eliminar a «${usuarioEliminar.nombre_completo || usuarioEliminar.email}»? Esta acción no se puede deshacer.`}
          textoCancelar="Cancelar"
          textoConfirmar="Eliminar usuario"
          textoCargando="Eliminando…"
          onConfirm={confirmarEliminar}
          onCancel={() => setUsuarioEliminar(null)}
        />
      )}

      <ModalAltaUsuario
        abierto={modalAbierto}
        onCerrar={() => { setModalAbierto(false); setErrorAlta(null) }}
        onGuardar={guardarUsuario}
        guardando={guardando}
        error={errorAlta}
      />
    </>
  )
}