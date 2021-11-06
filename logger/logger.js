const nl = '\n';

function z(num, zeroCount){
	return ('' + num).padStart(zeroCount, '0');
}

function formatDatetime(datetime){
	return "YYYY-MM-DD HH:mm:ss.SSS"
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

	verbose(message){
		this.#log(message, "stdout", "\u001b[37;1m[%datetime%] \u001b[36;1mInfo:\u001b[0m %message%", 1);
	}

	log(message){
		this.#log(message, "stdout", "\u001b[37;1m[%datetime%] \u001b[32;1mInfo:\u001b[0m %message%", 2);
	}

	warn(message){
		this.#log(message, "stderr", "\u001b[37;1m[%datetime%] \u001b[33;1mWarning:\u001b[0m %message%", 3);
	}

	error(message){
		this.#log(message, "stderr", "\u001b[37;1m[%datetime%] \u001b[31;1mERROR:\u001b[0m %message%", 4);
	}

	critical(message){
		this.#log(message, "stderr", "\u001b[37;1m[%datetime%] \u001b[35;1mCRITICAL:\u001b[0m %message%", 5);
	}
}
