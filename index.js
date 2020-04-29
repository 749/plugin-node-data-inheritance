'use strict'
const packageJson = require('./package.json')

const log = require('@pattern-lab/core/src/lib/log')

const pluginName = packageJson['@pattern-lab-plugin'].name
const pluginModuleName = packageJson.name

const path = require('path')

const fs = require('fs-extra')
const glob = require('glob')

const inheritance = require('./src/inheritance')

function getPluginFrontendConfig () {
  return {
    name: pluginName,
    templates: [],
    stylesheets: [],
    javascripts: [],
    onready: '',
    callback: ''
  }
}

/**
 * @param {Patternlab} patternlab
 */
function pluginInit (patternlab) {
  if (!patternlab) {
    console.error('patternlab object not provided to plugin-init')
    process.exit(1)
  }

  // write the plugin json to public/patternlab-components
  var pluginConfig = getPluginFrontendConfig()
  var pluginConfigPathName = path.resolve(patternlab.config.paths.public.root,
    'patternlab-components', 'packages')

  try {
    fs.outputFileSync(pluginConfigPathName + '/' + pluginName + '.json',
      JSON.stringify(pluginConfig, null, 2))
  } catch (ex) {
    console.trace(`${pluginName}: Error occurred while writing pluginFile configuration`)
    console.log(ex)
  }

  // add the plugin config to the patternlab-object
  if (!patternlab.plugins) {
    patternlab.plugins = []
  }

  patternlab.plugins.push(pluginConfig)

  // write the plugin dist folder to public/pattern-lab
  var pluginFiles = glob.sync(path.join(__dirname, 'dist', '**', '*'))
  if (pluginFiles && pluginFiles.length > 0) {
    for (var i = 0; i < pluginFiles.length; i++) {
      try {
        var fileStat = fs.statSync(pluginFiles[i])
        if (fileStat.isFile()) {
          var relativePath = path.relative(__dirname, pluginFiles[i]).replace('dist', '')
          var writePath = path.join(patternlab.config.paths.public.root,
            'patternlab-components', 'pattern-lab', pluginName, relativePath)
          var tabJSFileContents = fs.readFileSync(pluginFiles[i], 'utf8')
          fs.outputFileSync(writePath, tabJSFileContents)
        }
      } catch (ex) {
        console.trace(`${pluginName}: Error occurred while copying pluginFile`, pluginFiles[i])
        console.log(ex)
      }
    }
  }
  // setup listeners if not already active. we also enable and set the plugin as initialized
  if (!patternlab.config.plugins) {
    patternlab.config.plugins = {}
  }

  // attempt to only register events once
  if (
    patternlab.config.plugins[pluginModuleName] !== undefined &&
    patternlab.config.plugins[pluginModuleName].enabled &&
    !patternlab.config.plugins[pluginModuleName].initialized
  ) {
    // register events
    inheritance.registerEvents(patternlab)

    // set the plugin initialized flag to true to indicate it is installed and ready
    patternlab.config.plugins[pluginModuleName].initialized = true
    log.info(`${pluginName} as ${pluginModuleName} loaded`)
  }
}

module.exports = pluginInit
