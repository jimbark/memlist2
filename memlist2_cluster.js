var cluster = require('cluster');

function startWorker() {
    var worker = cluster.fork();
    console.log('CLUSTER: Worker %d started', worker.id);
}

if(cluster.isMaster){

    require('os').cpus().forEach(function(){
	    startWorker();
    });

    // log any workers that disconnect; if a worker disconnects, it
    // should then exit, so we'll wait for the exit event to spawn
    // a new worker to replace it
    cluster.on('disconnect', function(worker){
	console.log('CLUSTER: Worker %d disconnected from the cluster.',
	    worker.id);
    });

    // when a worker dies (exits), create a worker to replace it
    cluster.on('exit', function(worker, code, signal){
	console.log('CLUSTER: Worker %d died with exit code %d (%s)',
	    worker.id, code, signal);
	startWorker();
    });

    // log4js logging required here in master otherwise worker logging does not work
    var log4js = require('log4js');

    log4js.configure({
	appenders: {
	    everything: { type: 'file', filename: __dirname + '/log/memlist.log', maxLogSize: 10485760, backups: 3},
	    console: { type: 'console' }
	},
	categories: { default: { appenders: [ 'everything' , 'console'], level: 'info'}
	}
    });

    var logger = log4js.getLogger();
    logger.level = 'debug';

    logger.debug("Some debug messages in master");
    logger.info("Some info messages in master");
    logger.error("Some error messages in master");


} else {
    // start our app on worker; see memlist2.js
    require('./memlist2.js')();
}
