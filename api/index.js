import {readFile} from 'node:fs/promises'
import {join} from 'node:path'
import {verifyPassword, sign, readToken} from '../server/auth.js'
import {recipes} from '../server/catalog.js'
const attempts=new Map()
export default async function handler(req,res) {
 res.setHeader('Cache-Control','private, no-store, max-age=0'); res.setHeader('X-Content-Type-Options','nosniff')
 const json=(status,data)=>{res.statusCode=status;res.setHeader('Content-Type','application/json');res.end(JSON.stringify(data))}
 const secret=process.env.SESSION_SECRET, hash=process.env.RECIPE_PASSWORD_HASH
 if(!secret || secret.length<32 || !hash) return json(503,{error:'Configura las variables privadas del servidor para habilitar el acceso.'})
 const url=new URL(req.url,'http://localhost'), action=url.searchParams.get('action') || 'session'
 const cookies=Object.fromEntries((req.headers.cookie||'').split(';').map(v=>v.trim().split('=')))
 const session=readToken(cookies.jr_session||'',secret)
 const cookie=(value,age)=>res.setHeader('Set-Cookie',`jr_session=${value}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${age}${process.env.VERCEL?' ; Secure':''}`)
 if(req.method==='POST') {
  const origin=req.headers.origin
  if(!origin || new URL(origin).host!==req.headers.host) return json(403,{error:'Origen no autorizado.'})
  if(action==='logout'){cookie('',0);return json(200,{ok:true})}
  if(action!=='login') return json(405,{error:'Operación no permitida.'})
  const ip=req.headers['x-forwarded-for']||req.socket?.remoteAddress||'local'
  const now=Date.now(); for(const [key,value] of attempts) if(value.until<now) attempts.delete(key)
  const limit=attempts.get(ip)
  if(limit?.count>=8) return json(429,{error:'Demasiados intentos. Intenta de nuevo en 15 minutos.'})
  let body=req.body
  if(!body){let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>2048)return json(413,{error:'Solicitud demasiado grande.'})}try{body=JSON.parse(raw)}catch{return json(400,{error:'Solicitud inválida.'})}}
  if(typeof body==='string'){try{body=JSON.parse(body)}catch{return json(400,{error:'Solicitud inválida.'})}}
  if(typeof body?.password!=='string' || body.password.length>256) return json(400,{error:'Contraseña inválida.'})
  if(!verifyPassword(body.password,hash)){attempts.set(ip,{count:(limit?.count||0)+1,until:limit?.until||now+900000});await new Promise(r=>setTimeout(r,500));return json(401,{error:'La contraseña no es correcta.'})}
  attempts.delete(ip);cookie(sign({exp:now+8*3600000,id:Math.random().toString(36).slice(2,8).toUpperCase()},secret),28800);return json(200,{ok:true})
 }
 if(req.method!=='GET')return json(405,{error:'Método no permitido.'})
 if(!session)return json(401,{error:'Inicia sesión para consultar el recetario.'})
 if(action==='session')return json(200,{ok:true,watermark:session.id})
 if(action==='recipes')return json(200,{recipes:recipes.map(({file,...recipe})=>recipe)})
 if(action==='image') {const recipe=recipes.find(r=>r.id===url.searchParams.get('id'));if(!recipe)return json(404,{error:'Receta no encontrada.'});try{const image=await readFile(join(process.cwd(),'assests-recetas',recipe.file));res.setHeader('Content-Type','image/jpeg');res.end(image)}catch{return json(404,{error:'Ficha no disponible.'})}return}
 return json(404,{error:'Ruta no encontrada.'})
}
