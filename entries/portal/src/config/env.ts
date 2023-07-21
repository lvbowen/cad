interface GlobalConfig {
  //是否是开发环境
  enableProxy:boolean;
  // 客户端ID
  client_id: string;
  // 密钥
  secret: string;
  //重定向地址
  redirectHost: string;
  // Oauth 鉴权地址
  oauthHost: string;
  // API接口地址
  apiHost: string;
  scope: string;
  // 业务平台地址
  portalHost: string;
  // 非当前项目地址
  host: string;
  // 项目编码
  project:string;
}

declare global {
  interface Window {
    config: GlobalConfig;
    projectRoute:string;
    projectId:string;
  }
}

const
  enableProxy = process.env.NODE_ENV === 'debug',
  {
    VUE_APP_OAUTH_CLINET_ID,
    VUE_APP_OAUTH_SECRET,
    VUE_APP_OAUTH_REDIRECT,
    VUE_APP_OAUTH_HOST,
    VUE_APP_API,
    VUE_APP_OAUTH_SCOPE,
    VUE_APP_PORTAL_HOST,
    VUE_APP_BASE_URL,
    VUE_APP_PROJECT
  } = process.env;

let env = window.config;

const connectDebugEnv = (base: string | undefined) => base && `${base}${VUE_APP_BASE_URL}` || base;


if (enableProxy) {
  env = Object.assign({}, env, {
    enableProxy,
    client_id: VUE_APP_OAUTH_CLINET_ID,
    secret: VUE_APP_OAUTH_SECRET,
    redirectHost: VUE_APP_OAUTH_REDIRECT,
    oauthHost: VUE_APP_OAUTH_HOST,
    apiHost: VUE_APP_API,
    scope: VUE_APP_OAUTH_SCOPE,
    portalHost: connectDebugEnv(enableProxy && VUE_APP_PORTAL_HOST),
    host: VUE_APP_PORTAL_HOST,
    project:VUE_APP_PROJECT
  });

  window.config = env;
}

export default env;
