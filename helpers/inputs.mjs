import { env } from 'process';

function getInputs(){
    const inputs = {};
    for(const i in env) if(i.startsWith('INPUT_')){
        inputs[i.slice(6).toLowerCase()] = env[i];
    }
    return inputs;
}

export default getInputs();
