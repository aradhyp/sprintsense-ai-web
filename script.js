let backlog = [];
let featureCounter = 101;

// Core Agentic Math
function calculateAgenticPoints(baseEffort, stackMult, riskMult) {
    const rawScore = baseEffort * stackMult * riskMult;
    const fibSequence = [1, 2, 3, 5, 8, 13, 21, 34, 55];
    return fibSequence.reduce((prev, curr) => {
        return (Math.abs(curr - rawScore) < Math.abs(prev - rawScore) ? curr : prev);
    });
}

// Live Preview Updater
function updateLivePreview() {
    const base = parseFloat(document.getElementById('effort').value);
    const stack = parseFloat(document.getElementById('techStack').value);
    const risk = parseFloat(document.getElementById('risk').value);
    
    document.getElementById('effortValue').textContent = base;
    
    const finalPoints = calculateAgenticPoints(base, stack, risk);
    document.getElementById('livePoints').textContent = finalPoints;
    
    // Dynamic color coding for preview box based on size
    const previewBox = document.getElementById('livePoints').parentElement.parentElement;
    if(finalPoints >= 13) {
        previewBox.className = "flex justify-between items-end p-4 rounded-xl mt-4 bg-rose-900 border border-rose-700 shadow-inner";
        document.getElementById('liveMath').className = "text-xs text-rose-300 font-mono mt-1";
    } else if(finalPoints >= 8) {
        previewBox.className = "flex justify-between items-end p-4 rounded-xl mt-4 bg-amber-900 border border-amber-700 shadow-inner";
        document.getElementById('liveMath').className = "text-xs text-amber-300 font-mono mt-1";
    } else {
        previewBox.className = "flex justify-between items-end p-4 rounded-xl mt-4 bg-indigo-900 border border-indigo-700 shadow-inner";
        document.getElementById('liveMath').className = "text-xs text-emerald-400 font-mono mt-1";
    }
    
    document.getElementById('liveMath').textContent = `${base} × ${stack} × ${risk}`;
}

// Attach event listeners for real-time updates
['effort', 'techStack', 'risk'].forEach(id => {
    document.getElementById(id).addEventListener('input', updateLivePreview);
});

// Calculate and render Sprint Capacity Dashboard
function updateDashboard() {
    const teamSize = parseInt(document.getElementById('teamSize').value) || 1;
    const capacityMax = teamSize * 5; // 5 points per dev per sprint
    document.getElementById('capacityMax').textContent = capacityMax;
    
    const totalCommitted = backlog.reduce((sum, f) => sum + f.points, 0);
    document.getElementById('totalPoints').textContent = totalCommitted;
    
    const percentFill = Math.min((totalCommitted / capacityMax) * 100, 100);
    const bar = document.getElementById('capacityBar');
    bar.style.width = `${percentFill}%`;
    
    const warningText = document.getElementById('capacityWarning');
    
    if (percentFill < 60) {
        bar.className = "h-2.5 rounded-full transition-all duration-500 ease-out bg-emerald-500";
        warningText.innerHTML = "🟢 Team has ample capacity.";
    } else if (percentFill <= 90) {
        bar.className = "h-2.5 rounded-full transition-all duration-500 ease-out bg-amber-500";
        warningText.innerHTML = "🟡 Approaching optimal sprint load.";
    } else {
        bar.className = "h-2.5 rounded-full transition-all duration-500 ease-out bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]";
        warningText.innerHTML = "🔴 <strong>Warning:</strong> Capacity critical. Risk of rollover.";
    }

    document.getElementById('featureCount').textContent = `${backlog.length} Features`;
    
    if(backlog.length > 0) {
        document.getElementById('topRice').textContent = backlog[0].rice;
    } else {
        document.getElementById('topRice').textContent = "0.0";
    }
}

// Update Capacity when team size changes
document.getElementById('teamSize').addEventListener('input', updateDashboard);

// Form Submission
document.getElementById('featureForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const title = document.getElementById('title').value;
    const base = parseFloat(document.getElementById('effort').value);
    const stack = parseFloat(document.getElementById('techStack').value);
    const risk = parseFloat(document.getElementById('risk').value);
    
    // Simulate RICE based on general input (to simplify UI for demo)
    // Assume high RICE for low effort, lower RICE for high effort to show dynamic sorting
    const agenticPoints = calculateAgenticPoints(base, stack, risk);
    const simulatedRice = parseFloat(((Math.random() * 50 + 50) / agenticPoints * 10).toFixed(1)); 

    const feature = {
        id: `F-${featureCounter++}`,
        title: title,
        rice: simulatedRice,
        points: agenticPoints,
        techLabel: document.getElementById('techStack').options[document.getElementById('techStack').selectedIndex].text.split(' ')[0]
    };

    backlog.push(feature);
    
    // Reset Form gently (keep sliders)
    document.getElementById('title').value = '';
    document.getElementById('title').focus();
    
    renderTable();
    updateDashboard();
});

function deleteFeature(id) {
    backlog = backlog.filter(f => f.id !== id);
    renderTable();
    updateDashboard();
}

function getPointBadgeClass(points) {
    if (points >= 13) return "bg-rose-100 text-rose-700 border-rose-200";
    if (points >= 8) return "bg-amber-100 text-amber-700 border-amber-200";
    return "bg-emerald-100 text-emerald-700 border-emerald-200";
}

function renderTable() {
    const tbody = document.getElementById('backlogTable');
    
    if (backlog.length === 0) {
        tbody.innerHTML = `
            <tr id="emptyState">
                <td colspan="5" class="text-center py-16">
                    <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 mb-4 border border-slate-100 shadow-sm">
                        <svg class="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
                    </div>
                    <p class="text-slate-500 font-medium text-base">No features baselined yet.</p>
                    <p class="text-slate-400 text-xs mt-1">Configure inputs on the left to activate the agent.</p>
                </td>
            </tr>`;
        return;
    }

    // Sort by RICE (Highest First)
    backlog.sort((a, b) => b.rice - a.rice);

    tbody.innerHTML = '';

    backlog.forEach((f, index) => {
        const tr = document.createElement('tr');
        tr.className = 'border-b border-slate-100 hover:bg-slate-50 transition-colors row-enter group';
        tr.style.animationDelay = `${index * 0.05}s`; // Stagger animation
        
        let priorityBadge = index === 0 
            ? `<span class="inline-flex items-center justify-center w-6 h-6 rounded-md bg-indigo-600 text-white font-bold shadow-sm text-xs">1</span>` 
            : `<span class="inline-flex items-center justify-center w-6 h-6 rounded-md bg-slate-100 text-slate-500 font-medium text-xs border border-slate-200">${index + 1}</span>`;

        tr.innerHTML = `
            <td class="py-3 px-4">${priorityBadge}</td>
            <td class="py-3 px-4">
                <p class="font-medium text-slate-800">${f.title}</p>
                <div class="flex items-center gap-2 mt-1">
                    <span class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">${f.id}</span>
                    <span class="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200">${f.techLabel}</span>
                </div>
            </td>
            <td class="py-3 px-4 text-center font-mono font-medium text-blue-600">${f.rice}</td>
            <td class="py-3 px-4 text-center">
                <span class="border px-2.5 py-1 rounded-full font-bold text-xs shadow-sm ${getPointBadgeClass(f.points)}">
                    ${f.points}
                </span>
            </td>
            <td class="py-3 px-4 text-right">
                <button onclick="deleteFeature('${f.id}')" class="text-slate-400 hover:text-rose-500 text-sm p-2 rounded-lg hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Initialize
updateLivePreview();
updateDashboard();
