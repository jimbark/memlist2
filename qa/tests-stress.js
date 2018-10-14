var loadtest = require('loadtest');
var expect = require('chai').expect;

suite('Stress tests', function(){

      test('Homepage should handle 100 requests in a second', function(done){
	  var options = {
	      //url: 'http://vekori.com',
	      url: 'https://forgettingtest.org',
	      concurrency: 20,
	      maxRequests: 10,
	      //secureProtocol: 'TLSv1_method'
	      //insecure: insecure,
	      //agentKeepAlive
	      Connection: Keep-alive
	  };
	  loadtest.loadTest(options, function(err,result){
	    expect(!err);
	    expect(result.totalTimeSeconds < 4);
	    done();
	  });
      });

});
