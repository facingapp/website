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
            $('span.hideme').css({ top: '-100px', left: '-10px' }).show();
            $('span.hideme').addClass('animated bounceInDown');
            $('.find-a-friend').addClass('animated flipInX');

            clearTimeout(timeout);

            timeout = setTimeout(function(){
                $('span.hideme').addClass('animated fadeOutUp');
            }, 3000);
        }
        else
        {
            $('span.hideme').removeClass('bounceInDown fadeOutUp');
            $('.find-a-friend').removeClass('flipInX');
        }

        if(panel == 'my-data' || panel == 'friends-data')
        {
            app.startWatchers();
        }
        else
        {
            app.clearWatchers();
        }
    });

    clearTimeout(timeout);

    timeout = setTimeout(function(){
        $('span.hideme').addClass('animated fadeOutUp');
        $('.logo').fadeIn('slow');
    }, 6000);

    var user_shuffle = 0;
    setInterval(function(){
        var $friends = $('.find-a-friend');
        var width = $friends.width();

        user_shuffle++;

        if(user_shuffle > 9)
        {
            user_shuffle = 0;
        }

        var position = -(user_shuffle * width);

        $friends.css({ 'background-position': position + 'px 0' });
    }, 4000);
});
