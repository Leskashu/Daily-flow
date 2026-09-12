const STORAGE_KEY = 'daily-flow-glass-desktop-v2';
const palette = ['#7eb9aa', '#d8c0cd', '#b0a3d8', '#d6bc86', '#9aa0a8', '#eee4d4'];
const categories = ['Здоровье', 'Развитие', 'Осознанность', 'Питание', 'Работа'];
const routineTemplate = [
  ['08:00', 'Подъем, вода, старт без хаоса'],
  ['10:00', 'Фокус-блок на работу / учебу'],
  ['13:00', 'Обед и короткая пауза'],
  ['16:00', 'Дорожка / движение'],
  ['19:00', 'Личное время и спокойный вечер'],
  ['22:30', 'Сон и перезагрузка']
];

const monthPanelTitle = document.getElementById('monthPanelTitle');
const monthGridWrap = document.getElementById('monthGridWrap');
const monthGridWrapHabits = document.getElementById('monthGridWrapHabits');
const monthSummaryLabel = document.getElementById('monthSummaryLabel');
const headerDate = document.getElementById('headerDate');
const clockDate = document.getElementById('clockDate');
const todayTitleDate = document.getElementById('todayTitleDate');
const todayList = document.getElementById('todayList');
const planTodayList = document.getElementById('planTodayList');
const topHabitsList = document.getElementById('topHabitsList');
const topHabitsListAnalytics = document.getElementById('topHabitsListAnalytics');
const focusText = document.getElementById('focusText');
const insightText = document.getElementById('insightText');
const trendChart = document.getElementById('trendChart');
const weeklyChart = document.getElementById('weeklyChart');
const categoryDonut = document.getElementById('categoryDonut');
const categoryLegend = document.getElementById('categoryLegend');
const weekdayChart = document.getElementById('weekdayChart');
const trendChartAnalytics = document.getElementById('trendChartAnalytics');
const weeklyChartAnalytics = document.getElementById('weeklyChartAnalytics');
const categoryDonutAnalytics = document.getElementById('categoryDonutAnalytics');
const categoryLegendAnalytics = document.getElementById('categoryLegendAnalytics');
const weekdayChartAnalytics = document.getElementById('weekdayChartAnalytics');
const overallRing = document.getElementById('overallRing');
const overallPercent = document.getElementById('overallPercent');
const overallMeta = document.getElementById('overallMeta');
const streakValue = document.getElementById('streakValue');
const bestStreakValue = document.getElementById('bestStreakValue');
const habitCount = document.getElementById('habitCount');
const todayDoneCount = document.getElementById('todayDoneCount');
const todayTotalCount = document.getElementById('todayTotalCount');
const todayBar = document.getElementById('todayBar');
const todayMiniDone = document.getElementById('todayMiniDone');
const todayMiniTotal = document.getElementById('todayMiniTotal');
const todayMiniBar = document.getElementById('todayMiniBar');
const todayCompletionCopy = document.getElementById('todayCompletionCopy');
const habitDialog = document.getElementById('habitDialog');
const habitManagerList = document.getElementById('habitManagerList');
const habitManagerItemTemplate = document.getElementById('habitManagerItemTemplate');
const newHabitTitle = document.getElementById('newHabitTitle');
const newHabitCategory = document.getElementById('newHabitCategory');
const dailyTaskDialog = document.getElementById('dailyTaskDialog');
const dailyTaskTitle = document.getElementById('dailyTaskTitle');
const habitLibrary = document.getElementById('habitLibrary');
const categoryCards = document.getElementById('categoryCards');
const analyticsMonthPercent = document.getElementById('analyticsMonthPercent');
const analyticsTopHabit = document.getElementById('analyticsTopHabit');
const analyticsWeakDay = document.getElementById('analyticsWeakDay');
const analyticsAdvice = document.getElementById('analyticsAdvice');
const analyticsInsights = document.getElementById('analyticsInsights');
const archiveCards = document.getElementById('archiveCards');
const archiveInsights = document.getElementById('archiveInsights');
const weekFocusInput = document.getElementById('weekFocusInput');
const weekPills = document.getElementById('weekPills');
const routineList = document.getElementById('routineList');
const dayFocusText = document.getElementById('dayFocusText');
const habitSearch = document.getElementById('habitSearch');

const state = loadState();
clearServiceWorkers();
ensureStructures();
renderAll();
startClock();
bindEvents();

