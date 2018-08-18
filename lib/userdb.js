// User database module, using AWS dynamodb

// the study identifer, remove when stored in a single place, or using environment variable
var studyID = "mt_pilot_b4";

// Base DynamoDB configuration
var AWS = require('aws-sdk');
var credentials = require('../credentials.js');
var attr = require('dynamodb-data-types').AttributeValue;

var env = process.env.NODE_ENV;

AWS.config.update({
    credentials: credentials.aws[env],
    region: 'eu-west-1'
});

AWS.config.apiVersions = {
dynamodb: '2012-10-08',
ec2: '2016-11-15'
};

// Create the DynamoDB service object
ddb = new AWS.DynamoDB();

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

// Read a user from the userdb based on supplied authid, if not found then create user record

exports.findOrCreateByIdLog = function(authId, profile) {

    var params = {
	TableName: 'userDb',
	Key: {
	    'authId' : {S: authId},
	},
	//ProjectionExpression: 'authId, userName, userEmail, created'
	// if not specified then get all attributes
    };

    // first try to get the item
    ddb.getItem(params, function(err, data) {
	if (err) {
	    console.log("Error", err);
	} else {
	    console.log("Success", data);
	    if (!data.Item) {
		console.log("No item exists");

		var user = {
		    authId: authId,
		    userName: 'joe',
		    userEmail: 'james.doe@doe.com',
		    created: Date.now().toString(),
		    status: 'new',
		    study: {},
		    delayed: {}
		};

		var params = {
		    TableName: 'userDb',
		    Item: attr.wrap(user),

		    /*Item: {
			'authId' : {S: authId},
			'userName' : {S: 'New Doe'},
			'userEmail' : {S: 'New.doe@doe.com'},
			'created' : {N: Date.now().toString()},
		    }*/
		};

		// Call DynamoDB to add the item to the table
		ddb.putItem(params, function(err, data) {
		    if (err) {
			console.log("Error", err);
		    } else {
			console.log("Success", data);
		    }
		});
	    }
	}
    });
};

// Read a user from the userdb based on supplied authid, if not found then create user record and callback

exports.findOrCreateById = function(authId, cb) {

    var params = {
	TableName: 'userDb',
	Key: {
	    'authId' : {S: authId},
	},
	//ProjectionExpression: 'authId, userName, userEmail, created'
	// if not specified then get all attributes
    };

    // first try to get the item
    ddb.getItem(params, function(err, data) {
	if (err) {
	    console.log("Error", err);
	    cb(err,null);
	} else {
	    console.log("Success", data);
	    if (data.Item){
		// convert data to user object
		var user = attr.unwrap(data.Item);
		cb(null,user);
		}
	    else {
		console.log("No item exists");

		var newUser = {
		    authId: authId,
		    userName: 'joe',
		    userEmail: 'james.doe@doe.com',
		    created: Date.now().toString(),
		    status: 'new',
		    study: { s1: studyID },
		    delayed: {},
		    password: 'pass'
		};

		var params = {
		    TableName: 'userDb',
		    Item: attr.wrap(newUser),

		    /*Item: {
			'authId' : {S: authId},
			'userName' : {S: 'New Doe'},
			'userEmail' : {S: 'New.doe@doe.com'},
			'created' : {N: Date.now().toString()},
		    }*/
		};

		// Call DynamoDB to add the item to the table
		ddb.putItem(params, function(err, data) {
		    if (err) {
			console.log("Error", err);
			cb(err,null);
		    } else {
			console.log("Success", data);
			cb(null,newUser);
		    }
		});
	    }
	}
    });
};


// Update a record in the userDb based on supplied authid

/*
exports.updateById = function(authId, attr, value, cb) {

    var params = {
	TableName: 'userDb',
	Key: {
	    'authId' : {S: authId},
	    },

	ExpressionAttributeNames: {
	    "#A": attr
	},
	ExpressionAttributeValues: {
	    ":a": {
		S: value
	    }
	},
	ReturnValues: "ALL_NEW",
	UpdateExpression: "SET #A = :a"
    };

    ddb.updateItem(params, function(err, data) {
	if (err) {
	    console.log(err, err.stack); // an error occurred
	    cb(err,null);
	}
	else {
	    console.log(data);           // successful response
	    cb(null,data);
	}
    });

};
*/

exports.updateById = function(authId, updates, cb) {

    //var updates = {'a': 'first', 'b': 'second', 'c':'third'}

    //Object.keys(updates).forEach(function(key) {
    //	console.log(key, updates[key]);
    //});

    ddb.updateItem(updates, function(err, data) {
	if (err) {
	    console.log(err, err.stack); // an error occurred
	    cb(err,null);
	}
	else {
	    console.log(data);           // successful response
	    cb(null,data);
	}
    });

};

// Create a new user record based on supplied authid, user, and callback

exports.createById = function(table, user, cb) {

    var params = {
	TableName: table,
	Key: {
	    'authId' : {S: user.authId},
	},
	//ProjectionExpression: 'authId, userName, userEmail, created'
	// if not specified then get all attributes
    };

    // first try to get the item to check it doesnt already exist
    ddb.getItem(params, function(err, data) {
	if (err) {
	    console.log("Error", err);
	    cb(err,null);
	} else {
	    console.log("Success", data);
	    if (data.Item){
		console.log("Withdrawn record already exists");
		}
	    else {
		console.log("No withdrawn item exists");
	    }

	    var params = {
		TableName: table,
		Item: attr.wrap(user),
	    };

	    // Call DynamoDB to add the item to the table (or update it)
	    ddb.putItem(params, function(err, data) {
		if (err) {
		    console.log("Error", err);
		    cb(err,null);
		} else {
		    console.log("Success", data);
		    cb(null,user);
		}
	    });
	}

    });
};

// Delete a user record based on supplied authid and table, and callback

exports.deleteById = function(table, authId, cb) {

    // build params object for the deletion
    var params = {
	TableName: table,
	Key: {
	    'authId' : {S: authId},
	},
    };

    // call function to delete the item
    ddb.deleteItem(params, function(err, data) {
	if (err) {
	    console.log("Error", err);
	    cb(err,null);
	} else {
	    console.log("Success", data);
	    cb(null,data);
	}
    });
};
