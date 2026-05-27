const axios = require("axios")
const FormData = require("form-data")

const REQUEST_INFORMATION_BASE_URL = process.env.REQUEST_INFORMATION_BASE_URL

async function submitRequestInformationFile(pdfBuffer, bearerToken, options = {}) {
  const requestBaseUrl = (options.baseUrl || REQUEST_INFORMATION_BASE_URL || "").trim()

  if (!requestBaseUrl) {
    throw new Error("REQUEST_INFORMATION_BASE_URL no está configurada.")
  }

  if (!pdfBuffer) {
    throw new Error("El PDF es requerido para enviar request-information.")
  }

  if (!bearerToken) {
    throw new Error("Bearer token es requerido.")
  }

  const requestUrl = requestBaseUrl.replace(/\/+$/, "") + "/api/request-information"
  console.log("REQUEST URL:", requestUrl)

  const form = new FormData()

  form.append("nui",         options.nui)
  form.append("givenName",   options.givenName)
  form.append("secondName",  options.secondName)
  form.append("surname1",    options.surname1)
  form.append("surname2",    options.surname2)
  form.append("province",    options.province)
  form.append("city",        options.city)
  form.append("country",     options.country || "EC")
  form.append("address",     options.address || "")
  form.append("email",       options.email || "")
  form.append("phoneNumber", options.phoneNumber || "")
  form.append("reason",      options.reason || "Firma de contrato") // ← faltaba

  if (options.typeSign)   form.append("typeSign",   options.typeSign)
  if (options.nuiManager) form.append("nuiManager", options.nuiManager)
  if (options.clientCode) form.append("clientCode", options.clientCode)

  // ✅ nombre con "_doc" para que Signbox lo procese
  form.append("file", pdfBuffer, {
    filename: options.filename || "contrato_doc.pdf",
    contentType: "application/pdf"
  })

  // ✅ campo correcto según documentación: "evidence-biometric" (mismo PDF por ahora)
  form.append("evidence-biometric", pdfBuffer, {
    filename: options.evidenceFilename || "evidencia_biometrica.pdf",
    contentType: "application/pdf"
  })

  const response = await axios.post(requestUrl, form, {
    headers: {
      ...form.getHeaders(),
      Authorization: `Bearer ${bearerToken}`
    }
  })

  return response.data
  // { status, requestId, url, detail }
}

async function completeSign(requestId, bearerToken, options = {}) {
  const requestBaseUrl = (options.baseUrl || REQUEST_INFORMATION_BASE_URL || "").trim()
  const completeSignUrl = requestBaseUrl.replace(/\/+$/, "") + "/api/complete-sign"
  console.log("COMPLETE SIGN URL:", completeSignUrl)

  const response = await axios.post(completeSignUrl, null, {
    headers: {
      Authorization: `Bearer ${bearerToken}`,
      Cookie: `onb_request=${requestId}`,
      "user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
      "X-Forwarded-For": options.clientIp || "127.0.0.1"
    }
  })

  return response.data
  // { result: true, detail: "Firma en proceso" }
}

module.exports = {
  submitRequestInformationFile,
  completeSign
}