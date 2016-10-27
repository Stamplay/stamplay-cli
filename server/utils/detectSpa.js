module.exports = function detectSpaUrl(req, res, next) {
  const isHome = req.url.match(/\/$/);
  const hasExtention = req.url.match(/\.[\w]+(\?.*)?$/);
  const isNotFound = req.url.match(/\/404$|\/404\.html$/);
  const isApi = req.url.match(/^(\/api\/.*)/);
  const isAuth = req.url.match(/^(\/auth\/.*)/);

  if (hasExtention || isNotFound || isHome || isApi || isAuth) {
    return next();
  }
  req.url = '/index.html';
  return next();
};
