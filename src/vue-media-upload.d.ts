declare module 'vue-media-upload' {
  import type { DefineComponent } from 'vue'
  import type { UploadMedia } from './types'
  const Uploader: DefineComponent<{
    server: string
    media?: UploadMedia[]
    headers?: Record<string, string>
    max?: number
    maxFilesize?: number
    warnings?: boolean
  }>
  export default Uploader
}
