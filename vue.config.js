const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  publicPath: process.env.NODE_ENV === 'production' ? '/ui/' : '/',
  transpileDependencies: true,
  configureWebpack: {
    devtool: 'source-map',
    optimization: {
      minimize: false
    },
    resolve: {
    symlinks: false
    },
  },
})
