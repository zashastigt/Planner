import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'


// https://vite.dev/config/
export default ({mode}) => {
  const env = loadEnv(mode, process.cwd());
  
  return defineConfig({
    plugins: [vue()],
    server: {
      port: 8080,
      strictPort: true,
      host: true,
      origin: env.FRONTEND_URL,
      allowedHosts: [env.DOMAIN]
    }
  })
}
