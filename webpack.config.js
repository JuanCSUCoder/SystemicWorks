// Generated using webpack-cli http://github.com/webpack-cli
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const WebpackPwaManifest = require('webpack-pwa-manifest');
const { GenerateSW } = require('workbox-webpack-plugin');

module.exports = {
	mode: 'development',
	entry: './src/index.ts',
	output: {
		path: path.resolve(__dirname, 'build'),
	},
	devServer: {
		open: true,
		host: 'localhost',
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: 'pages/index.html',
		}),
		new HtmlWebpackPlugin({
			template: 'pages/report.html',
			filename: 'report/index.html'
		}),
		new CopyWebpackPlugin({
			patterns: [
				{ from: "pages/assets", to: "assets" },
			],
		}),
		new CopyWebpackPlugin({
			patterns: [
				{ from: "pages/favicon.png" }
			]
		}),
		new WebpackPwaManifest({
			publicPath: './',
			name: 'SystemicWorks App',
			short_name: 'SystemicWorks',
			description: 'An advanced and open source app for thinking in systems with causal loops diagrams',
			background_color: '#ffffff',
			theme_color: "#0000ff",
			ios: true,
			crossorigin: null, //can be null, use-credentials or anonymous
			icons: [
				{
					src: path.resolve('pages/icon_large.png'),
					sizes: [96, 128, 192, 256, 384, 512, 1024], // multiple sizes
					ios: true
				},
				{
					src: path.resolve('pages/icon_large.png'),
					sizes: 1024,
					ios: 'startup'
				},
				{
					src: path.resolve('pages/maskable_icon.png'),
					sizes: [96, 128, 192, 256, 384, 512, 1024], // multiple sizes
					purpose: 'maskable'
				},
			],
			file_handlers: [
				{
					"action": "./",
					"accept": {
						"text/plain": [".smwks"]
					}
				},
			],
		}),
		new GenerateSW({
			cleanupOutdatedCaches: true,
		}),
		// Add your plugins here
		// Learn more obout plugins from https://webpack.js.org/configuration/plugins/
	],
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: 'ts-loader',
				exclude: /node_modules/,
			},
			{
				test: /\.css$/i,
				use: ['style-loader', 'css-loader'],
			},
			{
				test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/,
				type: 'asset',
			},

			// Add your rules for custom modules here
			// Learn more about loaders from https://webpack.js.org/loaders/
		],
	},
	resolve: {
		extensions: ['.tsx', '.ts', '.js'],
	},
};
