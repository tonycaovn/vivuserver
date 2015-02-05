var mongo = require('mongodb'); 
var Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure;
 
var server = new Server('localhost', 27017, {auto_reconnect: true});
db = new Db('vivudb', server);

//find all users
exports.findAllUsers = function(req, res) {
    db.collection('users', function(err, collection) {
        collection.find().toArray(function(err, items) {
            res.send(items);
        });
    });
};

//find a user by id
exports.findUserById = function(req, res) {
    var id = req.params.id;
    console.log('Retrieving user: ' + id);
    db.collection('users', function(err, collection) {
        collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, item) {
            res.send(item);
        });
    });
};

// find user by facebook id 
exports.findUserByFacebookID = function(req, res) {
    var facebookid = req.params.facebookid;
    console.log('Retrieving user by facebook id : ' + facebookid);
    console.log(facebookid.toString());
    db.collection('users', function(err, collection) {
        collection.findOne({'FaceBookID':facebookid.toString()}, function(err, item) {
            if( err ) {
            res.send({'Error':'Some error has rise'});
            }
            if(item == null) {
            	console.log("There are no  User by facebookid in system");
            	res.send({'Unknown':'No user on system found'});
            }
            else{
            res.send(item);
            }
        });
    });
};

//find a user by userid
exports.findUserByUserId = function(req, res) {
    var userid = req.params.id;
    console.log('Retrieving user: ' + userid);
    db.collection('users', function(err, collection) {
        collection.findOne({'UserID':userid.toString()}, function(err, item) {
            res.send(item);
        });
    });
};


//find a user by username
exports.findUserByUserName = function(req, res) {
	var user = req.body;
    console.log('Retrieving user: ' + user.UserName);
    db.collection('users', function(err, collection) {
        collection.findOne({'UserName':user.UserName}, function(err, item) {
            res.send(item);
        });
    });
};




// add a user
exports.addUser = function(req, res) {
    var user = req.body;
    user.noCfs = 0;
	console.log('Adding User: ' + JSON.stringify(user));
	var userid = user.UserID;
	db.collection('users', function(err, collection) {
		collection.findOne({'UserID':userid.toString()}, function(err, item) {
			if(item == null){
				console.log('There are no item');
				collection.insert(user, {safe:true}, function(err, result) {
		            if (err) {
		                res.send({'Error':'An error has occurred'});
		            } else {
		                console.log('Success: ' + JSON.stringify(result[0]));
		                res.send(result[0]);
		            }
		        });
			}
			else{
				res.send({'UserDuplication':'User duplicate'});
			}
	    });
	});
}

//update a user 
exports.updateUser = function(req, res) {
	// update user by id mongodb
    /*
    var id = req.params.id;
    var user = req.body;
    console.log('Updating user: ' + id);
    console.log(JSON.stringify(user));
    db.collection('users', function(err, collection) {
        collection.update({'_id':new BSON.ObjectID(id)}, user, {safe:true}, function(err, result) {
            if (err) {
                console.log('Error updating user: ' + err);
                res.send({'error':'An error has occurred'});
            } else {
                console.log('' + result + ' document(s) updated');
                res.send(user);
            }
        });
    });
    */
    
    // update user by id userid
    var user = req.body;
    var userid = user.UserID;
    
    console.log('Updating user: ' + userid);
    console.log(JSON.stringify(user));
    db.collection('users', function(err, collection) {
        collection.update({'UserID':userid.toString()}, user, {safe:true}, function(err, result) {
            if (err) {
                console.log('Error updating user: ' + err);
                res.send({'error':'An error has occurred'});
            } else {
                console.log('' + result + ' document(s) updated');
                res.send(result);
            }
        });
    });
    
}

//delete a user by Id
exports.deleteUserById = function(req, res) {
    var id = req.params.id;
    console.log('Deleting user: ' + id);
    db.collection('users', function(err, collection) {
        collection.remove({'_id':new BSON.ObjectID(id)}, {safe:true}, function(err, result) {
            if (err) {
                res.send({'error':'An error has occurred - ' + err});
            } else {
                console.log('' + result + ' document(s) deleted');
                res.send(req.body);
            }
        });
    });
}

//delete a user by UserId
exports.deleteUserByUserId = function(req, res) {
    var userid = req.params.id;
    console.log('Deleting user by User Id: ' + userid);
    db.collection('users', function(err, collection) {
        collection.remove({'UserID':userid.toString( )}, {safe:true}, function(err, result) {
            if (err) {
                res.send({'error':'An error has occurred - ' + err});
            } else {
                console.log('' + result + ' document(s) deleted');
                res.send(req.body);
            }
        });
    });
}

//delete all user
exports.deleteAllUsers = function(req, res) {
    console.log('Deleting All User');
    db.collection('users', function(err, collection) {
        collection.remove({},function(err, result){
            if (err) {
                res.send({'error':'An error has occurred - ' + err});
            } 
            else{
                console.log('' + result + ' document(s) deleted');
                res.send(req.body);
            }
        });
    });
}
