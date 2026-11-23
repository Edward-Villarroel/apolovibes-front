import { useNavigate } from 'react-router-dom'
import { mediaPath } from '../utils/media.js'


const COLOR_FONDO_404 = '#faf9f7'
const MASCARA_BORDES = [
  'linear-gradient(to right, transparent 0, #000 6%, #000 94%, transparent 100%)',
  'linear-gradient(to bottom, transparent 0, #000 6%, #000 94%, transparent 100%)',
].join(', ')


const ESTILOS_404 = `
  .nf-marco {
    position: relative;
    width: min(100%, 87vh);
    aspect-ratio: 3 / 2;
  }

  .nf-img {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: contain;
  }

  .nf-acciones {
    position: absolute;
    right: 5%;
    bottom: 8%;
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .nf-inicio {
    position: absolute;
    left: 79%;
    top: 76%;
    transform: translate(-50%, -50%);
  }

  @media (max-width: 768px) {
    .nf-marco {
      width: 100%;
      max-width: 560px;
      aspect-ratio: auto;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 24px;
    }

    .nf-img {
      height: auto;
      aspect-ratio: 3 / 2;
    }

    .nf-acciones {
      position: static;
      flex-direction: column;
      flex-wrap: nowrap;
      width: 100%;
      max-width: 320px;
    }

    .nf-acciones button,
    .nf-inicio {
      width: 100%;
      min-height: 44px;
    }

    .nf-inicio {
      position: static;
      transform: none;
      max-width: 320px;
    }
  }
`

function ContenidoNotFound() {
  const navegar = useNavigate()

  return (
    <div
      style={{
        width: '100%',
        flex: 1,
        marginBottom: '-60px',
        minHeight: '58vh',
        backgroundColor: COLOR_FONDO_404,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <style>{ESTILOS_404}</style>

      <div className="nf-marco">
        <img
          className="nf-img"
          src={mediaPath('404.webp')}
          alt="Error 404: esta página no existe"
          loading="lazy"
          decoding="async"
          style={{
            WebkitMaskImage: MASCARA_BORDES,
            maskImage: MASCARA_BORDES,
            WebkitMaskComposite: 'source-in',
            maskComposite: 'intersect',
          }}
        />
        <button
          type="button"
          className="nf-inicio"
          onClick={() => navegar('/', { replace: true })}
          style={{
            background: 'var(--accent)',
            color: 'var(--text)',
            border: 'none',
            borderRadius: 10,
            padding: '10px 22px',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'opacity .2s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.85' }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
        >
          Volver al inicio
        </button>
      </div>
    </div>
  )
}

function PantallaCompletaNotFound() {
  return (
    <div
      style={{
        backgroundColor: COLOR_FONDO_404,
        width: '100%',
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
      }}
    >
      <style>{ESTILOS_404}</style>

      <div className="nf-marco">
        <img
          className="nf-img"
          src={mediaPath('404.webp')}
          alt="Error 404: esta página no existe"
          loading="eager"
          decoding="async"
          style={{
            WebkitMaskImage: MASCARA_BORDES,
            maskImage: MASCARA_BORDES,
            WebkitMaskComposite: 'source-in',
            maskComposite: 'intersect',
          }}
        />
        <div className="nf-acciones">
          <button
            type="button"
            onClick={() => window.location.assign(import.meta.env.BASE_URL)}
            style={{
              background: 'var(--accent)',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              padding: '10px 22px',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'opacity .2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.85' }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
          >
            Volver al inicio
          </button>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              background: 'none',
              color: '#5A6B7D',
              border: '1px solid #5A6B7D',
              borderRadius: 10,
              padding: '10px 22px',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'border-color .2s, color .2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent)'
              e.currentTarget.style.color = 'var(--accent)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#5A6B7D'
              e.currentTarget.style.color = '#5A6B7D'
            }}
          >
            Recargar la página
          </button>
        </div>
      </div>
    </div>
  )
}

export default function NotFound({ completo = false }) {
  return completo ? <PantallaCompletaNotFound /> : <ContenidoNotFound />
}