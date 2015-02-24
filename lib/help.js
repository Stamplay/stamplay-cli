var app = require('./app'),
    chalk = require('chalk');

module.exports = {
  showHelp: function(command) {
    switch (command) {
      
      case 'add-app': break;

      case 'deploy': 
        console.log('\n' +
                    '  stamplay deploy\n' +
                    '    Deploys the current app to Stamplay and creates a new version,\n' +                    
                    '\n' +
                    '    Optional command line parameters:\n' +
                    '\n' +
                    '      -m, --message  An optional version message\n' +                    
                    '\n' +
                    '    Uploads the directory detailed by the "public" attribute in the\n' +
                    '    stamplay.json settings file under. The app must contain an entry point file\n' +
                    '    called index.html at root level of your public directory. If no file\n' +
                    '    is found you\'ll be prompted to create it.\n');
        break;

      case 'start': break;

      case 'open':
        console.log('\n' +
                    '  stamplay open\n' +
                    '    Opens the current Stamplay app\'s stamplayapp.com subdomain in a browser.\n');
        break;

      case 'init': 
        console.log('\n' +
                    '  stamplay init\n' +
                    '    Initializes an existing Stamplay app in the current directory and prompts\n' +
                    '    you through configuring it for stamplayapp.com.\n' +
                    '\n' +
                    '    Generates a stamplay.json file in the current directory for all the settings\n' +
                    '    required for deploy. If you don\'t have appId and apiKey yet\n' +
                    '    open https://editor.stamplay.com and create a new app.\n');

        break;

      default:
        this.showVersion();
        console.log('Usage: stamplay <command>\n' +
                    '\n' +
                    '  Available commands are:\n' +
                    '\n' +
                    '  deploy\n' +
                    '    Deploys a new version of the current app to Stamplay\n' +
                    '\n' +
                    '  init\n' +
                    '    Initializes an existing Stamplay app in the current directory and prompts\n' +
                    '    you through configuring it.\n' +
                    '\n' +
                    '  open\n' +
                    '    Opens the URL of the current Stamplay app in a browser.\n' +
                    '\n' +                    
                    '  -h, --help\n' +
                    '    Shows this help screen. Use `stamplay <command> --help` for more detailed\n' +
                    '    help instructions.\n' +
                    '\n' +
                    '  -v, --version\n' +
                    '    Displays the current version.\n' +                    
                    '\n' +
                    'For a quick start guide, see https://stamplay.com\n');

        break;

    }
  },
  showVersion: function() {
    console.log('\n' + 'Stamplay Command Line Tools\n' );
  }
};