module.exports = {
  presets: [
    '@babel/preset-env',
    ['@vue/app',
      {
        modules: "commonjs",
      }
    ]
  ],
  plugins: [
    ['import', { libraryName: '@h3/antd-vue', libraryDirectory: 'lib', style: true }, '@h3/antd-vue'],
    ['import', { libraryName: '@h3/report', libraryDirectory: 'lib', style: true }, '@h3/report'],
    ['import', { libraryName: 'vant', libraryDirectory: 'es', style: true}, 'vant']
  ]
};
