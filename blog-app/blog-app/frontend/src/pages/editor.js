import { api } from '../api.js';
import { navigate, isLoggedIn, toast } from '../utils.js';

export async function renderEditor(container, id = null) {
  if (!isLoggedIn()) { navigate('#/login'); return; }

  const isEdit = id !== null;
  let post = null;

  if (isEdit) {
    container.innerHTML = `<div class="editor-page"><div class="container"><div class="loading-screen"><div class="spinner"></div></div></div></div>`;
    try { post = await api.getPost(id); }
    catch { toast('Post not found', 'error'); navigate('#/'); return; }
  }

  container.innerHTML = `
    <div class="editor-page page-enter">
      <div class="container" style="max-width:820px">

        <div class="editor-header">
          <div>
            <div style="font-family:var(--font-mono);font-size:0.72rem;color:var(--accent);text-transform:uppercase;letter-spacing:0.1em;margin-bottom:0.3rem">
              ${isEdit ? 'Editing story' : 'New story'}
            </div>
            <h2>${isEdit ? post.title : 'Write something great'}</h2>
          </div>
          <div class="editor-actions">
            <a href="${isEdit ? `#/post/${id}` : '#/'}" class="btn btn-ghost">Discard</a>
            <button id="btn-publish" class="btn btn-primary">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
              ${isEdit ? 'Save changes' : 'Publish'}
            </button>
          </div>
        </div>

        <div class="editor-meta-row">
          <div class="form-group">
            <label class="form-label">Author name</label>
            <input type="text" id="f-author" class="form-input" placeholder="Your display name" value="${post?.author || ''}" />
          </div>
          <div class="form-group">
            <label class="form-label">Category <span style="color:var(--text-3)">(optional)</span></label>
            <input type="text" id="f-category" class="form-input" placeholder="e.g. Technology, Life, Travel" />
          </div>
        </div>

        <div class="editor-field title-field form-group">
          <label class="form-label">Title</label>
          <input type="text" id="f-title" class="form-input" placeholder="Your story title…" value="${post?.title || ''}" />
        </div>

        <div class="editor-field form-group">
          <label class="form-label">Content</label>
          <textarea id="f-content" class="form-textarea">${post?.content || ''}</textarea>
        </div>

        <div id="editor-error" class="form-error" style="display:none;margin-top:0.5rem">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12" y2="16"/></svg>
          <span id="editor-error-text"></span>
        </div>

        <!-- Word count -->
        <div style="text-align:right;margin-top:0.5rem;font-size:0.78rem;color:var(--text-3);font-family:var(--font-mono)">
          <span id="word-count">0</span> words
        </div>

      </div>
    </div>`;

  // Word count
  const content = document.getElementById('f-content');
  const wc      = document.getElementById('word-count');
  const countWords = () => {
    const words = content.value.trim().split(/\s+/).filter(Boolean).length;
    wc.textContent = words;
  };
  countWords();
  content.addEventListener('input', countWords);

  // Publish
  document.getElementById('btn-publish').addEventListener('click', async () => {
    const errWrap = document.getElementById('editor-error');
    const errText = document.getElementById('editor-error-text');
    errWrap.style.display = 'none';

    const payload = {
      title:   document.getElementById('f-title').value.trim(),
      author:  document.getElementById('f-author').value.trim(),
      content: document.getElementById('f-content').value.trim(),
    };

    if (!payload.title)   { errText.textContent = 'Title is required.';   errWrap.style.display = 'flex'; return; }
    if (!payload.content) { errText.textContent = 'Content is required.'; errWrap.style.display = 'flex'; return; }

    const btn = document.getElementById('btn-publish');
    btn.disabled = true;
    btn.textContent = isEdit ? 'Saving…' : 'Publishing…';

    try {
      if (isEdit) {
        await api.updatePost(id, payload);
        toast('Story updated!', 'success');
        navigate(`#/post/${id}`);
      } else {
        const created = await api.createPost(payload);
        toast('Story published!', 'success');
        navigate(`#/post/${created.id}`);
      }
    } catch (err) {
      errText.textContent = err.message || 'Failed to save.';
      errWrap.style.display = 'flex';
      btn.disabled = false;
      btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg> ${isEdit ? 'Save changes' : 'Publish'}`;
    }
  });
}
