var app = {

	platform: (typeof device != 'undefined') ? device.platform : 'desktop',
    socket: (typeof io != 'undefined') ? io.connect('https://app.youfacing.me:443') : null,
    my_name: null,
    my_space: 'Main',
    initialized: false,
    location_data: {},

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

            if(device)
            {
                app.my_name = device.uuid;
            }

            setTimeout(function() {
                navigator.splashscreen.hide();
            }, 2000);

            app.hardware.start();
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

					if(typeof app.location_data.accelerometer !== 'undefined' && typeof app.location_data.compass !== 'undefined' && typeof app.location_data.geolocation !== 'undefined')
					{
						app.sendData();
						gui.render.self();
					}

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
					return false;
				}

				try
				{
					app.hardware.compass.obj = navigator.compass.watchHeading(
						app.hardware.compass.success,
						app.hardware.compass.error,
						app.hardware.compass.settings
					);
				}
				catch(err)
				{
					app.util.debug('error', err.message);
				}
			},
			stop: function()
			{
				try
				{
					navigator.compass.clearWatch(app.hardware.compass.obj);
					app.hardware.compass.obj = null;
				}
				catch(err)
				{
					app.util.debug('error', err.message);
				}
			},
			success: function(heading)
			{
				app.location_data.compass = {
					direction: app.hardware.compass.direction(heading.magneticHeading),
					magnetic_heading: heading.magneticHeading
				};
			},
			error: function(error)
			{
				if(error.message)
				{
					app.util.debug('error', 'Compass Error: ' + error.message);
					jQuery('.me .compass ul').html('<li class="error">'+ error.message +'</li>');
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
					return false;
				}

				try
				{
					app.hardware.geolocation.obj = navigator.geolocation.watchPosition(
						app.hardware.geolocation.success,
						app.hardware.geolocation.error,
						app.hardware.geolocation.settings
					);
				}
				catch(err)
				{
					app.util.debug('error', err.message);
				}
			},
			stop: function()
			{
				try
				{
					navigator.geolocation.clearWatch(app.hardware.geolocation.obj);
					app.hardware.geolocation.obj = null;
				}
				catch(err)
				{
					app.util.debug('error', err.message);
				}
			},
			success: function(position)
			{
				app.location_data.geolocation = {
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
				jQuery('.me .geolocation ul').html('<li class="error">'+ error.message +'</li>');
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
					return false;
				}

				try
				{
					app.hardware.accelerometer.obj = navigator.accelerometer.watchAcceleration(
						app.hardware.accelerometer.success,
						app.hardware.accelerometer.error,
						app.hardware.accelerometer.settings
					);
				}
				catch(err)
				{
					app.util.debug('error', err.message);
				}
			},
			stop: function()
			{
				try
				{
					navigator.accelerometer.clearWatch(app.hardware.accelerometer.obj);
					app.hardware.accelerometer.obj = null;
				}
				catch(err)
				{
					app.util.debug('error', err.message);
				}
			},
			success: function(acceleration)
			{
				app.location_data.acceleration = {
					x: acceleration.x,
					y: acceleration.y,
					z: acceleration.z
				};
			},
			error: function()
			{
				app.util.debug('error', 'Failed to use acceleration');
				jQuery('.me .acceleration ul').html('<li class="error">Failed to use acceleration</li>');
			}
		}
	},
    sendData: function()
    {
        app.socket.emit('sendData', JSON.stringify(app.location_data));
    },
	util:
	{
		enable_debug: true,
		debug: function(level, message)
		{
			if(app.util.enable_debug)
			{
				switch(level)
				{
					case 'log':
						console.log(message);
						break;

					case 'warn':
						console.warn(message);
						break;

					case 'debug':
						console.debug(message);
						break;

					case 'error':
						console.error(message);
						break;
				}
			}

			if(typeof message != 'string')
			{
				message = JSON.stringify(message);
			}

			jQuery('#dev-log .output ul').append('<li class="'+ level +'"><i class="fa fa-angle-right"></i>&nbsp; ' + message + '</li>');
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


app.socket.on('connect', function () {
    jQuery('#home .message').html('<i class="fa fa-check"></i>').show().fadeOut('slow');
    app.socket.emit('addFriend', app.my_name);
});

app.socket.on('reconnect', function () {
    jQuery('#home .message').html('<i class="fa fa-history"></i>').show().fadeOut('slow');
});

app.socket.on('disconnect', function () {
    jQuery('#home .message').html('<i class="fa fa-times"></i>').show().fadeOut('slow');
});

app.socket.on('reconnecting', function () {
    jQuery('#home .message').html('<i class="fa fa-circle-o-notch fa-spin"></i>').show().fadeOut('slow');
});

app.socket.on('error', function () {
    jQuery('#home .message').html('<i class="fa fa-exclamation-triangle"></i>').show().fadeOut('slow');
});

app.socket.on('receiveData', function(name, data)
{
    if(name != app.my_name)
    {
        gui.render.friend(data);
        jQuery('#status').html('<i class="fa fa-map-marker"></i>').show();
    }
});

function switchSpace(space)
{
    if(app.socket && app.socket.connected)
    {
        app.socket.emit('switchSpace', space);
    }
}

window.onerror = function(errorMsg, url, lineNumber) {
	app.util.debug('error', "Uncaught error " + errorMsg + " in " + url + ", line " + lineNumber);
};