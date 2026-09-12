# BetData AI

Telegram Mini App de **inteligencia de fútbol en vivo**. La IA escanea el día, detecta señales y las explica en un feed tipo juego — no en un dashboard de métricas.

**BetData AI** — Inteligencia Predictiva con IA.

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

1. **Opt-in** — landing de tips gratuitos y bono de bienvenida hacia el Servidor Oficial.
2. **Acceder** — simulación visual (3s) → `isUnlocked=true` en `localStorage`.
3. **AI feed** — SCAN → señal destacada → WHY → streak / resultados.
4. **LIVE** — interfaz 9:16 para retransmitir, con texto gigante y alertas.

Para volver al gatekeeper usa *Cerrar sesión*.

## Navegación

- **AI** — feed de señales, scan, battle y misión del día
- **Matches** — partidos por día, con análisis visual
- **LIVE** — broadcast mode 9:16
- **Account** — sesión, Bet Builder e historial

## Telegram Mini App

1. Crea un bot con [@BotFather](https://t.me/BotFather).
2. Configura *Menu Button* / *Mini App* apuntando a la URL pública (Vercel u otro host HTTPS).
3. Abre la Mini App desde Telegram. Fuera de Telegram el preview de navegador funciona igual; `openLink` cae a `window.open`.

## RapidAPI (SportAPI / SofaScore)

Sin `RAPIDAPI_KEY`, `/api/fixtures` sirve el mock de `src/lib/mocks/fixtures.ts`.

Con clave, el servidor consulta **SportAPI** (`sportapi7.p.rapidapi.com`). Las categorías del día se cachean 30 minutos. Si la API falla o no hay eventos, se usan los mocks.

```bash
# .env.local
RAPIDAPI_KEY=tu_clave
RAPIDAPI_SPORT_HOST=sportapi7.p.rapidapi.com
NEXT_PUBLIC_OFFICIAL_SERVER_URL=https://tu-servidor-deportivo-oficial
```

No subas la clave al repositorio: `.env.local` está en `.gitignore`.

## Aviso

Herramienta de análisis para mayores de 18 años. No es consejo de apuesta. Juega con responsabilidad.
