const path = require('path')
// const px2rem = require('postcss-px2rem')
// // 配置基本大小
// const postcss = px2rem({
//   remUnit: 16
// })
module.exports = {
  // publicPath: process.env.NODE_ENV === 'production'
  // ? '/production-sub-path/'
  //   : '/',
  publicPath: '/',
  devServer: {
    open: true,
    host: 'localhost',
    port: 80,
    https: false,
    hotOnly: false,
    // proxy: {
    //   // 配置跨域
    //   '/api': {
    //     target: 'https://ele-interface.herokuapp.com/api/',
    //     ws: true,
    //     changOrigin: true,
    //     pathRewrite: {
    //       '^/api': ''
    //     }
    //   }
    // },
    before: app => {}
  },
  pluginOptions: {
    'style-resources-loader': {
      preProcessor: 'sass',
      patterns: [
        path.resolve(__dirname, './src/assets/styles/*.scss')      //你的.scss文件所在目录
      ]
    }
  }
}