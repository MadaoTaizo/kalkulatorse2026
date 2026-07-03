export class Charts {
  constructor(modules) {
    this.modules = modules;
  }

  initDashboardCharts() {
    const charts = document.querySelectorAll('[data-chart]');
    charts.forEach((chartEl) => {
      const type = chartEl.dataset.chart;
      if (type === 'bar') {
        const canvas = chartEl.querySelector('canvas');
        if (canvas && window.Chart) {
          new window.Chart(canvas, {
            type: 'bar',
            data: {
              labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun'],
              datasets: [{
                label: 'Nilai',
                data: [10, 20, 15, 25, 18, 30],
                backgroundColor: '#2563eb'
              }]
            },
            options: { responsive: true, maintainAspectRatio: false }
          });
        }
      }
    });
  }
}
