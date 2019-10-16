/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

 //Sync bootstrap tabs with url hash 
$(function () {
    var hash = window.location.hash;
    hash && $('ul.nav a[href="' + hash + '"]').tab('show');

    $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
        window.location.hash = this.hash;
    });
});
