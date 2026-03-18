const BASE = '/api';

const headers = () => ({
  'Content-Type': 'application/json',
  ...(localStorage.getItem('token')
    ? { Authorization: `Bearer ${localStorage.getItem('token')}` }
    : {})
});

const handle = async (res) => {
  if (!res.ok) {
    const msg = await res.text().catch(() => `HTTP ${res.status}`);
    throw new Error(msg || `HTTP ${res.status}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
};

export const api = {
  register:      (d) => fetch(`${BASE}/auth/register`, { method: 'POST', headers: headers(), body: JSON.stringify(d) }).then(handle),
  login:         (d) => fetch(`${BASE}/auth/login`,    { method: 'POST', headers: headers(), body: JSON.stringify(d) }).then(handle),
  getPosts:      ()  => fetch(`${BASE}/posts`,          { headers: headers() }).then(handle),
  getPost:       (id)=> fetch(`${BASE}/posts/${id}`,    { headers: headers() }).then(handle),
  createPost:    (d) => fetch(`${BASE}/posts`,          { method: 'POST', headers: headers(), body: JSON.stringify(d) }).then(handle),
  updatePost:    (id,d)=>fetch(`${BASE}/posts/${id}`,   { method: 'PUT',  headers: headers(), body: JSON.stringify(d) }).then(handle),
  deletePost:    (id)=> fetch(`${BASE}/posts/${id}`,    { method: 'DELETE', headers: headers() }).then(handle),
  getComments:   (id)=> fetch(`${BASE}/comments/${id}`, { headers: headers() }).then(handle),
  addComment:    (id,d)=>fetch(`${BASE}/comments/${id}`,{ method: 'POST', headers: headers(), body: JSON.stringify(d) }).then(handle),
  deleteComment: (id)=> fetch(`${BASE}/comments/${id}`, { method: 'DELETE', headers: headers() }).then(handle),
  getUsers:      ()  => fetch(`${BASE}/admin/users`,    { headers: headers() }).then(handle),
  deleteUser:    (id)=> fetch(`${BASE}/admin/users/${id}`,{ method: 'DELETE', headers: headers() }).then(handle),
};
