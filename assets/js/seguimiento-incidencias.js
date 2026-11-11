// Historiales ficticios y estables para las incidencias de demostración existentes.
// No representan actualizaciones del municipio ni se persisten en localStorage.
const actualizacionesPorId = {
  7: { inicio: '2026-10-29', tareas: 'La cuadrilla comenzó el fresado y la nivelación de la calzada en Av. Intendente Ratti 1200.' },
  8: { inicio: '2026-10-30', tareas: 'El equipo de arbolado inició la poda correctiva y la señalización preventiva en Zuilbarchero 520.' },
  9: { inicio: '2026-10-31', tareas: 'El equipo eléctrico comenzó el reemplazo de las líneas subterráneas en Olazábal 1100.' },
  10: { inicio: '2026-10-26', tareas: 'Los técnicos iniciaron el recambio de la placa controladora del semáforo en Av. Santa Rosa y Lavalle.' },
  11: { inicio: '2026-10-27', tareas: 'La cuadrilla inició la nivelación de la tapa de inspección y el sellado del hormigón en Defilippi 1420.' },
  12: { inicio: '2026-10-28', tareas: 'El equipo de arbolado comenzó el corte de las ramas que obstruyen la luminaria en Pirán 340.' },
  13: { inicio: '2026-10-16', fin: '2026-10-18', tareas: 'La cuadrilla comenzó el bacheo en caliente y el sellado del pavimento en Martín Fierro 3100.', resultado: 'Se completó el sellado del asfalto y se habilitó el carril al tránsito.' },
  14: { inicio: '2026-10-19', fin: '2026-10-21', tareas: 'El equipo de iluminación inició el recambio del artefacto por una luminaria LED en Alvear 920.', resultado: 'Se instaló la luminaria LED y se verificó su correcto encendido y funcionamiento.' },
  15: { inicio: '2026-10-21', fin: '2026-10-23', tareas: 'La cuadrilla de arbolado comenzó el corte y retiro del árbol caído en Juncal 1250.', resultado: 'Se retiraron los troncos y las ramas y se despejó la vereda para el paso peatonal.' },
  16: { inicio: '2026-10-22', fin: '2026-10-24', tareas: 'El equipo vial inició la preparación de la calzada y la demarcación de la senda en Las Heras 400.', resultado: 'Se completó la pintura de la senda peatonal y de la línea de frenado.' },
  17: { inicio: '2026-10-23', fin: '2026-10-25', tareas: 'La cuadrilla comenzó la reconstrucción del pavimento de la esquina de Av. Ratti y Grecia.', resultado: 'Se completó el bacheo asfáltico y se restituyó la circulación en la esquina.' },
  18: { inicio: '2026-10-24', fin: '2026-10-26', tareas: 'Los técnicos iniciaron el enderezamiento y la revisión eléctrica de la columna en República del Salvador 500.', resultado: 'Se aseguró la columna de iluminación y se verificó el funcionamiento eléctrico.' },
  19: { inicio: '2026-10-25', fin: '2026-10-27', tareas: 'El equipo de mantenimiento comenzó la recolección y el triturado de restos de poda en Bacacay 780.', resultado: 'Se retiraron los restos verdes y se dejó despejada la vereda.' },
  20: { inicio: '2026-10-25', fin: '2026-10-28', tareas: 'La cuadrilla inició el encofrado y el hormigonado del cordón cuneta en Viamonte 1550.', resultado: 'Se completó el cordón cuneta y se verificó la terminación del hormigón.' }
};

export function obtenerSeguimiento(reporte, ahora = new Date()) {
  const partes = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(reporte.fecha || '');
  if (!partes) return [];
  const fecha = `${partes[3]}-${partes[2]}-${partes[1]}`;
  const hoy = new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Argentina/Buenos_Aires' }).format(ahora);
  if (!Number.isFinite(Date.parse(fecha)) || fecha > hoy) return [];
  const historial = [{ etapa: 'recibido', titulo: 'Reporte recibido', fecha, icono: 'check', descripcion: 'El reporte fue registrado correctamente en la plataforma' }];
  const datos = actualizacionesPorId[reporte.id];
  if (!datos || !['en_proceso', 'finalizado'].includes(reporte.estado)) return historial;
  if (datos.inicio > fecha && datos.inicio <= hoy) {
    historial.push({ etapa: 'iniciado', titulo: 'Trabajos iniciados', fecha: datos.inicio, icono: 'wrench', descripcion: datos.tareas });
    if (reporte.estado === 'finalizado' && datos.fin > datos.inicio && datos.fin <= hoy) {
      historial.push({ etapa: 'finalizado', titulo: 'Intervención finalizada', fecha: datos.fin, icono: 'flag-checkered', descripcion: datos.resultado });
    }
  }
  return historial;
}
