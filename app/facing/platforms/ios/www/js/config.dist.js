var config = {

	/* General Application Settings */
	app:
	{
		/* Name of Application */
		title: 'Facing App',

		env: 'dev',

		dev: {

			base: 'http://127.0.0.1:4000',

			/* Development Socket IO */
			socket: {

				/* URL for Development Socket IO JavaScript File */
				js: 'http://127.0.0.1:4000/socket.io/socket.io.js',

				/* URL for Development Socket Server */
				io: 'http://127.0.0.1:4000'
			}
		},
		prod: {

			base: 'https://app.mywebsite.com',

			/* Development Socket IO */
			socket: {
				/* URL for Production Socket IO JavaScript File */
				js: 'https://app.mywebsite.com/socket.io/socket.io.js',

				/* URL for Production Socket Server */
				io: 'https://app.mywebsite.com:443'
			}
		}
	},

	/* Google Settings */
	google: {

		/* Analytics Code for Mobile App */
		analytics: 'UA-XXXXXXXX-X'
	}
};