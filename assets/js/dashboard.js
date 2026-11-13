import { cargarComponentesModulares } from './utils/include.js';
import { actualizarBotonHeader } from './auth.js';
import { obtenerReportes } from './reportes.js';

document.addEventListener('DOMContentLoaded', async () => {
  await cargarComponentesModulares();
  actualizarBotonHeader();

  const reportes = obtenerReportes();
  
  // KPIs
  const finalizados = reportes.filter(r => r.estado === 'finalizado').length;
  const enProceso = reportes.filter(r => r.estado === 'en_proceso').length;
  document.getElementById('kpiTotal').textContent = reportes.length;
  document.getElementById('kpiResueltos').textContent = finalizados;
  document.getElementById('kpiProceso').textContent = enProceso;

  // Datos Categorías
  const conteoCategorias = reportes.reduce((acc, r) => {
    acc[r.categoria] = (acc[r.categoria] || 0) + 1;
    return acc;
  }, {});

  // Gráfico Doughnut (Categorías)
  new Chart(document.getElementById('graficoCategorias'), {
    type: 'doughnut',
    data: {
      labels: ['Baches', 'Luminarias', 'Arbolado', 'Tránsito'],
      datasets: [{
        data: [
          conteoCategorias['bache'] || 0, 
          conteoCategorias['luminaria'] || 0, 
          conteoCategorias['arbolado'] || 0, 
          conteoCategorias['transito'] || 0
        ],
        backgroundColor: ['#007bbf', '#f59e0b', '#10b981', '#ef4444'],
        borderWidth: 0
      }]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });

  // LÓGICA DE DESCARGA DE DATOS ABIERTOS (CSV)
  const btnDescargarCsv = document.getElementById('btnDescargarCsv');
  if (btnDescargarCsv) {
    btnDescargarCsv.addEventListener('click', () => {
      if (!reportes.length) {
        alert('No hay datos disponibles para descargar.');
        return;
      }
      
      // 1. Armar las cabeceras de las columnas
      let contenidoCsv = "ID,Fecha_Reporte,Categoria,Estado,Titulo,Direccion,Latitud,Longitud\n";
      
      // 2. Iterar sobre los reportes y armar las filas
      reportes.forEach(r => {
        // Escapamos las comas en los textos para no romper el formato CSV
        const tituloLimpio = `"${(r.titulo || '').replace(/"/g, '""')}"`;
        const direccionLimpia = `"${(r.direccion || '').replace(/"/g, '""')}"`;
        
        const fila = `${r.id},${r.fecha},${r.categoria},${r.estado},${tituloLimpio},${direccionLimpia},${r.lat},${r.lng}`;
        contenidoCsv += fila + "\n";
      });
      
      // 3. Crear el archivo virtual (Blob) y forzar la descarga
      const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), contenidoCsv], { type: 'text/csv;charset=utf-8;' }); // El Uint8Array fuerza a que Excel lea bien los acentos (BOM)
      const urlDestino = URL.createObjectURL(blob);
      
      const enlaceDescarga = document.createElement("a");
      enlaceDescarga.href = urlDestino;
      enlaceDescarga.download = "reporte_urbano_ituzaingo_dataset.csv";
      
      document.body.appendChild(enlaceDescarga);
      enlaceDescarga.click();
      document.body.removeChild(enlaceDescarga);
      URL.revokeObjectURL(urlDestino);
    });
  }

  // Gráfico de Barras (Estados)
  new Chart(document.getElementById('graficoEstados'), {
    type: 'bar',
    data: {
      labels: ['Reportado', 'En Proceso', 'Finalizado'],
      datasets: [{
        label: 'Volumen',
        data: [
          reportes.filter(r => r.estado === 'reportado').length,
          enProceso,
          finalizados
        ],
        backgroundColor: ['#ef4444', '#f59e0b', '#10b981'],
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
    }
  });
});

