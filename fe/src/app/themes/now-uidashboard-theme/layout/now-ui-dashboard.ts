/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

/*!

 =========================================================
 * Now UI Dashboard - v1.1.0
 =========================================================

 * Product Page: https://www.creative-tim.com/product/now-ui-dashboard
 * Copyright 2018 Creative Tim (http://www.creative-tim.com)

 * Designed by www.invisionapp.com Coded by www.creative-tim.com

 =========================================================

 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

 */

declare var $: any;

// export function nowUiDashboardJs() {
//     if (!$('.collapse').collapse) {
//         console.log("bootstrap's .collapse() not loaded yet, waiting...", $, $('.collapse'), $('.collapse').collapse);
//         setTimeout(nowUiDashboardJs, 10000);
//     } else {
//         _nowUiDashboardJs();
//     }
// }

export function nowUiDashboardJs() {

    let transparent = true;
    let transparentDemo = true;
    let fixedTop = false;

    let navbar_initialized = false;
    let backgroundOrange = false;
    let sidebar_mini_active = false;
    let toggle_initialized = false;

    let seq = 0, delays = 80, durations = 500;
    let seq2 = 0, delays2 = 80, durations2 = 500;

    $(document).ready(function () {

        console.log($('.collapse').collapse);

        if ($('.full-screen-map').length == 0 && $('.bd-docs').length == 0) {
            // On click navbar-collapse the menu will be white not transparent
            $('.collapse').collapse('hide').on('show.bs.collapse', function () {
                $(this).closest('.navbar').removeClass('navbar-transparent').addClass('bg-white');
            }).on('hide.bs.collapse', function () {
                $(this).closest('.navbar').addClass('navbar-transparent').removeClass('bg-white');
            });
        }

        nowuiDashboard.initMinimizeSidebar();

        let $navbar = $('.navbar[color-on-scroll]');
        let scroll_distance = $navbar.attr('color-on-scroll') || 500;

        $('.form-control').on("focus", function () {
            $(this).parent('.input-group').addClass("input-group-focus");
        }).on("blur", function () {
            $(this).parent(".input-group").removeClass("input-group-focus");
        });

        // Activate bootstrapSwitch
        $('.bootstrap-switch').each(function () {
            let $this = $(this);
            let data_on_label = $this.data('on-label') || '';
            let data_off_label = $this.data('off-label') || '';

            $this.bootstrapSwitch({
                onText: data_on_label,
                offText: data_off_label
            });
        });
    });

    $(document).on('click', '.navbar-toggle', function () {
        console.log(this, nowuiDashboard);
        let $toggle = $(this);

        if (nowuiDashboard.misc.navbar_menu_visible == 1) {
            $('.frmdb-layout').removeClass('nav-open');
            nowuiDashboard.misc.navbar_menu_visible = 0;
            setTimeout(function () {
                $toggle.removeClass('toggled');
                $('#bodyClick').remove();
            }, 550);

        } else {
            setTimeout(function () {
                $toggle.addClass('toggled');
            }, 580);

            let div = '<div id="bodyClick"></div>';
            $(div).appendTo('body').click(function () {
                $('.frmdb-layout').removeClass('nav-open');
                nowuiDashboard.misc.navbar_menu_visible = 0;
                setTimeout(function () {
                    $toggle.removeClass('toggled');
                    $('#bodyClick').remove();
                }, 550);
            });

            $('.frmdb-layout').addClass('nav-open');
            nowuiDashboard.misc.navbar_menu_visible = 1;
        }
    });

    $(window).resize(function () {
        // reset the seq for charts drawing animations
        seq = seq2 = 0;

        if ($('.full-screen-map').length == 0 && $('.bd-docs').length == 0) {
            let $navbar = $('.navbar');
            let isExpanded = $('.navbar').find('[data-toggle="collapse"]').attr("aria-expanded");
            if ($navbar.hasClass('bg-white') && $(window).width() > 991) {
                $navbar.removeClass('bg-white').addClass('navbar-transparent');
            } else if ($navbar.hasClass('navbar-transparent') && $(window).width() < 991 && isExpanded != "false") {
                $navbar.addClass('bg-white').removeClass('navbar-transparent');
            }
        }
    });

    let nowuiDashboard = {
        misc: {
            navbar_menu_visible: 0
        },

        initMinimizeSidebar: function () {
            if ($('.sidebar-mini').length != 0) {
                sidebar_mini_active = true;
            }

            $('#minimizeSidebar').click(function () {
                var $btn = $(this);

                if (sidebar_mini_active == true) {
                    $('body').removeClass('sidebar-mini');
                    sidebar_mini_active = false;
                    nowuiDashboard.showSidebarMessage('Sidebar mini deactivated...');
                } else {
                    $('body').addClass('sidebar-mini');
                    sidebar_mini_active = true;
                    nowuiDashboard.showSidebarMessage('Sidebar mini activated...');
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

        showSidebarMessage: function (message) {
            try {
                $.notify({
                    icon: "now-ui-icons ui-1_bell-53",
                    message: message
                }, {
                        type: 'info',
                        timer: 4000,
                        placement: {
                            from: 'top',
                            align: 'right'
                        }
                    });
            } catch (e) {
                console.log('Notify library is missing, please make sure you have the notifications library added.');
            }

        }

    };

    function hexToRGB(hex, alpha) {
        var r = parseInt(hex.slice(1, 3), 16),
            g = parseInt(hex.slice(3, 5), 16),
            b = parseInt(hex.slice(5, 7), 16);

        if (alpha) {
            return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
        } else {
            return "rgb(" + r + ", " + g + ", " + b + ")";
        }
    }
}
