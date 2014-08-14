var timeout = null;

$(function() {
    var items = $('.slide');
    var content = $('.content');

    function open() {
        $(items).removeClass('close').addClass('open');
    }

    function close() {
        $(items).removeClass('open').addClass('close');
    }

    $('#navToggle').on('touchstart', function(event) {
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
    $('nav a').click(function(){
        $('nav a').removeClass('active');
        $('.panel').removeClass('active');

        var $this = $(this);
        var panel = $this.data('panel');
        var label = $this.html();

        $this.addClass('active');
        $('#' + panel).addClass('active');

        $('header .label').html(label);

        $('#navToggle').trigger('touchstart');

        if(panel == 'home')
        {
            $('.find-a-friend').addClass('animated flipInX');
	        $('.logo').fadeIn('slow');
        }
        else
        {
	        $('.logo').fadeOut('fast');
	        $('span.hideme').remove();
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

    clearTimeout(timeout);

    timeout = setTimeout(function(){
        $('span.hideme').addClass('animated fadeOutUp');
        $('.logo').fadeIn(2500);
    }, 3000);

    var user_shuffle = 0;
    setInterval(function(){
        var $friends = $('.find-a-friend.default');
        var width = $friends.width();

        user_shuffle++;

        if(user_shuffle > 9)
        {
            user_shuffle = 0;
        }

        var position = -(user_shuffle * width);

        $friends.css({ 'background-position': position + 'px 0' });
    }, 4000);

	$('.clear-log').click(function(){
		$('#dev-log .output ul').html('');
	});
});
