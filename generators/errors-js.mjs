const head = "import _ from '@/components/json-rpc-error.js';\n\nexport const\n";

export default struct => {
    let res = head;
    for(const section in struct){
        for(const name in struct[section]){
            const current = struct[section][name];
            res += `    ${section}_${name} = _(${current[0]}, ${JSON.stringify(current[1])}),\n`;
        }
        res += '\n';
    }
    return res.slice(0, -3) + ';\n';
} 
