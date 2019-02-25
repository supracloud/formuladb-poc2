/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

declare var $: any;

export function lightBootstrapDashbord() {
    /*!
    
     =========================================================
     * Light Bootstrap Dashboard - v2.0.1
     =========================================================
    
     * Product Page: http://www.creative-tim.com/product/light-bootstrap-dashboard
     * Copyright 2017 Creative Tim (http://www.creative-tim.com)
     * Licensed under MIT (https://github.com/creativetimofficial/light-bootstrap-dashboard/blob/master/LICENSE.md)
    
     =========================================================
    
     * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
    
     */

     let $sidebar_wrapper;
    var searchVisible = 0;
    var transparent = true;

    var transparentDemo = true;
    var fixedTop = false;

    var navbar_initialized = false;
    var mobile_menu_visible = 0,
        mobile_menu_initialized = false,
        toggle_initialized = false,
        bootstrap_nav_initialized = false,
        $sidebar,
        isWindows;

    $(document).ready(function () {
        let window_width = $(window).width();

        // check if there is an image set for the sidebar's background
        lbd.checkSidebarImage();

        // Init navigation toggle for small screens
        if (window_width <= 991) {
            lbd.initRightMenu();
        }

        //  Activate the tooltips
        // $('[rel="tooltip"]').tooltip();

        //      Activate regular switches
        if ($("[data-toggle='switch']").length != 0) {
            $("[data-toggle='switch']").bootstrapSwitch();
        }

        $('.form-control').on("focus", function () {
            $(this).parent('.input-group').addClass("input-group-focus");
        }).on("blur", function () {
            $(this).parent(".input-group").removeClass("input-group-focus");
        });

        // Fixes sub-nav not working as expected on IOS
        $('body').on('touchstart.dropdown', '.dropdown-menu', function (e) {
            e.stopPropagation();
        });
    });

    // activate collapse right menu when the windows is resized
    $(window).resize(function () {
        if ($(window).width() <= 991) {
            lbd.initRightMenu();
        }
    });

    let lbd = {
        misc: {
            navbar_menu_visible: 0
        },
        checkSidebarImage: function () {
            $sidebar = $('.sidebar');
            let image_src = $sidebar.data('image');

            if (image_src !== undefined) {
                // let sidebar_container = '<div class="sidebar-background" style="background-image: url(' + image_src + ') "/>'
                // $sidebar.append(sidebar_container);
            } else if (mobile_menu_initialized == true) {
                // reset all the additions that we made for the sidebar wrapper only if the screen is bigger than 991px
                $sidebar_wrapper.find('.navbar-form').remove();
                $sidebar_wrapper.find('.nav-mobile-menu').remove();

                mobile_menu_initialized = false;
            }
        },

        initRightMenu: function () {
            $sidebar_wrapper = $('.sidebar-wrapper');

            if (!mobile_menu_initialized) {

                let $navbar = $('nav').find('.navbar-collapse').first().clone(true);

                let nav_content = '';
                let mobile_menu_content = '';

                //add the content from the regular header to the mobile menu
                $navbar.children('ul').each(function () {

                    let content_buff = $(this).html();
                    nav_content = nav_content + content_buff;
                });

                nav_content = '<ul class="nav nav-mobile-menu">' + nav_content + '</ul>';

                let $navbar_form = $('nav').find('.navbar-form').clone(true);

                let $sidebar_nav = $sidebar_wrapper.find(' > .nav');

                // insert the navbar form before the sidebar list
                let $nav_content = $(nav_content);
                $nav_content.insertBefore($sidebar_nav);
                $navbar_form.insertBefore($nav_content);

                $(".sidebar-wrapper .dropdown .dropdown-menu > li > a").click(function (event) {
                    event.stopPropagation();

                });

                mobile_menu_initialized = true;
            } else {
                console.log('window with:' + $(window).width());
                if ($(window).width() > 991) {
                    // reset all the additions that we made for the sidebar wrapper only if the screen is bigger than 991px
                    $sidebar_wrapper.find('.navbar-form').remove();
                    $sidebar_wrapper.find('.nav-mobile-menu').remove();

                    mobile_menu_initialized = false;
                }
            }

            if (!toggle_initialized) {
                let $toggle = $('.navbar-toggler');

                $toggle.click(function () {

                    if (mobile_menu_visible == 1) {
                        $('.frmdb-layout').removeClass('nav-open');

                        $('.close-layer').remove();
                        setTimeout(function () {
                            $toggle.removeClass('toggled');
                        }, 400);

                        mobile_menu_visible = 0;
                    } else {
                        setTimeout(function () {
                            $toggle.addClass('toggled');
                        }, 430);


                        let main_panel_height = $('.main-panel')[0].scrollHeight;
                        let $layer = $('<div class="close-layer"></div>');
                        $layer.css('height', main_panel_height + 'px');
                        $layer.appendTo(".main-panel");

                        setTimeout(function () {
                            $layer.addClass('visible');
                        }, 100);

                        $layer.click(function () {
                            $('.frmdb-layout').removeClass('nav-open');
                            mobile_menu_visible = 0;

                            $layer.removeClass('visible');

                            setTimeout(function () {
                                $layer.remove();
                                $toggle.removeClass('toggled');

                            }, 400);
                        });

                        $('.frmdb-layout').addClass('nav-open');
                        mobile_menu_visible = 1;

                    }
                });

                toggle_initialized = true;
            }
        }
    }
}