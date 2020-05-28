var path = require('path')
var fs = require('fs')
var packageJson = require('./package.json')

var pluginName = packageJson['@pattern-lab-plugin'].name
var pluginModuleName = packageJson.name
var nodeModulesPath = path.join(process.cwd(), '..', '..')

function copyFolderRecursiveSync (source, target) {
  var files = []

  // check if folder needs to be created or integrated
  var targetFolder = path.join(target, path.basename(source))
  if (!fs.existsSync(targetFolder)) {
    fs.mkdirSync(targetFolder, {
      recursive: true
    })
  }

  // copy
  if (fs.lstatSync(source).isDirectory()) {
    files = fs.readdirSync(source)
    files.forEach(function (file) {
      var curSource = path.join(source, file)
      if (fs.lstatSync(curSource).isDirectory()) {
        copyFolderRecursiveSync(curSource, targetFolder)
      } else {
        fs.copyFileSync(curSource, path.join(targetFolder, file))
      }
    })
  }
}

var parentPackageJson = path.resolve(nodeModulesPath, '..', 'package.json')
if (fs.existsSync(parentPackageJson) && require(parentPackageJson).name !== pluginModuleName) {
  copyFolderRecursiveSync(path.join(nodeModulesPath, pluginModuleName), path.join(nodeModulesPath))

  console.log(`Pattern Lab Node Plugin - ${pluginModuleName} installed as ${pluginName}. `)
  console.log('You may have to run `npm run postinstall` from your console as well.')
}
