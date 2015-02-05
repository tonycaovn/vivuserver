module.exports = function () {
    // defind gcm
	this.gcm = require('node-gcm');
	
    //define sender by google server API
	this.sender = new this.gcm.Sender('AIzaSyDzDEs9Gf7HR4tZTq_sf8gKprkg-CTSnX0');
    this.registrationIds = [];
    
    this.message = new this.gcm.Message();
	
	this.send = function() { 
		for(var i = 0;i < this.registrationIds.length;i++){
			console.log("registrationIds: " + this.registrationIds[i]);
			this.sender.send(this.message, this.registrationIds[i], 4, function (result) {
				console.log("Sending: "+result);
			});
		}
	};
	
	this.test = function( ){
		console.log("Hello WOrld");
	}
	
	this.addMessageData = function(key,content){
		this.message.addData(key,content);
	}
	this.addRegId = function(id){
		this.registrationIds.push(id); 
	}
	this.addRegIdList = function(idlist){
		this.registrationIds = idlist;
	}
}
