const path = require('path');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const defaultCssVars = require('@cloudpivot/common/styles/variable').mobile;

const extendLessVars = require('./extends/theme');

const modifyVars = Object.assign({}, defaultCssVars, extendLessVars);

const CopyWebpackPlugin = require('copy-webpack-plugin');

let pages = {
  main: {
    entry: 'src/main.ts',
    template: 'public/index.html',
    filename: 'index.html',
  },
  externalLink: {
    entry: 'src/views/externalLink/apps.ts',
    template: 'src/views/externalLink/el.html',
    filename: 'el.html',
  }
};

const getMobilePublicPath = (baseUrl) => {
  if (!baseUrl) {
    return '/mobile/';
  } else {
    return process.env.BASE_URL + '/mobile/';
  }
}

module.exports = {
  //publicPath: process.env.BASE_URL+'/mobile/',
  publicPath: getMobilePublicPath(process.env.BASE_URL),
  pages,
  filenameHashing: true,
  productionSourceMap: true,
  // 处理IE兼容————vuex持久化脚本语法转译
  transpileDependencies: ['vuex-persist', 'flatted', 'ansi-regex'], // /@cloudpivot\/[\w-]+/],
  configureWebpack: config => {
    return {

      plugins: [
        new CopyWebpackPlugin([
          {from: 'node_modules/@liveqing/liveplayer/dist/component/crossdomain.xml'},
          {from: 'node_modules/@liveqing/liveplayer/dist/component/liveplayer.swf'},
          {from: 'node_modules/@liveqing/liveplayer/dist/component/liveplayer-lib.min.js', to: 'js/'}
        ])]
    }
  },
  devServer: {
    port: 9100,
    open: false,
    disableHostCheck: true,
    proxy: {
      '/dataManage/': {
        target: process.env.VUE_APP_API + '/',
        changeOrigin: true,
      },
      '/api/': {
        target: process.env.VUE_APP_API + '/',
        // target:  'http://47.106.247.123:8080/',
        // target: 'http://rap2api.taobao.org/',
        changeOrigin: true,
        // pathRewrite: {
        //   '^/api': '', // app/mock/94968
        // },
      },
      '/bim/': {
        target: process.env.VUE_APP_API + '/',
        changeOrigin: true,
      },
      '/externalLink/': {
        target: process.env.VUE_APP_API + '/',
        changeOrigin: true,
      },
      '/apis/': {
        target: process.env.VUE_APP_OAUTH_HOST + '/',
        changeOrigin: true,
        pathRewrite: {
          '^/apis': ''
        },
      },
      '/QingLive/': {
        target: process.env.VUE_APP_PORTAL_HOST + '/',
        changeOrigin: true,
      },
      '/dashboard/': {
        target: process.env.DASHBOARD + '/',
        changeOrigin: true
      },
      '/data-source/': {
        target: process.env.DATASOURCE + '/',
        changeOrigin: true
      },
      '/codeManage/': {
        target: process.env.DATASOURCE + '/',
        changeOrigin: true
      }
    },
    before: (app) => {
      app.all('*', function (req, res, next) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'X-Requested-With');
        res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS');
        res.header('X-Powered-By', '3.2.1');
        if (req.method === 'OPTIONS') {
          res.sendStatus(200);
        } else {
          next();
        }
      })
    }
  },

  css: {
    loaderOptions: {
      less: {
        modifyVars: modifyVars,
        javascriptEnabled: true
      },
    },
  },
  chainWebpack: config => {
    config.resolve.alias
      .set('assets', path.resolve(__dirname, './src/assets'))
      .set('styles', path.resolve(__dirname, './src/styles'));


    //worker
    config.module
      .rule('worker')
      .test(/\.worker\.js$/)
      .use('worker')
      .loader('worker-loader')
      .options({
        inline: 'fallback'
      })
      .loader('babel-loader')
      .options({
        presets: ["@babel/preset-env"]
      });

    // 删除预加载, preload删除方式一样
    ['main', 'externalLink'].map(name => config.plugins.delete(`prefetch-${name}`))

    // 优化打包
    config.optimization
      .splitChunks({
        minSize: 300000,
        maxInitialRequests: 6
      })

    // 配置打包分析
    // if (process.env.npm_config_report) {
    // config
    //   .plugin('webpack-bundle-analyzer')
    //   .use(BundleAnalyzerPlugin)
    // }
  }
};
