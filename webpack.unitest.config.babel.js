import path from 'path'
import webpack from 'webpack'
import WebpackMerger from 'webpack-merge'
import WebpackConf from './webpack.common.config.babel'

export default WebpackMerger(WebpackConf, {
  devtool: 'source-map',
  plugins: [
    new webpack.DefinePlugin({
      'process.env': { 
         NODE_ENV: JSON.stringify('production') 
       }
    })
  ],
  /**
   * Sinon setting
   *
   * UMD will make compiled occur some error
   * Error:
   * modules[moduleId].call is not a function
   * Issue: https://github.com/webpack/webpack/issues/304
   *
   * @todo 后面版本修复后删除
   */
  module: {
    noParse: [
      /node_modules\/sinon\//
    ]
  },
  resolve: {
    alias: {
      sinon: 'sinon/pkg/sinon.js'
    }
  }
})
