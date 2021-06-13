interface OutputDevice{
	send(data: string): void
}

export default class Logger{
	constructor(dev: OutputDevice, host: string, source: string)

	/**
	 * Very detailed logs
	 */
	verbose(data: Error | string): void

	/**
	 * Important logs
	 */
	log(data: Error | string): void

	/**
	 * Something may go wrong
	 */
	warn(data: Error | string): void

	/**
	 * Failed to do something. This may cause problems!
	 */
	error(data: Error | string): void

	/**
	 * Critical error. Node's shutted down!
	 */
	critical(data: Error | string): void
}
