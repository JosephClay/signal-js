import fs from 'fs';
import path from 'path';
import webpack from 'webpack';
import { format } from 'date-fns';
import TerserPlugin from 'terser-webpack-plugin';
import CompressionPlugin from 'compression-webpack-plugin';

const pkg = JSON.parse(fs.readFileSync('./package.json'));

export default {
	entry: './src/index.js',
	mode: 'production',
	devtool: 'source-map',
	output: {
		library: 'signal',
		libraryTarget: 'umd',
		path: path.resolve(process.cwd(), 'dist'),
		filename: 'signal-js.min.js',
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
			}
		]
	},
	plugins: [
		new webpack.EnvironmentPlugin({
			NODE_ENV: 'production',
		}),
		new webpack.BannerPlugin({
			entryOnly: true,
			banner() {
				const { homepage, author, version, license } = pkg;
				const date = format(new Date(), 'yyyy-dd-MM');
				const year = new Date().getFullYear();
				return (`
signal-js - v${version} - ${date}
${homepage}
Copyright (c) 2013-${year} ${author.name} License: ${license}
				`);
			},
		}),
		new CompressionPlugin({
			filename({ path, query }) {
				return `${path}.gz${query}`;
			},
		})
	]
};