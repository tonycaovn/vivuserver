var mongo = require('mongodb'); 
var fs = require('fs');
var path = require("path");
var Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure;
 
var server = new Server('localhost', 27017, {auto_reconnect: true});
db = new Db('vivudb', server);

function getExtPart(str){
	var n=str.split(".");
	return n[n.length - 1];
}
function getNamePart(str){
	var n=str.split(".");
	return n[0];
}

function removeSubstring(str,strrm){
	var newstr = str.replace(strrm,""); 
	return newstr;
}

exports.uploadAudio = function(req, res){
		var addInbox = function(inbox) {
			console.log("Starting add Inbox: ");
			console.log(inbox);
			console.log(inbox.UserID);
			var gcm = new GLOBAL.GCMessage;
			
			
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
				console.log("findDeviceByUserIdAndSend");
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
				console.log("increaseNoInbox");
				inbox.InboxID = ++noCfs;
				findDeviceByUserIdAndSend(inbox.UserID);
		    }
			
			// step 2.2
			var userUnknown = function( ) {
				console.log("userUnknown");
		    	res.send({'unknown':'There are no user in this system'});
		    }
			
			// step 1
			var getNoCfsByUserId = function(userid){
				try{
					console.log("getNoCfsByUserId: "+ userid);
				    db.collection('users', function(err, users) {
				    	users.findOne({'UserID':userid}, function(err, item) {
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
			    catch(e){
			    	console.log("Error at getNoCfsByUserId");
			    }
			}
			
		    getNoCfsByUserId(inbox.UserID);
		}// end add inbox function
	
	
	
	var inbox = JSON.parse(req.body.json);
	console.log("json: ");
	console.log(inbox);
	//update Inbox
	var updateInbox = function(seqNo){
		try{
			var link = GLOBAL.HOSTNAME + "/cfs/audio/"+seqNo;
			inbox.ContentVoice = link;
			addInbox(inbox);
		 }
		 catch(e){
		 	console.log("error in updateInbox in uploadAudio ");
		 	res.send({error:"Error from server"});
		 }
	}
	
	var saveAudio = function(seqNo){
  		console.log('Adding New Audio');
  		staticDir = removeSubstring(GLOBAL.__dirname,"/vivuserver/trunk");
  		//var audioDir = GLOBAL.__dirname + "/public/audio/";
  		var audioDir = staticDir + "/staticserver/public/audio/";
  		  		
  		console.log("audio Dir: "+audioDir);
  		//var fileName = req.files.source.name;
  		var fileName = seqNo+"."+getExtPart(req.files.source.name);
  		console.log("source: "+req.files.source.path);
  		console.log("dest: "+audioDir + fileName);
  		
  		fs.rename(req.files.source.path,
  			audioDir + fileName,
  			function(err){
  				if(err != null){
  					console.log("Server cant rename");
  					console.log(err);
  					res.send({error:"Error from server"});
  				}
  				else{
  					console.log("Success rename");  					
  					var soundlib = new GLOBAL.Sound;
  					var sourcepart = getNamePart(fileName);
  					soundlib.convertWavToMp3(audioDir + fileName,audioDir + sourcepart+".mp3",function( ){
  						fs.unlink(audioDir + fileName,function(err){
  							console.log("Error delete file: " + err);
  						});
  					});
  					updateInbox(seqNo);
  					res.send("Ok");
  				}
  			}
		);
	}

	var insertSequence = function( ){
		var sequences = {sequenceNo:1};
		db.collection('sequences', function(err, collection) {
	        collection.insert(sequences, {safe:true}, function(err, result) {
	            if (err) {
	            	console.log("Error when insert first sequence");
	                res.send({'error':'An error has occurred'});
	            } 
	            else {
	                console.log('Success: ' + JSON.stringify(result[0]));
	                saveAudio(result[0].sequenceNo);
	            }
	        });
	    });
	}
	
	var updateSequence = function( ){
		 db.collection('sequences', function(err, sequences) {
		     sequences.findOne({}, function(err, item) {
		        	item.sequenceNo++;
		        	sequences.save(item);
		        	saveAudio(item.sequenceNo);
		     });
		});
	}
	
	db.collection('sequences', function(err, sequences) {
        sequences.find().toArray(function(err, items) {
        	if(items.length == 0){
        		insertSequence( );
        	}
        	else{
            	updateSequence( );
            }
        });
    });
}