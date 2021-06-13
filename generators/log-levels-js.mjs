const head = `
const nl = '\\n';

function z(num, zeroCount){
	return ('' + num).padStart(zeroCount, '0');
}

function formatDatetime(datetime){
	return %datetime_format%
		.replace('sss', z(datetime.getMilliseconds(), 3))
		.replace('ss', z(datetime.getSeconds(), 2))
		.replace('mm', z(datetime.getMinutes(), 2))
		.replace('HH', z(datetime.getHours(), 2))
		.replace('DD', z(datetime.getDate(), 2))
		.replace('MM', z(datetime.getMonth() + 1, 2))
		.replace('YYYY', datetime.getFullYear());
}

function getMessageAndStack(data){
	if(typeof data === 'string'){
		let [ message, ...stack ] = data.split(nl);
		return {
			message,
			stack: stack.join(nl),
		}
	}
	else if(data instanceof Error){
		return 'stack' in data ? getMessageAndStack(data.stack) : {
			message: data.message,
			stack: '',
		};
	}
	else return getMessageAndStack('' + data);
}

function padLines(text){
	return text.split(nl).map(line => ('    ' + line.trimLeft())).join(nl);
}

function applyFormat(format, datetime, message){
	message = getMessageAndStack(message);
	message = message.stack ? message.message + nl + padLines(message.stack) : message.message;
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
`.slice(1);

const tsHead = `
interface OutputDevice{
	send(data: string): void
}

export default class Logger{
	constructor(dev: OutputDevice, host: string, source: string)
`.slice(1);

export default struct => {
	const dtFormat = struct['&datetime_format'];
	let js = head.replace('%datetime_format%', JSON.stringify(dtFormat)),
		ts = tsHead;
	for(let code in struct){
		if(!Number.isNaN(+code)){
			const { name, description, mq_format, stdout_format, stderr_format } = struct[code];
			const format = stdout_format ? stdout_format : stderr_format;
			js += `
	${name}(message){
		const now = new Date;${
			format
			? `
		process.${stdout_format ? 'stdout' : 'stderr'}.write(applyFormat(${JSON.stringify(format)}, now, message) + nl);`
			: ''
		}${
			mq_format
			? `
		const { message: msg, stack } = getMessageAndStack(message);
		const sendObj = {
			source: this.#source,
			host: this.#host,
			level: ${code},
			timestamp: this.#ts(now),
			message: msg,
		};
		if(stack) sendObj.stack = stack;
		this.#dev.send(JSON.stringify(sendObj));`
			: ''
		}
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
