import fs from 'fs';
import path from 'path';
import { getTocTreeFromString } from '../utils/toc';

const mdPath = path.resolve(__dirname, './assets/test.md');
const content = fs.readFileSync(mdPath, 'utf-8');



test('Toc 目录获取', () => {
  const result = getTocTreeFromString(content);
  expect(result.length).toBe(2);
  expect(result[0].children.length).toBe(1);
  expect(result[1].children.length).toBe(3);
  expect(result[1].children[2].children.length).toBe(2);
});
