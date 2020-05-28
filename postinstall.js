var path = require('path');
var fs = require('fs');
var packageJson = require('./package.json')

var pluginName = packageJson['@pattern-lab-plugin'].name
var pluginModuleName = packageJson.name
var node_modules_path = path.join(process.cwd(), 'node_modules');

function copyFolderRecursiveSync( source, target ) {
  var files = [];

  //check if folder needs to be created or integrated
  var targetFolder = path.join( target, path.basename( source ) );
  if ( !fs.existsSync( targetFolder ) ) {
      fs.mkdirSync( targetFolder, {
        recursive: true
      } );
  }

  //copy
  if ( fs.lstatSync( source ).isDirectory() ) {
      files = fs.readdirSync( source );
      files.forEach( function ( file ) {
          var curSource = path.join( source, file );
          if ( fs.lstatSync( curSource ).isDirectory() ) {
              copyFolderRecursiveSync( curSource, targetFolder );
          } else {
              fs.copyFileSync( curSource, path.join(targetFolder, file) );
          }
      } );
  }
}

if(require(path.join(process.cwd(), "package.json")).name != packageJson.name) {
  copyFolderRecursiveSync(path.join(node_modules_path, pluginModuleName), path.join(node_modules_path));

  console.log(`Pattern Lab Node Plugin - ${pluginModuleName} installed as ${pluginName}. `)
  console.log('You may have to run `npm run postinstall` from your console as well.')
}
