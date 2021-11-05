import general from './processes/general.mjs';
import errors from './processes/errors.mjs';
import logLevels from './processes/log-levels.mjs';

async function timer(func, name){
	const start = Date.now();
	await func();
	console.log(`Process ${name} done in ${Date.now() - start}ms`);
}

void async function(){
	const start = Date.now();
	await Promise.all([
		timer(general, 'general'),
		timer(errors, 'errors'),
		timer(logLevels, 'log-levels'),
	]);
	console.log(`Generation completed in ${Date.now() - start}ms`);
}()
