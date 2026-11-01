import axios from './AxiosClient'
import NProgress from 'nprogress'
let pending = 0
axios.interceptors.request.use((config) => {
  pending++
  NProgress.start()
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})
function finish() {
  pending = Math.max(0, pending - 1)
  if (pending === 0) NProgress.done()
}
axios.interceptors.response.use(
  (response) => {
    finish()
    return response
  },
  (error) => {
    finish()
    return Promise.reject(error)
  },
)
