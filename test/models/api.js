/* globals describe, before, it */
const ApiRequest = require('../../lib/api');
const assert = require('assert');
const rmdir = require('rimraf');
const fs = require('fs');
const path = require('path');
const nock = require('nock');

const appId = 'clitest';
const apiKey = 'c4300c0c4c0df03e9fbaae97e53f297347fcd5d7b44811c2025dd52fd2f45843';
const authorizationHeader = 'Basic Y2xpdGVzdDpjNDMwMGMwYzRjMGRmMDNlOWZiYWFlOTdlNTNmMjk3MzQ3ZmNkNWQ3YjQ0ODExYzIwMjVkZDUyZmQyZjQ1ODQz';
const fixturesFolder = path.join(__dirname, '../', '/fixtures');
const finalExit = process.exit;

describe('Test on ApiRequest model', () => {

  before((done) => {
    const data = {};
    data.appId = appId;
    data.apiKey = apiKey;
    data.public = './';
    data.ignore = ['stamplay.json', '**/.*', '**/node_modules/**'];
    const dataString = `${JSON.stringify(data, null, 2)}\n`;
    rmdir(fixturesFolder, () => {
      fs.mkdir(fixturesFolder, () => {
        fs.writeFile(`${fixturesFolder}/stamplay.json`, dataString, () => {
          fs.writeFile(`${fixturesFolder}/index.html`, '<h1>test</h1>', done);
        });
      });
    });
  });

  it('App constructor', () => {
    const api = new ApiRequest(appId, apiKey, ['**/.*']);
    assert.equal(api.url, 'https://cli.stamplayapp.com');
    assert.equal(api.appId, appId);
    assert.equal(api.apiKey, apiKey);
    assert.equal(api.filesToIgnore.length, 1);
  });

  it('Method : getRequestOptions', () => {
    const api = new ApiRequest(appId, apiKey, ['**/.*']);
    const options = api.getRequestOptions('POST', '/deploy');
    assert.equal(options.method, 'POST');
    assert.equal(options.url, 'https://cli.stamplayapp.com/deploy');
    assert.equal(Object.keys(options.headers).length, 1);
    assert.equal(options.headers.authorization, authorizationHeader);
  });

  it('Method : getRequestOptions with json response', () => {
    const api = new ApiRequest(appId, apiKey, ['**/.*']);
    const options = api.getRequestOptions('POST', '/deploy', true);
    assert.equal(options.method, 'POST');
    assert.equal(options.url, 'https://cli.stamplayapp.com/deploy');
    assert.equal(Object.keys(options.headers).length, 1);
    assert.equal(options.headers.authorization, authorizationHeader);
    assert.equal(options.json, true);
  });

  it('Method : getRequestOptions with custom headers', () => {
    const headers = [{
      source: '*.js',
      headers: [{
        key: 'cache-control',
        value: 'max-age=10',
      }],
    }];
    const api = new ApiRequest(appId, apiKey, ['**/.*']);
    const options = api.getRequestOptions('POST', '/deploy', false, headers);
    assert.equal(options.method, 'POST');
    assert.equal(options.url, 'https://cli.stamplayapp.com/deploy');
    assert.equal(Object.keys(options.headers).length, 2);
    assert.equal(options.headers.authorization, authorizationHeader);
    assert.equal(options.headers['custom-headers'], 'eJyLrlYqzi8tSk5VslLS0ssqVtJRykhNTEktKlayiq5Wyk6tBEokJyZnpOom5+eVFOXnAFWUJeaUgjTkJlboJqan2hoaKNXG1sYCALsBGOU=');
  });

  it('Method : checkCredentials', (done) => {
    const expectedUrl = 'https://cli.stamplayapp.com/credentials';
    const expectedHeaders = {
      Authorization: 'Basic Y2xpdGVzdDpjNDMwMGMwYzRjMGRmMDNlOWZiYWFlOTdlNTNmMjk3MzQ3ZmNkNWQ3YjQ0ODExYzIwMjVkZDUyZmQyZjQ1ODQz',
    };
    const expectedAPI = nock(expectedUrl, expectedHeaders)
      .get('')
      .reply(200, {});

    const api = new ApiRequest(appId, apiKey, ['**/.*']);
    api.checkCredentials(() => {
      expectedAPI.done();
      done();
    });
  });

  it('Method : uploadFolder', (done) => {
    const scope = nock('https://cli.stamplayapp.com')
      .post('/deploy?comment=test')
      .reply(200);
    const api = new ApiRequest(appId, apiKey, ['**/.*']);
    api.uploadFolder(fixturesFolder, 'test');
    process.exit = () => {
      assert.strictEqual(scope.isDone(), true);
      done();
    };
  });

  it('Method : downloadFolder', (done) => {
    const scope = nock('https://cli.stamplayapp.com')
      .get('/download')
      .reply(200);

    const api = new ApiRequest(appId, apiKey, ['**/.*']);
    api.downloadFolder(() => {});
    process.exit = () => {
      scope.isDone();
      done();
    };
  });

  it('Method : getVersionsList', (done) => {
    const scope = nock('https://cli.stamplayapp.com')
      .get('/versions')
      .reply(200, {
        data: [{
          versionId: 'v1',
        }],
      });
    const api = new ApiRequest(appId, apiKey, ['**/.*']);
    api.getVersionsList((data) => {
      scope.isDone();
      assert(data.length === 1);
      assert.equal(data[0].versionId, 'v1');
      done();
    });
  });

  it('Method : rollbackToVersion', (done) => {
    const scope = nock('https://cli.stamplayapp.com')
      .post('/rollback', {
        version: 'v1',
      })
      .reply(200);

    const api = new ApiRequest(appId, apiKey, ['**/.*']);
    api.rollbackToVersion('v1');
    process.exit = function (statusCode) {
      this.exit = finalExit;
      scope.isDone();
      done();
    };
  });
});
