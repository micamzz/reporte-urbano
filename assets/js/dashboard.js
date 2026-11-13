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