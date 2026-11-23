import { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useCart } from '../context/CartContext.jsx'
import { mediaPath } from '../utils/media.js'

export default function RutaCliente({ children }) {
    const { isLoggedIn, isAdmin, isEmpleado } = useAuth()
    const { abrirLogin } = useCart()

    useEffect(() => {
        if (!isLoggedIn) abrirLogin()
    }, [isLoggedIn])

    if (isAdmin) return <Navigate to="/admin" replace />
    if (isEmpleado) return <Navigate to="/admin/venta" replace />
    if (isLoggedIn) return children

    return (
        <section className="wrap" 
        style={{ padding: '100px 20px', textAlign: 'center', maxWidth: 480, margin: '0 auto' }}
        >
            <img 
            src={mediaPath('sinproductos.webp')}
            alt=""
            loading="lazy"
            decoding="async"
            width="512"
            height="512"
            style={{ display: 'block', height: 100, textAlign: 'center', width: 'auto', margin: '0 auto 20px' }}
            />
            <p style={{ color: 'var(--text-dim)', marginBottom: 20, lineHeight: 1.6 }}>
                Debes iniciar sesión para realizar una cotización. 
                Si no tienes una cuenta puedes crearte una cuenta o iniciar con tu cuenta google. 
            </p>
            <button
                className="btn btn-primary"
                onClick={abrirLogin}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
            >
                 Ingresar
            </button>
        </section>
    )
}