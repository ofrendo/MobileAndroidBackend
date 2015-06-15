var session = require("express-session");

var sessionStore;

exports.getSessionStore = function() {
	if (!sessionStore) {
		sessionStore = new session.MemoryStore();
	}
	return sessionStore;
}

exports.getSessionFromCookie = function(cookie, callback) {
	var sessionStore = exports.getSessionStore();
	var sid = getSID(cookie);
	//console.log("SID: " + sid);
	sessionStore.get(sid, function(param1, session) {
		//console.log(arguments);
		if (typeof(callback) == "function") callback(session);
	});
}

function getSID(cookie) {
	var startIndex = cookie.indexOf("connect.sid");
	var startString = cookie.substring(startIndex + "connect.sid=s%3A".length, cookie.length);
	var endIndex = startString.indexOf(".");
	if (endIndex == -1) {
		endIndex = startString.length;
	}
	var sid = startString.substring(0, endIndex);
	return sid;
}

exports.setUser = function(req, user) {
	delete user["password"];
	req.session.user = user;
	//console.log("----Set user session: ----");
	//console.log(req.session);
}

exports.onCheckSession = function(req, res, next) {
	//console.log("----REQ HEADERS----");
	//console.log(req.);
	if (exports.isLoggedIn(req)) {
		next();			
	}	
	else {
		//console.log("User not logged in:");
		//console.log(req.session);
		res.status(401).send(JSON.stringify({message: "Not logged in."}));
	}
}

exports.isLoggedIn = function(req) {
	return !!req.session.user;
}

exports.doLogout = function(req) {
	delete req.session["user"];
}