function bindEvents() {
  document.getElementById('prevMonthBtn').addEventListener('click', () => shiftMonth(-1));
  document.getElementById('nextMonthBtn').addEventListener('click', () => shiftMonth(1));
  document.getElementById('jumpTodayBtn').addEventListener('click', () => {
    state.selectedMonth = dateKeyMonth(new Date());
    saveState();
    renderAll();
  });
  document.getElementById('prevMonthBtnHabits').addEventListener('click', () => shiftMonth(-1));
  document.getElementById('nextMonthBtnHabits').addEventListener('click', () => shiftMonth(1));

  document.getElementById('openHabitManager').addEventListener('click', openHabitManager);
  document.getElementById('openHabitManagerBottom').addEventListener('click', openHabitManager);
  document.getElementById('openHabitManagerInline').addEventListener('click', openHabitManager);
  document.getElementById('openHabitManagerNav').addEventListener('click', openHabitManager);
  document.getElementById('saveHabitChangesBtn').addEventListener('click', saveHabitManagerChanges);
  document.getElementById('createHabitBtn').addEventListener('click', createHabitFromForm);
  document.getElementById('addDailyTaskBtn').addEventListener('click', () => dailyTaskDialog.showModal());
  document.getElementById('saveDailyTaskBtn').addEventListener('click', saveDailyTask);

  document.querySelectorAll('[data-view]').forEach(button => {
    button.addEventListener('click', () => setView(button.dataset.view));
  });

  weekFocusInput.addEventListener('input', () => {
    state.weekFocus = weekFocusInput.value;
    saveState();
  });

  habitSearch.addEventListener('input', renderHabitLibrary);
}

function clearServiceWorkers() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(regs => regs.forEach(reg => reg.unregister())).catch(() => {});
  }
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.error(e);
    }
  }
  return makeDefaultState();
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function makeDefaultState() {
  const now = new Date();
  const selectedMonth = dateKeyMonth(now);
  const habits = [
    { id: uid(), title: 'Чтение 30 минут', category: 'Развитие', color: palette[2] },
    { id: uid(), title: 'Дорожка', category: 'Здоровье', color: palette[0] },
    { id: uid(), title: 'Закрыть белок', category: 'Питание', color: palette[3] },
    { id: uid(), title: 'Соцсети', category: 'Осознанность', color: palette[1] },
    { id: uid(), title: 'Изучение языков', category: 'Развитие', color: palette[5] },
    { id: uid(), title: 'Моё визуальное время', category: 'Работа', color: palette[4] },
  ];

  const completions = {};
  const customTasks = {};
  const days = daysInMonth(now.getFullYear(), now.getMonth());
  for (let day = 1; day <= days; day++) {
    const date = new Date(now.getFullYear(), now.getMonth(), day);
    const key = dateKey(date);
    completions[key] = {};
    habits.forEach((habit, i) => {
      const shouldMark = seedRandom(day * 19 + i * 13) > 0.42;
      completions[key][habit.id] = shouldMark && date <= now;
    });
  }
  customTasks[dateKey(now)] = [
    { id: uid(), title: 'Закрыть ключевую задачу дня', done: false },
    { id: uid(), title: 'Разобрать мелкие хвосты', done: false }
  ];

  return {
    selectedMonth,
    currentView: 'overview',
    habits,
    completions,
    customTasks,
    weekFocus: 'Удержать базовый ритм без перегруза.',
    dayFocus: 'Закрыть базовые привычки и одну ключевую задачу.'
  };
}

function ensureStructures() {
  const today = dateKey(new Date());
  if (!state.completions[today]) state.completions[today] = {};
  if (!state.customTasks[today]) state.customTasks[today] = [];
  state.habits.forEach(habit => {
    if (typeof state.completions[today][habit.id] !== 'boolean') {
      state.completions[today][habit.id] = false;
    }
  });
  saveState();
}

function uid() { return Math.random().toString(36).slice(2, 10); }
function seedRandom(seed) { return Math.abs(Math.sin(seed * 9999)) % 1; }
function dateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
function dateKeyMonth(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}
function daysInMonth(year, monthIndex) { return new Date(year, monthIndex + 1, 0).getDate(); }
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}
function capitalize(str) { return str.charAt(0).toUpperCase() + str.slice(1); }

function setView(view) {
  state.currentView = view;
  saveState();
  document.querySelectorAll('.pane').forEach(pane => pane.classList.toggle('is-active', pane.dataset.pane === view));
  document.querySelectorAll('.tab-pill').forEach(btn => btn.classList.toggle('is-active', btn.dataset.view === view));
  document.querySelectorAll('.nav-item[data-view]').forEach(btn => btn.classList.toggle('is-active', btn.dataset.view === view));
}

function shiftMonth(direction) {
  const [year, month] = state.selectedMonth.split('-').map(Number);
  const date = new Date(year, month - 1 + direction, 1);
  state.selectedMonth = dateKeyMonth(date);
  saveState();
  renderAll();
}

function renderAll() {
  ensureStructures();
  renderHeaderDates();
  renderMonthGrid(monthGridWrap, false);
  renderMonthGrid(monthGridWrapHabits, true);
  renderTodayList(todayList, true);
  renderTodayList(planTodayList, false);
  renderMetrics();
  renderTopHabits(topHabitsList);
  renderTopHabits(topHabitsListAnalytics);
  renderCharts();
  renderHabitLibrary();
  renderCategoryCards();
  renderAnalytics();
  renderPlan();
  renderArchive();
  setView(state.currentView || 'overview');
}

