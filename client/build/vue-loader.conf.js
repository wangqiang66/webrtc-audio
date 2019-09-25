'use strict'
const utils = require('./utils')
const config = require('../config')
const isProduction = process.env.NODE_ENV === 'production'
const sourceMapEnabled = isProduction
  ? config.build.productionSourceMap
  : config.dev.cssSourceMap
const extract = isProduction ? config.build.exact : config.dev.exact
const hotReload = isProduction ? config.build.hotReload : config.dev.hotReload
const usePostCSS = isProduction ? config.build.usePostCSS : config.dev.usePostCSS


module.exports = {
  loaders: utils.cssLoaders({
    sourceMap: sourceMapEnabled,
    extract,
    hotReload,
    usePostCSS
  }),
  cssSourceMap: sourceMapEnabled,
  cacheBusting: config.dev.cacheBusting,
  transformToRequire: {
    video: ['src', 'poster'],
    source: 'src',
    img: 'src',
    image: 'xlink:href'
  }
}
