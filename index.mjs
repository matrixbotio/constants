import general from './processes/general.mjs';
import errors from './processes/errors.mjs';

async function timer(func){
    const start = Date.now();
    await func();
    console.log(`Process ${func.name} done in ${Date.now() - start}ms`);
}

async function main(){
    const start = Date.now();
    await Promise.all([
        timer(general),
        timer(errors),
    ]);
    console.log(`Generation completed in ${Date.now() - start}ms`);
}

main();
