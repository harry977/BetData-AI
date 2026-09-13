# RadarBet IA

Telegram Mini App de **inteligencia de fútbol en vivo**. La IA escanea el día, destaca la señal más fuerte y explica el porqué. Pensada para usarse y retransmitirse en vertical.

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- Framer Motion + Recharts
- `@telegram-apps/sdk` + script oficial `telegram-web-app.js`
- Feed SportAPI (SofaScore vía RapidAPI). Hoy y Directo pintan el array de partidos en cuanto llega el fetch. Sin partidos, un loader ligero; nunca una jornada simulada.

## Cómo arrancar

```bash
npm install
cp .env.example .env.local
npm run dev
```

La app queda en [http://127.0.0.1:43141](http://127.0.0.1:43141).

## Flujo

1. **Landing** — “Deja de regalar tu dinero a los tipsters. Pásate a la IA.” CTA: *Probar gratis en Telegram*.
2. **Registro** — Telegram (Mini App o Login Widget) y también desde el navegador. Sin correo ni contraseña.
3. **Hoy** — partidos en curso y próxima jornada, señal más fuerte y CTA para comprobar cuotas. En cabecera: **Resultados hoy** (solo partidos cerrados de hoy). **Ver ficha** abre el desglose del partido (bottom sheet en móvil, panel derecho en escritorio): mercados, barras de stats y contexto.
4. **En directo** — solo partidos en juego, 9:16. Cada partido muestra la señal de la IA, radar de presión (últimos 5 min) y, si la presión supera 80% o la probabilidad de gol 85%, una alerta de gol inminente.
5. **Combinadas IA** — cuota objetivo, número de partidos, mercados y confianza mínima. Genera un boleto con picks y cuotas del día.
6. **Mi cuenta** — progreso, bono de hasta 500€ (después de entrar) y ajustes.

El bono **no** aparece en la landing. Dentro de la app no se habla de tipsters.

Para volver a la landing usa *Cerrar sesión*.

## Telegram Mini App

1. Crea un bot con [@BotFather](https://t.me/BotFather).
2. Configura *Menu Button* / *Mini App* apuntando a la URL pública (HTTPS).
3. En Telegram, *Entra con Telegram* usa el usuario de `initData` (un toque).
4. En el navegador, el mismo botón te deja entrar. Si configuras `NEXT_PUBLIC_TELEGRAM_BOT_ID` y `/setdomain`, abre el login oficial de Telegram. Opcional: `TELEGRAM_BOT_TOKEN` para validar la firma.

## RapidAPI (SportAPI)

La app habla con [SportAPI](https://rapidapi.com) (`sportapi7.p.rapidapi.com`) desde el servidor. El cliente está en `src/lib/sportapi.ts` y las rutas internas son:

- `GET /api/matches/live` — fixtures en directo (marcador, minuto, estado EN DIRECTO)
- `GET /api/matches/categories?date=YYYY-MM-DD&timezoneOffset=0` — categorías/ligas de fútbol
- `GET /api/event/{id}/incidents` — goles, tarjetas y córners
- `GET /api/event/{id}/statistics` — xG, tiros, posesión
- `GET /api/crest/team/{id}` — escudo Premium (`/api/v1/team/{id}/image`)
- `GET /api/crest/league/{id}` — logo de competición
- `GET /api/fixtures` — jornada (hoy / mañana / ayer) + directo

```bash
# .env.local
RAPIDAPI_KEY="TU_API_KEY_AQUI"
RAPIDAPI_HOST="sportapi7.p.rapidapi.com"
NEXT_PUBLIC_OFFICIAL_SERVER_URL=https://tu-servidor-deportivo-oficial
```

Con clave válida el directo sale de `/api/v1/sport/football/events/live` y los escudos de `/api/v1/team/{id}/image`. La cabecera muestra **EN VIVO · CONECTADO A SPORTAPI** cuando el fetch responde. Si SportAPI no trae partidos, se muestra el estado vacío; no hay jornada de demostración ni flags `IS_DEMO`.

No subas la clave al repositorio: `.env.local` está en `.gitignore`.

## Aviso

Herramienta de análisis para mayores de 18 años. No es consejo de apuesta. Juega con responsabilidad.
