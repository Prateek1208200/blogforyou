// ── Auth helpers ─────────────────────────────────
export const isLoggedIn  = () => !!localStorage.getItem('token');
export const isAdmin     = () => localStorage.getItem('role') === 'ADMIN';
export const getUsername = () => localStorage.getItem('username') || 'User';

export function logout() {
  localStorage.clear();
  updateNavAuth();
  navigate('#/');
}

// ── Navigation ────────────────────────────────────
export function navigate(hash) {
  window.location.hash = hash;
}

// ── Toast ─────────────────────────────────────────
let toastTimer;
export function toast(msg, type = 'default') {
  const el = document.getElementById('toast');
  if (!el) return;
  clearTimeout(toastTimer);
  el.textContent = msg;
  el.className = `show ${type}`;
  toastTimer = setTimeout(() => { el.className = ''; }, 3000);
}

// ── Nav auth area ─────────────────────────────────
export function updateNavAuth() {
  const el = document.getElementById('nav-auth');
  if (!el) return;
  if (isLoggedIn()) {
    el.innerHTML = `
      ${isAdmin() ? `<a href="#/admin" class="btn btn-ghost">Admin</a>` : ''}
      <a href="#/new-post" class="btn btn-outline">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
        Write
      </a>
      <button onclick="window.__logout()" class="btn btn-ghost">${getUsername()}</button>
    `;
  } else {
    el.innerHTML = `
      <a href="#/login"    class="btn btn-ghost">Sign in</a>
      <a href="#/register" class="btn btn-primary">Get started</a>
    `;
  }
}

// ── Date formatter ────────────────────────────────
export function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

// ── Avatar initials ───────────────────────────────
export function initials(name) {
  return (name || 'A').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

// ── Scroll to top ─────────────────────────────────
export function scrollTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── Header scroll effect ──────────────────────────
export function initHeaderScroll() {
  const header = document.getElementById('site-header');
  if (!header) return;
  const handler = () => header.classList.toggle('scrolled', window.scrollY > 10);
  window.addEventListener('scroll', handler, { passive: true });
  return () => window.removeEventListener('scroll', handler);
}
