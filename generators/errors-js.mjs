const head = `
/**
 * @template {number} C
 * @template {string} N
 * @template {string} M
 * @arg {C} code
 * @arg {N} name
 * @arg {M} message
 */
function _(code, name, message){
    return Object.assign(new Error, { code, message, name })
}

export const
`.slice(1);

export default struct => {
    let res = head;
    for(const section in struct){
        for(const name in struct[section]){
            const current = struct[section][name];
            res += `    ${section}_${name} = _(${current[0]}, ${JSON.stringify(`${section}_${name}`)}, ${JSON.stringify(current[1])}),\n`;
        }
        res += '\n';
    }
    return res.slice(0, -3) + ';\n';
} 
