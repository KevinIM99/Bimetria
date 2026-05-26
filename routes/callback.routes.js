const express = require("express")
const router = express.Router()

const sessions = require("../utils/sessions")
const { evaluateBiometric } = require(
  "../biometricDecision.service"
)
const { fetchExtraDocumentByCedula } = require("../services/extraDocument.service")

const   CALLBACK_TOKEN = process.env.CALLBACK_TOKEN

router.post("/callback", async (req, res) => {

  try {

    const tokenHeader = req.get("x-callback-token")

    if (!CALLBACK_TOKEN || tokenHeader !== CALLBACK_TOKEN) {
      return res.status(401).json({
        success: false,
        message: "No autorizado"
      })
    }

    const { sessionId, result } = req.body

    const session = sessions[sessionId]

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Sesión no encontrada"
      })
    }

    const evaluation =
      evaluateBiometric(result)
    session.result = result
    session.evaluation = evaluation

    session.finishedAt = new Date()

    if (evaluation.decision === "APPROVED") {
      try {
        const extraDocumentBuffer = await fetchExtraDocumentByCedula(session.cedula)
        session.extraDocument = {
          id: session.cedula,
          buffer: extraDocumentBuffer,
          fetchedAt: new Date()
        }
      } catch (error) {
        console.error("Error obteniendo extradocument:", error.message)
        session.extraDocument = {
          id: session.cedula,
          error: error.message
        }
      }
    }

    return res.json({
      success: true
    })

  } catch (error) {

    return res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

router.get("/result/:sessionId", async (req, res) => {

  const session = sessions[req.params.sessionId]

  if (!session) {
    return res.status(404).json({
      success: false,
      message: "Sesión no encontrada"
    })
  }




  return res.json({

  success: true,

  sessionId: req.params.sessionId,

  similarity:
    session.evaluation?.similarity,

  decision:
    session.evaluation?.decision,

  message:
    session.evaluation?.message,

  biometrics:
    session.result
  })

})

router.get("/result", async (req, res) => {
  const sessionId = req.query.sessionId || req.body?.sessionId

  if (!sessionId) {
    return res.status(400).json({
      success: false,
      message: "sessionId es requerido como query param"
    })
  }

  const session = sessions[sessionId]

  if (!session) {
    return res.status(404).json({
      success: false,
      message: "Sesión no encontrada"
    })
  }

  return res.json({
    success: true,
    sessionId,
    similarity: session.evaluation?.similarity,
    decision: session.evaluation?.decision,
    message: session.evaluation?.message,
    biometrics: session.result
  })
})

module.exports = router
