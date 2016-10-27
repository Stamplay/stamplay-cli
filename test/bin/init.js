/*global beforeEach, describe, it */
const assert = require('assert');
const path = require('path');
const rmdir = require('rimraf');
const fs = require('fs');

const appId = 'clitest';
const apiKey = '2e659c075ca2557eb2ecedb550cd25c7b6e4333b0032cc653b5bc44d2ec1c96d';
const stamplayBin = path.join(__dirname, '../../', '/bin/stamplay');
const fixturesFolder = path.join(__dirname, '../', '/fixtures');

describe('Stamplay cli init command', () => {
  beforeEach((done) => {
    rmdir(fixturesFolder, () => {
      fs.mkdir(fixturesFolder, () => {
        done();
      });
    });
  });

  it('stamplay init (invalid appId)', (done) => {
    const terminal = require('child_process').spawn('bash');
    var input = 0;

    terminal.stdout.on('data', (data) => {
      var output = data.toString();
      assert.equal(output, 'Enter your appId: ');
      if (input === 1) {
        return
      };
      input++;
    });

    terminal.on('exit', (code) => {
      done();
    });

    terminal.stdin.write(`cd ${fixturesFolder} && ${stamplayBin} init`);
    terminal.stdin.write('\n');
    terminal.stdin.write(`${appId} no-pass`);
    terminal.stdin.write('\n');
    terminal.stdin.end();
  });

  it('stamplay init (invalid credentials)', (done) => {
    const terminal = require('child_process').spawn('bash');
    var input = 0;

    terminal.stdout.on('data', (data) => {
      var output = data.toString();
      if (input === 0) {
        assert.equal(output, 'Enter your appId: ');
      } else if (input === 1) {
        assert.equal(output, 'Enter your apiKey: ');
      } else if (input === 2) {
        assert.equal(output, 'Error : AppId or apiKey are incorrect\n');
      }
      input += 1;
    });

    terminal.on('exit', (code) => {
      done();
    });

    terminal.stdin.write(`cd ${fixturesFolder} &&  ${stamplayBin} init`);
    terminal.stdin.write('\n');

    setTimeout(() => {
      terminal.stdin.write(`${appId}no-pass`);
      terminal.stdin.write('\n');
    }, 200);

    setTimeout(() => {
      terminal.stdin.write(apiKey);
      terminal.stdin.write('\n');
      terminal.stdin.end();
    }, 400);
  });

  it('stamplay init', (done) => {
    const terminal = require('child_process').spawn('bash');
    var input = 0;
    terminal.stdout.on('data', (data) => {
      var output = data.toString();
      if (input === 0) {
        assert.equal(output, 'Enter your appId: ');
      } else if (input === 1) {
        assert.equal(output, 'Enter your apiKey: ');
      } else if (input === 2) {
        assert.equal(output, 'Initialized Stamplay project clitest\n');
      }
      input++;
    });

    terminal.on('exit', (code) => {
      const stamplayJson = require('../fixtures/stamplay.json')
      assert.equal(stamplayJson.appId, appId);
      assert.equal(stamplayJson.apiKey, apiKey);
      assert.equal(stamplayJson.public, './');
      assert.equal(stamplayJson.ignore.length, 3);
      done();
    });

    terminal.stdin.write(`cd ${fixturesFolder} && ${stamplayBin} init`);
    terminal.stdin.write('\n');

    setTimeout(() => {
      terminal.stdin.write(appId);
      terminal.stdin.write('\n');
    }, 200);

    setTimeout(() => {
      terminal.stdin.write(apiKey);
      terminal.stdin.write('\n');
      terminal.stdin.end();
    }, 1200);
  });
});
