import validate from 'schema-utils';
import {Schema} from 'schema-utils/declarations/validate';
import schema from '../schema.json';

const configuration = {
  name: 'local-md-loader',
  baseDataPath: 'options',
};


test('Schema Test', () => {
  validate(schema as Schema, {
    inject: {
      data: {
        title: 'wind',
      },
    },
    groups: [
      {
        title: '文档',
        route: '/docs',
        order: 1,
        basePath: './docs',
      },
      {
        order: 2,
        title: '组件',
        route: '/components',
        basePath: './components',
      },
    ],
  }, configuration);
  expect(true).toBeTruthy();
})


