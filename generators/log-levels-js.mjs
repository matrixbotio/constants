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
	#consoleWriter
	#pendingWrites
	#finishedPendingWritesCallbacks
	#getCurrentISOTime

	constructor(dev, host, source, consoleWriter, getCurrentISOTime){
		this.#dev = dev;
		this.#host = host;
		this.#source = source;
		this.#consoleWriter = consoleWriter;
		this.#pendingWrites = 0;
		this.#finishedPendingWritesCallbacks = [];
		this.#getCurrentISOTime = getCurrentISOTime || () => new Date().toISOString();
	}

	async #log(message, writer, format, level){
		const now = this.#getCurrentISOTime();
		this.#pendingWrites++;
		(await this.#consoleWriter)[writer].write(applyFormat(format, new Date(now), message) + nl);
		const sendObj = Object.assign({
			source: this.#source,
			host: this.#host,
			level,
			time: now,
		}, getBaseLogData(message));
		try{ await this.#dev.send(JSON.stringify(sendObj)) } catch(e){}
		if(!--this.#pendingWrites){
			const callbacks = this.#finishedPendingWritesCallbacks;
			this.#finishedPendingWritesCallbacks = [];
			callbacks.forEach(cb => cb());
		}
	}

	finishedPendingWrites(){
		return new Promise(r => {
			if(!this.#pendingWrites) return r();
			this.#finishedPendingWritesCallbacks.push(r);
		});
	}
`.slice(1);

const tsHead = `
interface OutputDevice{
	send(data: string): void
}

interface ConsoleWriter{
	write(data: string): void
}

interface ConsoleDevice{
	stdout: ConsoleWriter
	stderr: ConsoleWriter
}

export default class Logger{
	constructor(
		dev: OutputDevice,
		host: string,
		source: string,
		consoleDevice: ConsoleDevice | Promise<ConsoleDevice>,
		getCurrentISOTime?: () => string,
	)

	finishedPendingWrites(): Promise<void>
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
		this.#log(message, ${JSON.stringify(stdout_format ? 'stdout' : 'stderr')}, ${JSON.stringify(format)}, ${code});
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