function renderHeaderDates() {
  const now = new Date();
  headerDate.textContent = new Intl.DateTimeFormat('ru-RU', { weekday: 'short', day: 'numeric', month: 'long' }).format(now);
  clockDate.textContent = new Intl.DateTimeFormat('ru-RU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(now);
  todayTitleDate.textContent = new Intl.DateTimeFormat('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' }).format(now);
}

function startClock() {
  updateClock();
  setInterval(updateClock, 15000);
}

function updateClock() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const mins = String(now.getMinutes()).padStart(2, '0');
  document.getElementById('hourTens').textContent = hours[0];
  document.getElementById('hourOnes').textContent = hours[1];
  document.getElementById('minuteTens').textContent = mins[0];
  document.getElementById('minuteOnes').textContent = mins[1];
}

function renderMonthGrid(target, compactTitle) {
  const [year, month] = state.selectedMonth.split('-').map(Number);
  const date = new Date(year, month - 1, 1);
  const days = daysInMonth(year, month - 1);
  const monthTitle = new Intl.DateTimeFormat('ru-RU', { month: 'long', year: 'numeric' }).format(date);
  monthPanelTitle.textContent = `Трекер на ${capitalize(monthTitle)}`;
  monthSummaryLabel.textContent = `${state.habits.length} привычек`;

  const todayKey = dateKey(new Date());
  let headerCells = '<th class="habit-head">Привычка</th>';
  for (let d = 1; d <= days; d++) headerCells += `<th>${d}</th>`;
  headerCells += '<th class="progress-cell">Прогресс</th>';

  let rows = filteredHabits().map(habit => {
    let dayCells = '';
    let doneCount = 0;
    for (let d = 1; d <= days; d++) {
      const cellDate = new Date(year, month - 1, d);
      const key = dateKey(cellDate);
      const done = !!state.completions[key]?.[habit.id];
      if (done) doneCount++;
      const isToday = key === todayKey;
      dayCells += `<td><button class="day-cell ${done ? 'is-done' : ''} ${isToday ? 'today-outline' : ''}" style="background:${done ? habit.color : 'rgba(255,255,255,0.04)'}" data-habit-id="${habit.id}" data-date="${key}" aria-label="${escapeHtml(habit.title)} ${d}"></button></td>`;
    }
    const percent = Math.round((doneCount / days) * 100);
    return `
      <tr>
        <td class="habit-head">
          <div class="habit-label">
            <span class="habit-dot" style="background:${habit.color}"></span>
            <div>
              <div class="habit-name">${escapeHtml(habit.title)}</div>
              <div class="habit-category">${escapeHtml(habit.category)}</div>
            </div>
          </div>
        </td>
        ${dayCells}
        <td class="progress-cell">
          <div class="row-progress">
            <span>${percent}%</span>
            <div class="row-progress-bar"><span style="width:${percent}%; background:${habit.color}"></span></div>
          </div>
        </td>
      </tr>`;
  }).join('');

  const empty = filteredHabits().length ? '' : '<div class="small-quote glass-soft">Ничего не найдено. Попробуй другой запрос в поиске.</div>';
  target.innerHTML = empty || `<div class="month-grid"><table><thead><tr>${headerCells}</tr></thead><tbody>${rows}</tbody></table></div>`;
  target.querySelectorAll('.day-cell').forEach(btn => btn.addEventListener('click', toggleMonthCell));
  bindMonthGridSnap(target);
}


function bindMonthGridSnap(target) {
  if (target.dataset.snapBound === 'true') return;
  target.dataset.snapBound = 'true';
  let settleTimer;

  const snapToCell = () => {
    const cells = target.querySelectorAll('.day-cell');
    if (cells.length < 2 || target.scrollWidth <= target.clientWidth) return;
    const step = cells[1].getBoundingClientRect().left - cells[0].getBoundingClientRect().left;
    if (!Number.isFinite(step) || step <= 0) return;
    const aligned = Math.round(target.scrollLeft / step) * step;
    if (Math.abs(target.scrollLeft - aligned) > 1) {
      target.scrollTo({ left: aligned, behavior: 'smooth' });
    }
  };

  target.addEventListener('scroll', () => {
    window.clearTimeout(settleTimer);
    settleTimer = window.setTimeout(snapToCell, 90);
  }, { passive: true });
  target.addEventListener('scrollend', snapToCell);
}

function toggleMonthCell(e) {
  const { habitId, date } = e.currentTarget.dataset;
  if (!state.completions[date]) state.completions[date] = {};
  state.completions[date][habitId] = !state.completions[date][habitId];
  saveState();
  renderAll();
}

