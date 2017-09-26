import * as path from 'path'
import * as autoprefixer from 'autoprefixer'
import * as WebpackMerger from 'webpack-merge'
import * as ExtractTextPlugin from 'extract-text-webpack-plugin'
import * as HtmlWebpackPlugin from 'html-webpack-plugin'

export let ResolveModules = [
  path.join(__dirname, './.build'),
  path.join(__dirname, './node_modules'),
  path.join(__dirname, './src')
]

export let Plugins = [
  /**
   * Extract style file
   * Inline styles can be externally optimized for loading
   */
  new ExtractTextPlugin({
    filename: 'styles/[name].[contenthash].css',
    allChunks: true
  }),
  /**
   * Entry template
   */
  new HtmlWebpackPlugin({
    filename: 'index.html'
  })
]

export let Entries = {
  index: path.join(__dirname, './src/index.js')
}

export let Rules = [
  {
    test: /\.(sass|scss)$/,
    use: ExtractTextPlugin.extract({
      fallback: 'style-loader',
      use: [
        {
          loader: 'css-loader',
          options: {
            minimize: true
          }
        },
        {
          loader: 'sass-loader'
        },
        {
          loader: 'postcss-loader',
          options: {
            plugins: [
              autoprefixer({
                browsers: [
                  'last 10 version',
                  'ie >= 9'
                ]
              })
            ]
          }
        }
      ]
    })
  }
]

export default WebpackMerger({
  devtool: 'inline-source-map',
  entry: Entries,
  output: {
    path: path.join(__dirname, './dist'),
    filename: '[name].js'
  },
  module: {
    rules: Rules
  },
  resolve: {
    modules: ResolveModules
  },
  resolveLoader: {
    modules: ResolveModules
  },
  devServer: {
    hot: true
  },
  plugins: Plugins
})
