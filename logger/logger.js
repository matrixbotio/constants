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

	verbose(message){
		this.#log(message, process.stdout, "\u001b[37;1m[%datetime%] \u001b[36;1mInfo:\u001b[0m %message%");
	}

	log(message){
		this.#log(message, process.stdout, "\u001b[37;1m[%datetime%] \u001b[32;1mInfo:\u001b[0m %message%");
	}

	warn(message){
		this.#log(message, process.stderr, "\u001b[37;1m[%datetime%] \u001b[33;1mWarning:\u001b[0m %message%");
	}

	error(message){
		this.#log(message, process.stderr, "\u001b[37;1m[%datetime%] \u001b[31;1mERROR:\u001b[0m %message%");
	}

	critical(message){
		this.#log(message, process.stderr, "\u001b[37;1m[%datetime%] \u001b[35;1mCRITICAL:\u001b[0m %message%");
	}
}
