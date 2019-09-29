$(document).ready(function(){
	

	navbar();

	$(window).resize(function(){
		$(".navbar.navbar-categories .nav-item").removeAttr("style")
		$(".category-list").html(' ');
		navbar();
	});

	function navbar(){
		var totalWidth = 0;
		var navbarWidth = $(".navbar.navbar-categories").width() - $(".navbar.navbar-categories .dropdown").width() - 50;

		$(".navbar.navbar-categories .nav-item").each(function(){

				totalWidth += $(this).width();

				if (totalWidth > navbarWidth){
					if(!$(this).hasClass("dropdown")){
						$(this).hide();
						var link = $(this).html();

						console.log(link);

						$(".category-list").append(link);
					}
				} else {
					$(this).show();
				}
		});

		$(".dropdown-menu .nav-link").each(function(){
			$(this).removeClass("nav-link").addClass("dropdown-item");
		});
	}

	$(window).scroll(function(){
		if($(window).scrollTop() > 540){
			$(".back-to-top").css("opacity","1");
			$(".navbar.navbar-categories").addClass("sticky-top");
		}
		else{

			$(".back-to-top").css("opacity","0");
			$(".navbar.navbar-categories").removeClass("fixed");
		}
	});

	$(".back-to-top").click(function(e){
		$("html, body").animate({ scrollTop: 0 },"slow");

		return false;
	});

	$(document).on("click",".nav-link, .dropdown-item",function(e){
		console.log(e.target);

		$(".nav-link").removeClass("active");
		$(".dropdown-item").removeClass("active");

		$(this).addClass("active");
	});


}), $(window).on("load",function(){
	
	var $grid = $('.grid').masonry({
	  	// options...
	  	itemSelector: '.item',
	  	columnWidth: '.item'
	});

	// bind filter button click
	$('body').on( 'click', '.navbar.navbar-categories a.frmdb-isotope-filter', function(e) {
		if ($('body.frmdb-editor-on').length > 0) return;
		
		e.preventDefault();
		
		var filterValue = $( this ).attr('data-filter');
		if (filterValue === '*') $grid.isotope({ filter: '*' });
		else $grid.isotope({ filter: `[data-category*="${filterValue}"]` });
	});
	
});