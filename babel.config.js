module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ["inline-import", { "extensions": [".sql", ".geo", ".geojson"] }]
    ],
    env: {
      production: {
        plugins: ['transform-remove-console']
      }
    },
  };
};
