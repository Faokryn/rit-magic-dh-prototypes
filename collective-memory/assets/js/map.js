var google, bam;

// sets the marker's position and updates the lat and lng inputs
function setMarkerPosition(latLng) {
    marker.setPosition(latLng);
    $("#q-where-lat").val(marker.position.lat());
    $("#q-where-lng").val(marker.position.lng());
}

if (google) {
    var map, marker, searchBox;

    /* Initialize map */

    map = new google.maps.Map(
        document.getElementById("map"),
        {
            // start map centered on the US
            center: new google.maps.LatLng(37.09024,-95.71289100000001),
            zoom: 4,
            // set map type to road map
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            // turn off map type control and street view button
            mapTypeControl:false,
            streetViewControl:false
        }
    );

    /* Set marker to click location */

    marker = new google.maps.Marker({map: map});

    google.maps.event.addListener(map, 'click', function (evt) {
        setMarkerPosition(evt.latLng);
    });

    // google.maps.event.addListener(marker, 'change', function (evt) {
    //     console.log("change!");
    // });


    /* Add the searchbar to the map */

    searchBoxInput = document.getElementById("pac-input");

    // Prevent form submission when pressing Enter
    google.maps.event.addDomListener(searchBoxInput, 'keydown', function(evt) {
        if (evt.keyCode == 13) {
            evt.preventDefault();
        }
    });

    // Initialize the searchbar and add it to the map
    searchBox = new google.maps.places.SearchBox(searchBoxInput);
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(searchBoxInput);

    // Allow the current area of the map to influence the results
    map.addListener("bounds_changed", function () {
        searchBox.setBounds(map.getBounds());
    });

    google.maps.event.addListener(searchBox, "places_changed", function () {

        var bounds, place;

        place = searchBox.getPlaces()[0];

        // if getPlaces() returns the empty list, place will be undefined
        if (!place) {
            return;
        }

        // set marker position to top result of search
        bounds = new google.maps.LatLngBounds();
        bounds.extend(place.geometry.location);
        setMarkerPosition(place.geometry.location);
        map.fitBounds(bounds);
        map.setZoom(Math.min(map.getZoom(), 13));
    });
    // Sets tab indexes of links in the google map so only the searchbar is focused when tabing through
    // I don't know why the setTimeout is required.  Maybe the Google Maps API has some delayed functions or something
    window.setTimeout(function () {
        $("#mapContainer a").attr("tabindex", "-1");
    }, 200);

}
else {
    console.error("Google Maps API not loaded!");
}
