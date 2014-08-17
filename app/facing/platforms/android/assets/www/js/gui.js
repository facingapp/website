var gui = {

	timeout: {},
	currentPanel: 'home',
	base: (config.app.env == 'dev') ? config.app.dev.base : config.app.prod.base,
	initialize: function()
	{
		app.util.debug('log', 'Setting up GUI');

		gui.prepareDevice();
		gui.handle.navigation();
		gui.handle.contacts();
		gui.animate();
	},
	prepareDevice: function()
	{
		app.util.debug('log', 'Preparing Device');

		if(typeof StatusBar !== 'undefined')
		{
			StatusBar.hide();
		}

		var platform = (typeof device != 'undefined') ? device.platform : 'desktop';

		$('html').addClass(platform.toLowerCase());
	},
	handle:
	{
		navigation: function(){

			app.util.debug('log', 'Setting up Navigation');

			var items = $('.slide');
			var content = $('.content');

			$('#navToggle').on('touchstart mousedown', function(event) {
				event.stopPropagation();
				event.preventDefault();

				if (content.hasClass('open'))
				{
					$(items).removeClass('open').addClass('close');
					app.stats.event('Navigation', 'Menu', 'Close');
				}
				else
				{
					$(items).removeClass('close').addClass('open');
					app.stats.event('Navigation', 'Menu', 'Open');
				}

				return false;
			});

			content.on('touchstart mousedown', function(){
				if (content.hasClass('open'))
				{
					$(items).removeClass('open').addClass('close');
					app.stats.event('Navigation', 'Menu', 'Closed by Page Tap');
				}
			});

			$('nav a').on('touchstart mousedown', function(){

				var panel = $(this).data('panel');
				var label = $(this).html();

				// Do nothing if user clicks tab for current panel
				if(panel == gui.currentPanel)
				{
					$('#navToggle').trigger('touchstart');
					return false;
				}

				app.stats.event('Navigation', 'Page Change', panel);

				$('nav a').removeClass('active');
				$('.panel').removeClass('active');

				gui.currentPanel = panel;

				$(this).addClass('active');
				$('#' + panel).addClass('active');

				$('header .label').html(label);

				$('#navToggle').trigger('touchstart');

				if(panel == 'home')
				{
					gui.reset();
				}
				else
				{
					$('.logo').addClass('fadeOut');
				}

				if(panel == 'my-data' || panel == 'friends-data')
				{
					app.hardware.start();
				}
				else
				{
					app.hardware.stop();
				}

				return false;
			});
		},
		contacts: function()
		{
			app.util.debug('log', 'Setting up Friend Picker');

			$('.find-a-friend').on('touchstart mousedown', function()
			{
				app.util.debug('log', 'Picking a Friend ...');

				clearTimeout(gui.timeout.welcomeIn);
				clearTimeout(gui.timeout.welcomeOut);

				$('.contact-options').fadeTo("slow" , 1);

				$('#home .welcome').removeClass('animated fadeInUp fadeOutDown').hide();

				if(typeof navigator.contacts !== 'undefined')
				{
					navigator.contacts.pickContact(function(contact)
					{
						console.log(JSON.stringify(contact));
						gui.render.contact.update(contact);
					}, function(err){ gui.render.contact.reset(err); });

					app.stats.event('Navigation', 'Contact', 'Picking Contact');
				}
				else
				{
					app.util.debug('warn', 'This Device does not support Contacts');
					app.stats.event('Navigation', 'Contact Error', 'Device Does Not Support Contacts');
					app.util.debug('debug', 'Generating Fake Contact for Dev Purposes');

					app.uuid = 'B734FE43-F4FD-C884-A901-3ADD585D0C41'; // Fake GUID

					var fake_contact = {
						"id"           : 1,
						"rawId"        : null,
						"displayName"  : null,
						"name"         : {
							"givenName"      : "John",
							"formatted"      : "John Doe",
							"middleName"     : null,
							"familyName"     : "Doe",
							"honorificPrefix": null,
							"honorificSuffix": null
						},
						"nickname"     : null,
						"phoneNumbers" : [
							{
								"type" : "home",
								"value": "(123) 456-7890",
								"id"   : 0,
								"pref" : false
							},
							{
								"type" : "work",
								"value": "(987) 654-3210",
								"id"   : 1,
								"pref" : false
							}
						],
						"emails"       : [
							{
								"type" : "home",
								"value": "fake.home.email@gmail.com",
								"id"   : 0,
								"pref" : false
							},
							{
								"type" : "work",
								"value": "fake.work.email@gmail.com",
								"id"   : 1,
								"pref" : false
							}
						],
						"addresses"    : null,
						"ims"          : null,
						"organizations": null,
						"birthday"     : null,
						"note"         : null,
						"photos"       : [
							{
								"pref" : "false",
								"value": "img/no-image-200.jpg",
								"type" : "url"
							}
						],
						"categories"   : null,
						"urls"         : null
					};

					gui.render.contact.update(fake_contact);
				}

				return false;
			});

			var user_shuffle = 0;
			setInterval(function(){
				var friends = $('.find-a-friend.default');
				var width = friends.width();

				user_shuffle++;

				if(user_shuffle > 9)
				{
					user_shuffle = 0;
				}

				var position = -(user_shuffle * width);

				friends.css({ 'background-position': position + 'px 0' });
			}, 4000);

			$('.force-reset-gui').on('touchstart mousedown', function(){
				app.util.debug('log', 'Resetting GUI ...');
				gui.reset();

				return false;
			});

			$('.contact-option').on('touchstart mousedown', function(){
				app.stats.event('Navigation', 'Contact', 'Using '+ $(this).attr('id') + ' with ID ' + $(this).data('invite_code'));
				gui.render.status('<i class="fa fa-circle-o-notch fa-fw fa-spin"></i> Waiting for '+ $(this).data('firstname') + ' to Connect');
				$('.contact-options').fadeTo("slow" , 0.33);
			});
		}
	},
	animate: function()
	{
		clearTimeout(gui.timeout.message);
		clearTimeout(gui.timeout.welcomeIn);
		clearTimeout(gui.timeout.welcomeOut);

		gui.timeout.message = setTimeout(function(){
			$('.status .message').fadeOut('slow');
		}, 100);

		gui.timeout.welcomeIn =setTimeout(function(){
			$('.welcome').addClass('animated fadeInUp').show();
		}, 1500);

		gui.timeout.welcomeOut =setTimeout(function(){
			$('.welcome').addClass('animated fadeOutDown').show();
		}, 6000);
	},
	reset: function()
	{
		$('.reset-gui').fadeOut();
		$('.logo').fadeIn(2500).removeClass('animated fadeInDown fadeOut');
		$('.find-a-friend').attr('style', '').removeClass('animated flipInX no-image');
		$('.contact-options').hide();
		gui.render.status('', true);
		$('.me .acceleration ul').html('');
		$('.me .geolocation ul').html('');
		$('.me .compass ul').html('');
		$('.friend .acceleration ul').html('');
		$('.friend .geolocation ul').html('');
		$('.friend .compass ul').html('');
		$('.welcome').removeClass('animated fadeInUp fadeOutDown').hide();

		setTimeout(function(){
			$('.find-a-friend').addClass('default animated flipInX');
			$('.logo').addClass('animated fadeInDown');
		}, 100);

		gui.animate();

		// @todo: kill any open socket connections

		app.util.debug('log', 'GUI Reset');
	},
	render:
	{
		debug: function(level, message)
		{
			$('#dev-log .output ul').append('<li class="'+ level +'"><i class="fa fa-angle-right"></i>&nbsp; ' + message + '</li>');
		},
		io: function(message, fadeout)
		{
			var elm = $('#home .io .status');
			elm.html(message).fadeIn();

			if(fadeout === true)
			{
				elm.fadeOut('slow')
			}
		},
		status: function(message, fadeout)
		{
			var elm = $('#home .message');
				elm.html(message).fadeIn();

			if(fadeout === true)
			{
				elm.fadeOut('slow')
			}
		},
		contact:
		{
			update: function(contact)
			{
				app.stats.event('Navigation', 'Contact', 'Displaying Selected Contact');

				// Allow user to Stop
				$('.reset-gui').fadeIn();

				// Setup initial data
				var name = contact.name.formatted;
				var first_name = contact.name.givenName;
				var invite_code = app.util.generateUID();

				// Leave if there was an issue with the contact
				if(!contact || typeof contact.name == 'undefined' || contact.name.givenName == '')
				{
					app.util.debug('warn', 'Invalid Contact');
					return false;
				}

				// Communicate with Socket that we want to initiate a session
				app.io.createSpace(invite_code);
				app.io.joinSpace(invite_code);

				// Add data attributes to links for later use
				$('.contact-option').data('invite_code', invite_code);
				$('.contact-option').data('firstname', first_name);

				// Update GUI
				gui.render.status('Find ' + name);

				// Remove Previous Event Bindings
				$('#clipboard, #sms').off();

				$('#clipboard').on('touchstart mousedown', function(){

					var text = gui.base + '/invite/' + invite_code;

					if(typeof cordova !== 'undefined')
					{
						cordova.plugins.clipboard.copy(text);

						navigator.notification.alert(
							text,
							function(){},
							'Copied to Clipboard',
							'OK'
						);
					}
					else
					{
						app.util.debug('warn', 'Unable to Copy to Device Clipboard');
					}

					return false;
				});

				var contact_image = $('.find-a-friend');
					contact_image.removeClass('no-image default');

				if(contact && contact.photos && contact.photos[0].value != '')
				{
					contact_image.css('background-image', 'url("' + contact.photos[0].value + '")');
				}
				else
				{
					contact_image.css('background-image', '');
					contact_image.addClass('no-image');
				}

				contact_image.addClass('contact');
				contact_image.css('background-position', '0px 0px');

				var message = 'Hey ' + first_name + ', can you hop on Facing so I can find you? '+ gui.base +'/invite/' + invite_code;
				var email_subject = encodeURIComponent('Facing App Invite');
				var email_message = encodeURIComponent(message);

				var number = (contact.phoneNumbers.length > 0)
					? contact.phoneNumbers[0].value
					: '';

				if(number !== '')
				{
					number = number.replace(/[^0-9]/g, '');

					$('#sms').on('touchstart mousedown', function(){

						if(sms && typeof sms.send !== 'undefined')
						{
							sms.send(number, message, 'INTENT', function(){}, function(err){});
						}
						else
						{
							app.util.debug('warn', 'Device Unable to Send SMS');
						}

						return false;
					});
				}
				else
				{
					$('#sms').hide();
				}

				var email = (contact.emails.length > 0)
					? contact.emails[0].value
					: '';

				if(email !== '')
				{
					$('#email').attr('href', 'mailto:' + email + '?subject=' + email_subject + '&body=' + email_message).show();
				}
				else
				{
					$('#email').hide();
				}

				$('.contact-options').fadeIn();
			},
			reset: function(err)
			{
				app.util.debug('log', 'Error: ' + err);
				gui.render.status('<i class="fa fa-times-circle"></i> Error Retrieving Contact', true);
				$('.contact-options').fadeOut();
			}
		},
		self:
		{
			debug: function()
			{
				if(typeof app.user_data.acceleration != 'undefined')
				{
					var acceleration = '' +
						'<li><strong>X</strong>:&nbsp; ' + app.user_data.acceleration.x + '</li>' +
						'<li><strong>Y</strong>:&nbsp; ' + app.user_data.acceleration.y + '</li>' +
						'<li><strong>Z</strong>:&nbsp; ' + app.user_data.acceleration.z + '</li>';

					$('.me .acceleration ul').html(acceleration);
				}

				if(typeof app.user_data.geolocation != 'undefined')
				{
					var geolocation = '' +
						'<li><strong>Latitude</strong>:&nbsp; ' + app.user_data.geolocation.latitude + ' &deg;</li>' +
						'<li><strong>Longitude</strong>:&nbsp; ' + app.user_data.geolocation.longitude + ' &deg;</li>' +
						'<li><strong>Altitude</strong>:&nbsp; ' + app.user_data.geolocation.altitude + '</li>' +
						'<li><strong>Accuracy</strong>:&nbsp; ' + app.user_data.geolocation.accuracy + '</li>' +
						'<li><strong>Heading</strong>:&nbsp; ' + app.user_data.geolocation.heading + '</li>' +
						'<li><strong>Speed</strong>:&nbsp; ' + app.user_data.geolocation.speed + '</li>';

					$('.me .geolocation ul').html(geolocation);
				}

				if(typeof app.user_data.compass != 'undefined')
				{
					var compass = '' +
						'<li><strong>Direction</strong>:&nbsp; ' + app.user_data.compass.direction + '</li>' +
						'<li><strong>Magnetic Heading</strong>:&nbsp; ' + app.user_data.compass.magnetic_heading + ' &deg;</li>';

					$('.me .compass ul').html(compass);
				}
			}
		},
		friend:
		{
			debug: function(data)
			{
				var user_data = JSON.parse(data);

				if(typeof user_data.acceleration != 'undefined')
				{
					var acceleration = '' +
						'<li><strong>X</strong>:&nbsp; ' + user_data.acceleration.x + '</li>' +
						'<li><strong>Y</strong>:&nbsp; ' + user_data.acceleration.y + '</li>' +
						'<li><strong>Z</strong>:&nbsp; ' + user_data.acceleration.z + '</li>';

					$('.friend .acceleration ul').html(acceleration);
				}

				if(typeof user_data.geolocation != 'undefined')
				{
					var geolocation = '' +
						'<li><strong>Latitude</strong>:&nbsp; ' + user_data.geolocation.latitude + ' &deg;</li>' +
						'<li><strong>Longitude</strong>:&nbsp; ' + user_data.geolocation.longitude + ' &deg;</li>' +
						'<li><strong>Altitude</strong>:&nbsp; ' + user_data.geolocation.altitude + '</li>' +
						'<li><strong>Accuracy</strong>:&nbsp; ' + user_data.geolocation.accuracy + '</li>' +
						'<li><strong>Heading</strong>:&nbsp; ' + user_data.geolocation.heading + '</li>' +
						'<li><strong>Speed</strong>:&nbsp; ' + user_data.geolocation.speed + '</li>';

					$('.friend .geolocation ul').html(geolocation);
				}

				if(typeof user_data.compass != 'undefined')
				{
					var compass = '' +
						'<li><strong>Direction</strong>:&nbsp; ' + user_data.compass.direction + '</li>' +
						'<li><strong>Magnetic Heading</strong>:&nbsp; ' + user_data.compass.magnetic_heading + ' &deg;</li>';

					$('.friend .compass ul').html(compass);
				}
			}
		}
	}
};

// Handler for Custom facing:// protocol
function handleOpenURL(url) {
	var invite_code = url.replace('facing://invite/', '');
	app.io.joinSpace(invite_code);
}

window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.oRequestAnimationFrame;