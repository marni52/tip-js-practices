export class ApiError extends Error {
  constructor(message, {
    kind,
    status = null,
    code = null,
    details = null,
    url = null,
    cause,
  } = {}) {
    super(message, cause === undefined ? undefined : { cause });
    this.name = "ApiError";
    this.kind = kind;
    this.status = status;
    this.code = code;
    this.details = details;
    this.url = url;
  }
}

// Создаёт URL относительно baseUrl и добавляет непустые параметры query.
// Значения кодируются средствами URL и URLSearchParams, а не вручную.
export function buildUrl(baseUrl, path, query = {}) {
  const base = checkBaseUrl(baseUrl);
  if (typeof path !== "string" || path.trim() === "") {
    throw new TypeError("path должен быть непустой строкой");
  }
  if (query === null || typeof query !== "object" || Array.isArray(query)) {
    throw new TypeError("query должен быть обычным объектом");
  }

  // убираем лишние слеши на стыке, чтобы не получилось //tasks
  const url = new URL(`${base.href.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`);
  const params = new URLSearchParams();
  for (const [name, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue; // false и 0 оставляем
    params.append(name, String(value));
  }
  url.search = params.toString();
  return url.href;
}

function checkBaseUrl(baseUrl) {
  if (typeof baseUrl !== "string") {
    throw new TypeError("baseUrl должен быть строкой");
  }
  let url;
  try {
    url = new URL(baseUrl); // относительный адрес здесь выбросит ошибку
  } catch {
    throw new TypeError(`baseUrl должен быть абсолютным адресом: ${baseUrl}`);
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new TypeError("baseUrl должен начинаться с http:// или https://");
  }
  if (url.search !== "" || url.hash !== "") {
    throw new TypeError("baseUrl не должен содержать query и hash");
  }
  return url;
}

const ALLOWED_METHODS = new Set(["GET", "POST", "PATCH", "DELETE"]);

function checkTimeout(value) {
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new TypeError("timeoutMs должен быть положительным целым числом");
  }
}

// requestJson(path, { method, query, body, signal, timeoutMs } = {})
// поддерживает GET, POST, PATCH и DELETE; ответ 204 преобразуется в null.
export function createApiClient({
  baseUrl,
  fetchFn = globalThis.fetch,
  timeoutMs = 3000,
} = {}) {
  const base = checkBaseUrl(baseUrl).href;
  if (typeof fetchFn !== "function") {
    throw new TypeError("fetchFn должен быть функцией");
  }
  checkTimeout(timeoutMs);

  async function requestJson(path, {
    method = "GET",
    query = {},
    body,
    signal,
    timeoutMs: requestTimeout = timeoutMs,
  } = {}) {
    // ПР6: кроме GET поддерживаются POST, PATCH и DELETE
    const httpMethod = typeof method === "string" ? method.toUpperCase() : "";
    if (!ALLOWED_METHODS.has(httpMethod)) {
      throw new TypeError(`Метод ${method} не поддерживается`);
    }
    if (httpMethod === "GET" && body !== undefined) {
      throw new TypeError("У GET-запроса не может быть тела");
    }
    const url = buildUrl(base, path, query);
    checkTimeout(requestTimeout);

    // Content-Type добавляем только когда есть тело
    const headers = { Accept: "application/json" };
    const init = { method: httpMethod, headers };
    if (body !== undefined) {
      headers["Content-Type"] = "application/json";
      init.body = JSON.stringify(body);
    }

    // сигнал тайм-аута + внешний сигнал (если передан)
    const timeoutSignal = AbortSignal.timeout(requestTimeout);
    const combined = signal ? AbortSignal.any([signal, timeoutSignal]) : timeoutSignal;

    // 1. Только сам fetch: здесь бывают network / timeout / aborted
    let response;
    try {
      response = await fetchFn(url, { ...init, signal: combined });
    } catch (error) {
      if (signal?.aborted) {
        throw new ApiError("Запрос отменён.", { kind: "aborted", url, cause: error });
      }
      if (timeoutSignal.aborted) {
        throw new ApiError(`Превышено время ожидания ответа (${requestTimeout} мс).`, { kind: "timeout", url, cause: error });
      }
      throw new ApiError("Не удалось подключиться к серверу.", { kind: "network", url, cause: error });
    }

    if (!(response instanceof Response)) {
      throw new ApiError("fetchFn вернул не Response.", { kind: "invalid-response", url });
    }

    const contentType = response.headers.get("Content-Type") ?? "";
    const isJson = /^application\/json\b/i.test(contentType);

    // 2. HTTP-ошибка: сначала статус, тело читаем только если это JSON
    if (!response.ok) {
      let apiError = null;
      if (isJson) {
        try {
          apiError = (await response.json())?.error ?? null;
        } catch {
          apiError = null; // тело испорчено, но статус всё равно сохраняем
        }
      }
      throw new ApiError(apiError?.message ?? `Сервер вернул ошибку HTTP ${response.status}.`, {
        kind: "http",
        status: response.status,
        code: apiError?.code ?? null,
        details: apiError?.details ?? null,
        url,
      });
    }

    // 3. Успешный ответ
    if (response.status === 204) return null;

    if (!isJson) {
      throw new ApiError(`Ожидался JSON, получен Content-Type "${contentType}".`, { kind: "invalid-response", url });
    }
    try {
      return await response.json();
    } catch (error) {
      throw new ApiError("Сервер вернул повреждённый JSON.", { kind: "invalid-response", url, cause: error });
    }
  }

  return { requestJson };
}
