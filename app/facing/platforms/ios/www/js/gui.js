var gui = {

	timeout: null,
	initialize: function()
	{
		app.util.debug('log', 'Setting up GUI');

		if(typeof StatusBar !== 'undefined')
		{
			StatusBar.hide();
		}

		setTimeout(function(){
			$('.welcome').addClass('animated fadeInUp').show();
		}, 1500);

		setTimeout(function(){
			$('.welcome').addClass('animated fadeOutDown').show();
		}, 6000);

		jQuery('.status .message').fadeOut('slow');

		jQuery('.find-a-friend').click(function(){

			app.util.debug('log', 'Find a Friend');

			navigator.contacts.pickContact(function(contact){

				jQuery('.reset-gui').fadeIn();

				var name = contact.name.formatted;

				app.util.debug('log', 'name: ' + name);
				app.util.debug('log', typeof name);

				jQuery('.status .message').html('Contact ' + name).fadeIn();

				var contact_image = jQuery('.find-a-friend');
					contact_image.removeClass('no-image default');

				if(contact && contact.photos && contact.photos[0].value != '')
				{
					contact_image.css('background-image', 'url("'+ contact.photos[0].value +'")');
				}
				else
				{
					contact_image.css('background-image', '');
					contact_image.addClass('no-image');
				}

				contact_image.addClass('contact');
				contact_image.css('background-position', '0px 0px');

				var subject = encodeURIComponent('Facing App Invite');
				var message = encodeURIComponent('Your friend would like you to use Facing: https://app.youfacing.me/invite/code');

				var number = (contact.phoneNumbers.length > 0)
					? contact.phoneNumbers[0].value
					: '';

				if(number !== '')
				{
					var re = /[^0-9]/;
					number = number.replace(re, '');

					if(app.platform == 'Android')
					{
						jQuery('#sms').attr('href', 'sms:'+ number +'?body=' + message).show();
					}
					else if(app.platform == 'iPhone' || app.platform == 'desktop')
					{
						jQuery('#sms').attr('href', 'sms:'+ number +';body=' + message).show();
					}
				}
				else
				{
					jQuery('#sms').hide();
				}

				var email = (contact.emails.length > 0)
					? contact.emails[0].value
					: '';

				if(email !== '')
				{
					jQuery('#email').attr('href', 'mailto:'+ email +'?subject='+ subject +'&body=' + message).show();
				}
				else
				{
					jQuery('#email').hide();
				}

				jQuery('.contact-options').fadeIn();

			},function(err){
				app.util.debug('log', 'Error: ' + err);
				jQuery('.status .message').html('<i class="fa fa-times-circle"></i> Error Retrieving Contact').fadeOut('slow');
				jQuery('.contact-options').fadeOut();
				return false;
			});
		});

		var items = jQuery('.slide');
		var content = jQuery('.content');

		function open() {
			jQuery(items).removeClass('close').addClass('open');
		}

		function close() {
			jQuery(items).removeClass('open').addClass('close');
		}

		jQuery('#navToggle').on('touchstart', function(event) {
			event.stopPropagation();
			event.preventDefault();
			if (content.hasClass('open')) {
				close();
			} else {
				open();
			}
		});
		content.click(function() {
			if (content.hasClass('open')) {
				close();
			}
		});
		jQuery('nav a').click(function(){
			jQuery('nav a').removeClass('active');
			jQuery('.panel').removeClass('active');

			var panel = jQuery(this).data('panel');
			var label = jQuery(this).html();

			jQuery(this).addClass('active');
			jQuery('#' + panel).addClass('active');

			jQuery('header .label').html(label);

			jQuery('#navToggle').trigger('touchstart');

			if(panel == 'home')
			{
				gui.reset();
			}
			else
			{
				jQuery('.logo').fadeOut('fast');
			}

			if(panel == 'my-data' || panel == 'friends-data')
			{
				app.hardware.start();
			}
			else
			{
				app.hardware.stop();
			}
		});

		clearTimeout(gui.timeout);

		jQuery('.logo').fadeIn(2500);

		var user_shuffle = 0;
		setInterval(function(){
			var friends = jQuery('.find-a-friend.default');
			var width = friends.width();

			user_shuffle++;

			if(user_shuffle > 9)
			{
				user_shuffle = 0;
			}

			var position = -(user_shuffle * width);

			friends.css({ 'background-position': position + 'px 0' });
		}, 4000);

		jQuery('.clear-log').click(function(){
			jQuery('#dev-log .output ul').html('');
		});

		var platform = (typeof device != 'undefined') ? device.platform : 'desktop';

		jQuery('html').addClass(platform.toLowerCase());

		jQuery('.force-reset-gui').click(function(){
			app.util.debug('log', 'Resetting GUI ...');
			gui.reset();
		});
	},
	reset: function()
	{
		jQuery('.reset-gui').fadeOut();
		jQuery('.logo').fadeIn(2500).removeClass('animated fadeInDown');
		jQuery('.find-a-friend').attr('style', '').removeClass('animated flipInX no-image');
		jQuery('.contact-options').hide();
		jQuery('.status .message').html('').hide();
		jQuery('.me .acceleration ul').html('');
		jQuery('.me .geolocation ul').html('');
		jQuery('.me .compass ul').html('');
		jQuery('.friend .acceleration ul').html('');
		jQuery('.friend .geolocation ul').html('');
		jQuery('.friend .compass ul').html('');
		jQuery('.welcome').removeClass('animated fadeInUp fadeOutDown').hide();

		setTimeout(function(){
			jQuery('.find-a-friend').addClass('default animated flipInX');
			jQuery('.logo').addClass('animated fadeInDown');
		}, 100);

		setTimeout(function(){
			jQuery('.welcome').addClass('animated fadeInUp').show();
		}, 1500);

		setTimeout(function(){
			jQuery('.welcome').addClass('animated fadeOutDown').show();
		}, 6000);

		// @todo: kill any open socket connections

		app.util.debug('log', 'GUI Reset');
	},
	render:
	{
		self:
		{
			debug: function()
			{
				if(typeof app.location_data.acceleration != 'undefined')
				{
					var acceleration = '' +
						'<li><strong>X</strong>:&nbsp; ' + app.location_data.acceleration.x + '</li>' +
						'<li><strong>Y</strong>:&nbsp; ' + app.location_data.acceleration.y + '</li>' +
						'<li><strong>Z</strong>:&nbsp; ' + app.location_data.acceleration.z + '</li>';

					jQuery('.me .acceleration ul').html(acceleration);
				}

				if(typeof app.location_data.geolocation != 'undefined')
				{
					var geolocation = '' +
						'<li><strong>Latitude</strong>:&nbsp; ' + app.location_data.geolocation.latitude + ' &deg;</li>' +
						'<li><strong>Longitude</strong>:&nbsp; ' + app.location_data.geolocation.longitude + ' &deg;</li>' +
						'<li><strong>Altitude</strong>:&nbsp; ' + app.location_data.geolocation.altitude + '</li>' +
						'<li><strong>Accuracy</strong>:&nbsp; ' + app.location_data.geolocation.accuracy + '</li>' +
						'<li><strong>Heading</strong>:&nbsp; ' + app.location_data.geolocation.heading + '</li>' +
						'<li><strong>Speed</strong>:&nbsp; ' + app.location_data.geolocation.speed + '</li>';

					jQuery('.me .geolocation ul').html(geolocation);
				}

				if(typeof app.location_data.compass != 'undefined')
				{
					var compass = '' +
						'<li><strong>Direction</strong>:&nbsp; ' + app.location_data.compass.direction + '</li>' +
						'<li><strong>Magnetic Heading</strong>:&nbsp; ' + app.location_data.compass.magnetic_heading + ' &deg;</li>';

					jQuery('.me .compass ul').html(compass);
				}
			}
		},
		friend:
		{
			debug: function(data)
			{
				var location_data = JSON.parse(data);

				if(typeof location_data.acceleration != 'undefined')
				{
					var acceleration = '' +
						'<li><strong>X</strong>:&nbsp; ' + location_data.acceleration.x + '</li>' +
						'<li><strong>Y</strong>:&nbsp; ' + location_data.acceleration.y + '</li>' +
						'<li><strong>Z</strong>:&nbsp; ' + location_data.acceleration.z + '</li>';

					jQuery('.friend .acceleration ul').html(acceleration);
				}

				if(typeof location_data.geolocation != 'undefined')
				{
					var geolocation = '' +
						'<li><strong>Latitude</strong>:&nbsp; ' + location_data.geolocation.latitude + ' &deg;</li>' +
						'<li><strong>Longitude</strong>:&nbsp; ' + location_data.geolocation.longitude + ' &deg;</li>' +
						'<li><strong>Altitude</strong>:&nbsp; ' + location_data.geolocation.altitude + '</li>' +
						'<li><strong>Accuracy</strong>:&nbsp; ' + location_data.geolocation.accuracy + '</li>' +
						'<li><strong>Heading</strong>:&nbsp; ' + location_data.geolocation.heading + '</li>' +
						'<li><strong>Speed</strong>:&nbsp; ' + location_data.geolocation.speed + '</li>';

					jQuery('.friend .geolocation ul').html(geolocation);
				}

				if(typeof location_data.compass != 'undefined')
				{
					var compass = '' +
						'<li><strong>Direction</strong>:&nbsp; ' + location_data.compass.direction + '</li>' +
						'<li><strong>Magnetic Heading</strong>:&nbsp; ' + location_data.compass.magnetic_heading + ' &deg;</li>';

					jQuery('.friend .compass ul').html(compass);
				}
			}
		}
	}
};
