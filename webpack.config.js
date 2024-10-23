// webpack.config.js
const path = require('path');

module.exports = {
  entry: './src/index.tsx', // 진입점을 index.tsx로 설정
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'] // 확장자 목록에 .tsx와 .ts 추가
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/, // .ts와 .tsx 파일을 ts-loader로 처리
        exclude: /node_modules/,
        use: 'ts-loader'
      },
      {
        test: /\.(js|jsx)$/, // .js와 .jsx 파일을 babel-loader로 처리
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      }
    ]
  },
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 9000
  }
};
