const head = `
/**
 * @template {number} C
 * @template {string} N
 * @template {string} M
 * @arg {C} code
 * @arg {N} name
 * @arg {M} message
 */
function _(code, name, message){
    return Object.assign(new Error, { code, message, name })
}

export const
`.slice(1);

const tsHead = `
function _<C extends number, N extends string, M extends string>(code: C, name: N, message: M){
    return Object.assign(new Error, { code, message, name })
}

export const
`.slice(1);

const pkgjson = JSON.stringify({
    name: '@/constants/errors',
    version: '0.0.0',
    module: 'index.mjs',
    types: 'index.d.ts',
}, null, '    ') + '\n';

export default struct => {
    let res = '';
    for(const section in struct){
        for(const name in struct[section]){
            const current = struct[section][name];
            res += `    ${section}_${name} = _(${current[0]}, ${JSON.stringify(`${section}_${name}`)}, ${JSON.stringify(current[1])}),\n`;
        }
        res += '\n';
    }
    return {
        'index.mjs': 'export * from "https://raw.githubusercontent.com/matrixbotio/constants/master/errors/errors.js";\n',
        'errors.js': head + res.slice(0, -3) + ';\n',
        'errors.ts': tsHead + res.slice(0, -3) + ';\n',
        'index.d.ts': 'export * from "./errors";\n',
        'package.json': pkgjson,
    };
}