function renderTodayList(target, includeDeleteButton) {
  const today = dateKey(new Date());
  const habitItems = filteredHabits().map(habit => ({
    id: habit.id,
    title: habit.title,
    subtitle: habit.category,
    done: !!state.completions[today]?.[habit.id],
    type: 'habit'
  }));
  const customItems = (state.customTasks[today] || []).map(task => ({
    id: task.id,
    title: task.title,
    subtitle: 'доп. задача',
    done: !!task.done,
    type: 'task'
  }));
  const all = [...habitItems, ...customItems];
  target.innerHTML = all.map(item => `
    <div class="today-item">
      <button class="today-check ${item.done ? 'is-done' : ''}" data-id="${item.id}" data-type="${item.type}" aria-label="Отметить"></button>
      <div class="today-copy"><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.subtitle)}</span></div>
      ${item.type === 'task' && includeDeleteButton ? `<button class="ghost-btn delete-task-btn" data-task-id="${item.id}">Удалить</button>` : `<span class="small-note">${item.type === 'task' ? 'задача' : 'привычка'}</span>`}
    </div>`).join('');
  target.querySelectorAll('.today-check').forEach(btn => btn.addEventListener('click', toggleTodayItem));
  target.querySelectorAll('.delete-task-btn').forEach(btn => btn.addEventListener('click', deleteCustomTask));
}

function toggleTodayItem(e) {
  const { id, type } = e.currentTarget.dataset;
  const today = dateKey(new Date());
  if (!state.completions[today]) state.completions[today] = {};
  if (type === 'habit') {
    state.completions[today][id] = !state.completions[today][id];
  } else {
    const task = state.customTasks[today].find(item => item.id === id);
    if (task) task.done = !task.done;
  }
  saveState();
  renderAll();
}

function deleteCustomTask(e) {
  const id = e.currentTarget.dataset.taskId;
  const today = dateKey(new Date());
  state.customTasks[today] = state.customTasks[today].filter(item => item.id !== id);
  saveState();
  renderAll();
}

function saveDailyTask(e) {
  e.preventDefault();
  const title = dailyTaskTitle.value.trim();
  if (!title) return;
  const today = dateKey(new Date());
  state.customTasks[today].push({ id: uid(), title, done: false });
  dailyTaskTitle.value = '';
  saveState();
  dailyTaskDialog.close();
  renderAll();
}

function renderMetrics() {
  const stats = getOverviewStats();
  overallRing.innerHTML = buildRing(stats.overallPercent, '#7eb9aa');
  overallPercent.textContent = `${stats.overallPercent}%`;
  overallMeta.textContent = `${stats.doneMonth} из ${stats.totalMonth} выполнено`;
  streakValue.textContent = stats.streak;
  bestStreakValue.textContent = stats.bestStreak;
  habitCount.textContent = state.habits.length;
  todayDoneCount.textContent = stats.todayDone;
  todayTotalCount.textContent = stats.todayTotal;
  todayMiniDone.textContent = stats.todayDone;
  todayMiniTotal.textContent = stats.todayTotal;
  todayBar.style.width = `${stats.todayPercent}%`;
  todayMiniBar.style.width = `${stats.todayPercent}%`;
  todayCompletionCopy.textContent = stats.todayPercent >= 80 ? 'Сильный день. Продолжай.' : stats.todayPercent >= 40 ? 'Нормальный темп. Ещё немного — и отлично.' : 'Пока разогрев. День ещё можно спасти.';
  focusText.textContent = getFocusCopy();
  insightText.textContent = getInsightCopy(stats);
}

function getOverviewStats() {
  const [year, month] = state.selectedMonth.split('-').map(Number);
  const days = daysInMonth(year, month - 1);
  let doneMonth = 0;
  let totalMonth = days * state.habits.length;
  for (let d = 1; d <= days; d++) {
    const key = dateKey(new Date(year, month - 1, d));
    state.habits.forEach(habit => {
      if (state.completions[key]?.[habit.id]) doneMonth++;
    });
  }
  const overallPercent = totalMonth ? Math.round((doneMonth / totalMonth) * 100) : 0;
  const today = dateKey(new Date());
  const todayDone = state.habits.filter(h => state.completions[today]?.[h.id]).length;
  const todayTotal = state.habits.length;
  const todayPercent = todayTotal ? Math.round((todayDone / todayTotal) * 100) : 0;
  return { overallPercent, doneMonth, totalMonth, todayDone, todayTotal, todayPercent, streak: getCurrentStreak(), bestStreak: getBestStreak() };
}

