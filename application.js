//Global variables
var map;
var infoWindow;

//My fav parks array
var myParks = [
    { position: {lat: 38.622627, lng: -90.192821}, name: "Busch Stadium"},
    { position: {lat: 39.284043, lng: -76.621554}, name: "Oriole Park"},
    { position: {lat: 34.073833, lng: -118.239958}, name: "Dodger Stadium"},
    { position: {lat: 37.778574, lng: -122.389230}, name: "ATT Park"},
    { position: {lat: 40.446838, lng: -80.005698}, name: "PNC Park"}
];


//Error handling for the Google Maps API
function googleErrorMsg() {
    alert("ERROR - Oops!!!.  For some reason or another, map failed to load. Please try again later.");
};

//Here starts the ViewModel!
function viewModel() {

    var self = this;
    this.filterText = ko.observable('');
    this.myParks = ko.observableArray(myParks);


    //filter park list here
    this.filteredPark = ko.computed(function() {
        return ko.utils.arrayFilter(self.myParks(), function(parkItem) { 
            var place = parkItem.name.toLowerCase().indexOf(self.filterText().toLowerCase());
            if (place !== -1) {
                if(parkItem.marker)
                  parkItem.marker.setVisible(true);
                } else {
            if(parkItem.marker)
              parkItem.marker.setVisible(false);
            }
            return place !== -1;
        });
      }, self);


    //Bounce the marker when clicked
    this.selectedPark = function(park) {
        if (park.name) {
            park.marker.setAnimation(google.maps.Animation.BOUNCE);
             if (infoWindow !== undefined) {
                infoWindow.close();
            }
            infoWindow = park.infoWindow;
            infoWindow.open(map, park.marker);
        }
        setTimeout(function() {
            park.marker.setAnimation(null);
        }, 1400);
    };

    //Setup the marker
    this.myParks().forEach(function(park) {
        var marker = new google.maps.Marker({
            title: park.name,
            position: park.position,
            map: map,
            animation: google.maps.Animation.DROP
        });

        park.marker = marker;
        marker.setVisible(true);
        this.markers = [];
        this.markers.push(marker);
        this.markers = ko.observableArray([]);
        //Use Ajax to retrieve wiki info
        var wikiUrl ='https://en.wikipedia.org/w/api.php?action=opensearch&format=json&callback=wikiCallBack&search=';
            $.ajax({
                url: wikiUrl+park.name,
                dataType: 'jsonp',
                timeout: 1100
                }).done(function(myParks) {
                    //here the content of the information window with wiki info
                    var infoWindow = new google.maps.InfoWindow();
                    infoWindow.setContent('<h3>Wiki page:  </h3>'+'<p>' + 
                    '<a href=' + myParks[3][0] + ' target="blank">'+park.name + '</a></p>');
                    park.infoWindow = infoWindow;
                    //marker animation
                    park.marker.addListener('click', function () {
                        if (infoWindow !== undefined) {
                            infoWindow.close();
                        }
                        infoWindow = park.infoWindow;
                        park.infoWindow.open(map, this);
                        park.marker.setAnimation(google.maps.Animation.BOUNCE);
                        setTimeout(function () {
                            park.marker.setAnimation(null);
                        }, 1400);
                    });
                    }).fail(function(jqXHR, textStatus){
                    alert("Oops! Wiki call failed. Please try again.");
                });
    });
}

//Initialize the main map
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 40.167781, lng: -95.804427},
    zoom: 4
});
    ko.applyBindings(viewModel());
}
