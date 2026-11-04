import { apiCotizador } from './api.js'

/**
 * Pide al backend que valide una imagen de referencia antes de enviarla.
 *
 * El endpoint revisa tipo real del archivo (JPG/PNG/WebP), contenido incrustado
 * sospechoso y que la imagen no esté corrupta. Lanza un Error con el mensaje del
 * backend cuando la imagen no pasa la validación.
 */
export async function validarImagenSegura(archivo, onProgress) {
  onProgress?.({ status: 'uploading', percent: 20, message: 'Subiendo imagen...' })

  const formData = new FormData()
  formData.append('imagen', archivo)

  onProgress?.({ status: 'processing', percent: 60, message: 'Buscando contenido no permitido...' })
  await apiCotizador.validarImagen(formData)

  onProgress?.({ status: 'completed', percent: 100, message: 'La imagen es segura.' })
}
