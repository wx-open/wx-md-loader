export interface ITreeNode<T = any, K = number | string> {
  id: K;
  pid: K;
  children?: ITreeNode<T, K>[];
  data?: T;

  [index: string]: any;
}

/**
 * 转换成 tree
 * @param data
 * @param pidKey
 * @param pk
 * @param cb
 * @param tv
 * @returns {*}
 */
// eslint-disable-next-line max-params
export function toTree<T = any, K = string | number>(
  data: ITreeNode<T, K>[],
  pidKey = 'pid',
  pk = 'id',
  cb: (node: ITreeNode<T, K>) => void,
  tv: K
) {
  const treeList: ITreeNode<T, K>[] = [];
  const group: Record<string, ITreeNode<T, K>[]> = {};
  let topValue = tv;
  if (typeof topValue === 'undefined') {
    topValue = (-1 as unknown) as K;
  }
  data.forEach((item) => {
    item.children = [];
    const pid = item[pidKey];
    if (pid === topValue) {
      treeList.push(item);
    } else {
      if (!group[pid]) {
        group[pid] = [];
      }
      group[pid].push(item);
    }
  });
  const loop = function (treeList: ITreeNode<T, K>[], group: Record<string, ITreeNode<T, K>[]>) {
    treeList.forEach((node) => {
      const id = node[pk];
      if (cb) {
        cb(node);
      }
      node.children = group[id] || [];
      loop(node.children, group);
    });
    return treeList;
  };
  return loop(treeList, group);
}
