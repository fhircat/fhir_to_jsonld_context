const log4js = require('log4js');
const rimraf = require('rimraf');
const fs = require('fs');

var logger = log4js.getLogger("app");

// Config
log4js.configure('config/log4js.json');

/***************** BEGIN *********************/

function run (argv) {

    var av = argv.slice(2)
    if (av.length == 0){
        logUsage();
        return;
    }

    console.log("Command line params:" + av);

    if (av == 'clean'){
        clearLogs('logs');
        return;
    }

    log('Starting transformation on ' + getTS());
}

run(process.argv);
/*********************************************/

function logUsage(){
    console.log('\n***********************************');
    console.log('\nParameters are not [correctly] provided...\n\n')
    console.log("Usage: node src/createContext.js ['directory path to shex json file' | clean]");
    console.log("\n\tclean: cleans the old log files for previous runs in 'logs' directory.");
    console.log('\n***********************************\n');
}

function clearLogs(d)
{
    rimraf('./' + d + '/*', function () { console.log("Deleted log files in directory '" + d + "'"); });
    logger = log4js.getLogger("app");
}

function getTS()
{
    var newDate = new Date();
    return "TS: " + newDate.toLocaleTimeString();
}

function log(message){
    console.log(message);
    logger.debug(message);
}