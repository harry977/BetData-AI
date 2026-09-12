# BetData AI

Telegram Mini App de **análisis predictivo deportivo**. Actúa como gatekeeper de opt-in: el usuario activa su cuenta de partner y desbloquea el dashboard de inteligencia (presión ofensiva, xG, alertas de valor).

**BetData AI** — Engine de Análisis Deportivo e Inteligencia de Datos.

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

1. **Gatekeeper** — registro en el partner (bono $20), depósito FTD e ID/correo.
2. **Verificación simulada** (2s) → desbloqueo persistido en `localStorage`.
3. **Dashboard** — selector de jornada, métricas live, gráficos y alerta BetData AI.

Para volver al gatekeeper usa *Cerrar sesión del motor*.

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
NEXT_PUBLIC_PARTNER_AFFILIATE_URL=https://tu-link-de-afiliado
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
