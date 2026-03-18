import { api } from '../api.js';
import { isAdmin, fmtDate, initials, toast } from '../utils.js';

export async function renderAdmin(container) {
  if (!isAdmin()) {
    container.innerHTML = `
      <div class="admin-page"><div class="container">
        <div class="error-screen">
          <h3>Access denied</h3>
          <p>You need admin privileges to view this page.</p>
          <a href="#/" class="btn btn-outline" style="margin-top:1.5rem">← Go home</a>
        </div>
      </div></div>`;
    return;
  }

  container.innerHTML = `
    <div class="admin-page"><div class="container">
      <div class="loading-screen"><div class="spinner"></div><span>Loading dashboard…</span></div>
    </div></div>`;

  try {
    const [users, posts] = await Promise.all([ api.getUsers(), api.getPosts() ]);

    container.innerHTML = `
      <div class="admin-page page-enter">
        <div class="container">

          <div class="admin-header">
            <div class="overline">Control Panel</div>
            <h1>Admin Dashboard</h1>
          </div>

          <!-- Stats row -->
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;margin-bottom:2.5rem">
            ${[
              ['Total Stories', posts.length, '📝'],
              ['Total Users',   users.length, '👥'],
              ['Admins',        users.filter(u => u.role === 'ADMIN').length, '🛡️'],
            ].map(([label, val, icon]) => `
              <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-lg);padding:1.5rem">
                <div style="font-size:1.5rem;margin-bottom:0.5rem">${icon}</div>
                <div style="font-family:var(--font-serif);font-size:2rem;font-weight:900;color:var(--accent)">${val}</div>
                <div style="font-size:0.78rem;color:var(--text-3);font-family:var(--font-mono);text-transform:uppercase;letter-spacing:0.08em">${label}</div>
              </div>`).join('')}
          </div>

          <!-- Tabs -->
          <div class="admin-tabs">
            <button class="admin-tab active" data-tab="posts">Stories</button>
            <button class="admin-tab" data-tab="users">Users</button>
          </div>

          <!-- Posts table -->
          <div id="tab-posts">
            <table class="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Published</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${posts.map(p => `
                  <tr>
                    <td style="color:var(--text-3);font-family:var(--font-mono)">${p.id}</td>
                    <td><a href="#/post/${p.id}">${p.title}</a></td>
                    <td>
                      <div style="display:flex;align-items:center;gap:0.5rem">
                        <div class="avatar" style="width:24px;height:24px;font-size:0.65rem">${initials(p.author)}</div>
                        ${p.author || '—'}
                      </div>
                    </td>
                    <td>${fmtDate(p.createdAt)}</td>
                    <td>
                      <div style="display:flex;gap:0.5rem">
                        <a href="#/edit/${p.id}" class="btn btn-ghost btn-sm">Edit</a>
                        <button onclick="window.__adminDeletePost(${p.id})" class="btn btn-danger btn-sm">Delete</button>
                      </div>
                    </td>
                  </tr>`).join('')}
                ${posts.length === 0 ? `<tr><td colspan="5" style="text-align:center;color:var(--text-3);padding:2rem">No stories yet</td></tr>` : ''}
              </tbody>
            </table>
          </div>

          <!-- Users table -->
          <div id="tab-users" style="display:none">
            <table class="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${users.map(u => `
                  <tr>
                    <td style="color:var(--text-3);font-family:var(--font-mono)">${u.id}</td>
                    <td>
                      <div style="display:flex;align-items:center;gap:0.6rem">
                        <div class="avatar" style="width:28px;height:28px;font-size:0.7rem">${initials(u.username)}</div>
                        <span>${u.username}</span>
                      </div>
                    </td>
                    <td style="color:var(--text-2)">${u.email}</td>
                    <td>
                      <span class="badge ${u.role === 'ADMIN' ? 'badge-gold' : 'badge-gray'}">${u.role}</span>
                    </td>
                    <td>
                      <button onclick="window.__adminDeleteUser(${u.id})" class="btn btn-danger btn-sm">Delete</button>
                    </td>
                  </tr>`).join('')}
              </tbody>
            </table>
          </div>

        </div>
      </div>`;

    // Tab switching
    document.querySelectorAll('.admin-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById('tab-posts').style.display = tab.dataset.tab === 'posts' ? 'block' : 'none';
        document.getElementById('tab-users').style.display = tab.dataset.tab === 'users' ? 'block' : 'none';
      });
    });

    window.__adminDeletePost = async (id) => {
      if (!confirm('Delete this story permanently?')) return;
      try {
        await api.deletePost(id);
        toast('Story deleted', 'success');
        renderAdmin(container);
      } catch (e) { toast(e.message, 'error'); }
    };

    window.__adminDeleteUser = async (id) => {
      if (!confirm('Delete this user account?')) return;
      try {
        await api.deleteUser(id);
        toast('User deleted', 'success');
        renderAdmin(container);
      } catch (e) { toast(e.message, 'error'); }
    };

  } catch (err) {
    container.innerHTML = `
      <div class="admin-page"><div class="container">
        <div class="error-screen">
          <h3>Failed to load dashboard</h3>
          <p>${err.message}</p>
        </div>
      </div></div>`;
  }
}
