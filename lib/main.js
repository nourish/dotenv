'use strict'

var fs = require('fs')

module.exports = {
  /*
   * Main entry point into dotenv. Allows configuration before loading .env
   * @param {Object} options - valid options: path ('.env'), encoding ('utf8')
   * @returns {Boolean}
  */
  config: function (options) {
    var path = '.env'
    var encoding = 'utf8'
    var silent = false
    var override = false

    if (options) {
      if (options.silent) {
        silent = options.silent
      }
      if (options.path) {
        path = options.path
      }
      if (options.encoding) {
        encoding = options.encoding
      }
      if (options.override) {
        override = options.override
      }
    }

    try {
      // specifying an encoding returns a string instead of a buffer
      var parsedObj = this.parse(fs.readFileSync(path, { encoding: encoding }))

      Object.keys(parsedObj).forEach(function (key) {
        var newKey = parsedObj[key]
        if (override || typeof process.env[key] === 'undefined') {
          process.env[key] = newKey
        }
      })

      return parsedObj
    } catch (e) {
      if (!silent) {
        console.error(e)
      }
      return false
    }
  },

  /*
   * Parses a string or buffer into an object
   * @param {String|Buffer} src - source to be parsed
   * @returns {Object}
  */
  parse: function (src) {
    var obj = {}

    // convert Buffers before splitting into lines and processing
    src.toString().split('\n').forEach(function (line) {
      // matching "KEY' and 'VAL' in 'KEY=VAL'
      var keyValueArr = line.match(/^\s*([\w\.\-]+)\s*=\s*(.*)?\s*$/)
      // matched?
      if (keyValueArr != null) {
        var key = keyValueArr[1]

        // default undefined or missing values to empty string
        var value = keyValueArr[2] ? keyValueArr[2] : ''

        // expand newlines in quoted values
        var len = value ? value.length : 0
        if (len > 0 && value.charAt(0) === '\"' && value.charAt(len - 1) === '\"') {
          value = value.replace(/\\n/gm, '\n')
        }

        // remove any surrounding quotes and extra spaces
        value = value.replace(/(^['"]|['"]$)/g, '').trim()

        obj[key] = value
      }
    })

    return obj
  }

}

module.exports.load = module.exports.config
