const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');

// Compile the isolated BLE layer in memory; no emitted files or extra test runtime.
function loadTypeScript(filename, mocks = {}) {
  filename = path.resolve(filename);
  const source = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, esModuleInterop: true },
    fileName: filename,
  }).outputText;
  const instance = new Module(filename, module);
  instance.filename = filename;
  instance.paths = Module._nodeModulePaths(path.dirname(filename));
  const originalRequire = instance.require.bind(instance);
  instance.require = specifier => {
    if (Object.prototype.hasOwnProperty.call(mocks, specifier)) return mocks[specifier];
    if (specifier.startsWith('.')) {
      const target = path.resolve(path.dirname(filename), specifier + '.ts');
      if (fs.existsSync(target)) return loadTypeScript(target, mocks);
    }
    return originalRequire(specifier);
  };
  instance._compile(source, filename);
  return instance.exports;
}
module.exports = { loadTypeScript };
