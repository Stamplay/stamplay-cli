/*globals describe, it, beforeEach, afterEach */
const assert = require('assert');
const path = require('path');
const rmdir = require('rimraf');
const fs = require('fs');
const exec = require('child_process').exec;

const apiKey = '2e659c075ca2557eb2ecedb550cd25c7b6e4333b0032cc653b5bc44d2ec1c96d'
const appId = 'clitest';
const stamplayBin = path.join(__dirname, '../../', '/bin/stamplay');
const fixturesFolder = path.join(__dirname, '../', '/fixtures');

describe('Stamplay cli download command', () => {
  beforeEach((done) => {
    const data = {};
    data.appId = appId;
    data.apiKey = apiKey;
    data.public = './';
    data.ignore = ['stamplay.json', '**/.*', '**/node_modules/**'];
    rmdir(fixturesFolder, () => {
      fs.mkdir(fixturesFolder, () => {
        done();
      });
    });
  });

  it('stamplay download', (done) => {
    const terminal = require('child_process').spawn('bash');
    var input = 0;

    terminal.stdout.on('data', (data) => {
      var output = data.toString();
      if (input === 0) {
        assert.equal(output, 'Enter your appId: ');
      } else if (input === 1) {
        assert.equal(output, 'Enter your apiKey: ');
      } else if (input == 2) {
        assert.equal(output, 'Initialized Stamplay project clitest\n');
      }
      input++;
    });

    terminal.on('exit', (code) => {
      done();
    });

    terminal.stdin.write(`cd ${fixturesFolder} && ${stamplayBin} download`);
    terminal.stdin.write('\n');

    setTimeout(() => {
      terminal.stdin.write(appId);
      terminal.stdin.write('\n');
    }, 200);

    setTimeout(() => {
      terminal.stdin.write(apiKey);
      terminal.stdin.write('\n');
      terminal.stdin.end();
    }, 800);
  });
});
