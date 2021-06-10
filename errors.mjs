import YAML from 'yaml';
import { readFile, writeFile } from 'fs/promises';
import { resolve } from 'path';
import js from './generators/errors-js.mjs';
import go from './generators/errors-go.mjs';

const yamlFile = resolve(process.argv[2], 'errors.yml');
const yaml = readFile(yamlFile, 'utf8').then(YAML.parse);

// destinations
const jsFile = resolve(process.cwd(), 'errors.js');
const goFile = resolve(process.cwd(), 'errors.go');

export default async () => {
    const structure = await yaml;
    await Promise.all([
        writeFile(jsFile, js(structure)),
        writeFile(goFile, go(structure))
    ]);
}
