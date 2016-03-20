module.exports = {
    //页面入口文件配置
    entry: "./react/src/simple/simple.js",
    //入口文件输出配置
    output: {
        path: __dirname,
        filename: "./react/src/simple/bundle.js"
    },
    module: {
        //加载器配置
        loaders: [{
            test: /\.js?$/,
            exclude: /node_modules/,
            loader: 'babel',
            query:
            {
                presets:['react']
            }
        }]
    },
};