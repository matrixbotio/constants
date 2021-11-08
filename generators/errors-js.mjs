const head = `
/**
 * Pseudo typings, used to generate proper error types in doc. You should ignore it.
 * Real typings is located at errors.ts file and re-exported by index.d.ts
 * 
 * @template {number} C
 * @template {string} N
 * @template {string} M
 * @arg {C} code
 * @arg {N} name
 * @arg {M} message
 * @return {Error & { code: C, name: N, message: M }}
 */
function _(code, name, msg){
	return class extends Error{
		constructor(message = msg){
			super(message);
			Object.assign(this, { code, message, name });
		}
	}
}

export const
`.slice(1);

const tsHead = `
interface ServiceError<C extends number, N extends string, M extends string> {
    new(): Error & { code: C, message: M, name: N }
    new<Message extends string>(message: Message): Error & { code: C, message: Message, name: N }
}

function _<C extends number, N extends string, M extends string>(code: C, name: N, message: M): ServiceError<C, N, M> {
    let Class: ServiceError<C, N, M>;
	return Class
}

export const
`.slice(1);

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
	};
}
