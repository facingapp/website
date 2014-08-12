$(function () {
    "use strict";

    if ($(window).width() > 992)
    {
        $(window).fadeThis({
            'reverse': false
        });
    };

    $('.tip').tooltip();

    var $form = $('#mc-form');

    $('#mc-subscribe').on('click', function(event){

        if (event)
        {
            event.preventDefault();
        }

        register($form);
    });

    function register($form)
    {
        $.ajax({
            type: $form.attr('method'),
            url: $form.attr('action'),
            data: $form.serialize(),
            cache: false,
            dataType: 'json',
            contentType: 'application/json; charset=utf-8',
            error: function(err)
            {
                $('#mc-notification').hide().html('<span class="alert">Could not connect to server. Please try again later.</span>').fadeIn("slow");
            },
            success: function(data)
            {
                if (data.result != "success")
                {
                    var message = data.msg.substring(4);
                    $('#mc-notification').hide().html('<span class="alert">' + message + '</span>').fadeIn("slow");
                }
                else
                {
                    var message = data.msg.substring(4);
                    $('#mc-notification').hide().html('<span class="success">Awesome! We sent you a confirmation email.</span>').fadeIn("slow");
                }
            }
        });
    }

    $(window).scroll(function(){
        if ($(this).scrollTop() > 200)
        {
            $('.scroll-top a').fadeIn(200);
        }
        else
        {
            $('.scroll-top a').fadeOut(200);
        }
    });

    $('.scroll-top a').click(function(event){
        event.preventDefault();

        $('html, body').animate({
            scrollTop: 0
        }, 1000);
    });

    $('a[href*=#]:not([href=#])').click(function(){
        if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname)
        {
            var target = $(this.hash);
                target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');

            if (target.length)
            {
                $('html,body').animate({
                    scrollTop: target.offset().top
                }, 1000);

                return false;
            }
        }
    });
});
