const API_BASE = '/api';

function getToken() {
  return localStorage.getItem('fcth_token');
}

async function fetchApi(endpoint, options = {}) {
  const token = getToken();
  const headers = { ...options.headers };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Don't set Content-Type for FormData
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });

  if (res.status === 401) {
    localStorage.removeItem('fcth_token');
    localStorage.removeItem('fcth_user');
    window.location.href = '/admin/login';
    throw new Error('Sessão expirada');
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Erro ${res.status}`);
  }

  // Handle CSV export
  const ct = res.headers.get('content-type');
  if (ct && ct.includes('text/csv')) {
    return res.blob();
  }

  return res.json();
}

// Auth
export async function login(username, password) {
  const data = await fetchApi('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  localStorage.setItem('fcth_token', data.token);
  localStorage.setItem('fcth_user', JSON.stringify(data.user));
  return data;
}

export function logout() {
  localStorage.removeItem('fcth_token');
  localStorage.removeItem('fcth_user');
}

export function getUser() {
  const u = localStorage.getItem('fcth_user');
  return u ? JSON.parse(u) : null;
}

export function isAuthenticated() {
  return !!getToken();
}

// Events
export const getEvents = () => fetchApi('/events/all');
export const createEvent = (formData) => fetchApi('/events', { method: 'POST', body: formData });
export const updateEvent = (id, formData) => fetchApi(`/events/${id}`, { method: 'PUT', body: formData });
export const deleteEvent = (id) => fetchApi(`/events/${id}`, { method: 'DELETE' });

// Partners
export const getPartners = () => fetchApi('/partners/all');
export const createPartner = (formData) => fetchApi('/partners', { method: 'POST', body: formData });
export const updatePartner = (id, formData) => fetchApi(`/partners/${id}`, { method: 'PUT', body: formData });
export const deletePartner = (id) => fetchApi(`/partners/${id}`, { method: 'DELETE' });

// Content
export const getAllContent = () => fetchApi('/content/all');
export const updateContentBatch = (items) => fetchApi('/content/batch', { method: 'PUT', body: JSON.stringify({ items }) });

// Newsletter
export const getNewsletterSignups = () => fetchApi('/newsletter');
export const deleteNewsletterSignup = (id) => fetchApi(`/newsletter/${id}`, { method: 'DELETE' });
export async function exportNewsletter() {
  const blob = await fetchApi('/newsletter/export');
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'newsletter_fcth.csv';
  a.click();
  URL.revokeObjectURL(url);
}

// Settings
export const getSettings = () => fetchApi('/settings');
export const updateSettingsBatch = (items) => fetchApi('/settings/batch', { method: 'PUT', body: JSON.stringify({ items }) });
export const uploadSettingFile = (file, settingKey) => {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('setting_key', settingKey);
  return fetchApi('/settings/upload', { method: 'POST', body: fd });
};

// Rankings
export const getRankingCategories = () => fetchApi('/rankings/categories');
export const createRankingCategory = (data) => fetchApi('/rankings/categories', { method: 'POST', body: JSON.stringify(data) });
export const updateRankingCategory = (id, data) => fetchApi(`/rankings/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteRankingCategory = (id) => fetchApi(`/rankings/categories/${id}`, { method: 'DELETE' });
export const getCategoryEtapas = (categoryId) => fetchApi(`/rankings/categories/${categoryId}/etapas`);
export const getAggregatedRanking = (categoryId) => fetchApi(`/rankings/categories/${categoryId}/aggregated`);
export const uploadRankingCSV = (categoryId, formData) => fetchApi(`/rankings/categories/${categoryId}/upload`, { method: 'POST', body: formData });
export const deleteRankingEtapa = (id) => fetchApi(`/rankings/etapas/${id}`, { method: 'DELETE' });

// Uploads
export const uploadFile = (formData) => fetchApi('/uploads', { method: 'POST', body: formData });
export const uploadContentImage = (file, contentKey) => {
  const fd = new FormData();
  fd.append('image', file);
  if (contentKey) fd.append('content_key', contentKey);
  return fetchApi('/content/upload-image', { method: 'POST', body: fd });
};

// Dashboard stats
export async function getDashboardStats() {
  const [events, partners, newsletter, categories] = await Promise.all([
    getEvents(),
    getPartners(),
    getNewsletterSignups(),
    getRankingCategories(),
  ]);
  return {
    totalEvents: events.length,
    totalPartners: partners.length,
    totalNewsletter: newsletter.length,
    totalRankings: categories.length,
  };
}
