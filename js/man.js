var chart_gebied;
var chart_vergelijkbaar;
var sUrlPre, sUrlPost, sActiveImage;
var activeArea = 0;

// Create the tooltips only on document load
$(document).ready(function () {

    if ($("img#kaartimage").length > 0) {
        sUrlPre = $('img#kaartimage').attr('src').substring(0, $('img#kaartimage').attr('src').indexOf('kaarten/')) + 'kaarten/';
    }
    sUrlPost = '.jpg';
    sActiveImage = 'Kaart-MAN-gebieden';

    /* === QTip Tooltips ======================================================================================= */
    $('area').not('area[href="#MAN_65"]').qtip({
        content: false,
        show: {
            event: 'mouseover focus'
        },
        hide: {
            event: 'mouseout blur'
        },
        position: {
            target: 'mouse',
            my: 'bottom center',
            adjust: {
                mouse: false,
                y: 50
            }
        }

    });

    // qTip items samenstellen voor Veluwe
    var veluwe_items = $('.MAN_lijst li[id*="MAN_65"]').clone(true, true);

    $(veluwe_items).each(function () {
        //remove child div and title
        $(this).find('div.popupinfo').remove();
        $(this).find('a').removeAttr('title');

        $(this).click(function (event) {
            event.preventDefault();
            id = $(this).attr('id');
            $('ol.MAN_lijst li#' + id + ' a').trigger("click");
            /*alert($(this).attr('id') + ' -  ' + $('ol.MAN_lijst li#'+id + ' a'));*/
        });

        $(this).bind('mouseover focus', function () {
            $('ol.MAN_lijst li#' + $(this).attr('id') + ' a').trigger("mouseover");
        });

    });

    /* Extra keuze lijst voor Veluwe*/
    $('area[href="#MAN_65"]').qtip({
        content: $('<p><em>Welk gebied wilt u precies bekijken?</em></p>').append('<ul />').append(veluwe_items),
        //        show: 'mouseover',
        hide: {
            fixed: true,
            delay: 180
        },
        position: {
            target: $('#kaartimage'),
            at: 'right center',
            my: 'right center',
            adjust: {
                x: 30
            }
        }
    });

    //Event op extra Veluwe areas triggert VEluwe algemeen event
    $('area[href="#MAN_651"], area[href="#MAN_652"]').bind('mouseover focus', function () {
        $('area[href="#MAN_65"]').trigger('mouseover');
    });
    //Event op extra Veluwe areas triggert VEluwe algemeen event
    $('area[href="#MAN_651"], area[href="#MAN_652"]').bind('mouseout blur', function () {
        $('area[href="#MAN_65"]').trigger('mouseout');
    });

    /* === Onload verbergen van elementen en event binding ======================================================================================= */
    //Verberg Gebiedkenmerken in lijst
    $('.popupinfo').addClass('hide');
    //Verberg data tabellen met class=collapse
    $('table.collapse').addClass('hide');
    // Click event Toon/Verberg datatabellen
    $('.ToonVerberg').click(function (event) {
        var link = $(this).find('a'), table = link.closest('div').find('table.collapse');

        event.preventDefault();

        if (table.hasClass('hide')) {
            link.text('Verberg meetwaarden tabel');
            table.removeClass('hide');
        } else {
            link.text('Toon meetwaarden tabel');
            table.addClass('hide');
        }
        
    });


    //Create charts
    setChartColors();
    $('table.collapse').each(function () {
        createChart($(this).attr('id'));
    });


    /*$('area').mouseover(function() { $(this).qtip('show'); }); */
    // NOTE: You can even omit all options and simply replace the regular title tooltips like so:
    // $('#content a[href]').qtip();


    /* === Event binding klikkaart en lijst met gebieden ======================================================================================= */

    //Click event for areas on map and hyperlinks in list
    $('area, .MAN_lijst .link a').click(function (event) {
        event.preventDefault();

        //Get node name to find correct target id
        var eventNode = $(this)[0].nodeName;

        switch (eventNode) {
            case "AREA":
                id = $(this).attr('href').substr($(this).attr('href').indexOf("#") + 1);
                selectedlistitem = $('#' + id);
                break;

            case "A":
                selectedlistitem = $(this).closest('li');
                id = selectedlistitem.attr('id');
                break;
        }

        if (event.type === 'click') {
            sActiveImage = id;
        }

        //console.log(event.type + ' click ' +  id);
        setActiveImage(id);
        
        //remove detailpopup info before appending
        $('#detailpopup').find('.popupinfo').remove();
        // append popupinfo to detailpopup
        selectedlistitem.find('.popupinfo').clone().appendTo('#detailpopup');
        //remove class 'hide'
        $('#detailpopup').removeClass('hide');
        $('#detailpopup').find('.popupinfo').removeClass('hide');
        document.location.href = "#detailpopup";

        // Zoom in map
        if (mapMAN._layers[id] != undefined) {
            mapMAN.fitBounds(mapMAN._layers[id].getBounds());
        } else {
            console.log('Layer ' + id + ' is not defined.');
        }
    });



    //List items click $('li#MAN_64, li#MAN_65, li#MAN_16, li#MAN_18, li#MAN_20, li#MAN_319, li#MAN_122 ')
    $('#lijstcontainer ol.MAN_lijst li').click(function () {
        sActiveImage = $(this).attr('id');

        setDefaultImage();
    });
    $('#lijstcontainer ol.MAN_lijst li, #lijstcontainer ol.MAN_lijst li a').bind('mouseover focus', function () {
        //Replace image of active area, Get node name to find correct target id
        setActiveImage($(this).closest('li').attr('id'));
    });
    $('#lijstcontainer ol.MAN_lijst li, #lijstcontainer ol.MAN_lijst li a').bind('mouseout blur', function () {
        //Reset default image
        setDefaultImage();
    });

    //area mouseover/mouseout events $('area[href=#MAN_64],area[href=#MAN_65], area[href=#MAN_122], area[href=#MAN_319], area[href=#MAN_20], area[href=#MAN_18], area[href=#MAN_16], ')
    $('area').bind('mouseover focus', function () {
        //Replace image of active area
        id = $(this).attr('href').substr($(this).attr('href').indexOf("#") + 1);

        //console.log(event.type + ' mouseover ' +  id);

        setActiveImage(id);
    });
    //area mouseout + blur events
    $('area').bind('mouseout blur', function (event) {
        //Reset default image
        id = $(this).attr('href').substr($(this).attr('href').indexOf("#") + 1);

        //console.log(event.type + ' mouseout ' + id);

        if (id !== activeArea && event.type === 'mouseout') {
            //console.log(event.type + ' setDefaultImage ' + id);
            setDefaultImage();
        }
    });


    /* === Highcharts highlighting ======================================================================================= */
    $('.highcharts-container input[type=checkbox]').focus(function () {
        //Charts container is second parent
        var thisChart = $(this).closest('div.chart_container').highcharts(), thisSerie = thisChart.series[$(this).index() - 1];

        if (thisSerie.graph) {
            //console.log(thisSerie.graph.attr('stroke-width'));
            thisSerie.graph.attr('stroke-width', '5');
        }

        //console.log($(this).closest('div.chart_container').attr('id') + '-' + ($(this).index() - 1) + '-' + thisChart.series[$(this).index() - 1].name);
    });

    $('.highcharts-container input[type=checkbox]').blur(function () {
        //Charts container is second parent
        var thisChart = $(this).closest('div.chart_container').highcharts(),
            thisSerie = thisChart.series[$(this).index() - 1];

        if (thisSerie.graph) {
            thisSerie.graph.attr('stroke-width', '2');
        }
        thisSerie.onMouseOver();

    });

    //Highcharts variabelen
    chart_gebied = Highcharts.charts[0];
    chart_vergelijkbaar = Highcharts.charts[1];


});
  
function setActiveImage(sUrl) {
    sUrl = sUrl.substr(sUrl.indexOf("#") + 1);
    sUrlNew = sUrlPre + sUrl + sUrlPost;

    $("#kaartimage").attr("src", sUrlNew);
}

function setDefaultImage() {

    sDefaultImage = sUrlPre + sActiveImage + sUrlPost; 

    $("#kaartimage").attr("src", sDefaultImage);
}