function getCurrentStreak() {
  let count = 0;
  const cursor = new Date();
  while (true) {
    const key = dateKey(cursor);
    const done = state.habits.some(h => state.completions[key]?.[h.id]);
    if (!done) break;
    count += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return count;
}

function getBestStreak() {
  const keys = Object.keys(state.completions).sort();
  let best = 0;
  let current = 0;
  let prevDate = null;
  keys.forEach(key => {
    const [y,m,d] = key.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    const done = state.habits.some(h => state.completions[key]?.[h.id]);
    if (!done) {
      current = 0;
      prevDate = date;
      return;
    }
    if (prevDate) {
      const expected = new Date(prevDate);
      expected.setDate(expected.getDate() + 1);
      current = dateKey(expected) === key ? current + 1 : 1;
    } else {
      current = 1;
    }
    best = Math.max(best, current);
    prevDate = date;
  });
  return best;
}

function renderTopHabits(target) {
  const [year, month] = state.selectedMonth.split('-').map(Number);
  const days = daysInMonth(year, month - 1);
  const rows = state.habits.map(habit => {
    let done = 0;
    for (let d = 1; d <= days; d++) {
      const key = dateKey(new Date(year, month - 1, d));
      if (state.completions[key]?.[habit.id]) done += 1;
    }
    return { ...habit, percent: Math.round((done / days) * 100) };
  }).sort((a,b) => b.percent - a.percent).slice(0,3);

  target.innerHTML = rows.map((item, index) => `
    <div class="top-habit-row">
      <div class="rank-badge" style="background:${item.color}">${index + 1}</div>
      <div>
        <div>${escapeHtml(item.title)}</div>
        <div class="panel-sub">${escapeHtml(item.category)}</div>
      </div>
      <strong>${item.percent}%</strong>
    </div>`).join('');
}

function getFocusCopy() {
  const categoriesMap = {};
  state.habits.forEach(habit => categoriesMap[habit.category] = (categoriesMap[habit.category] || 0) + 1);
  const top = Object.entries(categoriesMap).sort((a,b) => b[1]-a[1])[0];
  if (!top) return 'Фокус пока не определён.';
  const map = {
    'Здоровье': 'Ставка на движение, воду и физическую устойчивость.',
    'Развитие': 'Рост через регулярность, а не редкие подвиги.',
    'Осознанность': 'Меньше шума, больше ясности и фокуса.',
    'Питание': 'Еда и режим здесь играют важнее, чем хотелось бы.',
    'Работа': 'Система должна поддерживать тебя, а не добивать.'
  };
  return map[top[0]] || 'Стабильность лучше идеальности.';
}

function getInsightCopy(stats) {
  if (stats.overallPercent >= 75) return 'Динамика уже сильная. Задача — просто не сорвать ритм.';
  if (stats.overallPercent >= 50) return 'Форма нормальная. Главный рычаг — убрать случайные провалы.';
  return 'Сейчас важнее собрать устойчивую базу, чем пытаться быть идеальной.';
}

function renderCharts() {
  const data = getChartData();
  trendChart.innerHTML = buildLineAreaChart(data.plan, data.fact);
  weeklyChart.innerHTML = buildBarChart(data.weekly.values, data.weekly.labels);
  renderDonut(categoryDonut, categoryLegend, data.categories);
  weekdayChart.innerHTML = buildBarChart(data.weekdays.values, data.weekdays.labels);
  trendChartAnalytics.innerHTML = buildLineAreaChart(data.plan, data.fact, 360);
  weeklyChartAnalytics.innerHTML = buildBarChart(data.weekly.values, data.weekly.labels, 360);
  renderDonut(categoryDonutAnalytics, categoryLegendAnalytics, data.categories, 120, 130);
  weekdayChartAnalytics.innerHTML = buildBarChart(data.weekdays.values, data.weekdays.labels, 360);
}

function getChartData() {
  const [year, month] = state.selectedMonth.split('-').map(Number);
  const days = daysInMonth(year, month - 1);
  const plan = Array.from({ length: days }, () => 100);
  const fact = [];
  for (let d = 1; d <= days; d++) {
    const key = dateKey(new Date(year, month - 1, d));
    const done = state.habits.filter(h => state.completions[key]?.[h.id]).length;
    fact.push(Math.round((done / state.habits.length) * 100));
  }

  const weeklyValues = [];
  const weeklyLabels = [];
  for (let start = 1; start <= days; start += 7) {
    let done = 0;
    let total = 0;
    for (let d = start; d <= Math.min(days, start + 6); d++) {
      const key = dateKey(new Date(year, month - 1, d));
      state.habits.forEach(habit => {
        total += 1;
        if (state.completions[key]?.[habit.id]) done += 1;
      });
    }
    weeklyValues.push(total ? Math.round((done / total) * 100) : 0);
    weeklyLabels.push(`Нед ${weeklyLabels.length + 1}`);
  }

  const categoryMap = {};
  state.habits.forEach(habit => {
    categoryMap[habit.category] = (categoryMap[habit.category] || 0) + 1;
  });
  const categoriesData = Object.entries(categoryMap).map(([label, value], index) => ({
    label, value, color: palette[index % palette.length]
  }));

  const weekdayBuckets = Array.from({ length: 7 }, () => ({ done: 0, total: 0 }));
  Object.keys(state.completions).forEach(key => {
    const [y,m,d] = key.split('-').map(Number);
    const idx = (new Date(y, m - 1, d).getDay() + 6) % 7;
    state.habits.forEach(habit => {
      weekdayBuckets[idx].total += 1;
      if (state.completions[key]?.[habit.id]) weekdayBuckets[idx].done += 1;
    });
  });

  return {
    plan,
    fact,
    weekly: { values: weeklyValues, labels: weeklyLabels },
    categories: categoriesData,
    weekdays: {
      values: weekdayBuckets.map(item => item.total ? Math.round((item.done / item.total) * 100) : 0),
      labels: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
    }
  };
}

function buildLineAreaChart(plan, fact, height = 240) {
  const width = 680;
  const padding = 24;
  const plotWidth = width - padding * 2;
  const plotHeight = height - padding * 2;
  const step = plan.length > 1 ? plotWidth / (plan.length - 1) : plotWidth;
  const point = (value, index) => `${padding + index * step},${padding + (100 - value) / 100 * plotHeight}`;
  const area = `${padding},${height - padding} ${fact.map(point).join(' ')} ${padding + (fact.length - 1) * step},${height - padding}`;
  const labels = [1, 5, 10, 15, 20, 25, plan.length].filter((v, i, arr) => arr.indexOf(v) === i)
    .map(day => `<text x="${padding + (day - 1) * step}" y="${height - 6}" text-anchor="middle" font-size="11" fill="rgba(245,245,242,.54)">${day}</text>`).join('');

  return `
    <svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
      <defs>
        <linearGradient id="graphFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#7eb9aa" stop-opacity="0.42" />
          <stop offset="100%" stop-color="#7eb9aa" stop-opacity="0.02" />
        </linearGradient>
      </defs>
      ${[0, 25, 50, 75, 100].map(value => `<line x1="${padding}" y1="${padding + (100 - value) / 100 * plotHeight}" x2="${width - padding}" y2="${padding + (100 - value) / 100 * plotHeight}" stroke="rgba(255,255,255,.07)" /><text x="4" y="${padding + (100 - value) / 100 * plotHeight + 4}" font-size="11" fill="rgba(245,245,242,.54)">${value}%</text>`).join('')}
      <polygon points="${area}" fill="url(#graphFill)"></polygon>
      <polyline points="${plan.map(point).join(' ')}" fill="none" stroke="rgba(238,228,212,.3)" stroke-width="2.5" stroke-dasharray="4 6"></polyline>
      <polyline points="${fact.map(point).join(' ')}" fill="none" stroke="#7eb9aa" stroke-width="3.2"></polyline>
      ${labels}
    </svg>`;
}

function buildBarChart(values, labels, height = 240) {
  const width = 440;
  const padding = 24;
  const chartHeight = height - 42;
  const barWidth = Math.min(42, (width - padding * 2) / (values.length * 1.6));
  const gap = barWidth / 2;
  const startX = padding + 10;
  return `
    <svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
      ${[0, 25, 50, 75, 100].map(value => `<line x1="${padding}" y1="${padding + (100 - value) / 100 * chartHeight}" x2="${width - padding}" y2="${padding + (100 - value) / 100 * chartHeight}" stroke="rgba(255,255,255,.07)" />`).join('')}
      ${values.map((value, index) => {
        const x = startX + index * (barWidth + gap);
        const barHeight = chartHeight * (value / 100);
        const y = padding + chartHeight - barHeight;
        return `<rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" rx="12" fill="${palette[index % palette.length]}" opacity=".92"></rect>
                <text x="${x + barWidth / 2}" y="${y - 8}" text-anchor="middle" font-size="11" fill="#f5f5f2">${value}%</text>
                <text x="${x + barWidth / 2}" y="${height - 8}" text-anchor="middle" font-size="11" fill="rgba(245,245,242,.54)">${labels[index]}</text>`;
      }).join('')}
    </svg>`;
}

function renderDonut(target, legendTarget, data, size = 98, viewbox = 120) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  const total = data.reduce((sum, item) => sum + item.value, 0) || 1;
  const arcs = data.map(item => {
    const length = circumference * (item.value / total);
    const svg = `<circle cx="60" cy="60" r="${radius}" fill="none" stroke="${item.color}" stroke-width="14" stroke-dasharray="${length} ${circumference - length}" stroke-dashoffset="${-offset}" transform="rotate(-90 60 60)"></circle>`;
    offset += length;
    return svg;
  }).join('');

  target.innerHTML = `
    <svg viewBox="0 0 ${viewbox} ${viewbox}">
      <circle cx="60" cy="60" r="${radius}" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="14"></circle>
      ${arcs}
      <text x="60" y="56" text-anchor="middle" font-size="24" fill="white" font-weight="700">${total}</text>
      <text x="60" y="74" text-anchor="middle" font-size="11" fill="rgba(245,245,242,.54)">привычек</text>
    </svg>`;

  legendTarget.innerHTML = data.map(item => `
    <div class="legend-row">
      <div class="legend-label"><span class="habit-dot" style="background:${item.color}"></span><span>${escapeHtml(item.label)}</span></div>
      <strong>${item.value}</strong>
    </div>`).join('');
}

