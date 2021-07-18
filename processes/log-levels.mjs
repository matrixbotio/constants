import YAML from 'yaml';
import { promises } from 'fs';
import { resolve } from 'path';
import js from '../generators/log-levels-js.mjs';
import json from '../generators/log-levels-json.mjs';
import go from '../generators/log-levels-go.mjs';
import java from '../generators/log-levels-java.mjs';

const { readFile, writeFile, mkdir } = promises;

const configPath = process.env['INPUT_CONFIG-PATH'],
	destPath = process.env['INPUT_DEST-PATH'],
	ghWorkspace = process.env.GITHUB_WORKSPACE;

const yamlFile = resolve(ghWorkspace, configPath, 'log-levels.yml');
const yaml = readFile(yamlFile, 'utf8').then(YAML.parse);

export default async () => {
	const structure = await yaml;
	const targetFiles = Object.assign(...await Promise.all([
		{},
		js(structure),
		json(structure),
		go(structure),
		java(structure),
	]));
	await Promise.all(Object.keys(targetFiles).map(async file => {
		const dest = resolve(ghWorkspace, destPath, 'logger', file);
		await mkdir(resolve(dest, '..'), {
			recursive: true,
		});
		return writeFile(dest, targetFiles[file]);
	}));
}
