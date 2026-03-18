import { api } from '../api.js';
import { fmtDate, initials, isLoggedIn, toast } from '../utils.js';

export async function renderPost(container, id) {
  container.innerHTML = `
    <div class="post-page">
      <div class="content-narrow">
        <div class="loading-screen"><div class="spinner"></div><span>Loading story…</span></div>
      </div>
    </div>`;

  try {
    const [post, comments] = await Promise.all([
      api.getPost(id),
      api.getComments(id)
    ]);

    container.innerHTML = `
      <div class="post-page page-enter">
        <div class="content-narrow">

          <a href="#/" class="post-back">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
            All stories
          </a>

          <header class="post-header">
            <div class="post-tag">Article</div>
            <h1 class="post-title">${post.title}</h1>
            <div class="post-byline">
              <div class="byline-avatar">${initials(post.author)}</div>
              <div class="byline-info">
                <div class="byline-name">${post.author || 'Anonymous'}</div>
                <div class="byline-date">${fmtDate(post.createdAt)}</div>
              </div>
              ${isLoggedIn() ? `
                <div class="post-actions">
                  <a href="#/edit/${post.id}" class="btn btn-ghost btn-sm">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    Edit
                  </a>
                  <button id="btn-delete-post" class="btn btn-danger btn-sm">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>
                    Delete
                  </button>
                </div>` : ''}
            </div>
          </header>

          <hr class="post-divider">
          <div class="post-body">${post.content}</div>
          <hr class="post-divider">

          <!-- Comments -->
          <section class="comments-section">
            <div class="comments-header">
              <h3>Responses</h3>
              <span class="comments-count" id="comments-count">${comments.length}</span>
            </div>
            <div id="comments-list"></div>

            ${isLoggedIn() ? `
              <div class="comment-form">
                <h4>Leave a response</h4>
                <div class="comment-form-row">
                  <div>
                    <label class="form-label">Your name</label>
                    <input type="text" id="comment-author" class="form-input" placeholder="Display name" />
                  </div>
                  <div>
                    <label class="form-label">Message</label>
                    <input type="text" id="comment-preview" class="form-input" placeholder="Keep it short…" style="display:none"/>
                  </div>
                </div>
                <div class="form-group">
                  <label class="form-label">Comment</label>
                  <textarea id="comment-content" class="form-textarea" style="min-height:100px" placeholder="Share your thoughts…"></textarea>
                </div>
                <div style="display:flex;justify-content:flex-end">
                  <button id="btn-comment" class="btn btn-primary">Post response</button>
                </div>
              </div>` : `
              <p style="color:var(--text-3);font-size:0.88rem;margin-top:1.5rem">
                <a href="#/login" style="color:var(--accent)">Sign in</a> to leave a response.
              </p>`}
          </section>

        </div>
      </div>`;

    // Render comments
    renderCommentsList(comments);

    // Delete post
    document.getElementById('btn-delete-post')?.addEventListener('click', async () => {
      if (!confirm('Delete this post permanently?')) return;
      try {
        await api.deletePost(id);
        toast('Post deleted', 'success');
        window.location.hash = '#/';
      } catch (e) { toast(e.message, 'error'); }
    });

    // Post comment
    document.getElementById('btn-comment')?.addEventListener('click', async () => {
      const content = document.getElementById('comment-content').value.trim();
      const author  = document.getElementById('comment-author').value.trim();
      if (!content) { toast('Please write something first', 'error'); return; }
      try {
        await api.addComment(id, { content, author: author || 'Anonymous' });
        document.getElementById('comment-content').value = '';
        document.getElementById('comment-author').value  = '';
        const updated = await api.getComments(id);
        document.getElementById('comments-count').textContent = updated.length;
        renderCommentsList(updated);
        toast('Response posted!', 'success');
      } catch (e) { toast(e.message, 'error'); }
    });

  } catch (err) {
    container.innerHTML = `
      <div class="post-page"><div class="content-narrow">
        <div class="error-screen">
          <h3>Post not found</h3>
          <p>${err.message}</p>
          <a href="#/" class="btn btn-outline" style="margin-top:1.5rem">← Back home</a>
        </div>
      </div></div>`;
  }
}

function renderCommentsList(comments) {
  const list = document.getElementById('comments-list');
  if (!list) return;
  if (comments.length === 0) {
    list.innerHTML = `<p style="color:var(--text-3);font-size:0.88rem;padding:1rem 0">No responses yet.</p>`;
    return;
  }
  list.innerHTML = comments.map(c => `
    <div class="comment-item">
      <div class="comment-meta">
        <div class="avatar" style="width:30px;height:30px;font-size:0.72rem">${initials(c.author)}</div>
        <span class="comment-author">${c.author || 'Anonymous'}</span>
        <span class="comment-date">${fmtDate(c.createdAt)}</span>
        ${isLoggedIn() ? `
          <button onclick="window.__deleteComment(${c.id})" class="btn btn-icon btn-sm" title="Delete">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>` : ''}
      </div>
      <p class="comment-text">${c.content}</p>
    </div>`).join('');

  window.__deleteComment = async (cid) => {
    if (!confirm('Delete this comment?')) return;
    try {
      await api.deleteComment(cid);
      const postId = window.location.hash.split('/')[2];
      const updated = await api.getComments(postId);
      document.getElementById('comments-count').textContent = updated.length;
      renderCommentsList(updated);
      toast('Comment deleted', 'success');
    } catch (e) { toast(e.message, 'error'); }
  };
}
