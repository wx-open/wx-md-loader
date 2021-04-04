import prettier from 'prettier';
import { EntryItem, getEntryList, getRouteEntry } from './toc';
import path from 'path';
import fs from 'fs';

export function format(source: string, parser = 'babel') {
  return prettier.format(source, {
    parser,
    singleQuote: true,
    tabWidth: 2,
    trailingComma: 'es5',
    printWidth: 120,
  });
}

export interface LoaderOptions {
  configFile?: boolean;
  type?: 'default' | 'code' | 'page' | 'source';
  groups?: EntryItem[];
  cwd?: string;
  inject?: object;
  template?: string;
}

export function normalizeOptions(o: any): Required<LoaderOptions> {
  return {
    type: 'default',
    cwd: process.cwd(),
    configFile: true,
    groups: [],
    inject: {},
    ...o,
  };
}

export function getLoaderRouteEntry(options: Required<LoaderOptions>) {
  const { configFile, cwd, groups, inject, template } = options;
  return configFile ? getRouteEntry() : getEntryList({ cwd, groups, inject, template });
}

export function getTemplatePath(template: LoaderOptions['template']) {
  let rs = template;
  if (!template) {
    if (!fs.existsSync(path.resolve(__dirname, '../../../wx-api-docs'))) {
      throw new Error('module wx-api-docs is not found, please run npm install wx-api-docs --save-dev');
    }
    const wxApiDocsPath = require.resolve('wx-api-docs');
    rs = path.resolve(path.dirname(wxApiDocsPath), 'src');
  }
  return rs!;
}
