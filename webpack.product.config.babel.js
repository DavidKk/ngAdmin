import webpack from 'webpack'
import WebpackMerger from 'webpack-merge'
import WebpackConf from './webpack.common.config.babel'

export default WebpackMerger(WebpackConf, {
  devtool: false,
  plugins: [
    new webpack.DefinePlugin({
      'process.env': { 
         NODE_ENV: JSON.stringify('production') 
       }
    }),
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: true,
      mangle: false,
      compress: {
        warnings: false
      },
      output: {
        comments: false
      }
    })
  ]
})
