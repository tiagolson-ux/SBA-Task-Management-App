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
