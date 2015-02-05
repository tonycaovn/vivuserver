var mongo = require('mongodb'); 
var Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure;
 
var server = new Server('localhost', 27017, {auto_reconnect: true});
db = new Db('vivudb', server);

//find all contacts
exports.findAllContacts = function(req, res) {
	 console.log('Retrieving all contacts');
     db.collection('contacts', function(err, collection) {
        collection.find().toArray(function(err, items) {
            res.send(items);
        });
    });
};

//find all by user id
exports.getAllContactByUserId = function(req, res) {
	 var id = req.params.id;
	 console.log('Retrieving all contacts by user id: ' + id);
    db.collection('contacts', function(err, collection) {
        collection.find({'UserID':id.toString()}).toArray(function(err, items) {
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

// add a contact
exports.addContact = function(req, res){
	console.log("Adding contact");
	var gcm = new GLOBAL.GCMessage;
	var synnum = 0;
	var dup = false;
    var insertContact = function(idx, contacts){
    	if (idx >= contacts.length) {
    		res.send("OK");
    		return ;
    	}

    	var userid = contacts[idx].UserID;
    	var contactid = contacts[idx].ContactID;
    
    	db.collection('contacts', function(err, collection) {
			collection.find({'UserID':userid,'ContactID':contactid}).toArray(
			function(err, items) {
  				
				if(items.length  == 0){
			        collection.insert(contacts[idx], {safe:true}, 
			        	function(err, result) {
			        		
			        		db.collection('users', function(err, users) {
								users.findOne({'UserID':contacts[idx].UserID},function(err, user) {
								try{
									console.log("user: ");
									console.log(user);
									//var userjson = JSON.parse(user);
									var newcontact = {
					        			"UserID": contacts[idx].ContactID,
										"ContactID": contacts[idx].UserID,
										"FacebookID": user.FaceBookID,
										"ContactName": user.UserName,
										"Avatar": user.UrlAvatar,
										"Gender": user.Gender
					        		};
					        		collection.insert(newcontact, {safe:true}, function(err, result) {
					        					db.collection('devices', function(err, collection) {
													collection.find({'UserID':newcontact.UserID}).toArray(function(err, devices) {
														var ltsDevicesIds = [];
														for(var i = 0;i <devices.length;i++){
															ltsDevicesIds.push(devices[i].DeviceID);
														}
														gcm.addRegIdList(ltsDevicesIds);
														gcm.addMessageData("contact",JSON.stringify(newcontact));
														gcm.send( );
													}); // end device collection
												});
					        				insertContact(idx+1, contacts);
					        		});
					        	}catch(e){
					        		
					        	}// end catch	
								});
							});
			        	});
				} else insertContact(idx + 1, contacts);
			});
		});
    }
    
    try{
	    var contacts = req.body;
	    console.log('Adding Contacts: ');
	    console.log(contacts);
				
		insertContact(0, contacts);
	}
    catch(e){
    	console.log("Error in addcontact, parse each contact");
    	res.send({'Error':'Error from server'});
    }
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
                res.send(user);
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

//delete all contact
exports.deleteAllContacts = function(req, res) {
    console.log('Deleting All Contacts');
    db.collection('contacts', function(err, collection) {
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
