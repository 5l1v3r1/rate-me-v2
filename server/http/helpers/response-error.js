module.exports = function (errorCode, body) {
  let error = new Error()
  error.code = errorCode
  error.body = body
  return error
}
