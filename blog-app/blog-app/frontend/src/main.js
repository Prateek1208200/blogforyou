import { updateNavAuth, initHeaderScroll, navigate, logout } from './utils.js';
import { renderPosts }  from './pages/posts.js';
import { renderPost }   from './pages/post.js';
import { renderAuth }   from './pages/auth.js';
import { renderEditor } from './pages/editor.js';
import { renderAdmin }  from './pages/admin.js';

// ── Expose globals ────────────────────────────────
window.__logout   = logout;
window.__navigate = navigate;

// ── Search filter ─────────────────────────────────
let allPosts = [];
export function setPostsCache(posts) { allPosts = posts; }
export function getPostsCache()      { return allPosts; }

// ── Router ────────────────────────────────────────
async function router() {
  const hash = window.location.hash || '#/';
  const app  = document.getElementById('app');

  // Fade out — use opacity only; transform on #app breaks position:fixed (toast)
  app.style.transition = 'opacity 0.15s ease';
  app.style.opacity    = '0';

  await new Promise(r => setTimeout(r, 130));

  app.innerHTML = '';
  app.style.transition = 'opacity 0.3s ease';
  app.style.opacity    = '1';

  if      (hash === '#/')               await renderPosts(app);
  else if (hash === '#/login')          await renderAuth(app, 'login');
  else if (hash === '#/register')       await renderAuth(app, 'register');
  else if (hash === '#/new-post')       await renderEditor(app);
  else if (hash === '#/admin')          await renderAdmin(app);
  else if (hash.startsWith('#/post/'))  await renderPost(app, hash.split('/')[2]);
  else if (hash.startsWith('#/edit/'))  await renderEditor(app, hash.split('/')[2]);
  else {
    app.innerHTML = `
      <div class="loading-screen">
        <p style="font-family:var(--font-serif);font-size:3rem;font-weight:900;color:var(--text-3)">404</p>
        <p style="color:var(--text-3)">Page not found</p>
        <a href="#/" class="btn btn-outline" style="margin-top:1rem">← Back home</a>
      </div>`;
  }

  window.scrollTo({ top: 0 });
}

// ── Search ────────────────────────────────────────
document.getElementById('search-input')?.addEventListener('input', (e) => {
  const q = e.target.value.trim().toLowerCase();
  if (!q) { if (window.location.hash === '#/') router(); return; }
  const app = document.getElementById('app');
  const results = getPostsCache().filter(p =>
    p.title.toLowerCase().includes(q) ||
    (p.content || '').toLowerCase().includes(q) ||
    (p.author  || '').toLowerCase().includes(q)
  );
  // Re-render posts page filtered
  import('./pages/posts.js').then(m => m.renderPosts(app, results));
});

// ── Init ──────────────────────────────────────────
updateNavAuth();
initHeaderScroll();
window.addEventListener('hashchange', router);
window.addEventListener('load', router);
