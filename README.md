# Recetario JR

Vue 3 + Vite con funciones Node para Vercel. Recetario para pacientes: 45 fichas originales, categorías, búsqueda por nombre o categoría (sin distinguir acentos), visor adaptable a móvil y logo JR. Modos claro y oscuro: toma la preferencia del sistema al primer acceso y guarda la elección en el dispositivo.

## Desarrollo

Node 22.12 o posterior.

```sh
npm install
npm run password
npm run dev
```

El comando de contraseña guarda un hash scrypt y una clave aleatoria en `.env.local`, excluido de Git. Introduce la contraseña acordada. No uses prefijo `VITE_` para secretos. Reinicia el servidor al cambiar variables.

```sh
npm test
npm run build
```

`npm run dev` incluye la API. `npm run preview` solo sirve el frontend; verifica funciones de producción en un despliegue Preview de Vercel.

## Vercel

1. Mantén el repositorio **privado** antes de subir las fichas: un repositorio público expondría las imágenes sin login.
2. Importa el repositorio. Framework Vite, Build `npm run build`, Output `dist`.
3. En Settings → Environment Variables agrega `RECIPE_PASSWORD_HASH` y `SESSION_SECRET`, copiando los valores de `.env.local`. Configura Production y Preview según corresponda.
4. Despliega después de configurar variables. Comprueba login, cierre de sesión y una ficha antes de producción.

Las funciones incluyen `assests-recetas/` mediante `includeFiles`. Las imágenes no se copian a `dist` ni a `public`; se sirven tras comprobar una sesión firmada de ocho horas. API con `Cache-Control: private, no-store` y cookie HttpOnly, SameSite y Secure en Vercel.

## Límites de privacidad

Una web no puede impedir capturas del sistema ni fotografías de pantalla. Un usuario autorizado puede extraer lo que ve. El visor añade marca de sesión, bloquea arrastrar y menú contextual, oculta la consulta al pasar la pestaña a segundo plano y deshabilita impresión por CSS. Son medidas disuasorias; la marca puede retirarse con herramientas de desarrollo.

El límite de ocho intentos por IP cada 15 minutos vive en memoria, sin persistencia entre instancias. Para protección adicional configura rate limiting en Vercel Firewall. El hash evita publicar la contraseña, pero una contraseña corta sigue siendo fácil de adivinar.

Las imágenes originales se conservan sin transcribir ingredientes. `server/catalog.js` contiene títulos y categorías, incluidas variantes suministradas. No se realiza push ni publicación automáticamente.
