export default struct => {
    let res = 'export const';
    for(const i in struct) res += `\n    ${struct[i]} = ${i},`;
	return {
		'notification-types.js': res.slice(0, -1) + ';\n',
		'index.d.ts': 'export * from "./notification-types";\n',
		'index.mjs': 'export * from "https://raw.githubusercontent.com/matrixbotio/constants/master/notification-types/notification-types.js";\n',
	}
}
