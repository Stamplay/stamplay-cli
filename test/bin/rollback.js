/* globals describe, beforeEach, it */
const assert = require('assert');
const path = require('path');
const rmdir = require('rimraf');
const fs = require('fs');

const apiKey = '2e659c075ca2557eb2ecedb550cd25c7b6e4333b0032cc653b5bc44d2ec1c96d';
const appId = 'clitest';
const stamplayBin = path.join(__dirname, '../../', '/bin/stamplay');
const fixturesFolder = path.join(__dirname, '../', '/fixtures');

describe('Stamplay cli rollback command', () => {
  beforeEach((done) => {
    const data = {};
    data.appId = appId;
    data.apiKey = apiKey;
    data.public = './';
    data.ignore = ['stamplay.json', '**/.*', '**/node_modules/**'];
    const dataString = `${JSON.stringify(data, null, 2)}\n`;
    rmdir(fixturesFolder, () => {
      fs.mkdir(fixturesFolder, () => {
        fs.writeFile(`${fixturesFolder}/stamplay.json`, dataString, () => {
          done();
        });
      });
    });
  });

  it('stamplay rollback', (done) => {
    const terminal = require('child_process').spawn('bash');
    var input = 0;

    terminal.stdout.on('data', (data) => {
      var output = data.toString();
      if (input === 0) {
        assert.equal(output.indexOf('Select version:') !== -1, true);
      }
      input++;
      terminal.stdin.end();
    });

    terminal.on('exit', (code) => {
      done();
    });
    terminal.stdin.write(`cd ${fixturesFolder} && ${stamplayBin} rollback`);
    terminal.stdin.write('\n');
  });
});
