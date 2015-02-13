var app = require('./app'),
    chalk = require('chalk');

module.exports = {
  showHelp: function(command) {
    switch (command) {
      
      case 'add-app': break;
      case 'deploy': break;
      case 'start': break;
      case 'init': break;

      default: break;
    }
  },
  showVersion: function() {
    console.log('\n' + 'Stamplay Command Line Tools\n' );
  }
};