import { promises } from 'fs';
import { resolve } from 'path';
import xml from 'xml2js';

const { readFile } = promises;

const pomPath = resolve(process.env.GITHUB_WORKSPACE, process.env['INPUT_DEST-PATH'], 'pom.xml');

function parse(str){
    return new Promise((resolve, reject) => {
        (new xml.Parser).parseString(str, (e, r) => {
            if(e) reject(e);
            else resolve(r);
        });
    });
}

function build(obj){
    return (new xml.Builder).buildObject(obj);
}

function incrementVersion(xml){
    const { version } = xml.project;
    let [ major, minor, patch ] = version[0].split('.');
    version[0] = `${major}.${minor}.${++patch}`;
}

export default async () => {
    const xml = await parse(await readFile(pomPath, 'utf8'));
    incrementVersion(xml);
    return {
        'pom.xml': build(xml),
    }
}
