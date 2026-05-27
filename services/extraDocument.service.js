const axios = require("axios")
const FormData = require("form-data")

const BASE_URL = process.env.EXTRA_DOCUMENT_BASE_URL || process.env.BASE_URL || ""
const EXTRA_DOCUMENT_PATH = "/api/extra-document"

async function fetchExtraDocumentByCedula(cedula, options = {}) {
  if (!cedula) {
    throw new Error("La cédula es requerida para obtener el extradocumento.")
  }

  console.log("EXTRA_DOCUMENT_BASE_URL:", process.env.EXTRA_DOCUMENT_BASE_URL)
  console.log("BASE_URL:", process.env.BASE_URL)
  console.log("Fetching extradocument para cédula:", cedula)

  const form = new FormData()
  form.append("id", cedula)

  const url = `${BASE_URL}${EXTRA_DOCUMENT_PATH}`
  console.log("URL extradocument:", url)

  const response = await axios({
    method: "get",
    url,
    headers: {
      ...form.getHeaders(),
      ...(options.headers || {})
    },
    data: form,
    responseType: "arraybuffer"
  })

  console.log("extradocument status:", response.status)
  console.log("extradocument size (bytes):", response.data?.length)

  return Buffer.from(response.data)
}


module.exports = {
  fetchExtraDocumentByCedula
}
