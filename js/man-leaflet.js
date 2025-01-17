/* Code to create Leaflet map 
** Martino  2017
*/ 
"use strict";

var mapOptions = {
  center: [52.1, 5.25], //[0,-5],
  zoom: 7.6, zoomSnap: 0.1, minZoom: 7.6,
  zoomControl: false,
  crs: L.CRS.EPSG3857,
  
  attributionControl: false,
  
}
var mapMAN = L.map('map', mapOptions );//.setView([52.1, 5.25], 7.6);
    
  mapMAN.addControl(new L.Control.ZoomMin());
  //*** Layers ***
  
  //L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
  //  maxZoom: 18,
  //  // attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
  //    // '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
  //    // 'Imagery © <a href="http://mapbox.com">Mapbox</a>',
  //  id: 'mapbox.light'
  //}).addTo(mapMAN);
  // var tileUrl = 'http://{s}.tile.osm.org';
  // PDOK RD New EPSG:28992  WGS EPSG:3857
  // var tileUrl = 'http://geodata.nationaalgeoregister.nl/tiles/service/tms/1.0.0/brtachtergrondkaartgrijs/EPSG:28992'
  // var tileUrl = 'http://tile.openstreetmap.nl/tiles';
  var tileLayerOptions = {
    // tms: true,
    id: 'ngr.wmts.gray',
    maxZoom: 14,
    // minZoom: 7
  };
  var basemap = L.tileLayer(tileUrl + '/{z}/{x}/{y}.png', tileLayerOptions);
  // basemap.addTo(mapMAN);
  
  var tileUrl = 'http://geodata.nationaalgeoregister.nl/wmts/?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=brtachtergrondkaartgrijs&TILEMATRIXSET=EPSG:3857&TILEMATRIX=EPSG:3857:{z}&TILEROW={y}&TILECOL={x}&FORMAT=image/png';
  var openbasiskaart = L.tileLayer(tileUrl, tileLayerOptions).addTo(mapMAN);
    
  //Provincies
  // var provinciesLayer = L.geoJson(geojsonProvincies, {
    // style: styleContour
  // }).addTo(mapMAN);
  //Fit to provinciesLayer
  // mapMAN.fitBounds(provinciesLayer.getBounds(),5)
  
  var manLayer = L.Proj.geoJson(natura2000Features, {
    style: style,
    onEachFeature: onEachFeature
  }).addTo(mapMAN);
  
  var nietNaturaLayer = L.geoJson(nietNaturaFeatures, {
    style: style,
    onEachFeature: onEachFeature
  }).addTo(mapMAN);

  // control that shows state info on hover
  var info = L.control();
  info.onAdd = function (mapMAN) {
    this._div = L.DomUtil.create('div', 'info');
    this.update();
    return this._div;
  };
  info.update = function (feature, latlng) {
    var props;
    props = (feature ? feature.properties : props );
    
    this._div.innerHTML = (props ? '<b>' 
      + props.naam_n2k + '</b> ' 
      // + '[' + props.nr + ']'
      + '[MAN-' + props.MAN_code +']'
      // + '[' + latlng + ']'
      : '');
  };
  // info.addTo(mapMAN);

  // get color depending on Natura number
  function getColor(value) {
    return value > 600 ? 'pink' : 
            value > 0 ? 'lightgreen' :
              'yellow';
  }
    // get highlight color depending on Natura number
  function getHighlightColor(value) {
    return value > 600 ? 'brown' : 
            value > 0 ? 'green' :
              'yellow';
  }
  
  function style(feature) {
    var featureColor = getColor(feature.properties.nr);
    return {
      weight: 1,
      opacity: 0.7,
      color: featureColor,
      //dashArray: '3',
      fillOpacity: 0.7,
      fillColor: featureColor
    };
  }
  function styleContour(feature) {
    return {
      weight: 0,
      opacity: 1,
      color: 'orange',
      fillOpacity: 0.1,
    };
  }
  
  //Highlighting feature
  function styleHighlight(feature) {
      return {
        fillColor: getHighlightColor(feature.properties.nr),
      // weight: 5       
      // color: '#666',
      //dashArray: '',
      //fillOpacity: 0.7   
    };
  }
      
  function highlightFeature(e) {
    var layer = e.target || e;
    // Set style and z-order
    layer.setStyle(styleHighlight(layer.feature));
    
    if ( 651 <= layer.feature.properties.nr <= 652 ) { 
      layer.bringToFront() 
    }
    // Show popup
    layer.openPopup();
    
    // var layerLatLng = layer.getBounds()._northEast;
    var layerLatLng = new L.LatLng(layer.getBounds()._northEast.lat
      , layer.getBounds()._northEast.lng - (layer.getBounds()._northEast.lng - layer.getBounds()._southWest.lng)/2 );
    layer._popup.setLatLng(layerLatLng);
    
    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
      layer.bringToFront();
    }
    
    // Always Veluwe areas on top
    mapMAN._layers['MAN_' + 651].bringToFront();
    mapMAN._layers['MAN_' + 652].bringToFront();
    
    // info.update(layer.feature, e.latlng);
  }
  function resetHighlight(e) {
    var layer = e.target || e;
    
    manLayer.resetStyle(layer);
    // info.update();
  }
  //Soom on select
  function zoomToFeature(e) {
      var layer = e.target;

      mapMAN.fitBounds(layer.getBounds());
      // info.update(layer.feature, e.latlng);
  }
  
  //Initialize features
  function onEachFeature(feature, layer) {
    if (!feature.properties.MAN_code) {
      layer._leaflet_id = 'MAN_' + feature.properties.nr;
    } else {
      layer._leaflet_id = 'MAN_' + feature.properties.MAN_code;
    }
    layer.bindPopup(feature.properties.naam_n2k, { autoPan: false });

    layer.on({
      mouseover: highlightFeature,
      mouseout: resetHighlight,
      click: zoomToFeature
    });
  }
  
  //Legend settings
  var legend = L.control({position: 'bottomright'});
  legend.onAdd = function (mapMAN) {

    var div = L.DomUtil.create('div', 'info legend'),
      labels = [];
    
    labels.push('<i style="background:' + getColor(10) + '"></i> Natura 2000' );
    labels.push('<i style="background:' + getColor(901) + '"></i> Niet Natura 2000' );
    
    div.innerHTML = labels.join('<br/>');
    return div;
  };
  legend.addTo(mapMAN);