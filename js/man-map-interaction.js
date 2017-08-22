var chart_gebied;
var chart_vergelijkbaar;
var sUrlPre, sUrlPost, sActiveImage;
var highlightedLayer;

$(document).ready(function () {

    /* === Event binding klikkaart en lijst met gebieden ======================================================================================= */

    //Click event for areas on map and hyperlinks in list
    $('.MAN_lijst .link a').click(function (event) {
        event.preventDefault();

        selectedlistitem = $(this).closest('li');
        id = selectedlistitem.attr('id');
                
        if (event.type === 'click') {
            sActiveImage = id;
        }

        //console.log(event.type + ' click ' +  id);
        // Zoom in map
        if (mapMAN._layers[id] != undefined) {
            mapMAN.fitBounds(mapMAN._layers[id].getBounds());
        } else {
            console.log('Layer ' + id + ' is not defined.');
        }        
        
        //remove detailpopup info before appending
        $('#detailpopup').find('.popupinfo').remove();
        // append popupinfo to detailpopup
        selectedlistitem.find('.popupinfo').clone().appendTo('#detailpopup');
        //remove class 'hide'
        $('#detailpopup').removeClass('hide');
        $('#detailpopup').find('.popupinfo').removeClass('hide');
        document.location.href = "#detailpopup";
    });



    //List items click $('li#MAN_64, li#MAN_65, li#MAN_16, li#MAN_18, li#MAN_20, li#MAN_319, li#MAN_122 ')
    $('#lijstcontainer ol.MAN_lijst li').click(function () {
        sActiveImage = $(this).attr('id');

        setDefaultImage();
    });
    $('#lijstcontainer ol.MAN_lijst li, #lijstcontainer ol.MAN_lijst li a').bind('mouseover focus', function () {
        // Reset resetHighlight(highlightedLayer);
        if( !!highlightedLayer ) resetHighlight(highlightedLayer);
        
        //Replace image of active area, Get node name to find correct target id
        var id = $(this).closest('li').attr('id');
        // Set global variable
        highlightedLayer = mapMAN._layers[id];
        
        if( highlightedLayer != undefined ) highlightFeature(highlightedLayer);
    });
    $('#lijstcontainer ol.MAN_lijst li, #lijstcontainer ol.MAN_lijst li a').bind('mouseout blur', function () {
        //Reset default image
        if( !!highlightedLayer ) resetHighlight(highlightedLayer);
        // info.update();
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



});
  
function setActiveImage(sUrl) {
    sUrl = sUrl.substr(sUrl.indexOf("#") + 1);
    sUrlNew = sUrlPre + sUrl + sUrlPost;
    console.log(sUrl);
    //$("#kaartimage").attr("src", sUrlNew);
}

function setDefaultImage() {

    sDefaultImage = sUrlPre + sActiveImage + sUrlPost; 

    $("#kaartimage").attr("src", sDefaultImage);
}

