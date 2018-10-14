module.exports = function(grunt){

	// load plugins
	[
		'grunt-mocha-test',
		'grunt-contrib-jshint',
		'grunt-exec',
	].forEach(function(task){
		grunt.loadNpmTasks(task);
	});

	// configure plugins
	grunt.initConfig({

	    //cafemocha: {
	    //    all: { src: 'qa/tests-*.js', options: { ui: 'tdd' }, }
	    //},

	    mochaTest: {
		test: {
		    options: {
			ui: 'tdd',
			reporter: 'spec',
			//captureFile: 'results.txt', // Optionally capture the reporter output to a file
			quiet: false, // Optionally suppress output to standard out (defaults to false)
			clearRequireCache: false, // Optionally clear the require cache before running tests (defaults to false)
			noFail: false // Optionally set to not fail on failed tests (will still fail on other errors)
		    },
		    src: ['qa/tests-*.js']
		}
	    },

	    jshint: {
		    app: ['memlist2*.js', 'public/js/**/*.js',
			  'lib/**/*.js'],
		    qa: ['Gruntfile.js', 'public/qa/**/*.js', 'qa/**/*.js'],
	    },

	    exec: {
		    linkchecker:
			{ cmd: 'linkchecker http://vekori.com' }
	    },
	});

	// register tasks
	grunt.registerTask('default', ['mochaTest','jshint','exec']);
};
