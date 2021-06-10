const head = `
package sharederrs

type apiError struct {
	Message string        \`json:"message"\`
	Code    int           \`json:"code"\`
	Name    string        \`json:"name"\`
}

func err(code int, name string, msg string) *apiError {
	return &apiError{
		Message: msg,
		Code:    code,
		Name:    name,
	}
}

// errors itself

`.slice(1);

function fixCase(str){
    let res = '';
    let nextUpper = true;
    for(const char of str){
        if(char === '_') nextUpper = true;
        else if(!nextUpper) res += char.toLowerCase();
        else {
            res += char;
            nextUpper = false;
        } 
    }
    return res;
}

export default struct => {
    let res = head;
    for(const section in struct){
        for(const name in struct[section]){
            const current = struct[section][name];
            const nameWSection = `${section}_${name}`;
            res += `var ${fixCase(nameWSection)} = err(${current[0]}, ${JSON.stringify(`${nameWSection}`)}, ${JSON.stringify(current[1])})\n`;
        }
        res += '\n';
    }
    return {
        'main.go': res.slice(0, -1),
    };
}
