const API_BASE = '/api';

async function fetchApi(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!res.ok) {
    throw new Error(`API Error: ${res.status}`);
  }

  return res.json();
}

// Public endpoints
export async function getEvents() {
  return fetchApi('/events');
}

export async function getPartners() {
  return fetchApi('/partners');
}

export async function getContent(page) {
  const data = await fetchApi(`/content?page=${page}`);
  return data.map || {};
}

export async function getAllContent() {
  const data = await fetchApi('/content');
  return data.map || {};
}

export async function getSettings() {
  return fetchApi('/settings');
}

export async function getRankings() {
  return fetchApi('/rankings');
}

export async function subscribeNewsletter(nome, email) {
  return fetchApi('/newsletter', {
    method: 'POST',
    body: JSON.stringify({ nome, email }),
  });
}
