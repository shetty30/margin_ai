import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('margin_token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

export default api

export const auth = {
  register: (d) => api.post('/auth/register', d),
  login:    (d) => api.post('/auth/login',    d),
}

export const profile = {
  me:     ()  => api.get('/profile/me'),
  update: (d) => api.patch('/profile/me', d),
  // onboard reuses PATCH /me — update_profile sets onboarded=1 when both income+savings present
  onboard: (d) => api.patch('/profile/me', d),
  uploadAvatar: (file) => {
    const fd = new FormData()
    fd.append('file', file)
    return api.post('/profile/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
  deleteAvatar: () => api.delete('/profile/avatar'),
}

export const dashboard = {
  get: (year, month) => api.get(`/dashboard/?year=${year}&month=${month}`),
}

export const transactions = {
  list:     (year, month, catId) => api.get(`/transactions/?year=${year}&month=${month}${catId ? `&category_id=${catId}` : ''}`),
  create:   (d)   => api.post('/transactions/', d),
  delete:   (id)  => api.delete(`/transactions/${id}`),
  parseSMS: (sms) => api.post('/transactions/parse-sms', { sms_text: sms }),
}

export const goals = {
  list:    ()             => api.get('/goals/'),
  create:  (d)            => api.post('/goals/', d),
  deposit: (id, amount)   => api.patch(`/goals/${id}/deposit?amount=${amount}`),
}

export const ai = {
  chat:   (message)  => api.post('/ai/chat',   { message }),
  afford: (question) => api.post('/ai/afford', { question }),
}
