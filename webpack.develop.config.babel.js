import fs from 'fs-extra'
import path from 'path'
import map from 'lodash/map'
import forEach from 'lodash/forEach'
import webpack from 'webpack'
import WebpackMerger from 'webpack-merge'
import WebpackConf, { resolveModules } from './webpack.common.config.babel'
import { port, proxy } from './config/nginx.json'

const UglifyJsPlugin = webpack.optimize.UglifyJsPlugin

WebpackConf.module.rules.splice(0, 1, {
  test: /\.jsx?$/,
  exclude: /node_modules/,
  include: resolveModules,
  use: [
    {
      loader: 'react-hot-loader/webpack'
    },
    {
      loader: 'babel-loader',
      options: {
        babelrc: false,
        presets: [
          ['es2015', { modules: false }],
          'react',
          'stage-0'
        ],
        plugins: [
          'transform-decorators-legacy',
          'transform-class-properties'
        ]
      }
    }
  ]
})

forEach(WebpackConf.entry, (config) => {
  config.splice(1, 0, 'react-hot-loader/patch')
})

export default WebpackMerger(WebpackConf, {
  devtool: 'source-map',
  devServer: {
    port,
    hot: true,
    inline: true,
    disableHostCheck: true,
    proxy: {
      '/v1/**': {
        target: 'http://test.zuimeizhongguowa.com',
        secure: false
      }
    }
  },
  plugins: [
    new DefinePlugin({
      'process.env': { 
         NODE_ENV: JSON.stringify('development') 
       }
    })
  ]
})
