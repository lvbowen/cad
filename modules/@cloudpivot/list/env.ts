//@ts-ignore
const enableProxy = process.env.NODE_ENV === 'debug';

let env = (window as any).config;


if (enableProxy) {
  env = Object.assign({}, env, {
    enableProxy,
    //@ts-ignore
    client_id: process.env.VUE_APP_OAUTH_CLINET_ID,
    //@ts-ignore
    secret: process.env.VUE_APP_OAUTH_SECRET,
    //@ts-ignore
    redirectHost: process.env.VUE_APP_OAUTH_REDIRECT,
    //@ts-ignore
    oauthHost: process.env.VUE_APP_OAUTH_HOST,
    //@ts-ignore
    apiHost: process.env.VUE_APP_API,
    //@ts-ignore
    scope: process.env.VUE_APP_OAUTH_SCOPE,
    //@ts-ignore
    portalHost: process.env.VUE_APP_PORTAL_HOST
  });

  (window as any).config = env;
}

export default env;
