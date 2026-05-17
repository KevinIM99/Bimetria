const axios = require("axios")

async function generateToken() {
  try {
    const authUrl = process.env.ID4FACE_AUTH_URL

    const response = await axios.post(
      authUrl,
      {
        username: process.env.ID4FACE_USER,
        password: process.env.ID4FACE_PASS
      },
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    )

    return response.data?.id_token
  } catch (error) {
    console.error("Failed to obtain ID4FACE token:", error.response?.status || error.message)
    throw error
  }
}

module.exports = {
  generateToken
}