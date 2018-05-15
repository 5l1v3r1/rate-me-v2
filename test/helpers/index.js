/**
 * define CELL_MODE if not present
 */
process.env.CELL_MODE = process.env.CELL_MODE || '_test'

const path = require('path')
const chai = require('chai')
const _ = require('lodash')
const mongoose = require('mongoose')

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

test.initTestEnv = function (done) {
  var loadDna = require('organic-dna-loader')
  loadDna(function (err, dna) {
    if (err) return done(err)

    test.variables.dna = dna

    test.cleanUploads(done)
  })
}

test.startServer = function (next) {
  test.initTestEnv(function (err) {
    if (err) return next(err)
    var cell = variables.cell = new (require('../../server/cell'))()
    var readyChemcals = _.get(test.variables, 'dna.server.processes.index.membrane.organic-express-server.expressSetupDoneOnce', ['ApiRoutesReady'])
    cell.plasma.on(readyChemcals, function (err) {
      if (err instanceof Error) return next(err)
      return next && next()
    })
    cell.start(function (err) {
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

test.getPlasma = function () {
  const Plasma = require('organic-plasma')
  return require('organic-plasma-feedback')(new Plasma())
}

test.dropDatabase = done => {
  if (mongoose.connection.readyState) {
    mongoose.connection.db.dropDatabase(() => {
      mongoose.disconnect(err => {
        if (err) return done(err)

        return mongoose.connection.once('disconnected', done)
      })
    })
  } else {
    done(new Error('Connection already closed'))
  }
}
