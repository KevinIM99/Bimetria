const express = require("express")
const router = express.Router()

const { v4: uuid } = require("uuid")

const sessions = require("../utils/sessions")
const { generateToken } = require("../services/id4face.service")

router.post("/start-verification", async (req, res) => {

  try {

    const { cedula, dactilar } = req.body

    if (!cedula || !dactilar) {
      return res.status(400).json({
        success: false,
        message: "cedula y dactilar son requeridos"
      })
    }

    const token = await generateToken()

    const sessionId = uuid()

    sessions[sessionId] = {
      cedula,
      dactilar,
      token,
      createdAt: new Date()
    }

    const verificationUrl = `${process.env.BASE_URL}/verify/${sessionId}`

    return res.json({
      success: true,
      sessionId,
      url: verificationUrl
    })

  } catch (error) {

    return res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

router.get("/verify/:sessionId", async (req, res) => {

  try {

    const { sessionId } = req.params

    const session = sessions[sessionId]

    if (!session) {
      return res.status(404).send("Sesión no encontrada")
    }

    const html = `
<!DOCTYPE html>
<html lang="es">
<head>

<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<title>Validación Biométrica</title>

<script
src="https://id4face.eclipsoft.com/dist/id4face@2.4.0.js"
defer>
</script>

<style>

body {
  font-family: Arial, sans-serif;
  background: #f5f5f5;
  margin: 0;
  padding: 40px;
  text-align: center;
}

.container {
  max-width: 500px;
  margin: auto;
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 0 20px rgba(0,0,0,0.1);
}

button {
  background: #111827;
  color: white;
  border: none;
  padding: 14px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
}

</style>

</head>
<body>

<div class="container">

<h2>Validación Biométrica</h2>

<eclipsoft-id4face dismissable oval limits></eclipsoft-id4face>

<br><br>

<button id="startButton">
Iniciar Validación
</button>

</div>

<script>

window.addEventListener("load", async () => {

  const id4face = document.querySelector("eclipsoft-id4face")

  id4face.token = "${session.token}"

  const config = {
    minMatch: "98",
    blink: true,
    env: "${process.env.ID4FACE_ENV}",
    faceRecognition: true,

    callbackUrl: "${process.env.BASE_URL}/callback",

    checkId: {
      id: "${session.cedula}",
      dactilar: "${session.dactilar}"
    }
  }

  try {

    await id4face.load(config)

  } catch(error) {

    console.error(error)
  }

  document
    .getElementById("startButton")
    .addEventListener("click", () => {

      id4face.start()
    })

  id4face.addEventListener("result", async (event) => {

    await fetch("${process.env.BASE_URL}/callback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-callback-token": "${process.env.CALLBACK_TOKEN}"
      },
      body: JSON.stringify({
        sessionId: "${sessionId}",
        result: event.detail
      })
    })
  })
})

</script>

</body>
</html>
    `

    res.send(html)

  } catch (error) {

    return res.status(500).send("Error interno")
  }
})

module.exports = router
