require("dotenv").config()

const express = require("express")
const cors = require("cors")

const verificationRoutes = require("./routes/verification.routes")
const callbackRoutes = require("./routes/callback.routes")
const requestRoutes = require("./routes/request.routes")

const app = express()

console.log("=== ENV VARS ===")
console.log("SELF_URL:", process.env.SELF_URL)
console.log("BASE_URL:", process.env.BASE_URL)
console.log("EXTRA_DOCUMENT_BASE_URL:", process.env.EXTRA_DOCUMENT_BASE_URL)
console.log("REQUEST_INFORMATION_BASE_URL:", process.env.REQUEST_INFORMATION_BASE_URL)


app.use(cors())
app.use(express.json({ limit: "50mb" }))
app.use(express.urlencoded({ extended: true }))

app.get("/", (req, res) => {
  res.send("ID4FACE API funcionando")
})

app.use(verificationRoutes)
app.use(callbackRoutes)
app.use(requestRoutes)

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Servidor iniciado en puerto ${PORT}`)
})
