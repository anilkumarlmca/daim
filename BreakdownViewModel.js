

function BreakdownViewModel() {
    var self = this;
    var coordWindow, searchRequest, bubble;
    var geocoder = null;
    var placesService = null;
    var maxZIndex = 5000;
    var prevSearchText;

    //
    var breakdownLayerGroup = new L.FeatureGroup();
    breakdownLayerGroup.setZIndex(10);
    breakdownLayerGroup.addTo(mainMap);    
    //The icon to be used to display the selected breakdown    
    self.Results = ko.observableArray([]);
    self.Provinces = ko.observableArray([]);
    self.SearchText = ko.observable(CreateSearchText(provider));
    self.SearchResults = ko.observableArray([]);
    self.CurrentMarker = null;
    self.SelectedIndex = ko.observable();
    self.Country = ko.observable();
    self.selProvince = ko.observable();
    self.Street = ko.observable(GetStreetAndNumber());
    self.Postal = ko.observable(callparams.pc ? callparams.pc : "");
    self.City = ko.observable(callparams.cty ? callparams.cty : "");
    self.Subcity = ko.observable(callparams.scty ? callparams.scty : "");
    self.latitude = ko.observable(callparams.lat);
    self.longitude = ko.observable(callparams.lon);
    self.noResults = ko.observable(false);
    self.selectedBreakdown = ko.observable();
    self.MaxResults = ko.observable(1000);
    self.searchMore = ko.observable(false);
    self.showPlaceOption = ko.observable(false);
    self.lastSearch = ko.observable("");

    self.countries = ko.computed(function () {
        return globalvm.countries();
    });
    //debugger;   
    //if (callparams.ctry) {
    //    if (middleEastCountries.indexOf(callparams.ctry.toUpperCase()) != -1) {
    //        searchLanguage = "en-gb";
    //    }
    //}
  
    
    self.Country.subscribe(function (countryCode) {
        //alert(code);
        //Search provinces for this country code
       
	    $.ajax({
	        cache: false,
	        async: true,
	        type: "GET",
	        dataType: "json",
	        url: "../api/provinces?ctryCode=" + countryCode,
	        contentType: "application/json;charset=utf-8",
	        timeout: requestTimeout,
	        success: function (data) {                    
	            //store the results in the array
	            self.Provinces(data);
	            if (data.length > 0) {
	                //Find the object with the given name in the array
	                var selectedProvince = $.grep(self.Provinces(), function (e) { return (e.abbrev === callparams.province || e.abbrev === callparams.state) ; });
	                //Select this item in the dropdown using the id of the item; if not found, select the first item
	                self.selProvince(selectedProvince.length > 0 ? selectedProvince[0].abbrev : data[0].abbrev);
	            }	                
	        },
	        error: function (e) { DisplayError(); }
	    });	    
	});

    self.showMoreOption = ko.computed(function () {
        return (self.SearchResults().length >= self.MaxResults()) && (self.lastSearch() === "F") && (self.searchMore() === false);
    });

    self.AddressLine1 = function (data) {
        var line = "";
        if (data.street) { line = data.street; }
        if (data.houseNumber) { line += (line != "" ? " " : "") + data.houseNumber; }
        if (data.postalCode) { line += (line != "" ? ", " : "") + data.postalCode; }
        if (data.city) { line += (line != "" ? ", " : "") + data.city; }
        return line;
    };

    self.AddressLine2 = function (data) {
        var line = "";
        if (data.district) { line = data.district; }
        if (data.county) { line += (line != "" ? ", " : "") + data.county; }
        if (data.state) { line += (line != "" ? ", " : "") + data.state; }
        line += (line != "" ? ", " : "") + (data.country ? data.country : data.countrycode);
        return line;
    };

    self.updateBreakdown = ko.computed({
        read: function () {
            return globalvm.updateBreakdown();
        },
        write: function (value) {
            globalvm.updateBreakdown(value);
        },  
        owner: this
    });

    self.updateCoord = ko.computed({
        read: function () {
            return globalvm.updateCoord();
        },
        write: function (value) {
            globalvm.updateCoord(value);
        },
        owner: this
    });

    if (callparams.ctry) {
        var countryCodes = $.grep(self.countries(), function (e) { return e.name == callparams.ctry; });
        //Select this item in the dropdown using the id of the item
        self.Country(countryCodes.length > 0 ? countryCodes[0].code : globalvm.Settings().defaultcountry);
    }
    else if (globalvm.Settings()) {
        self.Country(globalvm.Settings().defaultcountry);
    }   
    //================SEARCH FREE==============
    self.SearchFree = function () {
        var params;
        var x = 12;
        if (self.SearchText() != "") {
            self.latitude("");
            self.longitude("");
            if (self.searchMore() == false) self.MaxResults(geocodemaxresults);
            var searchMore = self.searchMore();
            ResetSearch();
            if (prevSearchText === self.SearchText()) {
                self.searchMore(searchMore);//searchmore
            }
            else {
                //search different term
                self.MaxResults(geocodemaxresults);
            }
            prevSearchText = self.SearchText();

            self.lastSearch("F");
            if (callparams.poitype) {
                //Motorway exit: geocode with a specific category filter
                if (callparams.poitype === EXITPOITYPE) {                    
                    provider.GeocodeFree(self.SearchText(), self.MaxResults(), callparams.poitype, self.SearchSuccess, self.SearchError);
                }
                else {
                    //other POI: places API (browse)
                    self.lastSearch("P");
                    provider.PlaceSearch(null, null, null, null, self.SearchText(), callparams.poitype, searchPlaceSuccess, searchPlaceError);
                }
            }
            else {
                //normal geocode   
                provider.GeocodeFree(self.SearchText(), self.MaxResults(), [], self.SearchSuccess, self.SearchError);
            }

            ShowLoading("btnSearch");
        }
        else {
             toastr.info("Please provide search criteria");
        }
    }    
    //================SEARCH ADDRESS==============
    self.SearchAddress = function () {
        self.latitude("");
        self.longitude("");
        self.SearchText("");
        if (self.searchMore() == false) self.MaxResults(geocodemaxresults);
        ResetSearch();
        self.lastSearch("A");
        
        provider.GeocodeAddress(self.Street(), self.Postal(),self.City(), self.Subcity(), self.Country(), self.MaxResults(), self.SearchSuccess, self.SearchError);

        ShowLoading("btnSearchAddress");
    }
    //================SEARCH COORD==============
    self.SearchCoord = function () {
        var coord;

        ResetSearch();

        if (self.latitude() == "" || self.longitude() == "") {
            toastr.info("Please provide latitude and longitude");
        }
        else {
            coord = ConvertCoordinates($.trim(self.latitude()), $.trim(self.longitude()));

            if (coord) {
                self.latitude(coord.latitude);
                self.longitude(coord.longitude);
                ShowLoading("btnSearchCoord");
                self.ReverseGeocode();
            }
            else {
                toastr.info("Unknown coordinate format!");
            }
        }
    }
    self.ReverseGeocode = function () {
        var params;
        if (self.searchMore() == false) self.MaxResults(revgeocodemaxresults);
        ResetSearch();
        self.SearchText("");
        self.Street("");
        self.City("");
        self.Subcity("");
        self.Postal("");
        self.Country(globalvm.Settings().defaultcountry);
        self.lastSearch("R");

        provider.ReverseGeocode(self.latitude(), self.longitude(), revgeocoderadius, self.MaxResults(), self.SearchSuccess, self.SearchError);        
    }
    //================SEARCH PLACES==============
    self.PlaceSearch = function () {
        if (self.lastSearch() == "R") {            
            provider.PlaceSearch(self.latitude(), self.longitude(), revGeoPlacesRadius, self.MaxResults(), self.SearchText(), null, searchPlaceSuccess, searchPlaceError)
        }
        else {           
            provider.PlaceSearch(null, null, revGeoPlacesRadius, self.MaxResults(), self.SearchText(), null, searchPlaceSuccess, searchPlaceError)
        }
    }
    //===============CALLBACK FUNCTIONS
    self.SearchSuccess = function (results) {
        if (results=== null || results.length === 0) {
            
            if (self.lastSearch() == "F") {
                self.PlaceSearch();
            }
            else if (self.lastSearch() == "R") {                
                provider.PlaceSearch(self.latitude(), self.longitude(), revGeoPlacesRadius, null, null, null, searchPlaceSuccess, searchPlaceError);

            }
            else {
                HideLoading();
                self.noResults(true);
            }
            return;
        }
        HideLoading();
        self.noResults(false);
        if (breakdownLayerGroup !== null && breakdownLayerGroup !== undefined) breakdownLayerGroup.clearLayers();

        var zIndex = maxZIndex;
        for (var i = 0; i < results.length; i++) {
            if (self.latitude() === "") self.latitude(results[i].latitude);
            if (self.longitude() === "") self.longitude(results[i].longitude);
            results[i].index = i;
            var svgURL = searchResultSVG.replace(/__NO__/g, (i + 1).toString()).replace(/__COLOR__/g, "#0000FF");
            if (i < 9) svgURL = "data:image/svg+xml;base64," + btoa(svgURL.replace(/_XCOORDINATOR_/g, "10"));
            else svgURL = "data:image/svg+xml;base64," + btoa(svgURL.replace(/_XCOORDINATOR_/g, "7"));
            // create icon
            var svgIcon = L.icon({
                iconUrl: svgURL,
                iconAnchor: [13, 32]
            });
            var popupHtml = "";
            if (providercode === providerKORCode) popupHtml = "<p style='font-size: 12px;white-space: nowrap'>" + results[i].label + "</p>";
            else popupHtml= "<p style='font-size: 12px;'>" +results[i].label + "</p>";
            var m = new MyMarker([results[i].latitude, results[i].longitude], { icon: svgIcon, opacity:1 }).bindPopup(popupHtml);
            m.setDefIcon(svgIcon);
            m.setData({ index: i, result: results[i] });
            m.setZIndexOffset(zIndex);
            m.setOldZIndex(zIndex);
            zIndex--;
            m.addTo(breakdownLayerGroup).on('click', markerOnClick);
            results[i].marker = m;            
        }
        if(providercode !== providerKORCode) self.showPlaceOption(self.lastSearch() == "F" || self.lastSearch() == "R" ? true : false);
        self.SearchResults(results);

        ShowResult(0, results[0], null);
    };
    self.SearchError = function (errorDetails, geocoder, searchParams) {
        HideLoading();
        var strGeocoder = "";
        var strSearchParams = "";
        if (geocoder) {
            strGeocoder = JSON.stringify(geocoder, null, 4);
        }
        if (searchParams) {
            strSearchParams = JSON.stringify(searchParams, null, 4);
        }
        LogError("The place search request failed", "Extra info: " + errorDetails + "\r\ngeocoder: " + strGeocoder + "\r\nSearchParams: " + strSearchParams);
        DisplayError("Search request failed");
    };
    searchPlaceSuccess = function (results) {
        var results, marker, coord, url;
        HideLoading();
        if (results !== null && results.length > 0) {
            var offset = self.SearchResults().length;
            self.noResults(false);
            self.Results(results);
            var zIndex = maxZIndex;

            for (var i = 0; i < results.length; i++) {
                if (self.latitude() === "") self.latitude(results[i].latitude);
                if (self.longitude() === "") self.longitude(results[i].longitude);

                results[i].index = i;
                var svgURL = searchResultSVG.replace(/__NO__/g, (i + offset + 1).toString()).replace(/__COLOR__/g, "#0000FF");
                if (i + offset < 9) svgURL = "data:image/svg+xml;base64," + btoa(svgURL.replace(/_XCOORDINATOR_/g, "10"));
                else svgURL = "data:image/svg+xml;base64," + btoa(svgURL.replace(/_XCOORDINATOR_/g, "7"));
                // create icon
                var svgIcon = L.icon({
                    iconUrl: svgURL,
                    iconAnchor: [13, 32]
                });
                var popupHtml = "";
                if (providercode === providerKORCode) popupHtml = "<p style='font-size: 12px;white-space: nowrap'>" +results[i].label + "</p>";
                else popupHtml= "<p style='font-size: 12px;'>" +results[i].label + "</p>";
                var m = new MyMarker([results[i].latitude, results[i].longitude], { icon: svgIcon }).bindPopup(popupHtml);
                m.setDefIcon(svgIcon);
                m.setData({ index: i + offset, result: results[i] });
                m.setZIndexOffset(zIndex);
                m.setOldZIndex(zIndex);
                zIndex--;
                m.addTo(breakdownLayerGroup).on('click', markerOnClick);
                //store in the object for use later
                results[i].marker = m;
            }

            self.SearchResults($.merge(self.SearchResults(), results));
            ShowResult(offset, results[0], null);
        }
        else {
            self.noResults(true);
        }
        self.showPlaceOption(false);
    };
    searchPlaceError = function (errDetails, url) {
        HideLoading();
        DisplayError("The place search request failed");
        LogError("The place search request failed", "URL: " + url + "\nExtra info: " + GetExtraErrorInfo(errDetails));
    };

    self.UtcSearchSuccess = function (results) {
        if (results === null || results.length === 0) {
            return;
        }
        UpdateTimeZoneData(0, results[0], null);
        self.showPlaceOption(false);

    };

    UpdateTimeZoneData = function (index, location, event) {
        globalvm.utcOffset(location.utcOffset);
        globalvm.rawUtcOffset(location.rawUtcOffset);
        globalvm.localtime(location.localTime);
        globalvm.timezoneid(location.timezoneid);
        if (resourceviewmodel) resourceviewmodel.UpdateLocalTime();
    };
     //Show results on the map============
    ShowResult = function (index, location, event) {        
        var markerIcoClicked = new L.Icon({ iconUrl: imageLocation + breakdownImage, iconAnchor: [64, 31] })
        //set the icon of the previous marker back.
        if (clickedMarker) {            
            clickedMarker.setIcon(clickedMarker.getDefIcon());
            clickedMarker.setZIndexOffset(clickedMarker.getOldZIndex());
            clickedMarker.setOpacity(1);
        }

        if (location.marker !== null && location.marker != undefined) {
            location.marker.setIcon(markerIcoClicked);
            location.marker.setZIndexOffset(10002);
            clickedMarker = location.marker;
        }
        else {
            var result = $.grep(self.SearchResults(), function (f) { return f.latitude === location.latitude && f.longitude === location.longitude; });
            result[0].marker.setIcon(markerIcoClicked);
            result[0].marker.setZIndexOffset(10002);
            clickedMarker = result[0].marker;
        }       
        clickedMarker.setOpacity(1);
        self.SelectedIndex(index);
        self.selectedBreakdown(location);

        globalvm.Breakdown(location.label);
        globalvm.breakdownCountry(location.countrycode);
        globalvm.breakdownPostalCode(location.postalCode);
        globalvm.latitude(location.latitude);
        globalvm.longitude(location.longitude);
        globalvm.href(location.href);
        globalvm.utcOffset(location.utcOffset);
        globalvm.rawUtcOffset(location.rawUtcOffset);
        globalvm.localtime(location.localTime);
        globalvm.timezoneid(location.timezoneid);
        globalvm.timezonename(location.timezonename);
       
        //if (!location.utcOffset) provider.UtcReverseGeocode(self.latitude(), self.longitude(), revgeocoderadius, self.UtcSearchSuccess, self.SearchError);
        if (!location.timezoneid) provider.UtcReverseGeocode(self.latitude(), self.longitude(), revgeocoderadius, self.UtcSearchSuccess, self.SearchError);

        if(resourceviewmodel) resourceviewmodel.UpdateLocalTime();

        mainMap.fitBounds(breakdownLayerGroup.getBounds().extend([location.latitude, location.longitude]));
    }

    //Show more results on the map============
    self.More = function () {
        self.searchMore(true);
        self.MaxResults(moremaxvalue);

        switch (self.lastSearch()) {
            case "F":
                self.SearchFree();
                break;
            case "A":
                self.SearchAddress();
                break;
            case "R":
                self.ReverseGeocode();
                break;
            case "P":
                self.PlaceSearch();
                break;
        }
    }

    ResetSearch = function () {
        self.lastSearch("");
        self.searchMore(false);
        self.showPlaceOption(false);
        self.SelectedIndex(0);
        self.SearchResults([]);
        self.selectedBreakdown();
        globalvm.Breakdown("");        
        self.CurrentMarker = null;       
        breakdownLayerGroup.clearLayers();
        //
        if (resourceviewmodel) resourceviewmodel.ResetResourceSearch();
    }

    markerOnClick = function (evt) {        
        ShowResult(evt.target.getData().index, evt.target.getData().result, null);
    };

    self.ShowCoordinateConverter = function () {
        if (coordWindow) {
            if (coordWindow.element.is(":hidden")) {
                coordWindow.open();
            }
        }
        else {
            coordWindow = $("#CoordConvWindow").kendoWindow({
                actions: ["Close"],
                draggable: true,
                height: "550px",
                modal: false,
                resizable: true,
                title: "Coordinate Converter",
                width: "420px",
                content: "CoordinateConverter.aspx?popup=1"
            }).data("kendoWindow");
        }
        coordWindow.center();
    }

    self.GetCountryName = function (additionalData) {
        var countries = $.grep(additionalData, function (d) { return d.key == "CountryName"; });
        if (countries.length > 0) return countries[0].value;
        return "";
    }
}

breakdownviewmodel = new BreakdownViewModel();
ko.applyBindings(breakdownviewmodel, $("#PanelBreakdown")[0]);
//# sourceURL=breakdownviewmodel.js
