import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import handler from './api/index.js'
export default defineConfig(({mode}) => {
 Object.assign(process.env, loadEnv(mode, process.cwd(), ''))
 return {
  plugins: [vue(), {
   name:'private-recipes-api',
   configureServer(server) {
    server.middlewares.use('/api', async (req,res) => {
     try {await handler(req,res)} catch {res.statusCode=500; res.end(JSON.stringify({error:'Error del servidor'}))}
    })
   }
  }],
  server:{fs:{deny:['.env','.env.*','**/assests-recetas/**','**/server/**','**/api/**']}}
 }
})
