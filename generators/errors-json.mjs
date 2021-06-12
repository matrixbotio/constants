function json(val){
	return JSON.stringify(val, null, '	') + '\n';
}

export default struct => {
	let errMap = {};
	for(const section in struct) for(const name in struct[section]){
		const current = struct[section][name];
		errMap[`${section}_${name}`] = {
			code: current[0],
			message: current[1],
			name: `${section}_${name}`,
		};
	}
	return {
		'errors.json': json(errMap),
	};
}
