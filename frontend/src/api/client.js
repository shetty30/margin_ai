import axios from 'axios'
const api = axios.create({ baseURL: '/api' })
api.interceptors.request.use(cfg => {
  const t = localStorage.getItem('margin_token')
  if (t) cfg.headers.Authorization = `Bearer ${t}`
  return cfg
})
export default api
export const auth = {
  register: d => api.post('/auth/register', d),
  login: d => api.post('/auth/login', d),
}
export const profile = {
  get: () => api.get('/profile/me'),
  update: d => api.patch('/profile/me', d),
  uploadAvatar: f => { const fd = new FormData(); fd.append('file',f); return api.post('/profile/avatar',fd,{headers:{'Content-Type':'multipart/form-data'}}) },
  deleteAvatar: () => api.delete('/profile/avatar'),
}
export const dashboard = { get: (y,m) => api.get(`/dashboard/?year=${y}&month=${m}`) }
export const transactions = {
  list: (y,m) => api.get(`/transactions/?year=${y}&month=${m}`),
  create: d => api.post('/transactions/', d),
  delete: id => api.delete(`/transactions/${id}`),
  parseSMS: t => api.post('/transactions/parse-sms',{sms_text:t}),
}
export const goals = {
  list: () => api.get('/goals/'),
  create: d => api.post('/goals/', d),
  deposit: (id,a) => api.patch(`/goals/${id}/deposit?amount=${a}`),
}
export const ai = {
  chat: m => api.post('/ai/chat',{message:m}),
  afford: q => api.post('/ai/afford',{question:q}),
}
