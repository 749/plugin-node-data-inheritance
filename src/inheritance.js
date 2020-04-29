const path = require('path')

const {Patternlab} = require('@pattern-lab/core')

const fs = require('fs-extra')
const merge = require('merge-deep')

const jsonCopy = require('@pattern-lab/core/src/lib/json_copy')
const events = require('@pattern-lab/core/src/lib/events')

/**
 * @param {Patternlab} patternlab
 * @param {string} patternName
 */
function getPatternByName (patternlab, patternName) {
  for (var i = 0; i < patternlab.patterns.length; i++) {
    if (patternlab.patterns[i].name === patternName) {
      return patternlab.patterns[i]
    }
  }

  return null
}

function arrayReplaceRecursive (arr) {
  var i = 0
  var p = ''
  var argl = arguments.length
  var retObj

  if (argl < 2) {
    throw new Error('There should be at least 2 arguments passed to arrayReplaceRecursive()')
  }

  if (Object.prototype.toString.call(arr) === '[object Array]') {
    retObj = []
    for (p in arr) {
      retObj.push(arr[p])
    }
  } else {
    retObj = {}
    for (p in arr) {
      retObj[p] = arr[p]
    }
  }

  for (i = 1; i < argl; i++) {
    for (p in arguments[i]) {
      if (retObj[p] && typeof retObj[p] === 'object') {
        retObj[p] = arrayReplaceRecursive(retObj[p], arguments[i][p])
      } else {
        retObj[p] = arguments[i][p]
      }
    }
  }

  return retObj
}

/**
 * @param {Patternlab} patternlab
 */
function generatePatternJson (args) {
  const patternlab = args[0]
  const pattern = args[1] || {}
  if ('patternLineages' in pattern) {
    for (var i = 0; i < pattern.patternLineages.length; i++) {
      var thePart = path.basename(pattern.patternLineages[i].lineagePath, '.rendered.html')
      var currentPattern = getPatternByName(patternlab, thePart)
      if (currentPattern) {
        generatePatternJson(patternlab, currentPattern)
        if (!pattern.jsonFileData) {
          pattern.jsonFileData = currentPattern.jsonFileData
        } else {
          pattern.jsonFileData = arrayReplaceRecursive(currentPattern.jsonFileData, pattern.jsonFileData)
        }
      }
    }
  }
}

/**
 * @param {Patternlab} patternlab
 */
function writeGeneratedJson (args) {
  const patternlab = args[0]
  const pattern = args[1]
  var allData = jsonCopy(patternlab.data, 'config.paths.source.data global data')
  if (typeof pattern === 'object') {
    if (pattern.jsonFileData) {
      allData = merge(allData, pattern.jsonFileData)
    }
    var jsonFile = path.join(patternlab.config.paths.public.patterns, pattern.getPatternLink(patternlab, 'custom', '-data.json'))
    fs.outputFileSync(jsonFile, JSON.stringify(allData))
  }
}

module.exports = {
  /**
   * @param {Patternlab} patternlab
   */
  registerEvents (patternlab) {
    patternlab.events.on(events.PATTERNLAB_PATTERN_BEFORE_DATA_MERGE, generatePatternJson)
    patternlab.events.on(events.PATTERNLAB_PATTERN_WRITE_BEGIN, writeGeneratedJson)
  }
}
