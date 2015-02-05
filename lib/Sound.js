module.exports = function () {
	this.ffmpeg = require('fluent-ffmpeg');
	this.convertWavToMp3 = function(sourcefile,destfile,callback){
		console.log("filesource: " + sourcefile);
		console.log("filedest: " +  destfile);
		var proc = new this.ffmpeg({ source: sourcefile })
  			.withAudioBitrate('128k')
  			.withAudioCodec('libmp3lame')
  			.withAudioChannels(2)
  			.toFormat('mp3')
  			.saveToFile(destfile, function(stdout, stderr) {
    			console.log('Soundfile has been converted succesfully');
    			callback( );	
		});
	}
}