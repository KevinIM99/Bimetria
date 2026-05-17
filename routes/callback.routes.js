const express = require("express")
const router = express.Router()

const sessions = require("../utils/sessions")
const CALLBACK_TOKEN = process.env.CALLBACK_TOKEN

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

    session.result = result
    session.finishedAt = new Date()

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
    data: session
  })
})

module.exports = router
