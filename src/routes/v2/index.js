const glob  = require('glob');
const logger = require('../../utils/logger')
const router = require('express').Router()

glob('**/*.js', {cwd: __dirname, ignore: 'index.js'}, function(error, files){
    if(error){
        logger.error(error.message)
        process.exit(1);
    }

    files.forEach(file => {
        const pack = require(`${__dirname}/${file}`);
        router.use(pack.baseUrl, pack.router);
    })
});

module.exports = router;