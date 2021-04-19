import { sortByOrder } from '../utils/toc';


test('菜单排序', () => {
  const res = sortByOrder([
    {
      order: -200,
    },
    {
      order: -100,
    },
    {
      order: -300,
    },
    {
      order: 100,
    },
    {
      order: 140,
    },
  ]).map(i => i.order).toString();
  expect(res).toBe('-300,-200,-100,100,140');
});
