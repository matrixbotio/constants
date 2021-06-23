export default struct => {
	return {
		'logger.json': JSON.stringify(struct, null, '	') + '\n',
	}
}
