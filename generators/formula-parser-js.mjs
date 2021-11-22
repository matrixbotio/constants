import peggy from 'peggy';

export default src => {
    return {
        'parser.js': peggy.generate(src, {
            output: 'source',
            format: 'es',
        }),
    }
}
