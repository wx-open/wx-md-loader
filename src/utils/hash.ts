import md5 from 'md5';

export function getMd5(str: string) {
  return md5(str);
}
