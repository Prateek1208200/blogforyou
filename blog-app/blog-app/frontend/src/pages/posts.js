import { api } from '../api.js';
import { fmtDate, initials, isLoggedIn } from '../utils.js';
import { setPostsCache } from '../main.js';

export async function renderPosts(container, overridePosts = null) {
  container.innerHTML = `
    <div class="posts-page">
      <div class="container">
        <div class="loading-screen"><div class="spinner"></div><span>Loading stories…</span></div>
      </div>
    </div>`;

  try {
    const posts = overridePosts ?? await api.getPosts();
    if (!overridePosts) setPostsCache(posts);

    container.innerHTML = `
      <div class="posts-page page-enter">
        <div class="container">
          <div class="posts-hero">
            <div class="posts-hero-inner">
              <h1>Stories worth<br><em>reading.</em></h1>
              <p>${posts.length} ${posts.length === 1 ? 'story' : 'stories'} published<br>by our writers</p>
            </div>
          </div>
          <div class="posts-grid" id="posts-grid"></div>
        </div>
      </div>`;

    const grid = document.getElementById('posts-grid');

    if (posts.length === 0) {
      grid.innerHTML = `
        <div class="posts-empty">
          <h3>No stories yet</h3>
          <p>Be the first to write something.</p>
          ${isLoggedIn() ? `<a href="#/new-post" class="btn btn-primary" style="margin-top:1.5rem">Start writing</a>` : ''}
        </div>`;
      return;
    }

    posts.forEach((post, i) => {
      const card = document.createElement('article');
      card.className = `post-card${i === 0 ? ' featured' : ''}`;

      const inner = i === 0 ? `
        <div class="post-card-text">
          <span class="post-card-tag">Featured</span>
          <h2>${post.title}</h2>
          <p class="post-card-excerpt">${post.content}</p>
          <div class="post-card-footer">
            <div class="post-card-meta">
              <div class="avatar">${initials(post.author)}</div>
              <span>${post.author || 'Anonymous'}</span>
              <span>·</span>
              <span>${fmtDate(post.createdAt)}</span>
            </div>
            <span class="post-card-arrow">→</span>
          </div>
        </div>` : `
        <span class="post-card-tag">Article</span>
        <h2>${post.title}</h2>
        <p class="post-card-excerpt">${post.content}</p>
        <div class="post-card-footer">
          <div class="post-card-meta">
            <div class="avatar">${initials(post.author)}</div>
            <span>${post.author || 'Anonymous'}</span>
            <span>·</span>
            <span>${fmtDate(post.createdAt)}</span>
          </div>
          <span class="post-card-arrow">→</span>
        </div>`;

      card.innerHTML = inner;
      card.addEventListener('click', () => { window.location.hash = `#/post/${post.id}`; });
      grid.appendChild(card);
    });

  } catch (err) {
    container.innerHTML = `
      <div class="posts-page"><div class="container">
        <div class="error-screen">
          <h3>Failed to load</h3>
          <p>${err.message}</p>
          <button onclick="location.reload()" class="btn btn-outline" style="margin-top:1.5rem">Try again</button>
        </div>
      </div></div>`;
  }
}
