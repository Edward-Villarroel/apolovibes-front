import { apiCotizador } from './api.js'

function numeroFirma(valor, defecto = '10') {
  const texto = valor === null || valor === undefined ? '' : String(valor).trim()
  if (texto === '') return defecto
  const numero = Number(texto.replace(',', '.'))
  if (!Number.isFinite(numero)) return texto
  return String(numero)
}

export function firmaEspecificaciones(form) {
  const colorFinal = form.color === 'Otro' ? form.colorOtro : form.color
  const partes = [
    numeroFirma(form.alto),
    numeroFirma(form.ancho),
    numeroFirma(form.largo),
    (form.unidad || 'cm').trim() || 'cm',
    String(Number(form.cantidad) > 0 ? Number(form.cantidad) : 1),
    (form.uso || 'Decorativo').trim() || 'Decorativo',
    String((form.material || '').trim()),
    (colorFinal || 'Negro').trim() || 'Negro',
  ]
  return partes.join('|')
}

export async function estimarPieza(archivo, form) {
  const fd = new FormData()
  fd.append('imagen', archivo)
  fd.append('alto', form.alto)
  fd.append('ancho', form.ancho)
  fd.append('largo', form.largo)
  fd.append('unidad', form.unidad)
  fd.append('cantidad', form.cantidad)
  fd.append('uso', form.uso)
  fd.append('material_usuario', form.material)
  fd.append('color', form.color === 'Otro' ? form.colorOtro : form.color)

  const resultado = await apiCotizador.estimar(fd)

  const pick = (...nombres) => {
    for (const n of nombres) {
      const v = resultado?.[n]
      if (v !== undefined && v !== null && String(v).trim() !== '') return v
    }
    return undefined
  }
  return { 
     precio_estimado: pick('precio_estimado', 'precio_estimado_ia', 'precio_clp'),
    precio_unitario: pick('precio_unitario', 'precio_unitario_ia', 'precio_unitario_clp'),
    gramos_estimados: pick('gramos_estimados', 'gramos_estimados_ia'),
    tiempo_estimado_horas: pick('tiempo_estimado_horas', 'tiempo_estimado_horas_ia'),
    material_sugerido: pick('material_sugerido', 'material_sugerido_ia', 'material_detectado'),
    complejidad: pick('complejidad', 'complejidad_ia'),
    confianza_material: pick('confianza_material', 'confianza_material_ia'),
    confianza_complejidad: pick('confianza_complejidad', 'confianza_complejidad_ia'),
    firma: firmaEspecificaciones(form),
  }
}
