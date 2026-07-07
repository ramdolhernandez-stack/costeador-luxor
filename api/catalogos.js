// Puente (proxy) que evita el bloqueo CORS del navegador.
// La app llama a /api/catalogos (misma dirección) y esta función, del lado del
// servidor, va a buscar los datos a Google Apps Script y los devuelve.
// Server-to-server no tiene restricción CORS, por eso funciona.

const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzEoPKhN6shaUSaAbaTD0U4d74Izg1FB9tmXepMrLYP7z7a0ZIlJ93gg0cQ4asvI3Hi/exec";

export default async function handler(req, res) {
  try {
    // Reenvía los parámetros de consulta si los hay (ej. ?tabs=... o ?listar=1)
    const qs = req.url.includes("?") ? req.url.split("?")[1] : "";
    const target = qs ? `${APPS_SCRIPT_URL}?${qs}` : APPS_SCRIPT_URL;

    const r = await fetch(target, { redirect: "follow" });
    const texto = await r.text();

    res.setHeader("Content-Type", "application/json; charset=utf-8");
    // Cache breve para no golpear Apps Script en cada carga
    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
    res.status(200).send(texto);
  } catch (e) {
    res.status(500).json({ error: String((e && e.message) || e) });
  }
}
