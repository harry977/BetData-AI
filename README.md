# BetData IA

Telegram Mini App de **inteligencia de fútbol en vivo**. La IA escanea el día, destaca la señal más fuerte y explica el porqué. Pensada para usarse y retransmitirse en vertical.

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- Framer Motion + Recharts
- `@telegram-apps/sdk` + script oficial `telegram-web-app.js`
- Feed SportAPI (SofaScore vía RapidAPI). Sin clave o sin partidos: estado vacío, nunca mocks.

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
3. **Hoy** — partidos en curso y próxima jornada (API en tiempo real), señal más fuerte y CTA para comprobar cuotas. En cabecera: **Resultados hoy** (solo partidos cerrados de hoy). **Ver ficha** abre el desglose del partido (bottom sheet en móvil, panel derecho en escritorio): mercados, barras de stats y contexto.
4. **En directo** — solo partidos en juego, 9:16. Cada partido muestra la señal de la IA, radar de presión (últimos 5 min) y, si la presión supera 80% o la probabilidad de gol 85%, una alerta de gol inminente. Si no hay live, estado vacío.
5. **Combinadas IA** — cuota objetivo, número de partidos, mercados y confianza mínima. Genera un boleto con picks y cuotas reales del día.
6. **Mi cuenta** — progreso, bono de hasta 500€ (después de entrar) y ajustes.

El bono **no** aparece en la landing. Dentro de la app no se habla de tipsters.

Para volver a la landing usa *Cerrar sesión*.

## Telegram Mini App

1. Crea un bot con [@BotFather](https://t.me/BotFather).
2. Configura *Menu Button* / *Mini App* apuntando a la URL pública (HTTPS).
3. En Telegram, *Entra con Telegram* usa el usuario de `initData` (un toque).
4. En el navegador, el mismo botón te deja entrar. Si configuras `NEXT_PUBLIC_TELEGRAM_BOT_ID` y `/setdomain`, abre el login oficial de Telegram. Opcional: `TELEGRAM_BOT_TOKEN` para validar la firma.

## RapidAPI (SportAPI / SofaScore)

`/api/fixtures` pide los partidos del día (`YYYY-MM-DD` UTC) a RapidAPI, con `timezone=Europe/Madrid` en API-Football. Sin clave, sin cuota o sin partidos, la app muestra un estado vacío — nunca datos de prueba.

```bash
# .env.local
RAPIDAPI_KEY=tu_clave
RAPIDAPI_SPORT_HOST=sportapi7.p.rapidapi.com
NEXT_PUBLIC_OFFICIAL_SERVER_URL=https://tu-servidor-deportivo-oficial
```

No subas la clave al repositorio: `.env.local` está en `.gitignore`.

## Aviso

Herramienta de análisis para mayores de 18 años. No es consejo de apuesta. Juega con responsabilidad.
