// NL view: setView([52, 5],6);
// US view: setView([37.8, -96], 4)
  var map = L.map('map').setView([52, 5],7);//.setView([37.8, -96], 4);

  
  L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
    maxZoom: 18,
    // attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
      // '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
      // 'Imagery © <a href="http://mapbox.com">Mapbox</a>',
    id: 'mapbox.light'
  }).addTo(map);

  var basemap = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png');
  // basemap.addTo(map);
            
  // control that shows state info on hover
  var info = L.control();

  info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info');
    this.update();
    return this._div;
  };

  info.update = function (feature, latlng) {
    var props;
    props = (feature ? feature.properties : props );
    
    this._div.innerHTML = (props ? '<b>' + props.naam_n2k + '</b> [' + props.nr + '][MAN-' + props.nr + ' Sinds: '+ props.MAN_meting +']'
      // + '[' + latlng + ']'
      : '');
  };

  info.addTo(map);


  // get color depending on population density value
  function getColor(value) {
    return value > 900 ? 'brown' :
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
      weight: 1,
      opacity: 1,
      color: 'orange',
      fillOpacity: 0.1,
    };
  }
  function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
      weight: 5
      // color: '#666',
      //dashArray: '',
      //fillOpacity: 0.7
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
      layer.bringToFront();
    }

    info.update(layer.feature, e.latlng);
  }

  var geojsonLayer;

  function resetHighlight(e) {
    geojsonLayer.resetStyle(e.target);
    info.update();
  }

  function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
  }

  function onEachFeature(feature, layer) {
    if (feature.properties.nr) {
      layer._leaflet_id = 'N2k-' + feature.properties.nr;
    }
    
    layer.on({
      mouseover: highlightFeature,
      mouseout: resetHighlight,
      click: zoomToFeature
    });
  }

  

  provinciesLayer = L.geoJson(geojsonProvincies, {
    style: styleContour
  }).addTo(map);
  
  geojsonLayer = L.geoJson(natura2000Features, {
    style: style,
    onEachFeature: onEachFeature
  }).addTo(map);
  
  nietNaturaLayer = L.geoJson(nietNaturaFeatures, {
    style: style,
    onEachFeature: onEachFeature
  }).addTo(map);
  // map.attributionControl.addAttribution('Population data &copy; <a href="http://census.gov/">US Census Bureau</a>');
  // Set bounds to feature Bargerveen [Nr=33]
  // map.fitBounds(geojsonLayer.getLayer('N2k-33').getBounds()); 
  
  var legend = L.control({position: 'bottomright'});

  legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
      grades = [0, 10, 20, 50, 100, 200, 500, 1000],
      labels = [],
      from, to;

    // for (var i = 0; i < grades.length; i++) {
      // from = grades[i];
      // to = grades[i + 1];

      // labels.push(
        // '<i style="background:' + getColor(from + 1) + '"></i> ' +
        // from + (to ? '&ndash;' + to : '+'));
    // }
    
    labels.push('<i style="background:' + getColor(10) + '"></i> Natura 2000' );
    labels.push('<i style="background:' + getColor(901) + '"></i> Niet Natura 2000' );
    
    div.innerHTML = labels.join('<br>');
    return div;
  };

  legend.addTo(map);