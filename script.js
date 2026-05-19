let backlog = [];
let featureCounter = 101;

// UI Elements mapping for live slider values
const updateSliderValue = (sliderId, displayId) => {
    document.getElementById(sliderId).addEventListener('input', (e) => {
        let val = e.target.value;
        if(sliderId === 'confidence') val += '%';
        document.getElementById(displayId).textContent = val;
    });
};

updateSliderValue('confidence', 'confValue');
updateSliderValue('userValue', 'uvValue');
updateSliderValue('timeCrit', 'tcValue');
updateSliderValue('riskRed', 'rrValue');
updateSliderValue('effort', 'effortValue');

function mapToFibonacci(effort) {
    if (effort <= 2) return 1;
    if (effort <= 4) return 3;
    if (effort <= 6) return 5;
    if (effort <= 8) return 8;
    return 13;
}

document.getElementById('featureForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const title = document.getElementById('title').value;
    const reach = parseFloat(document.getElementById('reach').value);
    const impact = parseFloat(document.getElementById('impact').value);
    const confidence = parseFloat(document.getElementById('confidence').value) / 100;
    
    const uv = parseFloat(document.getElementById('userValue').value);
    const tc = parseFloat(document.getElementById('timeCrit').value);
    const rr = parseFloat(document.getElementById('riskRed').value);
    const effort = parseFloat(document.getElementById('effort').value);

    // Calculations
    const jobSize = effort;
    const riceScore = (reach * impact * confidence) / jobSize;
    const wsjfScore = (uv + tc + rr) / jobSize;
    const storyPoints = mapToFibonacci(jobSize);

    const feature = {
        id: `F-${featureCounter++}`,
        title: title,
        wsjf: parseFloat(wsjfScore.toFixed(2)),
        rice: parseFloat(riceScore.toFixed(1)),
        points: storyPoints
    };

    backlog.push(feature);
    document.getElementById('featureForm').reset();
    
    // Reset displays
    document.getElementById('confValue').textContent = '80%';
    document.getElementById('uvValue').textContent = '5';
    document.getElementById('tcValue').textContent = '5';
    document.getElementById('rrValue').textContent = '5';
    document.getElementById('effortValue').textContent = '5';

    renderTable();
});

function deleteFeature(id) {
    backlog = backlog.filter(f => f.id !== id);
    renderTable();
}

function renderTable(sortBy = 'wsjf') {
    const tbody = document.getElementById('backlogTable');
    
    if (backlog.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center py-8 text-slate-400">No features added yet. Use the form to baseline features.</td></tr>';
        document.getElementById('totalPoints').textContent = '0';
        return;
    }

    // Sorting
    if (sortBy === 'wsjf') {
        backlog.sort((a, b) => b.wsjf - a.wsjf);
    } else {
        backlog.sort((a, b) => b.rice - a.rice);
    }

    tbody.innerHTML = '';
    let totalPts = 0;

    backlog.forEach((f, index) => {
        totalPts += f.points;
        const tr = document.createElement('tr');
        tr.className = 'border-b border-slate-100 hover:bg-slate-50 transition';
        
        let priorityBadge = index === 0 ? `<span class="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-bold ring-1 ring-blue-300">#1</span>` : `<span class="text-slate-500 font-medium">#${index + 1}</span>`;

        tr.innerHTML = `
            <td class="py-3 px-4">${priorityBadge}</td>
            <td class="py-3 px-4 font-medium text-slate-800">${f.id}: ${f.title}</td>
            <td class="py-3 px-4 font-mono font-medium text-blue-600">${f.wsjf}</td>
            <td class="py-3 px-4 font-mono font-medium text-emerald-600">${f.rice}</td>
            <td class="py-3 px-4">
                <span class="bg-slate-100 border border-slate-200 px-3 py-1 rounded-full font-bold text-slate-700 text-xs">${f.points} SP</span>
            </td>
            <td class="py-3 px-4 text-right">
                <button onclick="deleteFeature('${f.id}')" class="text-red-400 hover:text-red-600 text-sm font-medium transition">Remove</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    document.getElementById('totalPoints').textContent = totalPts;
}

document.getElementById('sortWSJF').addEventListener('click', () => renderTable('wsjf'));
document.getElementById('sortRICE').addEventListener('click', () => renderTable('rice'));
