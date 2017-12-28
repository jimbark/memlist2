// User database module, using AWS dynamodb

// Base DynamoDB configuration
var AWS = require('aws-sdk');
var credentials = require('../credentials.js');

AWS.config.update({
    credentials: credentials.aws.development,
    region: 'eu-west-1'
});

AWS.config.apiVersions = {
dynamodb: '2012-10-08',
ec2: '2016-11-15',
s3: '2006-03-01'
};

// Create S3 service object
s3 = new AWS.S3();

// Call S3 to list current buckets

exports.s3ListBuckets = function() {

    console.log('s3ListBuckets called');

    s3.listBuckets(function(err, data) {
	if (err) {
	    console.log("Error", err);
	} else {
	    console.log("Bucket List", data.Buckets);
	}
    });

};


exports.s3CreateBucket = function(bucket) {

    // Create the parameters for calling createBucket
    var bucketParams = {
	Bucket : bucket
    };

    // Call S3 to create the bucket
    s3.createBucket(bucketParams, function(err, data) {
	if (err) {
	    console.log("Error", err);
	} else {
	    console.log("Success", data.Location);
	}
    });

};

exports.s3Upload = function(bucket, filename, text, cb) {

    // call S3 to upload file to specified bucket
    var uploadParams = {Bucket: bucket, Key: filename, Body: text};

    // call S3 to retrieve upload file to specified bucket
    s3.upload (uploadParams, function (err, data) {
	if (err) {
	    cb(err,data);
	} if (data) {
	    console.log("Upload Success to S3", data.Location);
	    cb(err,data);
	}
    });

};





/*


//var authId = process.argv[2];

// Read a user from the userdb based on supplied authid
// returns item by adding to global varibale 'item'
exports.findByIdLog = function(authId) {

    console.log("global item:", item);

    var params = {
	TableName: 'userDb',
	Key: {
	    'authId' : {S: authId},
	},
	//ProjectionExpression: 'authId, userName, userEmail, created'
	// if not specified then get all attributes
    };

    ddb.getItem(params, function(err, data) {
	if (err) {
	    console.log("Error", err);
	    //return[err,null];
	    //return{err: err, data: null};
	    item = {err: err, data: null};

	} else {
	    console.log("Success", data);
	    //return[null,data];
	    //var item = {err: null, data: data};
	    //console.log(item);
	    //return(item);
	    //return{err: null, data: data};
	    //return(5);
	    var user = attr.unwrap(data.Item);
	    item = {err: null, data: user};
	}
    });
    //console.log(item);
    //return(item);
};

// Read a user from the userdb based on supplied authid, and execute callback
exports.findById = function(authId,cb) {

    var params = {
	TableName: 'userDb',
	Key: {
	    'authId' : {S: authId},
	},
	//ProjectionExpression: 'authId, userName, userEmail, created'
	// if not specified then get all attributes
    };

    ddb.getItem(params, function(err, data) {
	if (err) {
	    console.log("Error", err);
	    cb(err,null);
	} else {
	    console.log("Success", data);
	    //convert data to user object
	    var user = attr.unwrap(data.Item);
	    console.log("Unwrapped user: ", user);
	    cb(null,user);
	}
    });
};

*/
