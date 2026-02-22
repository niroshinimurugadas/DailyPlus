// --- State Management ---
let state = {
    tasks: JSON.parse(localStorage.getItem('stellar_tasks')) || [],
    routines: JSON.parse(localStorage.getItem('stellar_routines')) || [],
    analytics: JSON.parse(localStorage.getItem('stellar_analytics')) || {},
    currentView: 'tasks',
    filter: 'all',
    lastResetDate: localStorage.getItem('stellar_last_reset') || new Date().toDateString()
};

// --- Chart Initialization ---
let completionChart = null;

// --- DOM Elements ---
const taskList = document.getElementById('task-list');
const routineList = document.getElementById('routine-list');
const taskInput = document.getElementById('task-input');
const routineInput = document.getElementById('routine-input');
const addTaskBtn = document.getElementById('add-task-btn');
const addRoutineBtn = document.getElementById('add-routine-btn');
const viewTitle = document.getElementById('view-title');
const currentDateEl = document.getElementById('current-date');
const navButtons = document.querySelectorAll('.nav-btn');
const viewSections = document.querySelectorAll('.view-section');
const filterBtns = document.querySelectorAll('.filter-btn');

// --- Initialization ---
function init() {
    updateDateDisplay();
    checkDailyReset();
    render();
    setupEventListeners();
    initChart();
}

// --- Logic Functions ---

function updateDateDisplay() {
    const options = { weekday: 'long', month: 'short', day: 'numeric' };
    currentDateEl.textContent = new Date().toLocaleDateString('en-US', options);
}

function checkDailyReset() {
    const today = new Date().toDateString();
    if (state.lastResetDate !== today) {
        // Reset routines completion status
        state.routines = state.routines.map(r => ({ ...r, completed: false }));
        state.lastResetDate = today;
        saveState();
    }
}

function saveState() {
    localStorage.setItem('stellar_tasks', JSON.stringify(state.tasks));
    localStorage.setItem('stellar_routines', JSON.stringify(state.routines));
    localStorage.setItem('stellar_analytics', JSON.stringify(state.analytics));
    localStorage.setItem('stellar_last_reset', state.lastResetDate);
}

function addTask() {
    const text = taskInput.value.trim();
    if (!text) return;
    const newTask = {
        id: Date.now(),
        text: text,
        completed: false,
        createdAt: new Date().toISOString()
    };
    state.tasks.push(newTask);
    taskInput.value = '';
    updateAnalytics(0);
    saveState();
    render();
}

function addRoutine() {
    const text = routineInput.value.trim();
    if (!text) return;
    const newRoutine = {
        id: Date.now(),
        text: text,
        completed: false
    };
    state.routines.push(newRoutine);
    routineInput.value = '';
    updateAnalytics(0);
    saveState();
    render();
}

function toggleTask(id) {
    const task = state.tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        if (task.completed) {
            updateAnalytics(1);
        } else {
            updateAnalytics(-1);
        }
        saveState();
        render();
    }
}

function toggleRoutine(id) {
    const routine = state.routines.find(r => r.id === id);
    if (routine) {
        routine.completed = !routine.completed;
        if (routine.completed) {
            updateAnalytics(1);
        } else {
            updateAnalytics(-1);
        }
        saveState();
        render();
    }
}

function deleteTask(id) {
    state.tasks = state.tasks.filter(t => t.id !== id);
    updateAnalytics(0);
    saveState();
    render();
}

function deleteRoutine(id) {
    state.routines = state.routines.filter(r => r.id !== id);
    updateAnalytics(0);
    saveState();
    render();
}

function editTask(id) {
    const newText = prompt("Edit task:", state.tasks.find(t => t.id === id).text);
    if (newText !== null && newText.trim() !== "") {
        state.tasks = state.tasks.map(t => t.id === id ? { ...t, text: newText.trim() } : t);
        saveState();
        render();
    }
}

function updateAnalytics(change) {
    const today = new Date().toDateString();
    if (!state.analytics[today]) {
        state.analytics[today] = { completions: 0, allDone: false };
    }

    // Support legacy (if any) or new structure
    if (typeof state.analytics[today] === 'number') {
        state.analytics[today] = { completions: state.analytics[today], allDone: state.analytics[today] > 0 };
    }

    state.analytics[today].completions = Math.max(0, state.analytics[today].completions + change);

    // Check if everything is done
    const allTasksDone = state.tasks.length > 0 && state.tasks.every(t => t.completed);
    const allRoutinesDone = state.routines.length > 0 && state.routines.every(r => r.completed);
    state.analytics[today].allDone = (allTasksDone && allRoutinesDone);

    if (completionChart) updateChart();
    updateStatsText();
}

