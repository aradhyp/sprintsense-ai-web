let burndownChart;

function initChart() {
    const ctx = document.getElementById('burndownChart').getContext('2d');
    
    Chart.defaults.color = '#94a3b8';
    Chart.defaults.font.family = 'Inter';

    burndownChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Day 1', 'Day 3', 'Day 6', 'Day 9', 'Day 12', 'Day 14'],
            datasets: [
                {
                    label: 'Ideal Burn',
                    data: [30, 24, 16, 10, 4, 0],
                    borderColor: '#334155',
                    borderDash: [5, 5],
                    tension: 0,
                    pointRadius: 0
                },
                {
                    label: 'AI Projected Burn (Factoring DORA)',
                    data: [30, 25, 20, 15, 10, 5],
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    fill: true,
                    tension: 0.3,
                    borderWidth: 3,
                    pointBackgroundColor: '#0f172a',
                    pointBorderColor: '#3b82f6',
                    pointBorderWidth: 2,
                    pointRadius: 4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'top', labels: { usePointStyle: true } } },
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' } },
                x: { grid: { display: false } }
            }
        }
    });
}

function updateAnalytics() {
    // 1. Get Inputs
    const cfr = parseFloat(document.getElementById('cfr').value);
    const mttr = parseFloat(document.getElementById('mttr').value);
    const teamSize = parseInt(document.getElementById('teamSize').value);

    // Update UI Labels
    document.getElementById('cfrVal').textContent = `${cfr}%`;
    document.getElementById('mttrVal').textContent = `${mttr} hrs`;
    document.getElementById('teamVal').textContent = teamSize;

    // 2. Core Math: DORA to Agile Translation
    const baseCapacity = teamSize * 5; // Assumption: 5 points per dev per sprint
    
    // Drag Coefficient: High CFR + High MTTR creates compounding drag
    const dragCoefficient = 1 + ((cfr / 100) * (mttr / 10));
    const effectiveCapacity = Math.max(1, Math.round(baseCapacity / dragCoefficient));

    document.getElementById('dragCo').textContent = `${dragCoefficient.toFixed(2)}x`;
    document.getElementById('effectiveCap').textContent = effectiveCapacity;

    // 3. Update DORA Badge Status
    const badge = document.getElementById('doraBadge');
    if (cfr < 10 && mttr <= 2) {
        badge.className = "bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 px-4 py-2 rounded-full font-bold text-sm";
        badge.textContent = "ELITE PERFORMER";
    } else if (cfr < 20 && mttr <= 8) {
        badge.className = "bg-blue-500/20 text-blue-400 border border-blue-500/50 px-4 py-2 rounded-full font-bold text-sm";
        badge.textContent = "HIGH PERFORMER";
    } else if (cfr < 35 && mttr <= 24) {
        badge.className = "bg-amber-500/20 text-amber-400 border border-amber-500/50 px-4 py-2 rounded-full font-bold text-sm";
        badge.textContent = "MEDIUM PERFORMER";
    } else {
        badge.className = "bg-rose-500/20 text-rose-400 border border-rose-500/50 px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2";
        badge.innerHTML = "⚠️ LOW PERFORMER (HIGH RISK)";
    }

    // 4. Update Burndown Chart
    if(burndownChart) {
        // Ideal burn straight line
        burndownChart.data.datasets[0].data = [baseCapacity, baseCapacity*0.8, baseCapacity*0.5, baseCapacity*0.3, baseCapacity*0.1, 0];
        
        // Projected burn flattening out based on drag
        let projected = [baseCapacity];
        let currentPoints = baseCapacity;
        let burnRate = effectiveCapacity / 5; // divided across the 5 points of the chart
        
        for(let i=1; i<=5; i++) {
            currentPoints = Math.max(0, currentPoints - burnRate);
            projected.push(Math.round(currentPoints));
        }
        
        // Color chart red if they will miss the sprint goal by a lot
        if (projected[5] > (baseCapacity * 0.2)) {
            burndownChart.data.datasets[1].borderColor = '#f43f5e'; // Rose
            burndownChart.data.datasets[1].backgroundColor = 'rgba(244, 63, 94, 0.1)';
        } else {
            burndownChart.data.datasets[1].borderColor = '#3b82f6'; // Blue
            burndownChart.data.datasets[1].backgroundColor = 'rgba(59, 130, 246, 0.1)';
        }

        burndownChart.data.datasets[1].data = projected;
        burndownChart.update();
    }

    // 5. Update Gantt Timeline (Visualizing delays)
    // Base widths: 25%, 35%, 25%
    const scale = Math.min(1.5, dragCoefficient); // Cap visual scaling at 1.5x so it doesn't break the UI
    
    document.getElementById('epic1').style.width = `${25 * scale}%`;
    document.getElementById('epic2').style.left = `${25 * scale}%`;
    document.getElementById('epic2').style.width = `${35 * scale}%`;
    document.getElementById('epic3').style.left = `${(25 * scale) + (35 * scale)}%`;
    document.getElementById('epic3').style.width = `${25 * scale}%`;
}

// Event Listeners
document.querySelectorAll('input[type=range]').forEach(input => {
    input.addEventListener('input', updateAnalytics);
});

// Boot up
window.onload = () => {
    initChart();
    updateAnalytics();
};
