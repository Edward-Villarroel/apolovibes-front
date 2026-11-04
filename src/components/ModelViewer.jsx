import { useTheme } from '../context/ThemeContext.jsx'
import { mediaPath } from '../utils/media.js'

const CONTENIDO = {
  validando: {
    imagen: null,
    titulo: "Validando imagen...",
    subtitulo: 'Estamos revisando que el archivo sea seguro.'
  },
  valida: {
    imagen: 'exito.webp',
    titulo: "Imagen verificada exitosamente.",
    subtitulo: 'Superó nuestras revisiones de seguridad. Puedes continuar con tu cotización.'
  },
  invalida: {
    imagen: 'sinproductos.webp',
    titulo: "Esta imagen no pasó la validación.",
    subtitulo: 'Por seguridad solo aceptamos imágenes verificadas. Prueba con otra.'
  },
}

export default function ModelViewer({ estado = 'validando', height = 400 }) {
  const { theme } = useTheme()
  const esOscuro = theme === 'dark'
  const contenido = CONTENIDO[estado]

  if (!contenido) return null

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        width: '100%',
        height,
        borderRadius: 12,
        overflow: 'auto',
        boxSizing: 'border-box',
        padding: 16,
        display: 'flex',
        border: '1px solid var(--line)',
        background: esOscuro ? 'var(--surface)' : 'var(--input-bg)',
      }}
    >
      <div
        style={{
          margin: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
          maxWidth: 300,
          textAlign: 'center',
        }}
      >
        {estado === 'validando' ? (
          <div
            aria-hidden="true"
            style={{
              width: 32,
              height: 32,
              marginBottom: 4,
              border: '3px solid transparent',
              borderTopColor: '#E8863E',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
          />
        ) : (
          <img
            src={mediaPath(contenido.imagen)}
            alt=""
            loading="lazy"
            decoding="async"
            width="512"
            height="512"
            style={{ display: 'block', height: 100, width: 'auto', maxWidth: '100%', flexShrink: 0 }}
          />
        )}
        <p style={{ fontSize: 13, color: 'var(--text-dim)', margin: 0, textAlign: 'center' }}>
          {contenido.titulo}
        </p>
        <p style={{ fontSize: 12, color: 'var(--text-dim)', margin: 0, textAlign: 'center' }}>
          {contenido.subtitulo}
        </p>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
