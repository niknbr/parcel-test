const fse = require('fs-extra');
const fs = require('fs');
const { readdir } = require('fs/promises');
const { Parcel } = require('@parcel/core');

const getDirectories = async source =>
  (await readdir(source, { withFileTypes: true }))
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)

const srcDir = `node_modules/@antv`;
const destDir = `src`;

async function makeBuild() {
  const dirs = await getDirectories(srcDir);
  dirs.forEach(async dir => {
    const srcDep = srcDir + '/' + dir;
    const destDep = destDir + '/' + dir;
    if (fs.existsSync(destDep)) {
      fs.rmSync(destDep, { recursive: true, force: true })
    }
    fse.copySync(srcDep, destDep, { overwrite: true|false })

    let bundler = new Parcel({
      entries: './src/graphin-components/lib/index.js',
      defaultConfig: '@parcel/config-default',
      targets: {
        graph: {
          distDir: 'dist'
        }
      }
    });

    try {
      let {bundleGraph, buildTime} = await bundler.run();
      let bundles = bundleGraph.getBundles();
      console.log(`✨ Built ${bundles.length} bundles in ${buildTime}ms!`);
    } catch (err) {
      console.log(err.diagnostics);
    }

  });
}

makeBuild();