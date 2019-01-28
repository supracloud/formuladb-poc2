/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

declare var $: any;

export function materialDashbord() {
    /*!

 =========================================================
 * Material Dashboard - v2.1.0
 =========================================================

 * Product Page: https://www.creative-tim.com/product/material-dashboard
 * Copyright 2018 Creative Tim (http://www.creative-tim.com)

 * Designed by www.invisionapp.com Coded by www.creative-tim.com

 =========================================================

 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

 */

    var breakCards = true;

    var searchVisible = 0;
    var transparent = true;

    var transparentDemo = true;
    var fixedTop = false;

    var mobile_menu_visible = 0,
        mobile_menu_initialized = false,
        toggle_initialized = false,
        bootstrap_nav_initialized = false;

    var seq = 0,
        delays = 80,
        durations = 500;
    var seq2 = 0,
        delays2 = 80,
        durations2 = 500;

    let $sidebar;


    $(document).ready(function () {

        $sidebar = $('.sidebar');
        md.initSidebarsCheck();

        let window_width = $(window).width();

        // check if there is an image set for the sidebar's background
        md.checkSidebarImage();

        //    Activate bootstrap-select
        if ($(".selectpicker").length != 0) {
            $(".selectpicker").selectpicker();
        }

        //  Activate the tooltips
        $('[rel="tooltip"]').tooltip();

        $('.form-control').on("focus", function () {
            $(this).parent('.input-group').addClass("input-group-focus");
        }).on("blur", function () {
            $(this).parent(".input-group").removeClass("input-group-focus");
        });

        // remove class has-error for checkbox validation
        $('input[type="checkbox"][required="true"], input[type="radio"][required="true"]').on('click', function () {
            if ($(this).hasClass('error')) {
                $(this).closest('div').removeClass('has-error');
            }
        });

    });

    $(document).on('click', '.navbar-toggler', function () {
        let $toggle = $(this);

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

            var $layer = $('<div class="close-layer"></div>');

            if ($('body').find('.main-panel').length != 0) {
                $layer.appendTo(".main-panel");

            } else if (($('body').hasClass('off-canvas-sidebar'))) {
                $layer.appendTo(".wrapper-full-page");
            }

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

    // activate collapse right menu when the windows is resized
    $(window).resize(function () {
        md.initSidebarsCheck();

        // reset the seq for charts drawing animations
        seq = seq2 = 0;
    });

    let md: any = {
        misc: {
            navbar_menu_visible: 0,
            active_collapse: true,
            disabled_collapse_init: 0,
        },

        checkSidebarImage: function () {
            let $sidebar = $('.sidebar');
            let image_src = $sidebar.data('image');

            if (image_src !== undefined) {
                let sidebar_container = '<div class="sidebar-background" style="background-image: url(' + image_src + ') "/>';
                $sidebar.append(sidebar_container);
            }
        },

        initSidebarsCheck: function () {
            if ($(window).width() <= 991) {
                if ($sidebar.length != 0) {
                    md.initRightMenu();
                }
            }
        },

        initMinimizeSidebar: function () {

            $('#minimizeSidebar').click(function () {
                var $btn = $(this);

                if (md.misc.sidebar_mini_active == true) {
                    $('body').removeClass('sidebar-mini');
                    md.misc.sidebar_mini_active = false;
                } else {
                    $('body').addClass('sidebar-mini');
                    md.misc.sidebar_mini_active = true;
                }

                // we simulate the window Resize so the charts will get updated in realtime.
                var simulateWindowResize = setInterval(function () {
                    window.dispatchEvent(new Event('resize'));
                }, 180);

                // we stop the simulation of Window Resize after the animations are completed
                setTimeout(function () {
                    clearInterval(simulateWindowResize);
                }, 1000);
            });
        },

        checkScrollForTransparentNavbar: debounce(function () {
            if ($(document).scrollTop() > 260) {
                if (transparent) {
                    transparent = false;
                    $('.navbar-color-on-scroll').removeClass('navbar-transparent');
                }
            } else {
                if (!transparent) {
                    transparent = true;
                    $('.navbar-color-on-scroll').addClass('navbar-transparent');
                }
            }
        }, 17),


        initRightMenu: debounce(function () {
            let $sidebar_wrapper = $('.sidebar-wrapper');

            if (!mobile_menu_initialized) {
                let $navbar = $('.frmdb-layout nav').find('.navbar-collapse').children('.navbar-nav');

                let ngContentAttrName = 'no-_ngContentFounf';
                for (let attr of $navbar.get(0).attributes) {
                    if (attr.name.indexOf("_ngcontent") == 0) {
                        ngContentAttrName = attr.name;
                    }
                }

                let mobile_menu_content = '';

                let nav_content = $navbar.html();

                nav_content = '<ul ' + ngContentAttrName + ' class="nav navbar-nav nav-mobile-menu">' + nav_content + '</ul>';

                let navbar_form = $('nav').find('.navbar-form').get(0).outerHTML;

                let $sidebar_nav = $sidebar_wrapper.find(' > .nav');

                // insert the navbar form before the sidebar list
                let $nav_content = $(nav_content);
                let $navbar_form = $(navbar_form);
                $nav_content.insertBefore($sidebar_nav);
                $navbar_form.insertBefore($nav_content);

                $(".sidebar-wrapper .dropdown .dropdown-menu > li > a").click(function (event) {
                    event.stopPropagation();

                });

                // simulate resize so all the charts/maps will be redrawn
                window.dispatchEvent(new Event('resize'));

                mobile_menu_initialized = true;
            } else {
                if ($(window).width() > 991) {
                    // reset all the additions that we made for the sidebar wrapper only if the screen is bigger than 991px
                    $sidebar_wrapper.find('.navbar-form').remove();
                    $sidebar_wrapper.find('.nav-mobile-menu').remove();

                    mobile_menu_initialized = false;
                }
            }
        }, 200),

    }

    // Returns a function, that, as long as it continues to be invoked, will not
    // be triggered. The function will be called after it stops being called for
    // N milliseconds. If `immediate` is passed, trigger the function on the
    // leading edge, instead of the trailing.

    function debounce(func, wait, immediate = false) {
        var timeout;
        return function () {
            var context = this,
                args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(function () {
                timeout = null;
                if (!immediate) func.apply(context, args);
            }, wait);
            if (immediate && !timeout) func.apply(context, args);
        };
    };
}