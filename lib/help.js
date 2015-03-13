var app = require('./app'),
  pkg = require('../package.json'),
  chalk = require('chalk');

module.exports = {
  showHelp: function(command) {
    switch (command) {
      
      case 'download': 
        console.log('\n' +
                    '  stamplay download\n' +
                    '    Download the current active version of an app.\n' +
                    '\n' +
                    '    You will be prompted to type appId and apiKey, if you don\'t have it\n' +
                    '    go into your app on https://editor.stamplay.com and get them\n' + 
                    '    under Backend -> ApiKey section.\n');
        break;

      case 'deploy': 
        console.log('\n' +
                    '  stamplay deploy\n' +
                    '    Deploys the current app to Stamplay and creates a new version.\n' +
                    '\n' +
                    '    Uploads the directory detailed by the "public" attribute in the\n' +
                    '    stamplay.json settings file under. The app must contain an entry point file\n' +
                    '    called index.html at root level of your public directory. If no file\n' +
                    '    is found you\'ll be prompted to create it.\n');
        break;

      case 'rollback': 
        console.log('\n' +
                    '  stamplay rollback\n' +
                    '    Restore in production a previously deployed version.\n' +
                    '    You\'ll be prompted to pick one of your previous deploys from a list.\n');
        break;

      case 'start': 
        console.log('\n' +
                    '  stamplay start\n' +
                    '    Start serving your app on your localhost.\n' +                    
                    '    The public folder will be served at the following address http://localhost:8080.\n');
        break;

      case 'open':
        console.log('\n' +
                    '  stamplay open\n' +
                    '    Opens the current Stamplay app\'s stamplayapp.com subdomain in a browser.\n');
        break;

      case 'init': 
        console.log('\n' +
                    '  stamplay init\n' +
                    '   Initializes an existing Stamplay app in the current directory and prompts \n' +
                    '   you to configuring it for stamplayapp.com. \n' +
                    '\n'+
                    '   Running stamplay init in an existing repository is safe. It will not \n' +
                    '   overwrite things that are already there.  It only Generates a \n' +
                    '   stamplay.json file in the current directory with all the settings \n' +
                    '   required to deploy it. If you don\'t have appId and apiKey yet \n' +
                    '   open https://editor.stamplay.com and create a new app.\n');

        break;

      default:
        this.showVersion();
        console.log('Usage: stamplay <command>\n' +
                    '\n' +
                    '  Available commands are:\n' +
                    '\n' +
                    '  deploy\n' +
                    '    Deploys a new version of the current app to Stamplay.\n' +
                    '\n' +
                    '  download\n' +
                    '    Download the current active version of an app,\n' +
                    '    You will be prompted to type appId and apiKey, if you don\'t have it\n' +
                    '    go into your app on https://editor.stamplay.com and get them' + 
                    '    under Backend -> ApiKey section.\n' +
                    '\n' +
                    '  init\n' +
                    '    Initialize your project and make it ready to be deployed on Stamplay. Run this command into your project folder.\n' +
                    '    The command will prompt you for AppId and Api Key.\n' +
                    '\n' +
                    '  open\n' +
                    '    Opens the URL of the current Stamplay app in a browser.\n' +
                    '\n' +                     
                    '  rollback\n' +
                    '    Restore in production a previously deployed version.\n' +
                    '\n' +                    
                    '  start\n' +
                    '    Run your app in your localhost on http://localhost:8080.\n' +
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
    console.log('\n' + 'Stamplay Command Line \nVersion ' + pkg.version + '\n');
    }
};
