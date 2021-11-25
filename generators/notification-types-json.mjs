export default struct => {
    const res = {};
    for(const i in struct) res[struct[i]] = +i;
	return {
		'notification-types.json': JSON.stringify(res),
	}
}
