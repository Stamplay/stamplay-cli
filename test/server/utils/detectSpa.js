/* globals describe, before, it */
const detectSpa = require('../../../server/utils/detectSpa');
const assert = require('assert');

const res = {};
const homeUrl = '/index.html';

describe('Detect SPA routing logic', () => {
  it('should request the file if an extension is found', (done) => {
    const url = '/app.js';
    const req = {
      url,
    };
    detectSpa(req, res, () => {
      assert.strictEqual(req.url, url);
      done();
    });
  });

  it('should request index.html if no extension is found', (done) => {
    const url = '/app/admin';
    const req = {
      url,
    };
    detectSpa(req, res, () => {
      assert.strictEqual(req.url, homeUrl);
      done();
    });
  });

  it('should request index.html if no extension is found and query parameter is present', (done) => {
    const url = '/app/admin?view=5';
    const req = {
      url,
      query: {
        view: 5,
      },
    };
    detectSpa(req, res, () => {
      assert.strictEqual(req.url, homeUrl);
      assert.strictEqual(req.query.view, 5);
      done();
    });
  });

  it('should request index.html if no extension is found, even if dots are contained in middle of url', (done) => {
    const url = '/app/admin/dash.board/payment';
    const req = {
      url,
    };
    detectSpa(req, res, () => {
      assert.strictEqual(req.url, homeUrl);
      done();
    });
  });

  it('should not change /api url', (done) => {
    const url = '/api/cobject/v1/test';
    const req = {
      url,
    };
    detectSpa(req, res, () => {
      assert.strictEqual(req.url, url);
      done();
    });
  });

  it('should not change /auth url', (done) => {
    const url = '/auth/v1/facebook/connect';
    const req = {
      url,
    };
    detectSpa(req, res, () => {
      assert.strictEqual(req.url, url);
      done();
    });
  });

  it('should not change url if / is requested', (done) => {
    const url = '/';
    const req = {
      url,
    };
    detectSpa(req, res, () => {
      assert.strictEqual(req.url, url);
      done();
    });
  });
});
