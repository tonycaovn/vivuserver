var fs = require('fs');
var os=require('os');
var express = require('express'),
    // wine = require('./routes/wines');
	user = require('./services/user');
	contact = require('./services/contact');
	inbox = require('./services/inbox');
	outbox = require('./services/outbox');
	device = require('./services/device');
	audio = require('./services/audio');
	GLOBAL.GCMessage = require('./lib/GCMessage.js');
	GLOBAL.Sound = require('./lib/Sound.js');
	
	GLOBAL.PORT = 3000;
	GLOBAL.IP = "54.214.9.117";
	GLOBAL.HOSTNAME = "vivu.uni.me";
	//GLOBAL.IP = "127.0.0.1";
	GLOBAL.__dirname = __dirname;
var app = express();
app.configure(function () {
    app.use(express.logger('dev'));     /* 'default', 'short', 'tiny', 'dev' */
    app.use(express.bodyParser());
	app.use(express.static(__dirname + '/public/html'));
});	


app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);





app.get('/$',function (req, res){
	 res.render('homepage.html');
});

app.get('/audio/flash',function (req, res){
	try{
		var filePath = __dirname + "/public/flash/dewplayer.swf";
		var audioFile = fs.statSync(filePath);
		res.setHeader('Content-Type', 'application/x-shockwave-flash');
		res.setHeader('Content-Length',audioFile.size);
		
		var readStream = fs.createReadStream(filePath);
		readStream.on('data', function(data) {
	        res.write(data);
	    });
	     readStream.on('end', function() {
	        res.end();        
	    });
    }
    catch(e){
    	console.log("Error when process get /audio/:id, error: "+ e);
    	res.send("Error from server");
    }
});

app.get('/cfs/audio/:id',function (req, res){
	try{
		var audioId = req.params.id;
		var ip = GLOBAL.IP;
		var host = ip+":8888";
		var source = "http://"+host+"/public/audio/"+audioId+".mp3";
		res.render('index1.html',
		{ 
			sourceurl:source, 
			sourceid: audioId
		});
	}
	catch(e){
		console.log("Error when process get cfs/audio/:id, error: "+ e);
    	res.send("Error from server");
	}
});

/*
app.get('/cfs/audio/:id',function (req, res)
{
	console.log("hostname:"+os.hostname());
	try{
		var audioId = req.params.id;
		var ip = GLOBAL.IP;
		var host = ip+":8888";
		var source = "http://"+host+"/public/audio/"+audioId+".mp3";
		//var source = "http://s91.stream.nixcdn.com/3ce626c71801e67a340ef3b7997001be/51828581/NhacCuaTui025/RingBackTone-SunnyHill_4g6z.mp3";
	    res.render(__dirname + '/public/template/index.jade', {sourceurl:source, sourceid: audioId});
	    
	}
	catch(e){
		console.log("Error when process get cfs/audio/:id, error: "+ e);
    	res.send("Error from server");
	}
});
*/

/*
app.get('/audio/:id',function (req, res)
{
	try{
		var audioId = req.params.id;
		var filePath = __dirname + "/public/audio/"+audioId+".mp3";
		var audioFile = fs.statSync(filePath);
		res.setHeader('Content-Type', 'audio/mpeg');
		res.setHeader('Content-Length',audioFile.size);
		
		var readStream = fs.createReadStream(filePath);
		readStream.on('data', function(data) {
	        res.write(data);
	    });
	     readStream.on('end', function() {
	        res.end();        
	    });
    }
    catch(e){
    	console.log("Error when process get /audio/:id, error: "+ e);
    	res.send("Error from server");
    }
});
*/

/*
app.get('/wines', wine.findAll);
app.get('/wines/:id', wine.findById);
app.post('/wines', wine.addWine);
app.put('/wines', wine.updateWine);
app.delete('/wines/:id', wine.deleteWine);
*/

//gcm service
//app.get('/services/gcm',  bllUsers);

// user service
app.get('/services/users', user.findAllUsers);
//app.get('/services/users/:id', user.findUserByUserId);
app.get('/services/users/:facebookid',user.findUserByFacebookID);
app.post('/services/users/searchname', user.findUserByUserName);
app.post('/services/users', user.addUser);
app.put('/services/users/:id', user.updateUser);
app.delete('/services/users/:id', user.deleteUserByUserId);
app.delete('/services/users', user.deleteAllUsers);

//contact service
app.get('/services/contacts', contact.findAllContacts);
app.get('/services/contacts/byuserid/:id', contact.getAllContactByUserId);
app.post('/services/contacts', contact.addContact);
app.delete('/services/contacts', contact.deleteAllContacts);
/*
app.post('/services/contacts', user.addUser);
app.put('/services/contacts/:id', user.updateUser);
app.delete('/services/contacts/:id', user.deleteUserByUserId);

*/

//inbox service
app.post('/services/inboxs/delete', inbox.deleteInboxs);
app.post('/services/inboxs', inbox.addInbox);
app.get('/services/inboxs', inbox.findAllInboxs);
app.get('/services/inboxs/byuserid/:id', inbox.findInboxByUserId);
app.delete('/services/inboxs', inbox.deleteAllInboxs);
app.put('/services/inboxs', inbox.updateInboxs);
//app.put('/services/inbox', inbox.updateInbox);


//outbox service
app.post('/services/outboxs/delete', outbox.deleteOutboxs);
app.post('/services/outboxs', outbox.addOutbox);
app.get('/services/outboxs', outbox.findAllInboxs);
app.get('/services/outboxs/byuserid/:id', outbox.findOutboxByUserId);
app.delete('/services/outboxs', outbox.deleteAllOutboxs);

//device service
app.post('/services/devices', device.addDevice);
app.get('/services/devices', device.getAllDevices);
app.get('/services/devices/byuserid/:id', device.getAllDevicesByUserId);
app.delete('/services/devices', device.deleteAllDevices);

//audio service
app.post('/upload', audio.uploadAudio);
app.get('/upload/view', function(req, res){
  res.send(
      '<form action="/upload" method="post" enctype="multipart/form-data">'+
      '<input type="file" name="source">'+
      '<input type="submit" value="Upload">'+
      '</form>'
  );
});

/************************test******************************************/
app.get('/convert', function(req, res){
	function removeSubstring(str,strrm){
		var newstr = str.replace(strrm,""); 
		return newstr;
	}
	GLOBAL.__staticDir = removeSubstring(GLOBAL.__dirname,"/vivuserver/trunk");
	var audioDir = GLOBAL.__staticDir + "/staticserver/public/audio/";
	var soundlib = new GLOBAL.Sound;
	soundlib.convertWavToMp3(audioDir + "24.wav",audioDir + "testout1.mp3");
	res.send("Ok");
});

/************************end test******************************************/


app.listen(GLOBAL.PORT);
console.log('Listening on port 3000...');
