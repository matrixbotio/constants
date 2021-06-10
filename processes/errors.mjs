import YAML from 'yaml';
import { promises } from 'fs';
import { resolve } from 'path';
import js from '../generators/errors-js.mjs';
import go from '../generators/errors-go.mjs';

const { readFile, writeFile } = promises;

const configPath = process.env['INPUT_CONFIG-PATH'],
    destPath = process.env['INPUT_DEST-PATH'],
    ghWorkspace = process.env.GITHUB_WORKSPACE;

const yamlFile = resolve(ghWorkspace, configPath, 'errors.yml');
const yaml = readFile(yamlFile, 'utf8').then(YAML.parse);

// destinations
const jsFile = resolve(ghWorkspace, destPath, 'errors.js');
const goFile = resolve(ghWorkspace, destPath, 'errors.go');

export default async () => {
    const structure = await yaml;
    await Promise.all([
        writeFile(jsFile, js(structure)),
        writeFile(goFile, go(structure))
    ]);
}
