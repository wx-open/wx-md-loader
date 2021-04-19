import { loader } from 'webpack';
import Markdown from 'markdown-it';
import { getMetaList, getRouteEntryDepDir, parseMeta } from './utils/toc';
import { format, getLoaderRouteEntry, getTemplatePath, normalizeOptions } from './utils/helpers';
import transformReact from './utils/transform';
import validate from 'schema-utils';
import { Schema } from 'schema-utils/declarations/validate';
import loaderUtils from 'loader-utils';
import optionSchema from './schema.json';
import path from 'path';

const localMdLoader: loader.Loader = function (source) {
  const loaderContext = this;
  const options = normalizeOptions(loaderUtils.getOptions(loaderContext));
  validate(optionSchema as Schema, options, {});
  const callback = this.async();
  const md = new Markdown();
  const stringSource = source.toString();
  const obj = md.parse(stringSource, {});
  const codeList = obj.filter((i) => i.type === 'fence');
  if (!callback) {
    return;
  }
  const dataType = options.type;
  if (dataType === 'code') {
    if (!codeList.length) {
      callback(null, 'export default ()=>{}');
      return;
    }
    let { content: res, info } = codeList[0];
    if (!['js', 'jsx', 'ts', 'tsx'].includes(info)) {
      callback(null, 'export default ()=>{}');
      return;
    }
    const suffix = info;
    this.resourcePath = this.resourcePath + `.${suffix}`;
    if (/x$/.test(suffix)) {
      res = transformReact(res);
    }
    callback(null, format(res, suffix === 'ts' ? 'typescript' : 'babel'));
    return;
  }
  if (dataType === 'page') {
    const metaList = getMetaList(obj);
    let meta: Record<string, any> = {};
    let desc = '';
    if (metaList.length) {
      meta = parseMeta(metaList[0].content);
      if (metaList.length > 1) {
        desc = metaList[1].content;
      }
    }
    if (meta.toc) {
    }
    let suffix = '';
    let content = '';
    if (codeList.length) {
      content = codeList[0].content;
      suffix = codeList[0].info;
    }
    const shouldFormat = ['js', 'jsx', 'ts', 'tsx'].includes(suffix);
    const res = `export default {
          content:\`${
            !shouldFormat
              ? content
              : encodeURIComponent(format(content, suffix === 'ts' || suffix === 'tsx' ? 'typescript' : 'babel'))
          }\`,
          type:'${codeList[0] ? codeList[0].info : ''}',
          meta:${JSON.stringify(meta)},
          desc:'${desc}',
          source: ${JSON.stringify(encodeURIComponent(source.toString()))},
       }`;
    // console.log(res);
    callback(null, format(res, 'babel'));
    return;
  }
  if (dataType === 'source') {
    getLoaderRouteEntry(options)
      .then(({ cwd, data: entryList, inject, template }) => {
        const data = entryList.map((i) => {
          i.fileList.forEach((f) => {
            loaderContext.addDependency(f);
          });
          delete i.fileList;
          return i;
        });
        const dirs = getRouteEntryDepDir();
        dirs.forEach((i) => {
          loaderContext.addContextDependency(i);
        });
        const dir = template;
        const src = cwd || path.resolve(process.cwd(), 'src');
        const rel = path.relative(dir, src).replace(/\\/g, '/');
        const res = `
         export async function loadMd(name: string) {
            return import(\`${rel}/\${name}.md\`);
         }
        export function loadAssets(assetPath: string) {
          const context = require.context(\`${rel}\`, true, /\\.(jpe?g|png|bmp|gif|v\.svg|webp)$/); 
          let imgPath = assetPath;
          if(!/^\.\\//.test(assetPath)){
            imgPath = './'+assetPath;
          }
          return context(imgPath).default;
       }
        export default {
          inject:${JSON.stringify(inject)},
          meta:${JSON.stringify(data)},
       }`;
        callback(null, format(res, 'babel'));
      })
      .catch((e) => {
        callback(e, JSON.stringify(e));
      });
    return;
  }
  const babelrc = path.resolve(__dirname, './config/babel.wx.js');
  const p1 = loaderUtils.stringifyRequest(this, '!wx-md-loader?type=page!' + this.resourcePath);
  const p = loaderUtils.stringifyRequest(
    this,
    `!babel-loader?configFile=${babelrc}!wx-md-loader?type=code!${this.resourcePath}`
  );
  const content = `import code from ${p};
      import html from ${p1};
      export {code, html};`;
  callback(null, content);
};

// export function pitch(remainingRequest: string, precedingRequest: string, data: any) {
//   // console.log('Loader Pitch', data);
// }
export default localMdLoader;
