module.exports = {
  existance: function (reqInput, params) {
    params.forEach(param => {
      if (!reqInput[param]) {
        throw new Error('Required field: ' + param + '.')
      }
    })
  }
}
