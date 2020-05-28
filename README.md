# Data Inheritance Plugin for Pattern Lab Node

The Data Inheritance Plugin allows patterns to inherit data from patterns within its lineage.
This means that data from included patterns is merged with the current pattern. The current pattern's data takes precedence.

## Installation

To add the Data Inheritance Plugin to your project using [npm](http://npmjs.com/):

`npm install --save @g749/plugin-node-data-inheritance`

Or add it directly to your project's `package.json` file and run `npm install`.

Note: This plugin needs an event which is not (yet?) available in Patternlab node, if it is to be used / tested the following needs to be added to ln. 360 in patternlab.js (Patternlab core lib):

    patternlab.events.emit('patternlab-pattern-before-data-merge', patternlab, pattern);

## Note
Due to the way patterlab-node handles plugins, during the postinstall.js the module is copied from `node_modules/@g749/plugin-node-data-inheritance` to `node_modules/plugin-node-data-inheritance`
