const head = `
const nl = '\\n';

function z(num, zeroCount){
	return ('' + num).padStart(zeroCount, '0');
}

function formatDatetime(datetime){
	return %datetime_format%
		.replace('SSS', z(datetime.getMilliseconds(), 3))
		.replace('ss', z(datetime.getSeconds(), 2))
		.replace('mm', z(datetime.getMinutes(), 2))
		.replace('HH', z(datetime.getHours(), 2))
		.replace('DD', z(datetime.getDate(), 2))
		.replace('MM', z(datetime.getMonth() + 1, 2))
		.replace('YYYY', datetime.getFullYear());
}

function getBaseLogData(data){
	if(data instanceof Error){
		const res = {
			message: data.name + ': ' + data.message,
		};
		if('code' in data) res.code = data.code;
		if('stack' in data){
			let stack = data.stack.split(nl);
			const maybeMessage = stack.shift();
			stack = padLines(stack);
			if(maybeMessage !== res.message) stack.unshift(maybeMessage);
			res.stack = stack.join(nl);
		}
		return res;
	} else return {
		message: '' + data,
	};
}

function padLines(text){
	return text.map(line => ('    ' + line.trimLeft()));
}

function applyFormat(format, datetime, message){
	return format.replace('%datetime%', formatDatetime(datetime)).replace('%message%', message);
}

export default class Logger{
	#dev
	#host
	#source

	constructor(dev, host, source){
		this.#dev = dev;
		this.#host = host;
		this.#source = source;
	}

	#ts(date){
		return Math.floor(date / 1000);
	}

	#log(message, writer, format){
		const now = new Date;
		writer.write(applyFormat(format, now, message) + nl);
		const sendObj = Object.assign({
			source: this.#source,
			host: this.#host,
			level: 1,
			timestamp: this.#ts(now),
		}, getBaseLogData(message));
		if(stack) sendObj.stack = stack;
		this.#dev.send(JSON.stringify(sendObj));
	}
`.slice(1);

const tsHead = `
interface OutputDevice{
	send(data: string): void
}

export default class Logger{
	constructor(dev: OutputDevice, host: string, source: string)
`.slice(1);

export default struct => {
	const dtFormat = struct['datetime_format'];
	let js = head.replace('%datetime_format%', JSON.stringify(dtFormat)),
		ts = tsHead;
	const levels = struct['levels'];
	for(let code in levels){
		if(!Number.isNaN(+code)){
			const { name, description, stdout_format, stderr_format } = levels[code];
			const format = stdout_format ? stdout_format : stderr_format;
			js += `
	${name}(message){
		this.#log(message, process.${stdout_format ? 'stdout' : 'stderr'}, ${JSON.stringify(format)});
	}
`;
			ts += `
	/**
	 * ${description}
	 */
	${name}(data: Error | string): void
`
		}
	}
	js += '}\n';
	ts += '}\n';
	return {
		'logger.js': js,
		'index.d.ts': ts,
		'index.mjs': 'export { default as default } from "https://raw.githubusercontent.com/matrixbotio/constants/master/logger/logger.js";\n',
	}
}
