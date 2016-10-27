/*globals describe, it, beforeEach, afterEach */
const assert = require('assert');
const path = require('path');
const rmdir = require('rimraf');
const fs = require('fs');
const exec = require('child_process').exec;

const apiKey = '2e659c075ca2557eb2ecedb550cd25c7b6e4333b0032cc653b5bc44d2ec1c96d';
const appId = 'clitest';
const stamplayBin = path.join(__dirname, '../../', '/bin/stamplay');
const fixturesFolder = path.join(__dirname, '../', '/fixtures');

describe('Stamplay cli deploy command', () => {
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
          fs.writeFile(`${fixturesFolder}/index.html`, '<h1>test</h1>', () => {
            done();
          });
        });
      });
    });
  });

  it('stamplay deploy', (done) => {
    const terminal = require('child_process').spawn('bash');

    terminal.on('exit', (code) => {
      done();
    });

    terminal.stdin.write(`cd ${fixturesFolder} && ${stamplayBin} deploy`);
    terminal.stdin.write('\n');

    setTimeout(() => {
      terminal.stdin.write('\n');
      terminal.stdin.end();
    }, 100);
  });

  it('stamplay deploy (no index.html)', (done) => {
    fs.unlink(`${fixturesFolder}/index.html`, () => {
      const terminal = require('child_process').spawn('bash');
      var res = '';

      terminal.stdout.on('data', (data) => {
        res += data;
      });

      terminal.stderr.on('data', (data) => {})

      terminal.on('exit', () => {
        assert.equal(res.toString(), 'Missing index.html in your public folder ./ please edit stamplay.json\n')
        done();
      });

      terminal.stdin.write(`cd  ${fixturesFolder} && ${stamplayBin} deploy`);
      terminal.stdin.write('\n');

      setTimeout(() => {
        terminal.stdin.write('test comment');
        terminal.stdin.write('\n');
        terminal.stdin.end();
      }, 10);
    });
  });
});
