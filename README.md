# BetData AI

Telegram Mini App de **pronósticos de fútbol** con inteligencia predictiva. El usuario activa la herramienta en el Servidor Deportivo Oficial y desbloquea el dashboard estilo NerdyTips: Bankers del día, confianza 1 a 10 y registro de aciertos.

**BetData AI** — Inteligencia Predictiva con IA.

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- Framer Motion + Recharts
- `@telegram-apps/sdk` + script oficial `telegram-web-app.js`
- Feed mock con el shape de API-Football (RapidAPI)

## Cómo arrancar

```bash
npm install
cp .env.example .env.local
npm run dev
```

La app queda en [http://127.0.0.1:43141](http://127.0.0.1:43141).

## Flujo

1. **Activación** — crear cuenta en el Servidor Oficial Integrado, depósito de activación e ID/correo.
2. **Simulación visual** (3s, tres estados) → `isUnlocked=true` en `localStorage` y entrada al dashboard.
3. **Dashboard** — stats de acierto, boleto del día, pestañas Hoy / Mañana / Ayer y tabla de pronósticos.

Para volver al gatekeeper usa *Cerrar sesión*.

## Telegram Mini App

1. Crea un bot con [@BotFather](https://t.me/BotFather).
2. Configura *Menu Button* / *Mini App* apuntando a la URL pública (Vercel u otro host HTTPS).
3. Abre la Mini App desde Telegram. Fuera de Telegram el preview de navegador funciona igual; `openLink` cae a `window.open`.

## RapidAPI (API-Football)

Sin `RAPIDAPI_KEY`, `/api/fixtures` sirve el mock de `src/lib/mocks/fixtures.ts`.

Con clave, el route handler consulta `api-football-v1.p.rapidapi.com/v3/fixtures?live=all` y fusiona cada fixture con la capa analítica de BetData AI.

```bash
# .env.local
RAPIDAPI_KEY=tu_clave
NEXT_PUBLIC_OFFICIAL_SERVER_URL=https://tu-servidor-deportivo-oficial
```

## Estructura

```
src/
  app/page.tsx              # Estado Gatekeeper ↔ Dashboard
  app/api/fixtures/route.ts # Feed mock / RapidAPI
  components/gatekeeper/
  components/dashboard/
  lib/mocks/fixtures.ts
  lib/telegram.ts
```

## Aviso

Herramienta de análisis para mayores de 18 años. No es consejo de apuesta. Juega con responsabilidad.
