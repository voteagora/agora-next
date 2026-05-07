const extensions = ['.svg', '.png', '.jpg', '.jpeg', '.gif', '.ico', '.webp'];
extensions.forEach(ext => {
  require.extensions[ext] = function(module, filename) {
    module.exports = 'mock-media';
  };
});
