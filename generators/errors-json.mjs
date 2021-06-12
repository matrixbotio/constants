function json(val){
	return JSON.stringify(val, null, '	') + '\n';
}

export default struct => {
	let errMap = {};
	for(const section in struct){
		for(const name in struct[section]) errMap[`${section}_${name}`] = struct[section][name];
	}
	return {
		'errors.json': json(errMap),
	};
}
