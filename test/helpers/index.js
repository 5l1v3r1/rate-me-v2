/**
 * define CELL_MODE if not present
 */
process.env.CELL_MODE = process.env.CELL_MODE || '_test'

var path = require('path')
var chai = require('chai')
var _ = require('lodash')
var foldAndMerge = require('organic-dna-fold')

global.expect = chai.expect

var test = global.test = {}
var variables = test.variables = {
  cell: null,
  dna: null,
  httpendpoint: 'http://127.0.0.1:13371',
  apiendpoint: 'http://127.0.0.1:13371/api',
  uploadsDir: path.join(process.cwd(), '/test/uploads')
}

require('./clean-uploads')
require('./uploads')

/**
 * Removes all organelles, from all processes' plasma and membrane's,
 * which are not in the `allowedOrganelles` array (or object) and
 * merges all values in `allowedOrganelles` object (if object)
 *
 * `allowedOrganelles` can be an array (in which case all allowed are kept as they are, merged with empty {})
 * or an object (in which case all allowed organelles are merged with the object's value)
 *
 * Example:
 * dna: `{ server.processes.plasma: { "A": { "foo": "bar" }, "B": {}, "C": {} } }`
 * allowedOrganelles: `{ "A": { "foo": "baz" }, "B": {} }`
 * result: `{ server.processes.plasma: { "A": { "foo": "baz" }, "B": {}, "C": false } }`
 *
 * Example with array:
 * allowedOrganelles: `[ "A", "B" ]`
 * result: `{ server.processes.plasma: { "A": { "foo": "bar" }, "B": {}, "C": false } }`
 * @param dna
 * @param allowedOrganelles
 * @returns {*}
 */
function removeNotAllowedOrganelles (dna, allowedOrganelles) {
  let allowedOrganellesObject = {}
  if (Array.isArray(allowedOrganelles)) {
    for (let i = 0; i < allowedOrganelles.length; i++) {
      allowedOrganellesObject[allowedOrganelles[i]] = {}
    }
  } else if (typeof allowedOrganelles === 'object') {
    allowedOrganellesObject = allowedOrganelles
  } else {
    throw new Error('allowedOrganelles must be either an object or an array')
  }

  for (let processName in dna.server.processes) {
    if (dna.server.processes.hasOwnProperty(processName)) {
      let process = dna.server.processes[processName]

      mergeOnlyAllowed(process.plasma, allowedOrganellesObject)
      mergeOnlyAllowed(process.membrane, allowedOrganellesObject)
    }
  }

  return dna
}

/**
 * Performs a `foldAndMerge` on the source branch,
 * flagging all elements, not in `allowed`, as
 * false (for removal) and merging `allowed`
 *
 * @param src
 * @param allowed
 */
function mergeOnlyAllowed (src, allowed) {
  let dst = {}
  for (let srcKey in src) {
    if (src.hasOwnProperty(srcKey)) {
      if (Object.keys(allowed).includes(srcKey)) {
        dst[srcKey] = allowed[srcKey]  // will be merged
      } else {
        dst[srcKey] = false  // will be removed
      }
    }
  }

  foldAndMerge(src, dst)
}

test.initTestEnv = function (done) {
  var loadDna = require('organic-dna-loader')
  loadDna(function (err, dna) {
    if (err) return done(err)

    test.variables.dna = dna

    test.cleanUploads(done)
  })
}

/**
 * Starts the default server cell, with all organelles
 * unless `allowedOrganelles` is provided.
 * If `allowedOrganelles` is array all specified organelles by name will be kept.
 * If `allowedOrganelles` is object their values will also be merged in dna.
 * If `allowedOrganelles` is missing no organelles will be removed
 *
 * @param allowedOrganelles Optional.
 * @param next
 */
test.startServer = function (allowedOrganelles, next) {
  if (typeof next === 'undefined') {
    next = allowedOrganelles
    allowedOrganelles = null
  }

  test.initTestEnv(function (err) {
    if (err) return next(err)

    if (allowedOrganelles) {
      test.variables.dna = removeNotAllowedOrganelles(test.variables.dna, allowedOrganelles)
    }

    var cell = variables.cell = new (require('../../server/cell'))()
    var readyChemcals = _.get(test.variables, 'dna.server.processes.index.membrane.organic-express-server.expressSetupDoneOnce', ['ApiRoutesReady'])
    cell.plasma.on(readyChemcals, function (err) {
      if (err instanceof Error) return next(err)
      next && next()
    })

    cell.start(test.variables.dna, function (err) {
      if (err) throw err
      // # build server cell
      cell.plasma.emit({type: 'build', branch: 'server.processes.index.plasma'}, function (err) {
        if (err) throw err
        cell.plasma.emit({type: 'build', branch: 'server.processes.index.membrane'}, function (err) {
          if (err) throw err
        })
      })
    })
  })
}

test.stopServer = function (next) {
  variables.cell.plasma.emit('kill', next)
}
