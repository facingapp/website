var app = {

	platform: (typeof device != 'undefined') ? device.platform : 'desktop',
    socket: null,
    uuid: null,
    initialized: false,
    user_data: {
	    app: {
		    device: this.platform,
		    dataType: 'stream'
	    }
    },
    initialize: function()
    {
        this.bindEvents();
    },
    bindEvents: function()
    {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    onDeviceReady: function()
    {
        app.receivedEvent('deviceready');
    },
    receivedEvent: function(id)
    {
        if(id == 'deviceready' && app.initialized === false)
        {
            app.initialized = true;

	        if(app.socket == null && typeof io != 'undefined')
	        {
		        var io_url = (config.app.env == 'dev')
			        ? config.app.socket.dev.io
			        : config.app.socket.prod.io;

		        app.socket = io.connect(io_url);
		        app.io.init();

		        app.util.debug('debug', 'Connecting to Socket on ' + io_url);
	        }

	        app.stats.init();

            if(device)
            {
                app.uuid = device.uuid;
            }

            setTimeout(function() {
                navigator.splashscreen.hide();
            }, 2000);

            app.hardware.start();
        }
    },
	stats: {
		init: function()
		{
			if(typeof analytics !== 'undefined')
			{
				analytics.startTrackerWithId(config.google.analytics);
				analytics.trackView(config.app.title);
				analytics.setUserId('my-user-id');
			}
		},
		event: function(category, action, label, value)
		{
			if(typeof analytics !== 'undefined')
			{
				analytics.trackEvent(category, action, label, value);
			}

			app.util.debug('debug', 'Event: ' + category + ' | ' + action + ' | ' + label);
		}
	},
	io:
	{
		init: function()
		{
			app.util.debug('log', 'Socket Initialized');

			app.socket.on('connect', function(){
				gui.render.status('<i class="fa fa-check"></i>', true);
				app.util.debug('log', 'Socket Connected');

				app.stats.event('Socket', 'Status', 'Connected');
			});

			app.socket.on('reconnect', function () {
				gui.render.status('<i class="fa fa-history"></i>', true);
				app.util.debug('log', 'Socket Reconnected');

				app.stats.event('Socket', 'Status', 'Reconnected');
			});

			app.socket.on('disconnect', function () {
				gui.render.status('<i class="fa fa-times"></i>', true);
				app.util.debug('log', 'Socket Disconnected');

				app.stats.event('Socket', 'Status', 'Disconnected');
			});

			app.socket.on('reconnecting', function () {
				gui.render.status('<i class="fa fa-circle-o-notch fa-spin"></i>', true);
				app.util.debug('log', 'Socket Reconnecting');

				app.stats.event('Socket', 'Status', 'Reconnecting');
			});

			app.socket.on('error', function () {
				gui.render.status('<i class="fa fa-exclamation-triangle"></i>', true);
				app.util.debug('error', 'Socket Error');

				app.stats.event('Socket', 'Status', 'Error');
			});

			app.socket.on('receiveData', function(name, data)
			{
				if(name != app.uuid)
				{
					gui.render.friend(data);
					gui.render.status('<i class="fa fa-map-marker"></i>', true);
					app.util.debug('log', 'Socket Received Data');
					app.util.debug('log', data);
				}
			});
		},
		createSpace: function(invite_code)
		{
			app.socket.emit('createSpace', invite_code, app.uuid);

			app.stats.event('Socket', 'Create', 'New Space ' + invite_code + ' created by ' + app.uuid);
		},
		joinSpace: function(invite_code)
		{
			app.socket.emit('switchSpace', invite_code, app.uuid);

			app.stats.event('Socket', 'Join', app.uuid + ' joined ' + invite_code);
		}
	},
	hardware:
	{
		timer: null,
		start: function()
		{
			if(app.hardware.timer === null)
			{
				app.hardware.accelerometer.start();
				app.hardware.compass.start();
				app.hardware.geolocation.start();

				app.hardware.timer = setInterval(function(){

					if(typeof app.user_data.accelerometer !== 'undefined' && typeof app.user_data.compass !== 'undefined' && typeof app.user_data.geolocation !== 'undefined')
					{
						app.sendData();
					}

					gui.render.self.debug();

				}, 1000);
			}
		},
		stop: function()
		{
			if(app.hardware.accelerometer.obj)
			{
				app.hardware.accelerometer.stop();
			}
			if(app.hardware.compass.obj)
			{
				app.hardware.compass.stop();
			}
			if(app.hardware.geolocation.obj)
			{
				app.hardware.geolocation.stop();
			}

			clearInterval(app.hardware.timer);
			app.hardware.timer = null;
		},
		compass:
		{
			obj: null,
			settings: {
				frequency: 1000
			},
			start: function()
			{
				if(typeof navigator.compass == 'undefined')
				{
					app.util.debug('warn', 'No Compass Found');
					app.stats.event('Hardware', 'Missing', 'No Compass Found');
					return false;
				}

				try
				{
					app.hardware.compass.obj = navigator.compass.watchHeading(
						app.hardware.compass.success,
						app.hardware.compass.error,
						app.hardware.compass.settings
					);

					app.stats.event('Hardware', 'Watching', 'Compass');
				}
				catch(err)
				{
					app.util.debug('error', err.message);
					app.stats.event('Hardware', 'Error', ' Failed to Watch Compass');
				}
			},
			stop: function()
			{
				try
				{
					navigator.compass.clearWatch(app.hardware.compass.obj);
					app.hardware.compass.obj = null;

					app.stats.event('Hardware', 'Stop Watching', 'Compass');
				}
				catch(err)
				{
					app.util.debug('error', err.message);
				}
			},
			success: function(heading)
			{
				app.user_data.compass = {
					direction: app.hardware.compass.direction(heading.magneticHeading),
					magnetic_heading: heading.magneticHeading
				};
			},
			error: function(error)
			{
				if(error.message)
				{
					app.util.debug('error', 'Compass Error: ' + error.message);
					app.stats.event('Hardware', 'Error', 'Compass Error: ' + error.message);
				}
			},
			direction: function(headingDegrees)
			{
				if (headingDegrees < 0 || headingDegrees > 360 || isNaN(headingDegrees) )
				{
					return "--";
				}
				else if (headingDegrees >= 0 && headingDegrees <= 11.25)
				{
					return "N";
				}
				else if (headingDegrees > 348.75 && headingDegrees <= 360)
				{
					return "N";
				}
				else if (headingDegrees > 11.25 && headingDegrees <= 33.75)
				{
					return "NNE";
				}
				else if (headingDegrees > 33.75 && headingDegrees <= 56.25)
				{
					return "NE";
				}
				else if (headingDegrees > 56.25 && headingDegrees <= 78.75)
				{
					return "ENE";
				}
				else if (headingDegrees > 78.75 && headingDegrees <= 101.25)
				{
					return "E";
				}
				else if (headingDegrees > 101.25 && headingDegrees <= 123.75)
				{
					return "ESE";
				}
				else if (headingDegrees > 123.75 && headingDegrees <= 146.25)
				{
					return "SE";
				}
				else if (headingDegrees > 146.25 && headingDegrees <= 168.75)
				{
					return "SSE";
				}
				else if (headingDegrees > 168.75 && headingDegrees <= 191.25)
				{
					return "S";
				}
				else if (headingDegrees > 191.25 && headingDegrees <= 213.75)
				{
					return "SSW";
				}
				else if (headingDegrees > 213.75 && headingDegrees <= 236.25)
				{
					return "SW";
				}
				else if (headingDegrees > 236.25 && headingDegrees <= 258.75)
				{
					return "WSW";
				}
				else if (headingDegrees > 258.75 && headingDegrees <= 281.25)
				{
					return "W";
				}
				else if (headingDegrees > 281.25 && headingDegrees <= 303.75)
				{
					return "WNW";
				}
				else if (headingDegrees > 303.75 && headingDegrees <= 326.25)
				{
					return "NW";
				}
				else if (headingDegrees > 326.25 && headingDegrees <= 348.75)
				{
					return "NNW";
				}
			}
		},
		geolocation:
		{
			obj: null,
			settings:
			{
				maximumAge: 1000,
				timeout: 30000,
				enableHighAccuracy: true
			},
			start: function()
			{
				if(typeof navigator.geolocation == 'undefined')
				{
					app.util.debug('warn', 'No GPS Found');
					app.stats.event('Hardware', 'Missing', 'No GPS Found');
					return false;
				}

				try
				{
					app.hardware.geolocation.obj = navigator.geolocation.watchPosition(
						app.hardware.geolocation.success,
						app.hardware.geolocation.error,
						app.hardware.geolocation.settings
					);

					app.stats.event('Hardware', 'Watching', 'GPS');
				}
				catch(err)
				{
					app.util.debug('error', err.message);
					app.stats.event('Hardware', 'Error', 'Failed to Watch GPS');
				}
			},
			stop: function()
			{
				try
				{
					navigator.geolocation.clearWatch(app.hardware.geolocation.obj);
					app.hardware.geolocation.obj = null;

					app.stats.event('Hardware', 'Stop Watching', 'GPS');
				}
				catch(err)
				{
					app.util.debug('error', err.message);
				}
			},
			success: function(position)
			{
				app.user_data.geolocation = {
					latitude: position.coords.latitude,
					longitude: position.coords.longitude,
					altitude: app.hardware.geolocation.distance( position.coords.altitude ),
					accuracy: app.hardware.geolocation.distance( position.coords.accuracy ),
					heading: app.hardware.compass.direction(position.coords.heading),
					speed: app.hardware.geolocation.speed( position.coords.speed )
				};
			},
			error: function(error)
			{
				app.util.debug('error', 'Geolocation Error: ' + error.message);
				app.stats.event('Hardware', 'Error', 'Geolocation Error: ' + error.message);
			},
			distance: function(value, use_metric)
			{
				var measure = (use_metric) 
					? +(Math.round(value + "e+2")  + "e-2") 
					: Math.round( value * 3 );
				
				var unit = (use_metric) ? 'Meters' : 'Feet';

				if(measure < 0)
				{
					measure = 0;
				}

				return measure + ' ' + unit;
			},
			speed: function(value, use_metric)
			{
				var measure = (use_metric) 
					? Math.round(value) 
					: Math.round( value * 2.23694 );
				var unit = (use_metric) ? 'mps' : 'MPH';

				if(measure < 0)
				{
					measure = 0;
				}

				return measure + ' ' + unit;
			}
		},
		accelerometer:
		{
			obj: null,
			settings:
			{
				frequency: 1000
			},
			start: function()
			{
				if(typeof navigator.accelerometer == 'undefined')
				{
					app.util.debug('warn', 'No Accelerometer Found');
					app.stats.event('Hardware', 'Missing', 'No Accelerometer Found');
					return false;
				}

				try
				{
					app.hardware.accelerometer.obj = navigator.accelerometer.watchAcceleration(
						app.hardware.accelerometer.success,
						app.hardware.accelerometer.error,
						app.hardware.accelerometer.settings
					);

					app.stats.event('Hardware', 'Watching', 'Accelerometer');
				}
				catch(err)
				{
					app.util.debug('error', err.message);
					app.stats.event('Hardware', 'Error', 'Failed to Watch Accelerometer');
				}
			},
			stop: function()
			{
				try
				{
					navigator.accelerometer.clearWatch(app.hardware.accelerometer.obj);
					app.hardware.accelerometer.obj = null;

					app.stats.event('Hardware', 'Stop Watching', 'Accelerometer');
				}
				catch(err)
				{
					app.util.debug('error', err.message);
				}
			},
			success: function(acceleration)
			{
				app.user_data.acceleration = {
					x: acceleration.x,
					y: acceleration.y,
					z: acceleration.z
				};
			},
			error: function()
			{
				app.util.debug('error', 'Failed to use Accelerometer');
				app.stats.event('Hardware', 'Error', 'Failed to use Accelerometer');
			}
		}
	},
    sendData: function()
    {
        app.socket.emit('sendData', JSON.stringify(app.user_data));
    },
	util:
	{
		enableDebug: true,
		debug: function(level, message)
		{
			if(app.util.enableDebug)
			{
				var Debug = Error;

				Debug.prototype.warn = function(){
					var args = Array.prototype.slice.call(arguments,0),suffix=this.lineNumber?'line: '+this.lineNumber:"\n"+this.stack;
					console.warn.apply(console, args.concat([suffix]));
				};

				Debug.prototype.error = function(){
					var args = Array.prototype.slice.call(arguments,0),suffix=this.lineNumber?'line: '+this.lineNumber:"\n"+this.stack;
					console.error.apply(console, args.concat([suffix]));
				};

				switch(level)
				{
					case 'log':
						console.log(message);
						break;

					case 'debug':
						console.debug(message);
						break;

					case 'warn':
						Debug().warn(message);
						break;

					case 'error':
						Debug().error(message);
						break;
				}
			}

			if(typeof message != 'string')
			{
				message = JSON.stringify(message);
			}

			gui.render.debug(level, message);
		},
		generateUID: function()
		{
			var UID = '';
			var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

			for(var i=0; i < 10; i++)
			{
				UID += possible.charAt(Math.floor(Math.random() * possible.length));
			}

			return UID;
		}
	}
};

window.onerror = function(errorMsg, url, lineNumber) {
	console.error("Uncaught error " + errorMsg + " in " + url + ", line " + lineNumber);
};