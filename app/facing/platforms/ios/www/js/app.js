var app = {

    socket: io.connect('http://app.youfacing.me:80'),
    my_name: null,
    my_space: 'Main',
    initialized: false,
    watchers: null,

    compass: null,
    geolocation: null,
    acceleration: null,

    location_data: {},

    compassSettings: { frequency: 1000 },
    geolocationSettings: { maximumAge: 1000, timeout: 30000, enableHighAccuracy: true },
    accelerationSettings: { frequency: 1000 },

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

            app.startWatchers();
        }
    },
    clearWatchers: function()
    {
        navigator.compass.clearWatch(app.compass);
        navigator.geolocation.clearWatch(app.geolocation);
        navigator.accelerometer.clearWatch(app.acceleration);

        app.compass = null;
        app.geolocation = null;
        app.acceleration = null;

        clearInterval(app.watchers);
        app.watchers = null;
    },
    startWatchers: function()
    {
        if(app.watchers === null)
        {
            app.watchGeolocation();
            app.watchCompass();
            app.watchAcceleration();

            app.watchers = setInterval(function(){
                app.sendData();
                app.renderMyData();
            }, 1000);
        }
    },
    watchCompass: function()
    {
        app.geolocation = navigator.compass.watchHeading(app.compassSuccess, app.compassError, app.compassSettings);
    },
    watchGeolocation: function()
    {
        app.geolocation = navigator.geolocation.watchPosition(app.geolocationSuccess, app.geolocationError, app.geolocationSettings);
    },
    watchAcceleration: function()
    {
        app.acceleration = navigator.accelerometer.watchAcceleration(app.accelerationSuccess, app.accelerationError, app.accelerationSettings);
    },
    compassSuccess: function(heading)
    {
        app.location_data.compass = {
            direction: app.compassGetDirection(heading.magneticHeading),
            magnetic_heading: heading.magneticHeading
        };
    },
    compassError: function(error)
    {
        console.error('Compass Error: ' + error.message);
        $('.me .compass ul').html('<li class="error">'+ error.message +'</li>');
    },
    compassGetDirection: function(headingDegrees)
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
    },
    geolocationSuccess: function(position)
    {
        app.location_data.geolocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            altitude: app.geolocationDistance( position.coords.altitude ),
            accuracy: app.geolocationDistance( position.coords.accuracy ),
            heading: app.compassGetDirection(position.coords.heading),
            speed: app.geolocationSpeed( position.coords.speed )
        };
    },
    geolocationError: function(error)
    {
        console.error('Geolocation Error: ' + error.message);
        $('.me .geolocation ul').html('<li class="error">'+ error.message +'</li>');
    },
    geolocationDistance: function(value, use_metric)
    {
        var measure = (use_metric) ? +(Math.round(value + "e+2")  + "e-2") : Math.round( value * 3 );
        var unit = (use_metric) ? 'Meters' : 'Feet';

        if(measure < 0)
        {
            measure = 0;
        }

        return measure + ' ' + unit;
    },
    geolocationSpeed: function(value, use_metric)
    {
        var measure = (use_metric) ? Math.round(value) : Math.round( value * 2.23694 );
        var unit = (use_metric) ? 'mps' : 'MPH';

        if(measure < 0)
        {
            measure = 0;
        }

        return measure + ' ' + unit;
    },
    accelerationSuccess: function(acceleration)
    {
        app.location_data.acceleration = {
            x: acceleration.x,
            y: acceleration.y,
            z: acceleration.z
        };
    },
    accelerationError: function()
    {
        console.error('Failed to use acceleration');
        $('.me .acceleration ul').html('<li class="error">Failed to use acceleration</li>');
    },
    renderMyData: function()
    {
        var acceleration = '' +
            '<li><strong>X</strong>:&nbsp; ' + app.location_data.acceleration.x + '</li>' +
            '<li><strong>Y</strong>:&nbsp; ' + app.location_data.acceleration.y + '</li>' +
            '<li><strong>Z</strong>:&nbsp; ' + app.location_data.acceleration.z + '</li>';

        $('.me .acceleration ul').html(acceleration);

        var geolocation = '' +
            '<li><strong>Latitude</strong>:&nbsp; ' + app.location_data.geolocation.latitude + ' &deg;</li>' +
            '<li><strong>Longitude</strong>:&nbsp; ' + app.location_data.geolocation.longitude + ' &deg;</li>' +
            '<li><strong>Altitude</strong>:&nbsp; ' + app.location_data.geolocation.altitude + '</li>' +
            '<li><strong>Accuracy</strong>:&nbsp; ' + app.location_data.geolocation.accuracy + '</li>' +
            '<li><strong>Heading</strong>:&nbsp; ' + app.location_data.geolocation.heading + '</li>' +
            '<li><strong>Speed</strong>:&nbsp; ' + app.location_data.geolocation.speed + '</li>';

        $('.me .geolocation ul').html(geolocation);

        var compass = '' +
            '<li><strong>Direction</strong>:&nbsp; ' + app.location_data.compass.direction + '</li>' +
            '<li><strong>Magnetic Heading</strong>:&nbsp; ' + app.location_data.compass.magnetic_heading + ' &deg;</li>';

        $('.me .compass ul').html(compass);
    },
    renderFriendsData: function(data)
    {
        var location_data = JSON.parse(data);

        var acceleration = '' +
            '<li><strong>X</strong>:&nbsp; ' + location_data.acceleration.x + '</li>' +
            '<li><strong>Y</strong>:&nbsp; ' + location_data.acceleration.y + '</li>' +
            '<li><strong>Z</strong>:&nbsp; ' + location_data.acceleration.z + '</li>';

        $('.friend .acceleration ul').html(acceleration);

        var geolocation = '' +
            '<li><strong>Latitude</strong>:&nbsp; ' + location_data.geolocation.latitude + ' &deg;</li>' +
            '<li><strong>Longitude</strong>:&nbsp; ' + location_data.geolocation.longitude + ' &deg;</li>' +
            '<li><strong>Altitude</strong>:&nbsp; ' + location_data.geolocation.altitude + '</li>' +
            '<li><strong>Accuracy</strong>:&nbsp; ' + location_data.geolocation.accuracy + '</li>' +
            '<li><strong>Heading</strong>:&nbsp; ' + location_data.geolocation.heading + '</li>' +
            '<li><strong>Speed</strong>:&nbsp; ' + location_data.geolocation.speed + '</li>';

        $('.friend .geolocation ul').html(geolocation);

        var compass = '' +
            '<li><strong>Direction</strong>:&nbsp; ' + location_data.compass.direction + '</li>' +
            '<li><strong>Magnetic Heading</strong>:&nbsp; ' + location_data.compass.magnetic_heading + ' &deg;</li>';

        $('.friend .compass ul').html(compass);
    },
    sendData: function()
    {
        app.socket.emit('sendData', JSON.stringify(app.location_data));
    }
};


app.socket.on('connect', function () {
    $('#status').html('<i class="fa fa-check"></i>').show().fadeOut('slow');
    app.socket.emit('addFriend', app.my_name);
});

app.socket.on('reconnect', function () {
    $('#status').html('<i class="fa fa-history"></i>').show().fadeOut('slow');
});

app.socket.on('disconnect', function () {
    $('#status').html('<i class="fa fa-times"></i>').show().fadeOut('slow');
});

app.socket.on('reconnecting', function () {
    $('#status').html('<i class="fa fa-circle-o-notch fa-spin"></i>').show().fadeOut('slow');
});

app.socket.on('error', function () {
    $('#status').html('<i class="fa fa-exclamation-triangle"></i>').show().fadeOut('slow');
});

app.socket.on('receiveData', function(name, data)
{
    if(name != app.my_name)
    {
        app.renderFriendsData(data);
        $('#status').html('<i class="fa fa-map-marker"></i>').show();
    }
});

function switchSpace(space)
{
    if(app.socket && app.socket.connected)
    {
        app.socket.emit('switchSpace', space);
    }
}
