const apiUrl = "http://localhost:3000";

/**
 * Fetch data from api
 * @param {string} path - Api path
 * @param {Object} config
 * @param {string} config.method  - Request method
 * @param {Object} config.body - Request body
 *
 * @returns {Object} - Resultado de la petición
 */

export async function fetchApi(path, { body, method }) {
  const headers = new Headers({ "Content-Type": "application/json" });

  const request = await fetch(`${apiUrl}${path}`, {
    headers,
    method,
    body: JSON.stringify(body),
  });

  const data = await request.json();

  return data;
}
