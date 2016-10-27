/* globals describe, beforeEach, afterEach, it */
const assert = require('assert');
const path = require('path');
const rmdir = require('rimraf');
const fs = require('fs');
const exec = require('child_process').exec;

const apiKey = '2e659c075ca2557eb2ecedb550cd25c7b6e4333b0032cc653b5bc44d2ec1c96d';
const appId = 'clitest';

const lastEnterChar = new RegExp('\n$');
const stamplayBin = path.join(__dirname, '../../', '/bin/stamplay');
const fixturesFolder = path.join(__dirname, '../', '/fixtures');

describe('Stamplay cli start command', () => {
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
          fs.writeFile(`${fixturesFolder}/index.html`, '<h1>start command</h1>', () => {
            done();
          });
        });
      });
    });
  });

  it('stamplay  (no stamplay.json file)', (done) => {
    exec(`${stamplayBin} start`, (error, stdout, stderr) => {
      stdout = stdout.replace(lastEnterChar, '');
      assert.equal(error.code, 1);
      assert.equal(stderr, '');
      assert.equal(stdout, 'Error : missing stamplay.json file, are you sure that is the right directory?');
      done();
    });
  });

  it('stamplay start', (done) => {
    const terminal = require('child_process').spawn('bash');
    terminal.stdout.on('data', (data) => {
      const output = data.toString();
      assert.equal(output, 'Server running with ./ as public folder at the following address http://localhost:8080\n');
    });

    setTimeout(() => {
      terminal.kill();
    }, 1000);

    terminal.on('exit', (code) => {
      done();
    });
    terminal.stdin.write(`cd ${fixturesFolder} && ${stamplayBin} start`);
    terminal.stdin.write('\n');
    terminal.stdin.end();
  });

  it('stamplay start with custom port (-p)', (done) => {
    var messages = 0;
    const terminal = require('child_process').spawn('bash');

    terminal.stdout.on('data', (data) => {
      var output = data.toString();
      messages++;
      switch (messages) {
      case '1':
        assert.equal(output, 'Warning: in case you get CORS request errors you have to add \'localhost:[PORT]\' in your Hosting -> Enabled CORS domain settings\n');
        break;
      case '2':
        assert.equal(output, 'Server running with ./ as public folder at the following address http://localhost:8000\n');
        break;
      }
    });

    setTimeout(() => {
      terminal.kill();
    }, 1000);

    terminal.on('exit', (code) => {
      done();
    });

    terminal.stdin.write(`cd  ${fixturesFolder} && ${stamplayBin} start -p 8000`);
    terminal.stdin.write('\n');
    terminal.stdin.end();
  });

  it('stamplay start with custom port (--port)', (done) => {
    var messages = 0;
    const terminal = require('child_process').spawn('bash');

    terminal.stdout.on('data', (data) => {
      var output = data.toString();
      messages++;
      switch (messages) {
      case '1':
        assert.equal(output, 'Warning: in case you get CORS request errors you have to add \'localhost:[PORT]\' in your Hosting -> Enabled CORS domain settings\n');
        break;
      case '2':
        assert.equal(output, 'Server running with ./ as public folder at the following address http://localhost:8000\n');
        break;
      }
    });

    terminal.on('exit', (code) => {
      done();
    });

    setTimeout(() => {
      terminal.kill();
    }, 1000);

    terminal.stdin.write(`cd ${fixturesFolder} && ${stamplayBin} start --port 8000`);
    terminal.stdin.write('\n');
    terminal.stdin.end();
  });

  it('stamplay start with wrong port', (done) => {
    exec(`cd ${fixturesFolder} && ${stamplayBin} start -p test`, (error, stdout, stderr) => {
      stdout = stdout.replace(lastEnterChar, '');
      assert.equal(error.code, 1);
      assert.equal(stderr, '');
      assert.equal(stdout, 'Error: port parameter must be an integer');
      done();
    });
  });

  it('stamplay start with both p and port parameter defined', (done) => {
    exec(`cd ${fixturesFolder} && ${stamplayBin} start -p test --port test`, (error, stdout, stderr) => {
      stdout = stdout.replace(lastEnterChar, '');
      assert.equal(error.code, 1);
      assert.equal(stderr, '');
      assert.equal(stdout, 'Error: "p" parameter is an alias of "proxy" parameter, you must use only one of them');
      done();
    });
  });
});
