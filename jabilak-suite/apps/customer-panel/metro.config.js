const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const config = getDefaultConfig(__dirname);

// pnpm/Metro can create and remove transient *_tmp_* folders while the
// fallback watcher is scanning node_modules. Exclude only those transient
// paths so a disappearing temp folder cannot crash Metro with ENOENT.
config.resolver.blockList = /.*_tmp_.*/;

module.exports = withNativeWind(config, {
  input: "./global.css",
  // Force write CSS to file system instead of virtual modules
  // This fixes iOS styling issues in development mode
  forceWriteFileSystem: true,
});
