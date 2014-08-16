/* Copy & Rename File to: config.js */

var config = {

	/* General Application Settings */
	app:
	{
		/* Name of Application */
		title: 'Facing App',

		env: 'dev',

		/* Socket IO */
		socket: {

			dev: {
				/* URL for Development Socket IO JavaScript File */
				js: 'http://127.0.0.1:4000/socket.io/socket.io.js',

				/* URL for Development Socket Server */
				io: 'http://127.0.0.1:4000'
			},
			prod: {
				/* URL for Socket IO JavaScript File */
				js: 'https://app.myserver.com/socket.io/socket.io.js',

				/* URL for Socket Server */
				io: 'https://app.myserver.com:443'
			}
		}
	},

	/* Google Settings */
	google: {

		/* Analytics Code for Mobile App */
		analytics: 'UA-53744207-2'
	}
};