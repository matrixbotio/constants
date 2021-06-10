import errors from './processes/errors.mjs';

async function main(){
    await Promise.all([
        errors(),
    ]);
}

main();
