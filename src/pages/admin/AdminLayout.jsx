import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useTheme } from '../../context/ThemeContext.jsx'
import {
  Menu, LogOut, LayoutDashboard, ClipboardList, Package,
  FileText, ShoppingCart, User, Tag, Users, Sun, Moon, X
} from 'lucide-react'
import ConfirmModal from '../../components/ConfirmModal.jsx'
import '../../styles/admin.css'
import { mediaPath } from '../../utils/media.js'

const navItems = [
  { to: '/admin', end: true, label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/pedidos', label: 'Pedidos', icon: ClipboardList },
  { to: '/admin/usuarios', label: 'Usuarios', icon: Users },
  { to: '/admin/inventario', label: 'Inventario', icon: Package },
  { to: '/admin/cotizaciones', label: 'Cotizaciones', icon: FileText },
  { to: '/admin/venta', label: 'Registrar Venta', icon: ShoppingCart },
  { to: '/admin/reportes', label: 'Reporte Ventas', icon: FileText },
  { to: '/admin/cupones', label: 'Códigos de descuento', icon: Tag },
]

const CREMA = '#FBF7EE'
const LINEA = 'rgba(251,247,238,.35)'

const itemStyle = ({ isActive }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '12px 14px',
  borderRadius: 10,
  fontSize: 15,
  marginBottom: 2,
  color: CREMA,
  background: isActive ? 'var(--surface-3)' : 'transparent',
  fontWeight: isActive ? 600 : 400,
  textDecoration: 'none',
  transition: 'background .15',
})

const sidebarBtnStyle = {
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, width: '100%',
  padding: '12px 14px', borderRadius: 999, fontSize: 14,
  color: '#B60303', background: '#E8F4F8', border: 'none',
  cursor: 'pointer', fontWeight: 600,
}

