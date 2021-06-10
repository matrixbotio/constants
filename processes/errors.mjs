import YAML from 'yaml';
import { promises } from 'fs';
import { resolve } from 'path';
import js from '../generators/errors-js.mjs';
import go from '../generators/errors-go.mjs';

const { readFile, writeFile } = promises;

const yamlFile = resolve(process.env.INPUT_CONFIG_PATH, 'errors.yml');
const yaml = readFile(yamlFile, 'utf8').then(YAML.parse);

// destinations
const jsFile = resolve(process.env.INPUT_DEST_PATH, 'errors.js');
const goFile = resolve(process.env.INPUT_DEST_PATH, 'errors.go');

export default async () => {
    const structure = await yaml;
    await Promise.all([
        writeFile(jsFile, js(structure)),
        writeFile(goFile, go(structure))
    ]);
}
