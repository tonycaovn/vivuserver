var mongo = require('mongodb'); 
var Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure;
 
var server = new Server('localhost', 27017, {auto_reconnect: true});
db = new Db('vivudb', server);

function getUserByUserId(userid, yescb,nocb){
	db.collection('users', function(err, users) {
    	users.findOne({'UserID':userid.toString()}, function(err, item) {
    		if(item != null){
    			
    			yescb(item);
    		}
    		else{
    			nocb();
    		}
        });
    });	
}


exports.addDevice = function(req, res) {
	var device = req.body;
	console.log("Devices");
	console.log(device);
	var UserUnknownCallBack = function( ) {
    	res.send({'Unknown':'There are no user in this system'});
    }
	var addingDevicesCallBack = function(user){	
	    console.log('Adding Devices: ' + JSON.stringify(device));
	    try{
			db.collection('devices', function(err, collection){
				collection.findOne({'DeviceID':device.DeviceID.toString()}, function(err, item) {
					if(item == null){
						  collection.insert(device, {safe:true}, function(err, result) {
							if (err) {
								res.send({'Error':'An error has occurred'});
							}
							else {
								console.log('Success: ' + JSON.stringify(result[0]));
								res.send(result[0]);
							}
						});
					}
					else{
						if(user.UserID == item.UserID){
							console.log("Insert a device already inserted before");
							res.send(item);
						}
						else{
							console.log("Insert a device that inserted with other user");
							collection.insert(device, {safe:true}, function(err, result) {
								if (err) {
									res.send({'error':'An error has occurred'});
								}
								else {
									console.log('Success: ' + JSON.stringify(result[0]));
									res.send(result[0]);
								}
							});
						}
					}
				}); // end find one
			}); // end collection
		}
		catch(err){
		
		}
	};

	getUserByUserId(device.UserID,addingDevicesCallBack,UserUnknownCallBack);
}

exports.getAllDevices = function(req,res){
	 console.log('Retrieving all devices');
	    db.collection('devices', function(err, collection) {
	        collection.find().toArray(function(err, items) {
	        	res.send(items);
	        });
	    });
}

exports.getAllDevicesByUserId = function(req, res) {
	 var id = req.params.id;
	 console.log('Retrieving all devices by user id: ' + id);
     db.collection('devices', function(err, collection) {
        collection.find({'UserID':id.toString()}).toArray(function(err, items) {
            res.send(items);
        });
    });
	
}


exports.deleteAllDevices = function(req, res){
    console.log('Deleting All Devices');
    db.collection('devices', function(err, collection) {
        collection.remove({},function(err, result){
            if (err) {
                res.send({'error':'An error has occurred - ' + err});
            } 
            else {
                console.log('' + result + ' document(s) deleted');
                res.send(req.body);
            }
        });
    });
}
