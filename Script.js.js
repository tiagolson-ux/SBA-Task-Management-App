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