function SidebarContent({ onLogout, onClose, user, theme, toggleTheme }) {
  const nombreCompleto = [user?.nombre, user?.apellido].filter(Boolean).join(' ') || user?.email || 'Mi cuenta'
  const rolLabel = user?.rol === 'admin' ? 'Admin' : user?.rol || ''

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 10px 18px' }}>
        <Link to="/" onClick={onClose} style={{ display: 'flex', alignItems: 'center' }}>
          <img
            src={mediaPath('nombrelogo2.webp')}
            alt="Apolo Vibes 3D"
            width="512"
            height="171"
            style={{ height: 40, width: 'auto' }}
          />
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Cerrar menú"
            style={{ background: 'none', border: 'none', padding: 0, color: CREMA, cursor: 'pointer', display: 'inline-flex' }}
          >
            <X size={24} />
          </button>
        )}
      </div>

      <div style={{ borderTop: `1px solid ${LINEA}`, marginBottom: 10 }} />

      <nav style={{ flex: 1 }}>
        {navItems.map(({ to, end, label, icon: Icon }) => (
          <NavLink key={to} to={to} end={end} style={itemStyle} onClick={onClose}>
            <Icon size={18} strokeWidth={2} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div style={{ borderTop: `1px solid ${LINEA}`, marginTop: 12, paddingTop: 14 }}>
        <div style={{ padding: '4px 12px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%',
              background: user?.foto ? 'transparent' : 'rgba(255,255,255,.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              border: user?.foto ? 'none' : `1px solid ${CREMA}`,
              overflow: 'hidden',
            }}>
              {user?.foto ? (
                <img src={user.foto} alt={nombreCompleto} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <User size={16} color={CREMA} />
              )}
            </div>
            <div style={{ lineHeight: 1.25, overflow: 'hidden' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: CREMA, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {nombreCompleto}
              </div>
              {rolLabel && (
                <div style={{ fontSize: 12, color: CREMA, opacity: .85 }}>{rolLabel}</div>
              )}
            </div>
          </div>

          <div style={{ marginTop: 10, display: 'flex', justifyContent: 'center' }}>
            <button
              style={{
                width: 34, height: 34, borderRadius: '50%',
                border: '1.5px solid rgba(251,247,238,.3)',
                background: 'rgba(251,247,238,.1)', color: CREMA,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'border-color .2s, background .2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(251,247,238,.6)'; e.currentTarget.style.background = 'rgba(251,247,238,.15)' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(251,247,238,.3)'; e.currentTarget.style.background = 'rgba(251,247,238,.1)' }}
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
              title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </div>
      </div>

      <div style={{ borderTop: `1px solid ${LINEA}`, marginTop: 12, paddingTop: 14 }}>
        <div style={{ padding: '4px 12px 12px' }}>
          <button style={sidebarBtnStyle} onClick={onLogout}>
            <LogOut size={16} />
            Cerrar sesión
          </button>
        </div>
      </div>
    </>
  )
}

function MobileSidebarContent({ onLogout, onClose, user, theme, toggleTheme }) {
  const nombreCompleto = [user?.nombre, user?.apellido].filter(Boolean).join(' ') || user?.email || 'Mi cuenta'
  const rolLabel = user?.rol === 'admin' ? 'Admin' : user?.rol || ''

  return (
    <>
      <div className="am-header">
        <div className="am-user">
          <div className="am-avatar">
            {user?.foto
              ? <img src={user.foto} alt={nombreCompleto} />
              : <User size={20} />}
          </div>
          <div className="am-user-text">
            <span className="am-user-name">{nombreCompleto}</span>
            {rolLabel && <span className="am-user-role">{rolLabel}</span>}
          </div>
        </div>
        <button className="am-close" onClick={onClose} aria-label="Cerrar menú">
          <X size={24} />
        </button>
      </div>

      <div className="am-section">
        <div className="am-title">Administración</div>
        {navItems.map(({ to, end, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onClose}
            className={({ isActive }) => `am-item${isActive ? ' active' : ''}`}
          >
            <Icon size={18} strokeWidth={2} />
            {label}
          </NavLink>
        ))}
      </div>

      <div className="am-section">
        <button className="am-item" onClick={toggleTheme}>
          {theme === 'dark'
            ? <><Sun size={18} /> Modo claro</>
            : <><Moon size={18} /> Modo oscuro</>}
        </button>
      </div>

      <div className="am-section am-section--pad">
        <button className="am-logout" onClick={onLogout}>
          <LogOut size={16} />
          Cerrar sesión
        </button>
      </div>

      <div className="am-footer">
        <Link to="/" onClick={onClose}>
          <img
            src={mediaPath('nombrelogo2.webp')}
            alt="Apolo Vibes 3D"
            width="512"
            height="171"
          />
        </Link>
      </div>
    </>
  )
}


export default function AdminLayout() {
  const [showConfirm, setShowConfirm] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()

  const handleLogout = async () => {
    try {
      await logout()
    } finally {
      setShowConfirm(false)
      setSidebarOpen(false)
      navigate('/')
    }
  }

  return (
    <div className="admin-layout">
      {/* Desktop sidebar */}
      <aside className="hide-mobile" style={{
        background: 'var(--accent)', borderRight: '1px solid var(--line)',
        padding: '24px 18px', display: 'flex', flexDirection: 'column',
      }}>
        <SidebarContent onLogout={() => setShowConfirm(true)} user={user} theme={theme} toggleTheme={toggleTheme} />
      </aside>

      {/* Mobile sidebar overlay */}
      <div
        className={`admin-sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />
      <aside
        className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}
        style={{ background: 'var(--accent)', borderRight: '1px solid var(--line)', flexDirection: 'column' }}
      >
        <MobileSidebarContent
          onLogout={() => setShowConfirm(true)}
          onClose={() => setSidebarOpen(false)}
          user={user}
          theme={theme}
          toggleTheme={toggleTheme}
        />
      </aside>

      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <header className="admin-mobile-header">
          <button
            className="admin-mobile-hamburger"
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menú"
          >
            <Menu size={24} />
          </button>

          <Link to="/" className="admin-mobile-logo">
            <img
              src={mediaPath('nombrelogo2.webp')}
              alt="Apolo Vibes"
              width="512"
              height="171"
              style={{ height: 40, width: 'auto' }}
            />
          </Link>

          <button
            className="admin-mobile-theme"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </header>

        <main className="admin-main">
          <Outlet />
        </main>
      </div>

      {showConfirm && (
        <ConfirmModal
          onConfirm={handleLogout}
          onCancel={() => setShowConfirm(false)}
          mensaje="Vas a salir del panel de administración. ¿Seguro?"
        />
      )}

      <style>{`
  .admin-mobile-header { display: none; }

  @media (max-width: 900px) {
    .admin-mobile-header {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      align-items: center;
      position: sticky;
      top: 0;
      z-index: 50;
      padding: 12px 16px;
      background: rgba(250,127,25,1);
      border-bottom: 1px solid rgba(30,58,95,.15);
      color: #FBF7EE;
    }
    .admin-mobile-hamburger {
      justify-self: start;
      display: inline-flex;
      background: none;
      border: none;
      padding: 0;
      color: #FBF7EE;
      cursor: pointer;
    }
    .admin-mobile-logo {
      display: flex;
      align-items: center;
      justify-self: center;
    }
    .admin-mobile-theme {
      justify-self: end;
      width: 34px;
      height: 34px;
      border-radius: 50%;
      border: 1.5px solid rgba(251,247,238,.3);
      background: rgba(251,247,238,.1);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #FBF7EE;
      cursor: pointer;
    }
  }
`}</style>
    </div >
  )
}
