const STORAGE_KEY = 'daily-flow-state-v1';
const CIRCUMFERENCE = 2 * Math.PI * 48;

const defaultHabits = [
  { id: 'walk', title: 'Дорожка', sub: 'шаги и ритм', group: 'body' },
  { id: 'protein', title: 'Белок', sub: 'закрыть норму', group: 'body' },
  { id: 'reading', title: 'Чтение 30 минут', sub: 'медленный фокус', group: 'growth' },
  { id: 'languages', title: 'Изучение языков', sub: 'хотя бы немного', group: 'growth' },
  { id: 'social', title: 'Соцсети', sub: 'осознанно, а не в дыру', group: 'creative' },
  { id: 'visual', title: 'Визуальное время', sub: 'видео, кино, макияж, уход', group: 'creative' },
];

const bodyList = document.getElementById('bodyList');
const growthList = document.getElementById('growthList');
const creativeList = document.getElementById('creativeList');
const historyList = document.getElementById('historyList');
const habitTemplate = document.getElementById('habitTemplate');
const doneCountEl = document.getElementById('doneCount');
const ringLabelEl = document.getElementById('ringLabel');
const ringFillEl = document.getElementById('ringFill');
const streakCountEl = document.getElementById('streakCount');
const resetTodayBtn = document.getElementById('resetToday');
const settingsDialog = document.getElementById('settingsDialog');
const openSettingsBtn = document.getElementById('openSettings');
const nameInput = document.getElementById('nameInput');
const settingsHabits = document.getElementById('settingsHabits');
const saveSettingsBtn = document.getElementById('saveSettings');

let state = loadState();
ensureToday();
renderAll();
registerServiceWorker();

openSettingsBtn?.addEventListener('click', () => {
  populateSettings();
  settingsDialog.showModal();
});

saveSettingsBtn?.addEventListener('click', (e) => {
  e.preventDefault();
  state.profile.name = (nameInput.value || '').trim();
  saveState();
  settingsDialog.close();
  renderAll();
});

resetTodayBtn?.addEventListener('click', () => {
  if (!confirm('Сбросить отметки за сегодня?')) return;
  state.days[state.today] = {};
  saveState();
  renderAll();
});

function todayKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        habits: parsed.habits?.length ? parsed.habits : defaultHabits,
        days: parsed.days || {},
        today: parsed.today || todayKey(),
        profile: parsed.profile || { name: '' },
      };
    }
  } catch (err) {
    console.error(err);
  }
  return {
    habits: defaultHabits,
    days: {},
    today: todayKey(),
    profile: { name: '' },
  };
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function ensureToday() {
  const actualToday = todayKey();
  state.today = actualToday;
  if (!state.days[actualToday]) state.days[actualToday] = {};
  state.habits.forEach(habit => {
    if (typeof state.days[actualToday][habit.id] !== 'boolean') {
      state.days[actualToday][habit.id] = false;
    }
  });
  saveState();
}

function renderAll() {
  ensureToday();
  renderHabits();
  renderOverview();
  renderHistory();
  renderHeroNote();
}

function renderHeroNote() {
  const note = document.querySelector('.hero-note');
  const name = state.profile?.name?.trim();
  note.textContent = name ? `${name}, держим ритм.` : 'Не мотивация. Ритм.';
}

function renderHabits() {
  bodyList.innerHTML = '';
  growthList.innerHTML = '';
  creativeList.innerHTML = '';

  state.habits.forEach(habit => {
    const node = habitTemplate.content.firstElementChild.cloneNode(true);
    node.dataset.id = habit.id;
    node.querySelector('.habit-title').textContent = habit.title;
    node.querySelector('.habit-sub').textContent = habit.sub || '';
    const done = !!state.days[state.today]?.[habit.id];
    node.classList.toggle('is-done', done);
    node.addEventListener('click', () => toggleHabit(habit.id));

    if (habit.group === 'body') bodyList.appendChild(node);
    else if (habit.group === 'growth') growthList.appendChild(node);
    else creativeList.appendChild(node);
  });
}

function toggleHabit(id) {
  state.days[state.today][id] = !state.days[state.today][id];
  saveState();
  renderAll();
}

function renderOverview() {
  const total = state.habits.length;
  const done = state.habits.filter(habit => state.days[state.today]?.[habit.id]).length;
  const percent = Math.round((done / total) * 100) || 0;

  doneCountEl.textContent = done;
  ringLabelEl.textContent = `${percent}%`;
  ringFillEl.style.strokeDashoffset = `${CIRCUMFERENCE - (CIRCUMFERENCE * percent / 100)}`;
  streakCountEl.textContent = getStreak();
}

function getStreak() {
  let streak = 0;
  let cursor = new Date(state.today + 'T12:00:00');

  while (true) {
    const key = todayKey(cursor);
    const record = state.days[key];
    const completed = record ? Object.values(record).some(Boolean) : false;
    if (!completed) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

function renderHistory() {
  historyList.innerHTML = '';

  const entries = Object.keys(state.days)
    .sort((a, b) => new Date(b) - new Date(a))
    .slice(0, 7);

  entries.forEach(key => {
    const done = Object.values(state.days[key] || {}).filter(Boolean).length;
    const item = document.createElement('div');
    item.className = 'history-item';
    item.innerHTML = `
      <div>
        <div class="history-date">${formatDate(key)}</div>
        <div class="history-meta">${done} из ${state.habits.length}</div>
      </div>
      <div class="history-meta">${done === state.habits.length ? 'идеально' : done > 0 ? 'в процессе' : 'пусто'}</div>
    `;
    historyList.appendChild(item);
  });
}

function formatDate(key) {
  const [, m, d] = key.split('-').map(Number);
  const months = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
  return `${d} ${months[m - 1]}`;
}

function populateSettings() {
  nameInput.value = state.profile?.name || '';
  settingsHabits.innerHTML = '';
  state.habits.forEach(habit => {
    const item = document.createElement('div');
    item.className = 'settings-habits-item';
    item.innerHTML = `<span>${habit.title}</span><span>${habit.sub}</span>`;
    settingsHabits.appendChild(item);
  });
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js').catch(console.error);
  }
}
