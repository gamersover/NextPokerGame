const webpack = require("webpack")

/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config) => {
        config.plugins.push(
            new webpack.IgnorePlugin({
                resourceRegExp: /^(bufferutil|utf-8-validate)$/,
            })
        )

        return config
    },
}

module.exports = nextConfig