function buildRing(percent, color) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - circumference * percent / 100;
  return `
    <svg viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="${radius}" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="12"></circle>
      <circle cx="50" cy="50" r="${radius}" fill="none" stroke="${color}" stroke-width="12" stroke-linecap="round" stroke-dasharray="${circumference}" stroke-dashoffset="${offset}" transform="rotate(-90 50 50)"></circle>
      <text x="50" y="55" text-anchor="middle" font-size="24" fill="white" font-weight="700">${percent}%</text>
    </svg>`;
}

function renderHabitLibrary() {
  const query = habitSearch.value.trim().toLowerCase();
  const list = state.habits.filter(habit => !query || habit.title.toLowerCase().includes(query) || habit.category.toLowerCase().includes(query));
  habitLibrary.innerHTML = list.map(habit => {
    const total = getHabitMonthPercent(habit.id);
    return `
      <div class="library-item">
        <span class="library-color" style="background:${habit.color}"></span>
        <div>
          <div>${escapeHtml(habit.title)}</div>
          <div class="library-meta">${escapeHtml(habit.category)} · ${total}% за месяц</div>
        </div>
        <div class="small-note">цвет</div>
        <button class="ghost-btn" type="button" onclick="document.getElementById('openHabitManager').click()">Изменить</button>
      </div>`;
  }).join('');
}

