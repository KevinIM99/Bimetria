const axios = require("axios")
const FormData = require("form-data")

const BASE_URL = process.env.EXTRA_DOCUMENT_BASE_URL || process.env.BASE_URL || ""
const EXTRA_DOCUMENT_PATH = "/api/extra-document"

async function fetchExtraDocumentByCedula(cedula, options = {}) {
  if (!cedula) {
    throw new Error("La cédula es requerida para obtener el extradocumento.")
  }

  const form = new FormData()
  form.append("id", cedula)

  const response = await axios({
    method: options.method || "post",
    url: `${BASE_URL}${EXTRA_DOCUMENT_PATH}`,
    headers: {
      ...form.getHeaders(),
      ...(options.headers || {})
    },
    data: form,
    responseType: "arraybuffer"
  })

  return Buffer.from(response.data)
}

module.exports = {
  fetchExtraDocumentByCedula
}
