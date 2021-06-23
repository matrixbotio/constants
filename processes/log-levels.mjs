import YAML from 'yaml';
import { promises } from 'fs';
import { resolve } from 'path';
import js from '../generators/log-levels-js.mjs';
import json from '../generators/log-levels-json.mjs';
import go from '../generators/log-levels-go.mjs';

const { readFile, writeFile, mkdir } = promises;

const configPath = process.env['INPUT_CONFIG-PATH'],
	destPath = process.env['INPUT_DEST-PATH'],
	ghWorkspace = process.env.GITHUB_WORKSPACE;

const yamlFile = resolve(ghWorkspace, configPath, 'log-levels.yml');
const yaml = readFile(yamlFile, 'utf8').then(YAML.parse);

// destinations
const dest = resolve(ghWorkspace, destPath, 'logger');
export default async () => {
	try{ await mkdir(dest) } catch(e){}
	const structure = await yaml;
	const targetFiles = Object.assign(...await Promise.all([
		{},
		js(structure),
		json(structure),
		go(structure),
	]));
	await Promise.all(Object.keys(targetFiles).map(file => writeFile(resolve(dest, file), targetFiles[file])));
}
