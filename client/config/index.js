'use strict'
// Template version: 1.3.1
// see http://vuejs-templates.github.io/webpack for documentation.

const path = require('path')
const ip = require('internal-ip').v4.sync()
const crypto = require('crypto')

module.exports = {
  dev: {
    // Paths
    assetsSubDirectory: 'static',
    assetsPublicPath: '',
    env: require('./dev.env'),
    // webpack-dev-server 相关配置
    proxyTable: {
      '/xunfei': {
        target: 'http://tupapi.xfyun.cn/v1/expression', // 对应自己的接口
        changeOrigin: true,
        ws: true,
        ignorePath: true
      },
      // onProxyRes: function(proxyRes, req, res) {
      //   const appId = '5d887011'
      //   const time = String(new Date().getTime())
      //   const params = new Buffer(JSON.stringify({
      //     image_name: 'img.jpg',
      //     image_url: ''
      //   })).toString('base64')
      //   const hash = crypto.createHash('md5')
      //   const checkSum = hash.update(appId + time + params).digest()
      //   proxyRes.headers['X-Appid'] = appId
      //   proxyRes.headers['X-CurTime'] = time
      //   proxyRes.headers['X-Param'] = params
      //   proxyRes.headers['X-CheckSum'] = checkSum
      //   console.log(11111111111, proxyRes.headers)
      // }
    },
    // Various Dev Server settings
    host: ip || 'localhost', // can be overwritten by process.env.HOST
    port: 8080, // can be overwritten by process.env.PORT, if port is in use, a free one will be determined
    autoOpenBrowser: true,
    errorOverlay: true,
    notifyOnErrors: true,
    poll: false, // https://webpack.js.org/configuration/dev-server/#devserver-watchoptions-
    // Use Eslint Loader?
    // If true, your code will be linted during bundling and
    // linting errors and warnings will be shown in the console.
    useEslint: false,
    // If true, eslint errors and warnings will also be shown in the error overlay
    // in the browser.
    showEslintErrorsInOverlay: false,
    exact: true,
    // hotReload: true,
    usePostCSS: true,
    /**
     * Source Maps
     */
    // https://webpack.js.org/configuration/devtool/#development
    devtool: '#cheap-module-eval-source-map',
    // If you have problems debugging vue-files in devtools,
    // set this to false - it *may* help
    // https://vue-loader.vuejs.org/en/options.html#cachebusting
    cacheBusting: true,
    cssSourceMap: true
  },

  build: {
    // Template for index.html
    index: path.resolve(__dirname, '../dist/index.html'),
    env: require('./prod.env'),
    // Paths
    assetsRoot: path.resolve(__dirname, '../dist'),
    assetsSubDirectory: 'static',
    assetsPublicPath: './',
    /**
     * Source Maps
     */
    productionSourceMap: false,
    // https://webpack.js.org/configuration/devtool/#production
    devtool: '#source-map',

    exact: true,
    hotReload: true,
    usePostCSS: true,
    // Gzip off by default as many popular static hosts such as
    // Surge or Netlify already gzip all static assets for you.
    // Before setting to `true`, make sure to:
    // npm install --save-dev compression-webpack-plugin
    productionGzip: false,
    productionGzipExtensions: ['js', 'css'],

    // Run the build command with an extra argument to
    // View the bundle analyzer report after build finishes:
    // `npm run build --report`
    // Set to `true` or `false` to always turn it on or off
    bundleAnalyzerReport: process.env.npm_config_report,

    // `npm run build:prod --generate_report`
    generateAnalyzerReport: process.env.npm_config_generate_report || false
  }
}
