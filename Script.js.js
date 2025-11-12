// Task Management App (by-TN)
// - Show tasks on the page (DOM)- Let user add tasks with a form- Let user update task status via a dropdown.
// - Automatically mark "Overdue" if deadline has passed (unless Completed)- Filter by status or category- Save tasks in localStorage so they survive refresh.

/* ========= 1) STORAGE KEYS + STATE ========= */
// STORAGE_KEY: a short name where we save our tasks in the browser.
const STORAGE_KEY = 'tn_tasks_v1';

// tasks: this is our main list (array) of task objects.
// We try to load what was saved before. If nothing saved, start with [].
let tasks = loadTasks();
console.log('[INIT] Loaded tasks from localStorage:', tasks);

/* ========= 2) HELP FUNCTIONS ========= */
// saveTasks: turn tasks array into text and store it in localStorage.
function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  console.log('[SAVE] Tasks saved to localStorage:', tasks);
}

// loadTasks: try to read from localStorage; if broken or empty, return [].
function loadTasks() {
  const raw = localStorage.getItem(STORAGE_KEY);
  try {
    const parsed = raw ? JSON.parse(raw) : [];
    console.log('[LOAD] Raw from storage:', raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    console.log('[LOAD] JSON parse failed. Starting fresh []');
    return [];
  }
}

// todayISO: gives "YYYY-MM-DD" for today's date to compare deadlines easily.
function todayISO() {
  const d = new Date();
  d.setHours(0, 0, 0, 0); // set time to midnight so day compares are clean
  const iso = d.toISOString().slice(0, 10);
  console.log('[DATE] Today ISO:', iso);
  return iso;
}

// isOverdue: true if deadline is before today AND task is not completed
function isOverdue(task) {
  if (task.status === 'Completed') return false;    // completed tasks aren't overdue
  if (!task.deadline) return false;                 // safety: no date, no overdue
  const t = todayISO();                             // get today's date (YYYY-MM-DD)
  const overdue = task.deadline < t;                // compare strings like "2025-11-11"
  console.log('[CHECK] Is task overdue?', { name: task.name, deadline: task.deadline, today: t, overdue });
  return overdue;
}

// applyAutoOverdue: walk through tasks; if any should be overdue, set it.
function applyAutoOverdue() {
  let changed = false;
  tasks = tasks.map(t => {
    if (isOverdue(t) && t.status !== 'Overdue') {
      console.log('[AUTO] Marking Overdue:', t.name);
      changed = true;
      return { ...t, status: 'Overdue' };
    }
    return t;
  });
  if (changed) {
    saveTasks();
    console.log('[AUTO] Overdue applied to some tasks.');
  }
}

/* ========= 3) GET DOM ELEMENTS ========= */
// We grab all the important page elements once (by IDs).
const form = document.getElementById('task-form');
const nameInput = document.getElementById('taskName');
const categoryInput = document.getElementById('category');
const deadlineInput = document.getElementById('deadline');
const statusInput = document.getElementById('status');
const addBtn = document.getElementById('addTaskBtn');

const filterStatus = document.getElementById('filterStatus');
const filterCategory = document.getElementById('filterCategory');
const clearFiltersBtn = document.getElementById('clearFiltersBtn');
const clearAllBtn = document.getElementById('clearAllBtn');

const tbody = document.getElementById('taskTableBody');

const countAll = document.getElementById('countAll');
const countInProgress = document.getElementById('countInProgress');
const countCompleted = document.getElementById('countCompleted');
const countOverdue = document.getElementById('countOverdue');

console.log('[DOM] Elements wired.');

/* ========= 4) RENDER HELPERS ========= */
// badgeFor: returns a tiny colored label for a given status.
function badgeFor(status) {
  if (status === 'Completed') return `<span class="badge completed">Completed</span>`;
  if (status === 'Overdue')   return `<span class="badge overdue">Overdue</span>`;
  return `<span class="badge progress">In Progress</span>`;
}

// updateCounts: show how many tasks are in each bucket (All, In Progress, etc.).
function updateCounts() {
  const all = tasks.length;
  const ip = tasks.filter(t => t.status === 'In Progress').length;
  const comp = tasks.filter(t => t.status === 'Completed').length;
  const od = tasks.filter(t => t.status === 'Overdue').length;

  countAll.textContent = `All: ${all}`;
  countInProgress.textContent = `In Progress: ${ip}`;
  countCompleted.textContent = `Completed: ${comp}`;
  countOverdue.textContent = `Overdue: ${od}`;

  console.log('[COUNTS] Updated:', { all, ip, comp, od });
}

// getFilteredTasks: look at the chosen filters and return only matching tasks.
function getFilteredTasks() {
  const s = filterStatus.value;   // 'All' or specific status
  const c = filterCategory.value; // 'All' or specific category
  const filtered = tasks.filter(t => {
    const statusOK = (s === 'All') || (t.status === s);
    const catOK = (c === 'All') || (t.category === c);
    return statusOK && catOK;
  });
  console.log('[FILTER] Applied:', { status: s, category: c, count: filtered.length });
  return filtered;
}

// render: rebuild the table from the current tasks + current filters.
function render() {
  console.log('[RENDER] Start');
  applyAutoOverdue();       // first, make sure overdue is up to date
  const visible = getFilteredTasks(); // then decide what to show
  tbody.innerHTML = '';     // clear old rows

  for (const t of visible) {
    // create table row
    const tr = document.createElement('tr');

    // name cell
    const tdName = document.createElement('td');
    tdName.textContent = t.name;
    tr.appendChild(tdName);

    // category cell
    const tdCat = document.createElement('td');
    tdCat.textContent = t.category;
    tr.appendChild(tdCat);

    // deadline cell
    const tdDead = document.createElement('td');
    tdDead.textContent = t.deadline || '';
    tr.appendChild(tdDead);

    // status badge cell
    const tdStatus = document.createElement('td');
    tdStatus.innerHTML = badgeFor(t.status);
    tr.appendChild(tdStatus);

    // update status control cell (a <select>)
    const tdUpdate = document.createElement('td');
    const sel = document.createElement('select');
    sel.className = 'action-select';
    ['In Progress', 'Completed', 'Overdue'].forEach(opt => {
      const o = document.createElement('option');
      o.value = opt;
      o.textContent = opt;
      if (opt === t.status) o.selected = true;
      sel.appendChild(o);
    });
    // when user changes the dropdown, update the task
    sel.addEventListener('change', () => {
      console.log('[ACTION] Status select changed:', { id: t.id, newStatus: sel.value });
      updateTaskStatus(t.id, sel.value);
    });
    tdUpdate.appendChild(sel);
    tr.appendChild(tdUpdate);

    // delete button cell
    const tdDel = document.createElement('td');
    const btn = document.createElement('button');
    btn.className = 'action-btn';
    btn.textContent = 'Delete';
    btn.addEventListener('click', () => {
      console.log('[ACTION] Delete clicked:', { id: t.id, name: t.name });
      deleteTask(t.id);
    });
    tdDel.appendChild(btn);
    tr.appendChild(tdDel);

    // finally put the row in the table body
    tbody.appendChild(tr);
  }

  updateCounts(); // after rendering rows, refresh the counters
  console.log('[RENDER] Done. Visible rows:', visible.length);
}