function renderCategoryCards() {
  const counts = {};
  state.habits.forEach(habit => counts[habit.category] = (counts[habit.category] || 0) + 1);
  categoryCards.innerHTML = Object.entries(counts).map(([name, count], index) => `
    <div class="category-card">
      <div class="eyebrow">Категория</div>
      <div>${escapeHtml(name)}</div>
      <div class="big-number" style="color:${palette[index % palette.length]}">${count}</div>
    </div>`).join('');
}

function getHabitMonthPercent(habitId) {
  const [year, month] = state.selectedMonth.split('-').map(Number);
  const days = daysInMonth(year, month - 1);
  let done = 0;
  for (let d = 1; d <= days; d++) {
    const key = dateKey(new Date(year, month - 1, d));
    if (state.completions[key]?.[habitId]) done += 1;
  }
  return Math.round((done / days) * 100);
}

function renderAnalytics() {
  const chartData = getChartData();
  const stats = getOverviewStats();
  analyticsMonthPercent.textContent = `${stats.overallPercent}%`;

  const ranked = state.habits.map(habit => ({ ...habit, percent: getHabitMonthPercent(habit.id) })).sort((a,b) => b.percent - a.percent);
  analyticsTopHabit.textContent = ranked[0] ? `${ranked[0].title} · ${ranked[0].percent}%` : '—';
  const weekdayMinIndex = chartData.weekdays.values.indexOf(Math.min(...chartData.weekdays.values));
  analyticsWeakDay.textContent = `${chartData.weekdays.labels[weekdayMinIndex]} · ${chartData.weekdays.values[weekdayMinIndex]}%`;
  analyticsAdvice.textContent = buildAdvice(stats, chartData.weekdays.values[weekdayMinIndex]);
  analyticsInsights.innerHTML = [
    `Лучшая привычка месяца — ${ranked[0] ? `<strong>${escapeHtml(ranked[0].title)}</strong>` : '—'}.`,
    `Самый слабый ритм чаще всего наблюдается в <strong>${chartData.weekdays.labels[weekdayMinIndex]}</strong>.`,
    `Общий месячный процент сейчас на уровне <strong>${stats.overallPercent}%</strong>.`,
    `Если хочешь реальный рост, держи минимум обязательных привычек даже в слабые дни.`
  ].map(text => `<div class="insight-card">${text}</div>`).join('');
}

function buildAdvice(stats, weakestDayPercent) {
  if (stats.overallPercent < 45) return 'Снизить ожидания до минимума и держать базовые 2–3 привычки каждый день.';
  if (weakestDayPercent < 40) return 'Самый слабый день нужно заранее разгружать и оставлять в нём только базу.';
  return 'Система уже живая. Дальше побеждает не мотивация, а повторяемость.';
}

