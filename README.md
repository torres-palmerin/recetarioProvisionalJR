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

## Netlify

1. Importa el repositorio en Netlify. `netlify.toml` configura `npm run build`, `dist` y la función `netlify/functions/api.js`.
2. En Site configuration → Environment variables agrega `RECIPE_PASSWORD_HASH` y `SESSION_SECRET` para Production y Deploy Previews.
3. Despliega y comprueba primero `/api?action=session`, el login y la apertura de una ficha.

Las reglas de `netlify.toml` deben permanecer antes del fallback de `/*` para que `/api` no reciba `index.html`.

## Protección de contenido

`src/content-protection.js` activa medidas disuasorias únicamente después del login: deshabilita selección, menú contextual, copiar, cortar, pegar, arrastre y atajos habituales de impresión o herramientas de desarrollo. También oculta el contenido cuando la pestaña o ventana pierde visibilidad. La limpieza de portapapeles para `PrintScreen` depende de permisos del navegador y puede no estar disponible.

Estas medidas no pueden controlar capturas hechas por el sistema operativo ni impedir que una persona fotografíe la pantalla. Canvas tampoco ofrece protección contra capturas; solo evita que el texto exista como nodos HTML fácilmente extraíbles. En este proyecto las fichas ya se entregan como imágenes protegidas por sesión.

Para una aplicación Android empaquetada, activa la protección nativa en la Activity:

```java
getWindow().setFlags(
	WindowManager.LayoutParams.FLAG_SECURE,
	WindowManager.LayoutParams.FLAG_SECURE
);
```

En iOS, la notificación permite reaccionar después de una captura, no impedirla:

```swift
NotificationCenter.default.addObserver(
	forName: UIApplication.userDidTakeScreenshotNotification,
	object: nil,
	queue: .main
) { _ in
	// Registrar el evento o mostrar una advertencia.
}
```

`isSecureTextEntry` puede usarse como técnica de ocultación en ciertos contenedores iOS, pero no es una API pública para proteger una vista web completa y debe probarse por versión del sistema.

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
