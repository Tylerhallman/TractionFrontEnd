module.exports = {
    getArgs() {
        const args = {};

        process.argv.slice(2).forEach(arg => {
            if (arg.startsWith('--')) {
                const [key, value] = arg.slice(2).split('=');
                args[key] = value !== undefined ? value : true;
            }
        });
        return args;
    }
};
