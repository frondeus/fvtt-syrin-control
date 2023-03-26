const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('cypress/fixtures/api/db.json');
const db = require('./cypress/fixtures/api/db.json');
const middlewares = jsonServer.defaults();

const expectedAuthToken = require('./cypress.env.json').authToken;

const authMiddleware = (req, res, next) => {
	const authToken = req.query['auth_token'];
	console.log('AUTH_TOKEN: ', authToken);
	if (authToken === expectedAuthToken) {
		next();
	} else {
		res.sendStatus(401);
	}
};

server.use(middlewares);
server.use(authMiddleware);
server.use((req, res, next) => {
	const soundsetUUID = req.query['soundset__uuid'];
	if (!!soundsetUUID) {
		console.log('Soundset UUID', soundsetUUID);
		//console.log('MOODS', db.soundsetMoods, soundsetUUID);
		let moods = db.soundsetMoods[soundsetUUID];
		if (!!moods) {
			//console.log('ROUTER', moods);
			res.jsonp(moods);
		} else {
			res.jsonp([]);
		}
	} else {
		next();
	}
});
server.use(router);

server.listen(3210, () => {
	console.log('JSON Server is running');
});
