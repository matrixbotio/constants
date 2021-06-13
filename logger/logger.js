const nl = '\n';

function z(num, zeroCount){
	return ('' + num).padStart(zeroCount, '0');
}

function formatDatetime(datetime){
	return "YYYY-MM-DD HH:mm:ss.sss"
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

function padLines(text, length){
	const prefix = ''.padStart(length, ' ');
	return text.split(nl).map(line => (prefix + line)).join(nl);
}

function applyFormat(format, datetime, message, stackPadLen){
	message = getMessageAndStack(message);
	message = message.stack ? message.message + nl + padLines(message.stack, stackPadLen) : message.message;
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

	verbose(message){
		const now = new Date;
		process.stdout.write(applyFormat("\u001b[37;1m[%datetime%] \u001b[36;1mInfo:\u001b[0m %message%", now, message, 32) + nl);
		const { message: msg, stack } = getMessageAndStack(message);
		const sendObj = {
			source: this.#source,
			host: this.#host,
			level: 1,
			timestamp: this.#ts(now),
			message: msg,
		};
		if(stack) sendObj.stack = stack;
		this.#dev.send(JSON.stringify(sendObj));
	}

	log(message){
		const now = new Date;
		process.stdout.write(applyFormat("\u001b[37;1m[%datetime%] \u001b[32;1mInfo:\u001b[0m %message%", now, message, 32) + nl);
		const { message: msg, stack } = getMessageAndStack(message);
		const sendObj = {
			source: this.#source,
			host: this.#host,
			level: 2,
			timestamp: this.#ts(now),
			message: msg,
		};
		if(stack) sendObj.stack = stack;
		this.#dev.send(JSON.stringify(sendObj));
	}

	warn(message){
		const now = new Date;
		process.stderr.write(applyFormat("\u001b[37;1m[%datetime%] \u001b[33;1mWarning:\u001b[0m %message%", now, message, 35) + nl);
		const { message: msg, stack } = getMessageAndStack(message);
		const sendObj = {
			source: this.#source,
			host: this.#host,
			level: 3,
			timestamp: this.#ts(now),
			message: msg,
		};
		if(stack) sendObj.stack = stack;
		this.#dev.send(JSON.stringify(sendObj));
	}

	error(message){
		const now = new Date;
		process.stderr.write(applyFormat("\u001b[37;1m[%datetime%] \u001b[31;1mERROR:\u001b[0m %message%", now, message, 33) + nl);
		const { message: msg, stack } = getMessageAndStack(message);
		const sendObj = {
			source: this.#source,
			host: this.#host,
			level: 4,
			timestamp: this.#ts(now),
			message: msg,
		};
		if(stack) sendObj.stack = stack;
		this.#dev.send(JSON.stringify(sendObj));
	}

	critical(message){
		const now = new Date;
		process.stderr.write(applyFormat("\u001b[37;1m[%datetime%] \u001b[35;1mCRITICAL:\u001b[0m %message%", now, message, 36) + nl);
		const { message: msg, stack } = getMessageAndStack(message);
		const sendObj = {
			source: this.#source,
			host: this.#host,
			level: 5,
			timestamp: this.#ts(now),
			message: msg,
		};
		if(stack) sendObj.stack = stack;
		this.#dev.send(JSON.stringify(sendObj));
	}
}
