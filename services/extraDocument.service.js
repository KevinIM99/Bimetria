const axios = require("axios")
const FormData = require("form-data")

const BASE_URL =
  process.env.EXTRA_DOCUMENT_BASE_URL ||
  process.env.BASE_URL ||
  ""

const EXTRA_DOCUMENT_PATH = "/api/extra-document"

async function fetchExtraDocumentByCedula(
  cedula,
  options = {}
) {

  if (!cedula) {
    throw new Error(
      "La cédula es requerida para obtener el extradocumento."
    )
  }

  console.log("===== EXTRA DOCUMENT DEBUG =====")

  console.log(
    "EXTRA_DOCUMENT_BASE_URL:",
    process.env.EXTRA_DOCUMENT_BASE_URL
  )

  console.log(
    "BASE_URL:",
    process.env.BASE_URL
  )

  const form = new FormData()

  form.append("id", cedula)

  const url =
    `${BASE_URL}${EXTRA_DOCUMENT_PATH}`

  console.log("URL extradocument:", url)

  console.log("Cedula enviada:", cedula)

  try {

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

    console.log(
      "extradocument status:",
      response.status
    )

    console.log(
      "extradocument size:",
      response.data?.length
    )

    return Buffer.from(response.data)

  } catch (error) {

    console.error("===== EXTRA DOCUMENT ERROR =====")

    console.error(
      "MESSAGE:",
      error.message
    )

    if (error.response) {

      console.error(
        "STATUS:",
        error.response.status
      )

      console.error(
        "HEADERS:",
        error.response.headers
      )

      console.error(
        "DATA:",
        error.response.data?.toString?.()
      )
    }

    throw error
  }
}

module.exports = {
  fetchExtraDocumentByCedula
}