# BetData IA

Telegram Mini App de **inteligencia de fútbol en vivo**. La IA escanea el día, destaca la señal más fuerte y explica el porqué. Pensada para usarse y retransmitirse en vertical.

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- Framer Motion + Recharts
- `@telegram-apps/sdk` + script oficial `telegram-web-app.js`
- Feed SportAPI (SofaScore vía RapidAPI) con fallback a mocks

## Cómo arrancar

```bash
npm install
cp .env.example .env.local
npm run dev
```

La app queda en [http://127.0.0.1:43141](http://127.0.0.1:43141).

## Flujo

1. **Landing** — “No le pagues más a los tipsters. La IA lo hace por ti.” CTA: *Entrar y ver pronósticos*.
2. **Registro** — Telegram si estás en la Mini App; si no, usuario o correo.
3. **Hoy** — misión, mejor señal en lenguaje claro y CTA para apostar/activar el bono de 500€, resto del día y rachas.
4. **En directo** — solo partidos en juego, 9:16. Cada partido muestra la señal de la IA y el mismo CTA del bono. Si no hay live, estado vacío.
5. **Mi cuenta** — progreso, boleto, bono de hasta 500€ (después de entrar) y ajustes.

El bono **no** aparece en la landing. Dentro de la app no se habla de tipsters.

Para volver a la landing usa *Cerrar sesión*.

## Telegram Mini App

1. Crea un bot con [@BotFather](https://t.me/BotFather).
2. Configura *Menu Button* / *Mini App* apuntando a la URL pública (HTTPS).
3. En Telegram, el botón *Entrar con Telegram* usa el usuario de `initData`.

## RapidAPI (SportAPI / SofaScore)

Sin `RAPIDAPI_KEY`, `/api/fixtures` sirve el mock de `src/lib/mocks/fixtures.ts`.

```bash
# .env.local
RAPIDAPI_KEY=tu_clave
RAPIDAPI_SPORT_HOST=sportapi7.p.rapidapi.com
NEXT_PUBLIC_OFFICIAL_SERVER_URL=https://tu-servidor-deportivo-oficial
```

No subas la clave al repositorio: `.env.local` está en `.gitignore`.

## Aviso

Herramienta de análisis para mayores de 18 años. No es consejo de apuesta. Juega con responsabilidad.
