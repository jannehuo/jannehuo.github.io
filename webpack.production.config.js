var webpack = require('webpack');
var uglify = new webpack.optimize.UglifyJsPlugin({
    compress: {
        warnings: false
    }
});
module.exports = {
    entry: ['./js/main.js'],
    output: {
        filename: "mission_bundle.js",
        path: __dirname + '/build'
    },
    devtool: "sourcemap",
    module: {
        loaders: [{
                test: /\.js$/,
                loader: 'babel-loader',
                query: {
                    presets: ['es2015']
                }
            },
            {
                test: /\.less$/,
                use: [{
                    loader: "style-loader"
                }, {
                    loader: "css-loader"
                }, {
                    loader: "less-loader"
                }]
            },
            {
                test: /\.ejs$/,
                loader: 'ejs-loader'
            },
            {
                test: /\.(png|jpg|gif|svg)$/,
                use: [
                  {
                    loader: 'url-loader'
                  }
                ]
            }
        ]
    },
    plugins: [
        uglify
    ]
}