// --- UI Rendering ---

function render() {
    renderTasks();
    renderRoutines();
    updateStatsText();
}

function renderTasks() {
    let filtered = state.tasks;
    if (state.filter === 'active') filtered = state.tasks.filter(t => !t.completed);
    if (state.filter === 'completed') filtered = state.tasks.filter(t => t.completed);

    taskList.innerHTML = filtered.map(task => `
        <li class="task-item ${task.completed ? 'completed' : ''}">
            <div class="task-checkbox ${task.completed ? 'checked' : ''}" onclick="toggleTask(${task.id})"></div>
            <span class="task-text">${task.text}</span>
            <div class="task-actions">
                <button class="action-btn" onclick="editTask(${task.id})">✎</button>
                <button class="action-btn delete" onclick="deleteTask(${task.id})">✕</button>
            </div>
        </li>
    `).join('');
}

function renderRoutines() {
    routineList.innerHTML = state.routines.map(routine => `
        <li class="task-item ${routine.completed ? 'completed' : ''}">
            <div class="task-checkbox ${routine.completed ? 'checked' : ''}" onclick="toggleRoutine(${routine.id})"></div>
            <span class="task-text">${routine.text}</span>
            <div class="task-actions">
                <button class="action-btn delete" onclick="deleteRoutine(${routine.id})">✕</button>
            </div>
        </li>
    `).join('');
}

function updateStatsText() {
    const totalCompleted = Object.values(state.analytics).reduce((acc, val) => {
        const count = typeof val === 'object' ? val.completions : val;
        return acc + count;
    }, 0);
    document.getElementById('stats-total').textContent = totalCompleted;

    // Calculate streak (consecutive days where ALL tasks were completed)
    let streak = 0;
    let d = new Date();
    while (true) {
        const dayData = state.analytics[d.toDateString()];
        if (dayData && (dayData.allDone || (typeof dayData === 'number' && dayData > 0))) {
            streak++;
            d.setDate(d.getDate() - 1);
        } else {
            break;
        }
    }
    document.getElementById('stats-streak').textContent = streak;
}

// --- Chart Integration ---

function initChart() {
    const ctx = document.getElementById('completionChart').getContext('2d');
    const data = getChartData();

    completionChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Tasks Completed',
                data: data.values,
                borderColor: '#18dcff',
                backgroundColor: 'rgba(24, 220, 255, 0.2)',
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#7d5fff',
                pointRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(255, 255, 255, 0.1)' },
                    ticks: { color: 'rgba(255, 255, 255, 0.6)' }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: 'rgba(255, 255, 255, 0.6)' }
                }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}

function updateChart() {
    const data = getChartData();
    completionChart.data.labels = data.labels;
    completionChart.data.datasets[0].data = data.values;
    completionChart.update();
}

function getChartData() {
    const labels = [];
    const values = [];
    // Show 30 days for monthly view
    for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dayStr = d.toDateString();

        // Label format: Nov 22
        const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

        // Show labels only for every 5th day to avoid cluttering, or first/last
        if (i % 5 === 0 || i === 0 || i === 29) {
            labels.push(label);
        } else {
            labels.push(''); // Empty label for others
        }

        const dayData = state.analytics[dayStr];
        const count = typeof dayData === 'object' ? dayData.completions : (dayData || 0);
        values.push(count);
    }
    return { labels, values };
}

// --- Event Listeners ---

function setupEventListeners() {
    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') addTask(); });

    addRoutineBtn.addEventListener('click', addRoutine);
    routineInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') addRoutine(); });

    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.getAttribute('data-view');
            switchView(view);
        });
    });

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.filter = btn.getAttribute('data-filter');
            renderTasks();
        });
    });
}

function switchView(view) {
    state.currentView = view;
    navButtons.forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-view') === view);
    });
    viewSections.forEach(sec => {
        sec.classList.toggle('hidden', sec.id !== `${view}-view`);
    });
    viewTitle.textContent = view.charAt(0).toUpperCase() + view.slice(1);
    if (view === 'analytics' && completionChart) {
        updateChart();
    }
}

// Start the app
init();