function renderPlan() {
  weekFocusInput.value = state.weekFocus || '';
  dayFocusText.textContent = state.dayFocus || 'Закрыть базовые привычки и одну ключевую задачу.';
  weekPills.innerHTML = [
    'Закрыть базовые привычки',
    'Не срываться из-за одного плохого дня',
    'Оставить время на отдых',
    'Дойти до конца недели без хаоса'
  ].map(item => `<span>• ${item}</span>`).join('');
  routineList.innerHTML = routineTemplate.map(([time, text]) => `
    <div class="routine-row">
      <div class="routine-time">${time}</div>
      <div>${text}</div>
    </div>`).join('');
}

function renderArchive() {
  const months = getArchiveMonths(5);
  archiveCards.innerHTML = months.map(date => {
    const data = getMonthSnapshot(date);
    return `
      <div class="archive-card">
        <div>
          <div class="eyebrow">${escapeHtml(data.label)}</div>
          <div class="value">${data.percent}%</div>
          <div class="meta">${data.done} из ${data.total} выполнено · топ: ${escapeHtml(data.topHabit)}</div>
        </div>
        <div class="small-note">${data.series} дн. серия</div>
      </div>`;
  }).join('');
  archiveInsights.innerHTML = [
    'В архиве важнее смотреть не на один плохой день, а на процент месяца.',
    'Если один месяц падает, ищи причину в перегрузе или слишком большом плане.',
    'Хороший архив — это не идеальные 100%, а понятная стабильная динамика.'
  ].map(text => `<div class="insight-card">${text}</div>`).join('');
}

function getArchiveMonths(count) {
  const [year, month] = state.selectedMonth.split('-').map(Number);
  return Array.from({ length: count }, (_, index) => new Date(year, month - 1 - index, 1));
}

function getMonthSnapshot(date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const days = daysInMonth(year, month);
  let done = 0;
  const total = days * state.habits.length;
  let bestHabit = state.habits[0]?.title || '—';
  let bestPercent = -1;
  state.habits.forEach(habit => {
    let habitDone = 0;
    for (let d = 1; d <= days; d++) {
      const key = dateKey(new Date(year, month, d));
      if (state.completions[key]?.[habit.id]) {
        done += 1;
        habitDone += 1;
      }
    }
    const percent = Math.round((habitDone / days) * 100);
    if (percent > bestPercent) {
      bestPercent = percent;
      bestHabit = habit.title;
    }
  });
  return {
    label: capitalize(new Intl.DateTimeFormat('ru-RU', { month: 'long', year: 'numeric' }).format(date)),
    percent: total ? Math.round((done / total) * 100) : 0,
    done,
    total,
    topHabit: bestHabit,
    series: Math.max(1, Math.round((done / (state.habits.length || 1)) / 3))
  };
}

function openHabitManager() {
  habitManagerList.innerHTML = '';
  state.habits.forEach(habit => {
    const node = habitManagerItemTemplate.content.firstElementChild.cloneNode(true);
    node.dataset.id = habit.id;
    node.querySelector('.habit-manager-title').value = habit.title;
    node.querySelector('.habit-manager-category').value = habit.category;
    node.querySelector('.delete-habit-btn').addEventListener('click', () => deleteHabit(habit.id));
    habitManagerList.appendChild(node);
  });
  habitDialog.showModal();
}

function saveHabitManagerChanges(e) {
  e.preventDefault();
  const rows = Array.from(habitManagerList.children);
  state.habits = rows.map((row, index) => {
    const existing = state.habits.find(habit => habit.id === row.dataset.id) || { id: uid(), color: palette[index % palette.length] };
    return {
      ...existing,
      title: row.querySelector('.habit-manager-title').value.trim() || `Привычка ${index + 1}`,
      category: row.querySelector('.habit-manager-category').value,
    };
  });
  syncCompletionsWithHabits();
  saveState();
  habitDialog.close();
  renderAll();
}

function createHabitFromForm() {
  const title = newHabitTitle.value.trim();
  if (!title) return;
  state.habits.push({
    id: uid(),
    title,
    category: newHabitCategory.value,
    color: palette[state.habits.length % palette.length]
  });
  newHabitTitle.value = '';
  syncCompletionsWithHabits();
  saveState();
  habitDialog.close();
  openHabitManager();
  renderAll();
}

function deleteHabit(habitId) {
  state.habits = state.habits.filter(habit => habit.id !== habitId);
  Object.keys(state.completions).forEach(key => delete state.completions[key][habitId]);
  syncCompletionsWithHabits();
  saveState();
  habitDialog.close();
  openHabitManager();
  renderAll();
}

function syncCompletionsWithHabits() {
  Object.keys(state.completions).forEach(key => {
    state.habits.forEach(habit => {
      if (typeof state.completions[key][habit.id] !== 'boolean') state.completions[key][habit.id] = false;
    });
  });
  ensureStructures();
}

function filteredHabits() {
  const query = habitSearch.value.trim().toLowerCase();
  if (!query) return state.habits;
  return state.habits.filter(habit => habit.title.toLowerCase().includes(query) || habit.category.toLowerCase().includes(query));
}
