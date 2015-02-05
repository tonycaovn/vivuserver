var mongo = require('mongodb'); 
var Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure;
 
var server = new Server('localhost', 27017, {auto_reconnect: true});
db = new Db('vivudb', server);

//add a contact
exports.addOutbox = function(req, res) {
    var outbox = req.body;
    console.log('Adding Outbox: ' + JSON.stringify(outbox));
    db.collection('outboxs', function(err, collection) {
        collection.insert(outbox, {safe:true}, function(err, result) {
            if (err) {
                res.send({'error':'An error has occurred'});
            } 
            else {
                console.log('Success: ' + JSON.stringify(result[0]));
                res.send(result[0]);
            }
        });
    });
}

exports.deleteOutboxs = function(req, res) {
	try{
	    var outboxs = req.body;
	    console.log('Deleting outboxs: ');
	    console.log(outboxs);
	   	var synnum = 0;
		for(var i = 0;i < outboxs.length;i++){
			var outbox = outboxs[i];
	    	var outboxid = outbox.OutboxID;
	    	var userid = outbox.UserID;
			db.collection('outboxs', function(err, collection) {
		        collection.remove({'UserID':userid,'OutboxID':outboxid}, {safe:true}, function(err, result) {
		            if(err){
		                res.send({'error':'An error has occurred - ' + err});
		            } 
		            else{
		            	synnum++;
		            	if(outboxs.length == synnum){
			                console.log(synnum + ' document(s) deleted');
			                res.send({'Ok':'Success'});	            	
	            		}
		            }
		        });
		    });
	    }	    
    }
    catch(e){
    	console.log('Error at delete outbox  '+e);
    	res.send({'Error':'Server errors'});
    }
}


//find all outbox
exports.findAllInboxs = function(req, res) {
    db.collection('outboxs', function(err, collection) {
        collection.find().toArray(function(err, items) {
            res.send(items);
        });
    });
};

//find outbox by userid
exports.findOutboxByUserId = function(req, res) {
    var userid = req.params.id;
    console.log('Retrieving outbox by userid: ' + userid);
    db.collection('outboxs', function(err, collection) {
        collection.find({'UserID':userid.toString()}).toArray (function(err, items) {
            res.send(items);
        });
    });
};

// delete all outbox
exports.deleteAllOutboxs = function(req, res) {
    console.log('Deleting All Outboxs');
    db.collection('outboxs', function(err, collection) {
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

