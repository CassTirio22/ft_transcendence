import { existsSync } from 'fs';
import { resolve } from 'path';

/**
 * Find the absolute path to the environment file.
 * @param {string} dest Should be the absolute path to the folder leading to the env file.
 * @returns {string} The absolute path to the environment file.
**/
export function getEnvPath(dest: string): string {
  const env: string | undefined = process.env.NODE_ENV;
  const fallback: string = resolve(`${dest}/.env`);
  const filename: string = env ? `${env}.env` : 'development.env';
  let filePath: string = resolve(`${dest}/${filename}`);

  if (!existsSync(filePath)) {
    filePath = fallback;
  }

  return filePath;
}