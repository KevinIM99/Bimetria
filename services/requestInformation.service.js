const axios = require("axios")
const FormData = require("form-data")

const REQUEST_INFORMATION_BASE_URL = process.env.REQUEST_INFORMATION_BASE_URL
const REQUEST_INFORMATION_PATH = "/api/request-information"

async function submitRequestInformationFile(pdfBuffer, bearerToken, options = {}) {
  const requestBaseUrl = (options.baseUrl || REQUEST_INFORMATION_BASE_URL || "").trim()
  const requestPath = (options.requestPath || REQUEST_INFORMATION_PATH || "").trim()

  if (!requestBaseUrl) {
    throw new Error("REQUEST_INFORMATION_BASE_URL no está configurada y no se recibió baseUrl en options.")
  }
  console.log({
    requestBaseUrl: `[${requestBaseUrl}]`,
    requestPath: `[${requestPath}]`
  })
  let requestUrl
  try {
    requestUrl = new URL(requestPath, requestBaseUrl).toString()
    console.log("URL generada:", requestUrl);
  } catch (error) {
    console.error("Error construyendo URL");
    console.error("requestBaseUrl:", requestBaseUrl);
    console.error("requestPath:", requestPath);
    throw new Error(`URL inválida para request-information: ${error.message}`)
  }

  if (!pdfBuffer) {
    throw new Error("El PDF es requerido para enviar request-information.")
  }

  if (!bearerToken) {
    throw new Error("Bearer token es requerido para enviar request-information.")
  }

  const form = new FormData()

  // Campos de metadata requeridos por el API
  form.append("nui", options.nui)
  form.append("givenName", options.givenName)
  form.append("secondName", options.secondName)
  form.append("surname1", options.surname1)
  form.append("surname2", options.surname2)
  form.append("province", options.province)
  form.append("city", options.city)
  form.append("country", options.country || "EC")
  form.append("address", options.address || "")
  form.append("email", options.email || "")
  form.append("phoneNumber", options.phoneNumber || "")

  // Enviar el mismo PDF en ambos campos: "file" (archivo) y "evidenceFile"
  form.append("file", pdfBuffer, {
    filename: options.filename || "evidence.pdf",
    contentType: "application/pdf"
  })

  form.append("evidenceFile", pdfBuffer, {
    filename: options.evidenceFilename || (options.filename || "evidence.pdf"),
    contentType: "application/pdf"
  })

  const headers = {
    ...form.getHeaders(),
    ...(options.headers || {})
  }

  const effectiveBearerToken = options.bearerToken || bearerToken
  if (effectiveBearerToken && !options.disableBearer) {
    headers.Authorization = `Bearer ${effectiveBearerToken}`
  }

  if (options.apiKey && options.apiKeyHeader) {
    headers[options.apiKeyHeader] = options.apiKey
  }

  if (options.authHeaders) {
    Object.assign(headers, options.authHeaders)
  }

  const axiosConfig = {
    headers
  }

  if (options.basicAuth || (options.username && options.password)) {
    axiosConfig.auth = {
      username: (options.basicAuth?.username || options.username),
      password: (options.basicAuth?.password || options.password)
    }
  }

  const response = await axios.post(
    requestUrl,
    form,
    axiosConfig
  )

  return response.data
}

module.exports = {
  submitRequestInformationFile
}
