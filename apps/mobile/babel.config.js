module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ["inline-import", { "extensions": [".sql", ".geo", ".geojson"] }],
      '@babel/plugin-transform-async-generator-functions'
    ],
    env: {
      production: {
        plugins: ['transform-remove-console']
      }
    },
  };
};
