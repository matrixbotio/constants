import general from './processes/general.mjs';
import errors from './processes/errors.mjs';
import logLevels from './processes/log-levels.mjs';
import formulaParser from './processes/formula-parser.mjs';
import notificationTypes from './processes/notification-types.mjs';

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
		timer(formulaParser, 'formula-parser'),
		timer(notificationTypes, 'formula-parser'),
	]);
	console.log(`Generation completed in ${Date.now() - start}ms`);
}()
