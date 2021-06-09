import YAML from 'yaml';
import { readFile, writeFile } from 'fs/promises';
import { resolve } from 'path';
import genJs from './generators/errors-js.mjs';

const yamlFile = resolve(process.argv[2], 'errors.yml');
const yaml = readFile(yamlFile, 'utf8').then(YAML.parse);

// destinations
const jsFile = resolve(process.cwd(), 'errors.js');

export default async () => {
    const structure = await yaml;
    const js = genJs(structure);

    await Promise.all([
        writeFile(jsFile, js),
    ]);
}
