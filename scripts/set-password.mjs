import { passwordHash } from '../server/auth.js'
import { randomBytes } from 'node:crypto'
import {writeFileSync} from 'node:fs'
import {createInterface} from 'node:readline/promises'
const rl=createInterface({input:process.stdin,output:process.stdout})
const password=await rl.question('Contraseña para el recetario (entrada visible solo en esta terminal): ')
rl.close()
if(!password) throw new Error('La contraseña no puede estar vacía')
writeFileSync('.env.local',`RECIPE_PASSWORD_HASH=${passwordHash(password)}\nSESSION_SECRET=${randomBytes(32).toString('hex')}\n`)
console.log('Configuración guardada en .env.local (excluida de Git).')
