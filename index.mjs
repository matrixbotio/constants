import errors from './errors.mjs';

async function main(){
    await Promise.all([
        errors(),
    ]);
}

main();
