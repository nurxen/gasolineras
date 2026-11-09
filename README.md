# ⛽⚡ GasoCerca

App para el móvil (Android e iPhone) que muestra las **gasolineras y puntos de recarga cerca de ti**, con los precios oficiales del Ministerio.
Sin servidores de pago ni anuncios: todo se aloja gratis en **GitHub Pages**, y **GitHub Actions** actualiza los precios cada 30 minutos.

## Qué hace

- **Gasolineras cercanas** con precio de gasolina y diésel (y 98, Premium, GLP, GNC, HVO, AdBlue).
- **Filtros**: distancia (1–50 km), combustible, **low cost**, **abiertas ahora** y **marcas**.
- **Orden**: más barata, más cercana o **coste real** (precio del depósito + el combustible que gastas en ir y volver).
- **Mejor opción** destacada arriba: cuánto ahorras frente a la más cercana.
- **Modo Ruta 🛣️**: indica adónde vas y te muestra las gasolineras o cargadores **de camino**, con los minutos de desvío, el kilómetro donde están y la hora a la que pasas. Puedes abrir Google Maps con la parada ya añadida (ruta calculada con OSRM / OpenStreetMap).
- **Buscador** de pueblos, direcciones y códigos postales de toda España (Nominatim / OpenStreetMap).
- **Mapa** con los precios en colores (verde barata, ámbar media, rojo cara).
- **Favoritas** (gasolineras y cargadores) y **navegación** con Google Maps, Waze o Apple Maps.
- **Historial**: gráfica de 90 días por gasolinera, media de tu provincia, aviso de si es buen momento para repostar y el día de la semana más barato.
- **Lo que más compensa**: tiene en cuenta el combustible del trayecto y **tu tiempo** (€/hora configurable), para no mandarte lejos por ahorrar 1 €.
- **Modo recarga ⚡**: puntos de recarga filtrados por conector (CCS2 y Tipo 2 para el Leapmotor T03), potencia y gratuitos, con **tiempo estimado del 10 % al 80 %** y coste.
  Los operadores no publican sus tarifas en abierto (solo se ven en el mapa oficial [Reve](https://www.mapareve.es)), así que el precio es **tu tarifa** si la guardas, el de OpenStreetMap si lo hay o una estimación por tipo de cargador.
- **Diario de repostajes y recargas**: gasto mensual, ahorro frente a la media de la zona y consumo real de cada coche.
- **Alertas de precio** en tus favoritas y **copia de seguridad** de tus datos.
- **Comparativa** del coste por 100 km entre el híbrido y el eléctrico.
- Funciona **sin conexión** con los últimos datos descargados.

## Publicarla (una sola vez, unos 5 minutos)

1. Crea un repositorio en GitHub (puede llamarse `gasolineras`) y **sube todos estos archivos**: arrastra el contenido de la carpeta a *Add file → Upload files*. Incluye la carpeta oculta `.github`.
   > Si al arrastrar no se sube `.github`, créala a mano: *Add file → Create new file* y escribe como nombre `.github/workflows/actualizar.yml`. Después pega dentro su contenido.
2. En el repositorio ve a **Settings → Pages** y en *Source* elige **GitHub Actions**.
3. Ve a la pestaña **Actions**. Si te lo pide, pulsa *I understand… enable workflows*. Abre **Actualizar precios y publicar**, pulsa **Run workflow** y espera 2 o 3 minutos.
4. Tu app estará en `https://TU-USUARIO.github.io/gasolineras/`.

> El repositorio debe ser **público** para que GitHub Pages y Actions sean gratis sin límites. Los datos son públicos y la app no guarda nada tuyo en GitHub: tus favoritas y ajustes se quedan solo en tu móvil.

## Instalarla en el móvil

- **iPhone (Safari):** abre el enlace, toca **Compartir** (□↑) y luego **Añadir a pantalla de inicio**.
- **Android (Chrome):** abre el enlace, toca el menú **⋮** y luego **Instalar aplicación**.

Al abrirla te pedirá permiso de ubicación. Si no se lo das, puedes escribir un pueblo o un código postal.

## Cómo funciona

```
GitHub Actions (cada 30 min)
  ├─ scripts/build-data.mjs      → descarga los precios del MITECO, los compacta y guarda el historial diario
  ├─ scripts/build-chargers.mjs  → puntos de recarga de OpenStreetMap (1 vez al día)
  ├─ rama "data"                 → guarda el historial (se reescribe, no hace crecer el repo)
  └─ despliega app/ en GitHub Pages
App (app/)  → HTML + JS sin frameworks, Leaflet para el mapa y un service worker para el modo sin conexión
```

Si los datos publicados fallasen, la app consulta directamente la API del Ministerio y OpenStreetMap desde el móvil.

### Personalizar

- **Marcas low cost:** en *Ajustes* dentro de la app (una por línea).
- **Datos de los coches** (litros, consumo, batería, conectores, €/kWh): en *Ajustes*.
- **Frecuencia de actualización:** línea `cron` en `.github/workflows/actualizar.yml`.

### Aviso

GitHub pausa las tareas programadas de un repositorio público tras **60 días sin actividad** y te avisa por correo. Para reactivarlas basta con pulsar *Enable workflow* en la pestaña Actions o hacer cualquier cambio en el repositorio.

## Fuentes de datos

- Precios: [Geoportal de carburantes — Ministerio para la Transición Ecológica y el Reto Demográfico](https://geoportalgasolineras.es) (API REST pública y gratuita).
- Puntos de recarga y mapa: © colaboradores de [OpenStreetMap](https://www.openstreetmap.org/copyright) (ODbL).
