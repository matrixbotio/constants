import YAML from 'yaml';
import { promises } from 'fs';
import { resolve } from 'path';
import js from '../generators/errors-js.mjs';
import json from '../generators/errors-json.mjs';
import inputs from '../helpers/inputs.mjs';

const { readFile, writeFile, mkdir } = promises;

const configPath = inputs['config-path'],
	destPath = inputs['dest-path'],
	ghWorkspace = process.env.GITHUB_WORKSPACE;

const yamlFile = resolve(ghWorkspace, configPath, 'errors.yml');
const yaml = readFile(yamlFile, 'utf8').then(YAML.parse);

// destinations
const dest = resolve(ghWorkspace, destPath, 'errors');
export default async () => {
	try{ await mkdir(dest) } catch(e){}
	const structure = await yaml;
	const targetFiles = Object.assign(...await Promise.all([
		{},
		js(structure),
		json(structure),
	]));
	await Promise.all(Object.keys(targetFiles).map(file => writeFile(resolve(dest, file), targetFiles[file])));
}
