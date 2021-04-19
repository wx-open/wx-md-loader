import glob from 'glob';

export interface ImageAssetsData {
  data: string[];
}
export default function getImageData(pattern: string, basePath: string) {
  return new Promise<ImageAssetsData>((resolve, reject) => {
    glob(
      pattern + '.@(jpg|png|jpeg|gif|bmp|webp)',
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
        resolve({
          data,
        });
      }
    );
  });
}
