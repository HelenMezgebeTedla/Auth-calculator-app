const tabs = document.querySelectorAll('.tab');
const panels = document.querySelectorAll('.panel');
const messageBox = document.getElementById('message');

const signupForm = document.getElementById('signupForm');
const loginForm = document.getElementById('loginForm');
const calculatorForm = document.getElementById('calculatorForm');

const loginStatus = document.getElementById('loginStatus');
const logoutBtn = document.getElementById('logoutBtn');

const num1 = document.getElementById('num1');
const num2 = document.getElementById('num2');
const operation = document.getElementById('operation');
const result = document.getElementById('result');

const STORAGE_KEYS = {
  users: 'users',
  currentUser: 'currentUser'
};

function showMessage(text, type = 'success') {
  messageBox.textContent = text;
  messageBox.className = `message ${type}`;
}

function clearMessage() {
  messageBox.textContent = '';
  messageBox.className = 'message hidden';
}

function openTab(targetId) {
  tabs.forEach(tab => {
    const isActive = tab.dataset.target === targetId;
    tab.classList.toggle('active', isActive);
    tab.setAttribute('aria-selected', String(isActive));
  });

  panels.forEach(panel => panel.classList.toggle('active', panel.id === targetId));
  clearMessage();
}

function getStoredValue(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
  } catch {
    return fallback;
  }
}

function getUsers() {
  const users = getStoredValue(STORAGE_KEYS.users, []);
  return Array.isArray(users) ? users : [];
}

function saveUsers(users) {
  localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
}

function getCurrentUser() {
  return getStoredValue(STORAGE_KEYS.currentUser, null);
}

function setCurrentUser(user) {
  localStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(user));
}

function clearCurrentUser() {
  localStorage.removeItem(STORAGE_KEYS.currentUser);
}

function refreshAuthUI() {
  const currentUser = getCurrentUser();

  if (currentUser?.name && currentUser?.email) {
    loginStatus.textContent = `Logged in as ${currentUser.name} (${currentUser.email})`;
    loginStatus.classList.add('logged-in');
  } else {
    loginStatus.textContent = 'Not logged in';
    loginStatus.classList.remove('logged-in');
  }
}

tabs.forEach(tab => {
  tab.addEventListener('click', () => openTab(tab.dataset.target));
});

signupForm.addEventListener('submit', event => {
  event.preventDefault();

  const name = document.getElementById('signupName').value.trim();
  const email = document.getElementById('signupEmail').value.trim().toLowerCase();
  const password = document.getElementById('signupPassword').value;

  if (name.length < 2) {
    showMessage('Please enter your full name.', 'error');
    return;
  }

  if (password.length < 6) {
    showMessage('Password must be at least 6 characters long.', 'error');
    return;
  }

  const users = getUsers();
  if (users.some(user => user.email === email)) {
    showMessage('An account with that email already exists.', 'error');
    return;
  }

  users.push({ name, email, password });
  saveUsers(users);

  signupForm.reset();
  showMessage('Account created successfully. You can now log in.', 'success');
  openTab('login');
  document.getElementById('loginEmail').value = email;
  showMessage('Account created successfully. You can now log in.', 'success');
});

loginForm.addEventListener('submit', event => {
  event.preventDefault();

  const email = document.getElementById('loginEmail').value.trim().toLowerCase();
  const password = document.getElementById('loginPassword').value;
  const foundUser = getUsers().find(user =>
    user.email === email && user.password === password
  );

  if (!foundUser) {
    showMessage('Invalid email or password.', 'error');
    return;
  }

  setCurrentUser({ name: foundUser.name, email: foundUser.email });
  refreshAuthUI();
  loginForm.reset();
  openTab('calculator');
  showMessage('Login successful. Calculator unlocked.', 'success');
});

logoutBtn.addEventListener('click', () => {
  clearCurrentUser();
  refreshAuthUI();
  result.textContent = '--';
  showMessage('Logged out successfully.', 'success');
});

calculatorForm.addEventListener('submit', event => {
  event.preventDefault();

  const currentUser = getCurrentUser();
  if (!currentUser?.email) {
    showMessage('Please log in before using the calculator.', 'error');
    openTab('login');
    return;
  }

  if (num1.value.trim() === '' || num2.value.trim() === '') {
    showMessage('Enter both numbers first.', 'error');
    result.textContent = '--';
    return;
  }

  const first = Number(num1.value);
  const second = Number(num2.value);

  if (!Number.isFinite(first) || !Number.isFinite(second)) {
    showMessage('Please enter valid numbers.', 'error');
    return;
  }

  let answer;

  switch (operation.value) {
    case 'add':
      answer = first + second;
      break;
    case 'subtract':
      answer = first - second;
      break;
    case 'multiply':
      answer = first * second;
      break;
    case 'divide':
      if (second === 0) {
        showMessage('Cannot divide by zero.', 'error');
        result.textContent = '--';
        return;
      }
      answer = first / second;
      break;
    default:
      showMessage('Invalid operation selected.', 'error');
      return;
  }

  const formattedAnswer = Number.isInteger(answer)
    ? answer.toString()
    : Number(answer.toPrecision(12)).toString();

  result.textContent = formattedAnswer;
  showMessage('Calculation completed.', 'success');
});

refreshAuthUI();
