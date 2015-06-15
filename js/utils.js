var md5 = require("blueimp-md5").md5;

exports.md5 = md5;

exports.setAvatar = function(object, emailMD5) {
	object.avatar = "http://www.gravatar.com/avatar/" + emailMD5 + "?d=identicon";
}