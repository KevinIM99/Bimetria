function evaluateBiometric(result) {

  const similarity =
    result?.match ||
    result?.similarity ||
    0

  let decision = "REJECTED"

  let message =
    "No fue posible validar identidad"

  if (similarity >= 98) {

    decision = "APPROVED"

    message =
      "Identidad validada correctamente"
  }

  else if (similarity >= 95) {

    decision = "MANUAL_REVIEW"

    message =
      "La validación requiere revisión manual"
  }

  else {

    decision = "REJECTED"

    message =
      "La similitud biométrica es demasiado baja"
  }

  return {

    similarity,

    decision,

    message
  }
}

module.exports = {
  evaluateBiometric
}