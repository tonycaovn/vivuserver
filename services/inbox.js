var mongo = require('mongodb'); 
var Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure;
 
var server = new Server('localhost', 27017, {auto_reconnect: true});
db = new Db('vivudb', server);

//add a inbox
exports.addInbox = function(req, res) {
	var gcm = new GLOBAL.GCMessage;
	var inbox = req.body;
	
	
	var saveInbox = function( ){
		db.collection('inboxs', function(err, collection) {
	        collection.insert(inbox, {safe:true}, function(err, result) {
	            if (err) {
	                res.send({'error':'An error has occurred'});
	            }
	            else{
	                console.log('Success: ' + JSON.stringify(result[0]));
	                res.send(result[0]);
	            }
	        });
	    }); // end Inbox collection
	}
	
	var findDeviceByUserIdAndSend = function (id) {
		console.log('Retrieving all devices by user id: ' + id);
		// get all device by userId
		db.collection('devices', function(err, collection) {
			collection.find({'UserID':id.toString()}).toArray(function(err, items) {
				var ltsDevicesIds = [];
				for(var i = 0;i <items.length;i++){
					ltsDevicesIds.push(items[i].DeviceID);
				}
				gcm.addRegIdList(ltsDevicesIds);
				gcm.addMessageData("inbox",inbox);
				gcm.send( );
				saveInbox( );
			}); // end device collection
		});
	}
	
	
	// step 2.1
	var increaseNoInbox = function (noCfs) {
		// increase Inbox Id
		inbox.InboxID = ++noCfs;
		findDeviceByUserIdAndSend(inbox.UserID);
    }
	
	// step 2.2
	var userUnknown = function( ) {
    	res.send({'unknown':'There are no user in this system'});
    }
	
	// step 1
	var getNoCfsByUserId = function(userid){
	    db.collection('users', function(err, users) {
	    	users.findOne({'UserID':userid.toString()}, function(err, item) {
	    		if(item != null){
		        	item.noCfs++;
		        	users.save(item);
		        	increaseNoInbox(item.noCfs);
	    		}
	    		else{
	    			userUnknown();
	    		}
	        });
	    });	
	}
	
    getNoCfsByUserId(inbox.UserID);
}

// find all inbox
exports.findAllInboxs = function(req, res) {
    db.collection('inboxs', function(err, collection) {
        collection.find().toArray(function(err, items) {
            res.send(items);
        });
    });
};

//find all inboxs by userid
exports.findInboxByUserId = function(req, res) {
	 var id = req.params.id;
	 console.log('Retrieving inbox contacts by user id: ' + id);
    db.collection('inboxs', function(err, collection) {
        collection.find({'UserID':id.toString()}).toArray(function(err, items) {
            res.send(items);
        });
    });
};





exports.deleteAllInboxs = function(req, res) {
    console.log('Deleting All Inboxs');
    db.collection('inboxs', function(err, collection) {
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


//update a inbox
exports.updateInbox = function(req, res) {
	try{
	    // update user by id userid
	    var inbox = req.body;
	    var inboxid = inbox.InboxID;
	    
	    console.log('Updating inbox: ' + inboxid);
	    console.log(JSON.stringify(inbox));
	    db.collection('inboxs', function(err, collection) {
	        collection.update({'InboxID':inboxid}, inbox, {safe:true}, function(err, result) {
	            if (err) {
	                console.log('Error updating inbox: ' + err);
	                res.send({'Error':'An error has occurred'});
	            } else {
	                console.log(result + ' document(s) updated');
	                res.send({'Ok':'Success'});
	            }
	        });
	    });
    }
    catch(e){
    	console.log('Error at update inbox by InboxId '+e);
    	res.send({'Error':'Server errors'});
    }
}

// delete many Inboxs
exports.deleteInboxs = function(req, res) {
	try{
	    var inboxs = req.body;
	    console.log('Deleting inboxs: ');
	    console.log(inboxs);
	   	var synnum = 0;
		for(var i = 0;i < inboxs.length;i++){
			var inbox = inboxs[i];
	    	var inboxid = inbox.InboxID;
	    	var userid = inbox.UserID;
			db.collection('inboxs', function(err, collection) {
		        collection.remove({'UserID':userid,'InboxID':inboxid}, {safe:true}, function(err, result) {
		            if(err){
		                res.send({'error':'An error has occurred - ' + err});
		            } 
		            else{
		            	synnum++;
		            	if(inboxs.length == synnum){
			                console.log(synnum + ' document(s) deleted');
			                res.send({'Ok':'Success'});	            	
	            		}
		            }
		        });
		    });
	    }	    
    }
    catch(e){
    	console.log('Error at update inbox by InboxId '+e);
    	res.send({'Error':'Server errors'});
    }
}

// update many inboxs
exports.updateInboxs = function(req, res) {
	try{
	    // update user by id userid
	    var inboxs = req.body;	    
	    
	    console.log('Updating inboxs: ');
	    console.log(inboxs);
	    var synnum = 0; 
	    for(var i = 0;i < inboxs.length;i++){
	    	var inbox = inboxs[i];
	    	var inboxid = inbox.InboxID;
	    	var userid = inbox.UserID;
	    	db.collection('inboxs', function(err, collection) {
	        collection.update({'InboxID':inboxid,'UserID':userid}, inbox, {safe:true}, function(err, result) {
	            if (err) {
	                console.log('Error updating inbox: ' + err);
	                res.send({'Error':'An error has occurred'});
	            } else {
	            	synnum++;
	            	if(inboxs.length == synnum){
		                console.log(result + ' document(s) updated');
		                res.send({'Ok':'Success'});	            	
	            	}
	            }
	        });
	    });
	    }
    }
    catch(e){
    	console.log('Error at update inbox by InboxId '+e);
    	res.send({'Error':'Server errors'});
    }
}