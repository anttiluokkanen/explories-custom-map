(function()
{
    'use strict';

    function scrollTo($el)
	{
        var offset = $("header").outerHeight() + 8;
        
		// Make sure $el is a jQuery object
		if ($el instanceof jQuery)
		{
			$("html, body").animate({
		        scrollTop: $el.offset().top - offset
		    }, 800);
		}
	}

	/**
	 * Scrolls the page to the right section if url hash is defined.
	 */
	function initScroll()
	{
		if (window.location.hash)
	    {
			// Scroll after all Prism Highlight content has (hopefully) loaded
            setTimeout(function() {
                scrollTo($(window.location.hash));
            }, 1000);
	    }
	}

    /**
	 * @param	{string}  hash
	 */
	function setHash(hash)
	{
		var id = hash.replace(/^.*#/, '');
		var elem = document.getElementById(id);
		elem.id = id+'-tmp';
		window.location.hash = hash;
		elem.id = id;
	}

	function removeHash()
	{
		window.location.hash = '';
		history.pushState('', document.title, window.location.pathname);
	}

    $(document).ready(function() {

        $("section").each(function() {
            var $section = $(this);
            var id = $(this).attr("id");
            var $li = $('<li></li>');
            var $a = $('<a></a>');
            $a.text($(this).children('h2').first().text());

            if ($a.text() != '')
            {
                $a.attr('href', '#' + id);
                $a.click(function(e) {
                    e.preventDefault();
                    scrollTo($section);
                    setHash(id);
                });

                $li.append($a);
                $("nav ul").append($li);
            }
        });

        initScroll();

        $("#menuBtn").click(function() {
            $("body").toggleClass("nav-open");
        });

        $(".scroll-to").click(function(e) {
            e.preventDefault();
            scrollTo($($(this).attr("href")));
            setHash($(this).attr("href"));
        });

    });

})();
