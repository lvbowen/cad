var host = window.location.protocol + '//' + window.location.host;
var projectRoute = 'Path';
var projectId = 'Code';

function ConfigGetMergeRoute(str) {
  if (str === 'undefined') {
    return host;
  } else {
    return host + '/' + str;
  }
}

function ConfigGetMergeMobileRoute(str) {
  if (str === 'undefined') {
    return host + '/mobile';
  } else {
    return host + '/' + str + '/mobile';
  }
}

function ConfigGetMergeId(str) {
  if (str === 'undefined') {
    return undefined;
  } else {
    return str;
  }
}

window._AMapSecurityConfig={'securityJsCode':'f18b5b7b8d8ef1479e6e3f01771712c1'};

window.config = {
  oauthHost: host + '/api',
  host: host,
  redirectHost: ConfigGetMergeMobileRoute(projectRoute),
  client_id: 'api',
  scope: 'read',
  secret: 'c31b32364ce19ca8fcd150a417ecce58',
  apiHost: host + '/api',
  portalHost: ConfigGetMergeRoute(projectRoute),
  project: ConfigGetMergeId(projectId),
  gaoDeKey:'a99e76b049842471913fd61c023dfd95'
};
