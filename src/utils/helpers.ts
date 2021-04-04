import prettier from 'prettier';
import { EntryItem, getEntryList, getRouteEntry } from './toc';

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
  const { configFile, cwd, groups, inject } = options;
  return configFile ? getRouteEntry() : getEntryList({ cwd, groups, inject });
}
