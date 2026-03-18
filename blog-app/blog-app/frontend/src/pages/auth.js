import { api } from '../api.js';
import { updateNavAuth, toast } from '../utils.js';

export async function renderAuth(container, mode) {
  const isLogin = mode === 'login';

  container.innerHTML = `
    <div class="auth-page page-enter">
      <div class="auth-panel">
        <div class="auth-panel-header">
          <div class="overline">${isLogin ? 'Welcome back' : 'Join Inkwell'}</div>
          <h1>${isLogin ? 'Sign in' : 'Create account'}</h1>
          <p>${isLogin
            ? 'Continue reading stories that matter to you.'
            : 'Start reading and writing stories today.'}</p>
        </div>

        <form id="auth-form" novalidate>
          ${!isLogin ? `
            <div class="form-group">
              <label class="form-label">Username</label>
              <input id="f-username" type="text" class="form-input" placeholder="Choose a username" />
            </div>` : ''}

          <div class="form-group">
            <label class="form-label">Email address</label>
            <input id="f-email" type="email" class="form-input" placeholder="you@example.com" />
          </div>

          <div class="form-group">
            <label class="form-label">Password</label>
            <div style="position:relative">
              <input id="f-password" type="password" class="form-input" placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;" style="padding-right:2.8rem" />
              <button type="button" id="btn-toggle-pw" tabindex="-1"
                style="position:absolute;right:0.75rem;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:var(--text-3);padding:0;display:flex;align-items:center">
                <svg id="pw-show" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                </svg>
                <svg id="pw-hide" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:none">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              </button>
            </div>
          </div>

          <div id="auth-error" class="form-error" style="display:none;margin-bottom:0.75rem">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12" y2="16"/>
            </svg>
            <span id="auth-error-text"></span>
          </div>

          <button type="submit" id="auth-submit" class="btn btn-primary"
            style="width:100%;justify-content:center;padding:0.75rem;margin-top:0.25rem;border-radius:var(--radius);font-size:0.95rem">
            ${isLogin ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <div class="auth-switch">
          ${isLogin
            ? "Don't have an account? <a href='#/register'>Sign up free</a>"
            : "Already have an account? <a href='#/login'>Sign in</a>"}
        </div>
      </div>
    </div>`;

  // Password visibility toggle
  document.getElementById('btn-toggle-pw').addEventListener('click', () => {
    const input = document.getElementById('f-password');
    const hidden = input.type === 'password';
    input.type = hidden ? 'text' : 'password';
    document.getElementById('pw-show').style.display = hidden ? 'none'  : 'block';
    document.getElementById('pw-hide').style.display = hidden ? 'block' : 'none';
  });

  function showError(msg) {
    document.getElementById('auth-error-text').textContent = msg;
    document.getElementById('auth-error').style.display = 'flex';
  }

  function setLoading(on) {
    const btn = document.getElementById('auth-submit');
    if (!btn) return;
    btn.disabled    = on;
    btn.textContent = on
      ? (isLogin ? 'Signing in...' : 'Creating account...')
      : (isLogin ? 'Sign in'       : 'Create account');
  }

  function validate(p) {
    if (!isLogin && !p.username)         return 'Username is required.';
    if (!p.email)                        return 'Email is required.';
    if (!/\S+@\S+\.\S+/.test(p.email))  return 'Enter a valid email address.';
    if (!p.password)                     return 'Password is required.';
    if (!isLogin && p.password.length < 6) return 'Password must be at least 6 characters.';
    return null;
  }

  document.getElementById('auth-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    document.getElementById('auth-error').style.display = 'none';

    const payload = {
      email:    (document.getElementById('f-email')?.value    || '').trim(),
      password:  document.getElementById('f-password')?.value || '',
    };
    if (!isLogin) {
      payload.username = (document.getElementById('f-username')?.value || '').trim();
    }

    const validErr = validate(payload);
    if (validErr) { showError(validErr); return; }

    setLoading(true);

    try {
      if (isLogin) {
        const data = await api.login(payload);
        localStorage.setItem('token',    data.token);
        localStorage.setItem('role',     data.role     || 'USER');
        localStorage.setItem('username', data.username || 'User');
        updateNavAuth();
        toast('Welcome back, ' + (data.username || 'friend') + '!', 'success');
        window.location.hash = '#/';
      } else {
        await api.register(payload);
        toast('Account created! Please sign in.', 'success');
        window.location.hash = '#/login';
      }
    } catch (ex) {
      showError(ex.message || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  });

  // Auto-focus first field
  setTimeout(() => {
    document.getElementById(isLogin ? 'f-email' : 'f-username')?.focus();
  }, 120);
}
