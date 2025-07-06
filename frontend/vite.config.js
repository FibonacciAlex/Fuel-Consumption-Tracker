import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/fuel-consumption-tracker/', // Set the base path for the application, if no subdirectory is used, set to '/'
  plugins: [react()],
})
