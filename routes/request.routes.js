const express = require("express")
const router = express.Router()

const sessions = require("../utils/sessions")
const { fetchExtraDocumentByCedula } = require("../services/extraDocument.service")
const { submitRequestInformationFile, completeSign } = require("../services/requestInformation.service")


router.post("/onboarding-request/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params
    const bearerToken =
      req.get("Authorization")?.replace(/^Bearer\s+/i, "") ||
      req.body?.bearerToken

    if (!bearerToken) {
      return res.status(400).json({
        success: false,
        message: "Bearer token es requerido en Authorization o body.bearerToken"
      })
    }

    const session = sessions[sessionId]

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Sesión no encontrada"
      })
    }

    if (!session.evaluation || session.evaluation.decision !== "APPROVED") {
      return res.status(400).json({
        success: false,
        message: "La sesión no está aprobada para enviar request-information"
      })
    }

    let pdfBuffer = session.extraDocument?.buffer

    if (!pdfBuffer) {
      pdfBuffer = await fetchExtraDocumentByCedula(session.cedula)
      session.extraDocument = {
        id: session.cedula,
        buffer: pdfBuffer,
        fetchedAt: new Date()
      }
    }

    const response = await submitRequestInformationFile(pdfBuffer, bearerToken, req.body)

    if (response?.requestId) {
      session.requestId = response.requestId
    }

    return res.json({
      success: true,
      sessionId,
      response
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
})

router.post("/onboarding-request", async (req, res) => {
  try {
    const sessionId = req.body.sessionId || req.query.sessionId
    const bearerToken =
      req.get("Authorization")?.replace(/^Bearer\s+/i, "") ||
      req.body?.bearerToken

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: "sessionId es requerido en body o query"
      })
    }

    if (!bearerToken) {
      return res.status(400).json({
        success: false,
        message: "Bearer token es requerido en Authorization o body.bearerToken"
      })
    }

    const session = sessions[sessionId]

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Sesión no encontrada"
      })
    }

    if (!session.evaluation || session.evaluation.decision !== "APPROVED") {
      return res.status(400).json({
        success: false,
        message: "La sesión no está aprobada para enviar request-information"
      })
    }

    let pdfBuffer = session.extraDocument?.buffer

    if (!pdfBuffer) {
      pdfBuffer = await fetchExtraDocumentByCedula(session.cedula)
      session.extraDocument = {
        id: session.cedula,
        buffer: pdfBuffer,
        fetchedAt: new Date()
      }
    }

    const response = await submitRequestInformationFile(pdfBuffer, bearerToken, req.body)

    if (response?.requestId) {
      session.requestId = response.requestId
    }

    return res.json({
      success: true,
      sessionId,
      response
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
})

router.post("/complete-sign/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params
    const bearerToken =
      req.get("Authorization")?.replace(/^Bearer\s+/i, "") ||
      req.body?.bearerToken

    if (!bearerToken) {
      return res.status(400).json({ success: false, message: "Bearer token requerido" })
    }

    const session = sessions[sessionId]
    if (!session) {
      return res.status(404).json({ success: false, message: "Sesión no encontrada" })
    }

    if (!session.requestId) {
      return res.status(400).json({
        success: false,
        message: "Primero debes llamar a /onboarding-request para obtener el requestId"
      })
    }

    const result = await completeSign(session.requestId, bearerToken, {
      baseUrl: req.body?.baseUrl,
      clientIp: req.ip
    })

    return res.json({ success: true, sessionId, result })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
})

module.exports = router
