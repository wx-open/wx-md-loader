import * as Token from 'markdown-it/lib/token';
import glob from 'glob';
import path from 'path';
import omit from 'omit.js';
import { toTree } from './tree';
import fs from 'fs';
import Markdown from 'markdown-it';
import { getTemplatePath } from './helpers';
import { getMd5 } from './hash';

const md = new Markdown();

export interface EntryItem {
  title: string;
  route: string;
  order?: number;
  basePath: string;
}

export interface EntryConfig {
  cwd?: string;
  template?: string;
  groups: EntryItem[];
  inject?: object;
}

interface MetaData {
  nodes: any[];
  mapping: Record<string, any>;
  fileList: string[];
}

export function getTreeData(entryKey: string, pattern: string, basePath: string, ctxPath: string) {
  return new Promise<MetaData>((resolve, reject) => {
    glob(
      pattern + '.md',
      {
        ignore: [
          './**/.git/**',
          './**/.svn/**',
          './**/node_modules/**',
          './**/.vscode/**',
          './**/.idea/**',
          './**/.bower_components/**',
        ],
        cwd: basePath,
      },
      (err, data) => {
        if (err) {
          reject(err);
          return;
        }
        const mapping: Record<string, Record<string, string>> = {};
        const fileList = data.map((i) => path.resolve(basePath, i));
        const metaList = data.map((filename) => {
          const filePath = path.resolve(basePath, filename);
          const markdown = fs.readFileSync(filePath, 'utf-8');
          const tokens = md.parse(markdown, {});
          const metaList = getMetaList(tokens);
          const routeKey = filename.replace('.md', '').replace(/\./g, '-').replace(/\//g, '-');
          const name = filename.replace(/\.md$/, '');
          const route = `${entryKey}/${routeKey}`;
          const contextPath = (ctxPath + '/' + name).replace(/^\//, '');
          mapping[routeKey] = {
            name,
            filename,
            route,
            contextPath,
          };
          const contents = getTocTreeFromTokens(tokens);
          let meta: Record<string, any> = {
            filename,
            routeKey,
            name,
            route,
            contextPath,
            contents,
            tocNodes: getTocList(contents),
          };

          let desc = '';
          if (metaList.length) {
            meta = {
              ...meta,
              ...parseMeta(metaList[0].content),
            };
          }
          if (metaList.length > 1) {
            desc = metaList[1].content;
            meta.desc = desc;
          }
          return meta;
        });
        // .filter(i => i.toc)
        const treeData = sortByOrder(metaList).map((i) => {
          return {
            id: i.title,
            pid: i.cate || -1,
            children: i.chidren,
            data: {
              ...omit(i, ['children']),
            },
          };
        });
        const tree = toTree(
          treeData,
          'pid',
          'id',
          (node) => {
            return node;
          },
          -1
        );
        resolve({
          fileList,
          nodes: tree,
          mapping,
        });
      }
    );
  });
}

export function getMetaList(obj: Token[]) {
  let start = false;
  const inlines: Token[] = [];
  obj.forEach((i) => {
    if (inlines.length > 1) {
      return;
    }
    if (i.type === 'hr') {
      start = true;
    }
    if (i.type === 'inline' && start) {
      inlines.push(i);
    }
  });
  return inlines;
}

export function parseMeta(content: string) {
  return content.split(/[\n\r]+/).reduce<Record<string, string>>((acc, c) => {
    const res = c.match(/\s*([^\s]+)\s*:\s*(.+)\s*/);
    if (!res) {
      return acc;
    }
    const [, k, v] = res;
    acc[k] = v;
    return acc;
  }, {});
}

function getEntryData(title: string, route: string, basePath: string, contextPath: string) {
  return getTreeData(route, '**/**', basePath, contextPath).then((res) => {
    const { fileList, ...restData } = res;
    return {
      title,
      route,
      data: restData,
      fileList,
    };
  });
}

function getWxConfig(cwd = process.cwd()): EntryConfig {
  const file = path.resolve(cwd, 'wx.config.js');
  if (fs.existsSync(file)) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const config = require(file);
      return {
        ...config,
      };
    } catch (e) {
      console.error(e);
    }
  }
  return {
    inject: {},
    groups: [],
  };
}

export function sortByOrder<T extends { order?: string | number }>(arr: T[]) {
  return arr.sort((a, b) => {
    const oa = Number(a.order);
    const ob = Number(b.order);
    if (!isNaN(oa) && !isNaN(ob)) {
      return oa - ob;
    }
    if (isNaN(oa)) {
      return 1;
    }
    if (isNaN(ob)) {
      return -1;
    }
    return 0;
  });
}

function getContextPathOfMd(cwd: string, basePath: string) {
  const src = path.resolve(cwd, basePath);
  return path.relative(cwd, src).replace(/\\/g, '/');
}

export function getEntryList(options: EntryConfig) {
  const { groups, cwd, inject, template } = options;
  const rCwd = cwd || process.cwd();
  return Promise.all(
    sortByOrder(groups).map((i) =>
      getEntryData(i.title, i.route, path.resolve(rCwd, i.basePath), getContextPathOfMd(rCwd, i.basePath))
    )
  ).then((data) => ({
    cwd: rCwd,
    data,
    template: getTemplatePath(template),
    inject,
  }));
}

export function getRouteEntry(cwd = process.cwd()) {
  return getEntryList(getWxConfig(cwd));
}

export function getRouteEntryDepDir(cwd = process.cwd()) {
  const { groups, cwd: _cwd } = getWxConfig(cwd);
  return groups.map((i) => {
    return path.resolve(_cwd || process.cwd(), i.basePath);
  });
}

export function getTocByTokens(tokens: Token[]) {
  const results: [string, number][] = [];
  let open = false;
  let tag = '';
  tokens.forEach((i) => {
    if (i.type === 'heading_open') {
      open = true;
      tag = i.tag;
      return;
    }
    if (open) {
      results.push([i.content, parseInt(tag.slice(1), 10)]);
      open = false;
      tag = '';
    }
  });
  return results;
}

export function getToc(content: string) {
  const tokens = new Markdown().parse(content, {});
  return getTocByTokens(tokens);
}

export interface TocItem {
  id: string;
  title: string;
  data: any;
  children: TocItem[];
}

export function getTocTree(res: [string, number][]) {
  function loop(res: [string, number][], path: string[] = [], max?: number, callback?: Function) {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const cb = callback || (() => {});
    const result: TocItem[] = [];
    for (let i = 0; i < res.length; i++) {
      const [title, level] = res[i];
      if (typeof max !== 'undefined' && level <= max) {
        break;
      }
      cb();
      const p = path.concat(title);
      const hash = getMd5(p.join('$'));
      result.push({
        id: hash,
        title,
        data: {
          path: p,
          hash,
          level,
        },
        children: loop(res.slice(i + 1), p, level, () => {
          i++;
          cb();
        }),
      });
    }
    return result;
  }

  return loop(res);
}

export function getTocTreeFromString(content: string) {
  return getTocTree(getToc(content));
}

export function getTocTreeFromTokens(tokens: Token[]) {
  return getTocTree(getTocByTokens(tokens));
}

export function getTocList(toc: TocItem[], r: TocItem[] = []) {
  toc.forEach((i) => {
    r.push(i);
    if (i.children.length) {
      getTocList(i.children, r);
    }
  });
  return r;
}
