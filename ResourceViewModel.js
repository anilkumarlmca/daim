function ResourceViewModel() {

    var self = this;
    var zIndexVansForDealer = 10000;
    var dlrWin, svWin, routeWin, caseWin, rsResource, routecount, routingService, currentResource, pressDetail;
    var dt = new Date();
    var brandsBound = false;
    var divisionsBound = false;
    var routecolors = new Array("#0b7b47", "#a45df1", "#fa6e59", "#7b0b3f", "#0a0a47", "#eb8c00", "#aaf15d", "#0000FF", "#070707", "#60F9FF", "#00FF00", "#FF7B00", "#FF0000", "#5C4CDF", "#FF00B2");
    var resourceLayerGroup = new L.FeatureGroup();
    resourceLayerGroup.setZIndex(20);
    mainGroupLayer.addLayer(resourceLayerGroup);
    var clickedMarker;
    self.dealerTooltip = ko.observable();
    var evobusLayerGroup = new L.FeatureGroup();
    mainGroupLayer.addLayer(evobusLayerGroup);
    var routesLayerGroup = new L.FeatureGroup();
    mainGroupLayer.addLayer(routesLayerGroup);
    //var today = new Date();
    //var dd = '0' + today.getDate();
    //dd = dd.substr(dd.length - 2);
    //var mm = today.getMonth() + 1; //January is 0!
    //mm = '0' + mm;
    //mm = mm.substr(mm.length - 2);
    //var yyyy = today.getFullYear();
    self.numResources = new Array(globalvm.Settings().maxnum1, globalvm.Settings().maxnum2, globalvm.Settings().maxnum3);
    self.distance = new Array(globalvm.Settings().maxdist1, globalvm.Settings().maxdist2, globalvm.Settings().maxdist3);
    self.drivingTime = new Array(globalvm.Settings().maxtime1, globalvm.Settings().maxtime2, globalvm.Settings().maxtime3);
    self.resTypes = new Array({ code: "d", name: "Dealer" }, { code: "s", name: "Service Van" }, { code: "b", name: "Both" });
    self.services = new Array({ code: "se", name: "Service" }, { code: "sa", name: "Sales" }, { code: "nf", name: "No Filter" });
    self.limitBy = new Array({ code: "n", name: "Number" }, { code: "d", name: "(Road) Distance" }, { code: "t", name: "Driving Time" });
    var weekDays = new Array({ name: "MON", num: 1 }, { name: "TUE", num: 2 }, { name: "WED", num: 3 }, { name: "THU", num: 4 }, { name: "FRI", num: 5 }, { name: "SAT", num: 6 }, { name: "SUN", num: 0 });
    self.roadCalcDirections = new Array({ code: "t", name: "To" }, { code: "f", name: "From" });


    self.Brands = ko.observableArray([]);
    self.Divisions = ko.observableArray([]);
    self.Classes = ko.observableArray([]);
    self.additionalServices = ko.observableArray([]);
    self.selBrand = ko.observable();
    self.selDivision = ko.observable();
    self.selClass = ko.observable();
    //self.selAddSvc = ko.observable();
    self.selAddSvc = ko.observableArray([]);

    var calculated = moment().utc().add(globalvm.utcOffset(), 's');

    self.selDate = ko.observable(calculated.format('DD-MM-YYYY'));
    self.selTime = ko.observable(PadLeft(calculated.hour(), "0", 2) + ":" + PadLeft(calculated.minute(), "0", 2));

    self.timezoneid = ko.observable();
    self.timezonename = ko.observable();

    self.selService = ko.observable(callparams.svc ? callparams.svc : "se");
    self.selResType = ko.observable(callparams.res ? callparams.res : "d");
    self.chkOpen = ko.observable(callparams.open == "y");
    //initialization
    $("#datepicker").datepicker("option", "disabled", !self.chkOpen());
    self.chkS24h = ko.observable(callparams.s24h == "y");
    self.chkRoadside = ko.observable(callparams.rsa == "y");
    self.chkUptime = ko.observable(callparams.upt == "y" || callparams.upt == "Y" || callparams.uptbus == "y" || callparams.uptbus == "Y");
    self.chkCamper = ko.observable(callparams.camp == "y" || callparams.camp == "Y");
    self.dealerId = ko.observable();
    self.selLimitBy = ko.observable(callparams.lim ? callparams.lim : "n");
    self.selNumResources = ko.observable(globalvm.Settings().maxnum1);
    self.selDistance = ko.observable(globalvm.Settings().maxdist1);
    self.selDrivingTime = ko.observable(globalvm.Settings().maxtime1);
    self.SearchResResults = ko.observableArray([]);
    self.SelectedResIndex = ko.observable();
    self.selectedVanForDealerIndex = ko.observable(-1);
    self.vansForDealers = ko.observableArray();
    self.selectedResource = ko.observable();
    self.roadCalcDirection = ko.observable(callparams.dir ? callparams.dir : "t");
    self.roadCalc = ko.observable(callparams.rdi == "y");
    self.natResources = ko.observable(callparams.nro == "y");
    self.radius = ko.observable();
    self.noResults = ko.observable(false);

    self.selBrand.extend({ notify: 'always' });
    self.selDivision.extend({ notify: 'always' });

    self.standAlone = ko.computed(function () {
        if (!callparams.type) return true;
        return (callparams.type == "");
    });

    self.distUnit = ko.computed(function () {
        return (globalvm.Settings().distanceunit == "M" ? "miles" : "km");
    });

    self.updateResource = ko.computed({
        read: function () {
            return globalvm.updateResource();
        },
        write: function (value) {
            globalvm.updateResource(value);
        },
        owner: this
    });

    self.chkOpenComp = ko.computed({
        read: function () {
            self.chkOpen(self.selService() != 'nf' && self.chkOpen());
            return self.chkOpen();
        },
        write: function (value) {
            $("#datepicker").datepicker("option", "disabled", !value);
            this.chkOpen(value);
        },
        owner: this
    });

    self.chkS24hComp = ko.computed({
        read: function () {
            self.chkS24h(self.selService() == 'se' && self.chkS24h());
            return self.chkS24h();
        },
        write: function (value) {
            self.chkS24h(value);
        },
        owner: this
    });

    self.chkUptimeComp = ko.computed({
        read: function () {
            self.chkUptime(self.selService() == 'se' && self.chkUptime());
            return self.chkUptime();
        },
        write: function (value) {
            self.chkUptime(value);
        },
        owner: this
    });

    self.chkRoadsideComp = ko.computed({
        read: function () {
            self.chkRoadside(self.selService() == 'se' && self.chkRoadside());
            return self.chkRoadside();
        },
        write: function (value) {
            self.chkRoadside(value);
        },
        owner: this
    });

    self.chkCamperComp = ko.computed({
        read: function () {
            self.chkCamper(self.selService() == 'se' && self.chkCamper());
            return self.chkCamper();
        },
        write: function (value) {
            self.chkCamper(value);
        },
        owner: this
    });

    //$.support.cors = true; //Necessary for IE
    $.ajax({
        cache: false,
        async: true,
        type: "GET",
        dataType: "json",
        url: "../api/brands",
        contentType: "application/json;charset=utf-8",
        timeout: requestTimeout,
        success: function (data) {
            //store the value in the array
            self.Brands(data);
            //the Brands dropdown is bound now
            brandsBound = true;
            //Find the object with the given name in the array
            var selectedBrand = $.grep(self.Brands(), function (e) { return e.name == callparams.br; });
            //Select this item in the dropdown using the id of the item
            self.selBrand(selectedBrand.length > 0 ? selectedBrand[0].id : data[0].id);
        },
        error: function (e) { DisplayError(); }
    });

    $.ajax({
        cache: false,
        async: true,
        type: "GET",
        dataType: "json",
        url: "../api/AdditionalServices",
        contentType: "application/json;charset=utf-8",
        timeout: requestTimeout,
        success: function (data) {
            self.additionalServices(data);
            var test = callparams.add ? callparams.add.split(",") : "";
            self.selAddSvc(test);
        },
        error: function (e) { DisplayError(); }
    });

    self.selBrand.subscribe(function (brandId) {
        //initial binding also triggers this event. In this case the divisions should not be retrieved
        if (brandsBound) {
            //Search divisions for this brand
            $.ajax({
                cache: false,
                async: true,
                type: "GET",
                dataType: "json",
                url: "../api/divisions/" + brandId,
                contentType: "application/json;charset=utf-8",
                timeout: requestTimeout,
                success: function (data) {
                    //store the results in the array
                    self.Divisions(data);
                    //The divisions dropdown is bound now
                    divisionsBound = true;
                    //Find the object with the given name in the array
                    var selectedDiv = $.grep(self.Divisions(), function (e) { return e.name == callparams.div; });
                    //Select this item in the dropdown using the id of the item; if not found, select the first item
                    self.selDivision(selectedDiv.length > 0 ? selectedDiv[0].id : data[0].id);
                },
                error: function (e) { DisplayError(); }
            });
        }
    });

    self.selDivision.subscribe(function (divisionId) {
        //initial binding also triggers this event. In this case the classes should not be retrieved
        if (divisionsBound) {
            //search classes for this division
            $.ajax({
                cache: false,
                async: true,
                type: "GET",
                dataType: "json",
                url: "../api/classes/" + divisionId,
                contentType: "application/json;charset=utf-8",
                timeout: requestTimeout,
                success: function (data) {
                    //store the results in the array
                    self.Classes(data);
                    //Find the object with the given name in the array
                    var selectedClass = $.grep(self.Classes(), function (e) { return e.name == callparams.cls; });
                    //Select this item in the dropdown using the id of the item; if not found, select the first item
                    self.selClass(selectedClass.length > 0 ? selectedClass[0].id : data[0].id);
                },
                error: function (e) { DisplayError(); }
            });
        }
    });


    //================== EvoBus================================

    self.Evobus = function () {
        var url, coord, evoMarker, evoMarkerIcon;
        var radius = parseInt($("#txtRadius").val());

        if (!isNaN(radius) && radius <= 250) {
            self.ResetResourceSearch();
            if (globalvm.Settings().distanceunit === "M") { radius = radius * 1.609; }
            ShowLoading("btnEvobus");

            provider.EvoBusSearch(globalvm.latitude(), globalvm.longitude(), radius, globalvm.Settings().distanceunit, self.EvobusSuccess, self.EvobusError);
        }
        else {
            toastr.info("Please provide a valid search radius:\nA numeric value from 1 to 250");
        }
    };

    self.EvobusSuccess = function (data) {
        HideLoading();

        if (data.geometries) {
            if (evobusLayerGroup !== null && evobusLayerGroup !== undefined) mainGroupLayer.removeLayer(evobusLayerGroup);
            evobusLayerGroup = new L.FeatureGroup();
            mainGroupLayer.addLayer(evobusLayerGroup);
            var lat; var long;
            var svgURL = searchResultSVG.replace(/__NO__/g, "").replace(/__COLOR__/g, "#FF0000");
            svgURL = "data:image/svg+xml;base64," + btoa(svgURL.replace(/_XCOORDINATOR_/g, "10"));

            // create icon
            var ico = L.icon({
                iconUrl: svgURL,
                iconAnchor: [10, 26]
            });
            var zIndex = 500;
            $.each(data.geometries, function (index, value) {
                //LEAFLET          
                var m = new MyMarker([value.nearestLat, value.nearestLon], { icon: ico, opacity: 1 }).bindPopup(CreateLocationString(value));
                m.setZIndexOffset(zIndex);
                m.setOldZIndex(zIndex);
                zIndex--;
                m.setData(value);
                m.setDefIcon(ico);
                m.addTo(evobusLayerGroup);
            });
            mainMap.fitBounds(evobusLayerGroup.getBounds().extend([globalvm.latitude(), globalvm.longitude()]));
        }
        else {
            if (data.error_id) {
                LogError("The Evobus search request failed", "Error message: " + data.issues[0].message);
            }
        }
    };

    self.EvobusError = function (xhr, status, e) {
        HideLoading();
        DisplayError();
        var err = eval("(" + xhr.responseText + ")");
        LogError("The Evobus search request failed", "URL: " + url + "\nExtra info: " + GetExtraErrorInfo(err));
    };

    self.EvoClear = function () {
        evobusLayerGroup.clearLayers();
    };

    //====================Resource====================
    self.SearchResource = function () {
        var parameters;
        self.noResults(false);
        if (globalvm.latitude() && globalvm.longitude()) {
            if (self.natResources() && globalvm.breakdownCountry() == "" && globalvm.href() != "") {
                $.ajax({
                    cache: false,
                    async: true,
                    type: "GET",
                    dataType: "jsonp",
                    url: globalvm.href(),
                    contentType: "application/json;charset=utf-8",
                    timeout: requestTimeout,
                    success: function (data) {
                        if (data) {
                            globalvm.breakdownCountry(data.location && data.location.address && data.location.address.countryCode ? data.location.address.countryCode : "");
                            //MA: we need to set postal code here as well since needed for AOI!
                            globalvm.breakdownPostalCode(data.location && data.location.address && data.location.address.postalCode ? data.location.address.postalCode : "");
                            parameters = GetSearchParams();
                            DoSearchResource(parameters);
                        };
                    },
                    error: function (xhr, status, e) {
                        DisplayError("The place lookup failed");
                        var err = eval("(" + xhr.responseText + ")");
                        LogError("The place lookup failed", "URL: " + globalvm.href() + "\nExtra info: " + GetExtraErrorInfo(err));
                    }
                });
            }
            else {
                parameters = GetSearchParams();
                DoSearchResource(parameters);
            }
        }
        else {
            alert("Please select a breakdown location first");
        }
    };

    DoSearchResource = function (params) {
        self.ResetResourceSearch();
        ShowLoading("btnSearchRes");

        $.ajax({
            cache: false,
            async: true,
            type: "POST",
            dataType: "json",
            url: "../api/SearchResources",
            data: JSON.stringify(params),
            contentType: "application/json;charset=utf-8",
            timeout: requestTimeout,
            success: ProcessResults,
            error: function (xhr, status, e) {
                HideLoading();
                DisplayError();
                var err = eval("(" + xhr.responseText + ")");
                LogError("The resource search request failed", "Extra info: " + GetExtraErrorInfo(err));
            }
        });
    }

    GetSearchParams = function () {
        var dateelements = self.selDate().split("-");
        var openDate = new Date(dateelements[2], dateelements[1] - 1, dateelements[0]);
        var opendaynum = openDate.getDay();
        var opendayname = $.grep(weekDays, function (e) {
            return e.num === opendaynum
        })[0].name;

        var params =
            {
                brand: $("#ddlBrand option:selected").text(),
                division: $("#ddlDivision option:selected").text(),
                vehclass: $("#ddlClass option:selected").text(),
                addsvc: (self.selAddSvc() ? (Array.isArray(self.selAddSvc()) ? self.selAddSvc().join(',') : "") : ""),
                country: globalvm.breakdownCountry(),
                direction: self.roadCalcDirection(),
                unit: globalvm.Settings().distanceunit,
                opendayname: (self.chkOpen() ? opendayname : ""),
                opendaynum: (self.chkOpen() ? opendaynum : ""),
                opentime: (self.chkOpen() ? self.selTime() : ""),
                type: self.selResType(),
                roadside: self.chkRoadside(),
                s24h: self.chkS24h(),
                uptime: self.chkUptime(),
                service: self.selService(),
                location: new CACCoordinate(parseFloat(globalvm.latitude()), parseFloat(globalvm.longitude())),
                maxres: (self.selLimitBy() == 'n' ? self.selNumResources() : ""),
                maxdist: (self.selLimitBy() == 'd' ? self.selDistance() : ""),
                maxtime: (self.selLimitBy() == 't' ? self.selDrivingTime() : ""),
                natresonly: self.natResources(),
                roaddistcalc: self.roadCalc(),
                providercode: providercode,
                opendaydate: (self.chkOpen() ? self.selDate() : "")
                //MA: pass additional params needed for the AOI implementation
                , postal_code: globalvm.breakdownPostalCode() //from selected location
                , add_aoi: (callparams.add_aoi === 'y') //from URL query string
                //TODO/CHECK: get from data.location.address.stateCode?
                , province: ''
                , tr: callparams.tr
                , em: callparams.em
                , utcoffset: globalvm.rawUtcOffset()
                , camp: self.chkCamper()

            };

        return params;
    }

    ProcessResults = function (data) {
        var marker, resourceIcon;
        var coord;
        try {

            HideLoading();

            if (data) {
                self.noResults(data.length === 0);
                var zIndex = 100;

                //reset
                zIndexVansForDealer = 1000;
                if (data.length > 0) {
                    for (var i = 0; i < data.length; i++) {
                        //create Icon
                        var ico = L.icon({
                            iconUrl: imageLocation + data[i].image,
                            iconAnchor: [40, 25]
                        });
                        //create marker with event click, bind the popup and add to the layer
                        var m = new MyMarker([data[i].location.latitude, data[i].location.longitude], {
                            icon: ico
                        });
                        
                        m.setZIndexOffset(zIndex);
                        m.setOldZIndex(zIndex);
                        zIndex--;
                        m.setData(i);
                        m.setDefIcon(ico);

                        //check if its a dealer
                        if (data[i].dealer) {
                            var markerPopup = L.popup({ className: "DealerMapPopup" })
                            .setContent(self.MakeDealerTooltip(data[i].dealer, i));
                            m.bindPopup(markerPopup)
                                .on('mouseover', function (evt) {
                                    evt.target.openPopup();
                                })
                                .on('mouseout', function (evt) {
                                    self.markerWithPopupMouseLeave(evt, evt.target.getPopup());
                                });
                        }

                        m.addTo(resourceLayerGroup)
                            .on('click', function (evt) {
                                var index = evt.target.getData();
                                var innerListItem = $(".SearchResResultDealer")[index];
                                if (innerListItem === null || innerListItem === undefined) innerListItem = $(".SearchResResultVan")[index];
                                var parentDiv = $("#panelContainer");
                                if (innerListItem !== null && innerListItem !== undefined) parentDiv.scrollTop(innerListItem.offsetTop);

                                self.SelectResource(index, -1, evt.target, true);
                            });

                        //init as observable

                        data[i].flags = ko.observable();
                        data[i].time = ko.observable(data[i].time);
                        data[i].distance = ko.observable(data[i].distance);
                        data[i].routeactive = ko.observable(false);
                        data[i].vansearch = ko.observable(true);
                        //store in this object for use later
                        data[i].marker = ko.observable(m);

                    }
                    //store data to an array 
                    self.SearchResResults(data);
                    if (data.length > 0) {
                        var innerListItem = $(".SearchResResultDealer")[0];
                        if (innerListItem === null || innerListItem === undefined) innerListItem = $(".SearchResResultVan")[0];
                        var parentDiv = $("#panelContainer");
                        if (innerListItem !== null && innerListItem !== undefined) parentDiv.scrollTop(innerListItem.offsetTop);
                        self.SelectResource(0, -1, data[0].marker(), null);
                    }
                }
            }
            else {
                self.noResults(true);
            }
        }
        catch (e) {
            //DisplayError("Processing of results failed: " + e.message);
            DisplayError("Processing of results failed!");

            //MA: [number] and [description] are "undefined" so we do not log them!?
            LogError("Processing of results failed", "name=[" + e.name + "]; message=[" + e.message + "]; stack=[" + e.stack + "];");
            console.info("Processing of results failed", "name=[" + e.name + "]; message=[" + e.message + "]; stack=[" + e.stack + "];");
        }
    };

    //MA
    self.ColorizeID = function (dealer) {
        //CHECK
        var s = (((dealer.is_aoi != null) && dealer.is_aoi) ? "red" : "#787878");

        return s;
    }

    //return truncated text with '...' at the end
    self.trimText = function (text, maxLength) {
        return (text.length > maxLength ? text.substring(0, (maxLength - 1)) + ' ...' : text);
    }

    self.markerWithPopupMouseLeave = function (evt, markerPopup) {
        var toElement = $(evt.originalEvent.toElement);
        var toElementClassName = "";

        if (toElement !== undefined && toElement !== null && toElement[0] !== undefined && toElement[0] !== null)
            toElementClassName = toElement[0].className;

        //only closes when mouse is not over the popup;
        if ($(".DealerMapPopup:hover").length === 0 && toElementClassName.indexOf("DealerMapPopup") === -1 && toElementClassName.indexOf("leaflet-popup-content-wrapper") === -1) {
            mainMap.closePopup(markerPopup);
        }
        else {
            //leaflet workaround - if the mouse is over the popup we bind an one-time mouseleave event to close it
            $(".DealerMapPopup").one("mouseleave", function (popupLeaveEvent) {
                mainMap.closePopup(markerPopup);
            });
        }
    }

    self.isDealerTooltipShowMoreVisible = ko.computed(function () {
        var dTooltip = self.dealerTooltip();
        if (!dTooltip)
            return false;

        if (dTooltip.check_reason && dTooltip.check_reason.length > 50)
            return true;
        if (dTooltip.not_available_reason && dTooltip.not_available_reason.length > 50)
            return true;

        return false;
    }, this);

    self.dealerTooltipShowMoreClick = function (dealerIndex, event) {
        self.SelectResource(dealerIndex, -1, event, true);
    }

    //MA: return tooltip for dealer
    //GM: in HTML
    self.MakeDealerTooltip = function (dealer, dealerResResultsIndex) {
        var dealerTooltip = dealer;
        //inject the index in the dealerTooltip object
        dealerTooltip.resResultsIndex = dealerResResultsIndex;

        //bind the dealer object to tooltipElement
        self.dealerTooltip(dealerTooltip);
        var returnHTML = $("#tooltipElement").html();

        //remove the bindings
        ko.cleanNode(returnHTML);

        return returnHTML;
    };

    self.SelectResource = function (index, vanForDealerIndex, evt, showdetails) {
        //data render
        if (self.SearchResResults().length > 0) {
            var selectedIconLeaflet;
            if (index != self.SelectedResIndex() || vanForDealerIndex != self.selectedVanForDealerIndex()) {
                self.SelectedResIndex(index);
                self.selectedVanForDealerIndex(vanForDealerIndex);
                self.selectedResource(self.SearchResResults()[index]);

                if (routeWin) routeWin.close();
                if (self.selectedResource().type == "d") {
                    if (svWin) svWin.close();
                    if (caseWin) caseWin.close();
                }
                if (self.selectedResource().type == "s") {
                    //prevent double refresh if event was triggered by ShowCases click
                    var isShowCasesClick = false;
                    if (evt && evt.toElement) {
                        if (evt.toElement.parentElement && evt.toElement.parentElement.dataset && evt.toElement.parentElement.dataset.bind)
                            isShowCasesClick = evt.toElement.parentElement.dataset.bind.indexOf("ShowCases") !== -1;
                        else if (evt.toElement.dataset && evt.toElement.dataset.bind)
                            isShowCasesClick = evt.toElement.dataset.bind.indexOf("ShowCases") !== -1;
                    }

                    if (dlrWin) dlrWin.close();
                    if (caseWin && caseWin.element.is(":visible") && !isShowCasesClick) { caseWin.refresh(); }
                }

                if (self.selectedResource().dealer) {
                    globalvm.Resource(self.selectedResource().dealer.dealerid + " - " + self.selectedResource().dealer.name);
                }
                else {
                    globalvm.Resource(self.selectedResource().servicevan.license + " - " + self.selectedResource().servicevan.m4t + " - " + self.selectedResource().servicevan.dealerid);
                }
                //Icon with highlight mark
                selectedIconLeaflet = L.icon({ iconUrl: imageLocation + self.selectedResource().imagesel, iconAnchor: [40, 25] });
                //set the icon of the previous marker back.
                if (clickedMarker) {
                    clickedMarker.setIcon(clickedMarker.getDefIcon());
                    clickedMarker.setZIndexOffset(clickedMarker.getOldZIndex());
                }
                self.selectedResource().marker().setIcon(selectedIconLeaflet);
                //bring selected marker to front
                self.selectedResource().marker().setZIndexOffset(1001);
                clickedMarker = self.selectedResource().marker();
            }

            if (showdetails) {
                if (self.selectedResource().type == "d") {
                    self.DealerDetails();
                }
                else {
                    self.VanDetails();
                }
            }
            else if (dlrWin) {
                dlrWin.refresh();
            }
        }
        mainMap.fitBounds(resourceLayerGroup.getBounds().extend([globalvm.latitude(), globalvm.longitude()]));
        return true;
    };

    self.ResetResourceSearch = function () {
        if (dlrWin) dlrWin.close();
        if (svWin) svWin.close();
        if (routeWin) routeWin.close();
        if (caseWin) caseWin.close();
        resourceLayerGroup.clearLayers();
        routesLayerGroup.clearLayers();
        clickedMarker = null;
        selectedMarker = null;
        //
        self.EvoClear();
        self.SelectedResIndex(-1);
        self.selectedVanForDealerIndex(-1);
        self.selectedResource();
        self.SearchResResults([]);
        self.vansForDealers([]);
        globalvm.Resource("");
        routecount = 0;
    };
    //=========================Route=====================
    self.RouteClick = function (data, event) {
        if (event.target.checked) {
            ShowRoute(data);
        }
        else {
            //remove the route from the map            
            routesLayerGroup.removeLayer(data.routecontainer);
            //TODO
            data.routeactive(false);
        }
        return true;
    }

    self.AltRouteClick = function (data, event) {
        if (event.target.checked) {
            routesLayerGroup.removeLayer(data.routecontainer);
            data.routecontainer = null;
            CalculateRoute(data, true);
        }
        else {
            routesLayerGroup.removeLayer(data.routecontainer)
            data.routecontainer = null;
            CalculateRoute(data, false);
        }
        return true;
    }

    ShowRoute = function (data) {
        if (data.routecontainer != null) {
            var routeLocalLayerGroup = data.routecontainer;
            var i = 0;
            routesLayerGroup.addLayer(routeLocalLayerGroup);
            data.routeactive(true);
        }
        else {
            //send calculate request
            CalculateRoute(data, false);
        }
    }

    CalculateRoute = function (data, altRoute) {
        var routingParams, flags;

        if (self.roadCalcDirection() == "f") {
            provider.CalculateRoute(globalvm.latitude(), globalvm.longitude(), data.location.latitude, data.location.longitude, self.CalculateDeparture(), altRoute, self.RoutingSuccess, self.RoutingError);
        }
        else {
            provider.CalculateRoute(data.location.latitude, data.location.longitude, globalvm.latitude(), globalvm.longitude(), self.CalculateDeparture(), altRoute, self.RoutingSuccess, self.RoutingError);
        }
        currentResource = data;
    }

    self.RoutingSuccess = function (result) {
        var flags, rt;
        flags = FilterFlags(result.flags);
        currentResource.flags(flags);

        currentResource.maneuvers = result.maneuvers;
        currentResource.summary = result.summary;
        DrawRoute(result, currentResource);

    }

    self.RoutingError = function (e) {

        DisplayError("The routing request failed");
        LogError("The routing request failed", e.message);
        console.info("The routing request failed", e.message);
    }

    DrawRoute = function (route, data) {
        var colorLine, linkPoly, flags;
        var parts, routeLine, routeLocalLayerGroup;
        var pointList = [];
        var specialPointList = [];
        if (!data.routecolor) {
            data.routecolor = routecolors[routecount % routecolors.length];
            routecount++;
        }
        colorLine = data.routecolor;
        route.shape.forEach(function (point) {
            parts = point.split(",");
            var point = new L.LatLng(parts[0], parts[1]);
            pointList.push(point);

        });

        routeLocalLayerGroup = new L.FeatureGroup();
        routeLine = new L.Polyline(pointList, {
            color: colorLine,
            weight: 4,
            opacity: 1,
            smoothFactor: 1
        }).addTo(routeLocalLayerGroup);
        //routeLine.setText('   ►   ', { repeat: true, attributes: { fill: 'white', 'font-size': '13px' } });
        routeLine.on('mouseover', function () {
            this.setText('  ►  ', { repeat: true, attributes: { fill: 'white', 'font-size': '14px', stroke: '#00ff00' } });
        });

        routeLine.on('mouseout', function () {
            this.setText(null);
        });

        data.routeactive(true);
        data.distance(FormatDistance(route.distance, globalvm.Settings().distanceunit));
        data.time(FormatTime(route.trafficTime));
        data.routecontainer = routeLocalLayerGroup;
        $.each(route.links, function (index, value) {
            flags = FilterFlags(value.flags);
            if (flags != "") {
                specialPointList = [];
                value.shape.forEach(function (point) {
                    parts = point.split(",");
                    console.info(point);
                    var point = new L.LatLng(parts[0], parts[1]);
                    specialPointList.push(point);

                });
                var color = (flags === "tunnel") ? "#FFFF00" : "#BB113B";
                specialRouteLine = new L.Polyline(specialPointList, {
                    color: color,
                    weight: 5,
                    opacity: 1,
                    smoothFactor: 1
                }).addTo(routeLocalLayerGroup);

            }
        });
        routeLocalLayerGroup.addTo(routesLayerGroup);
        mainMap.fitBounds(resourceLayerGroup.getBounds().extend([globalvm.latitude(), globalvm.longitude()]));
    }

    self.RouteDescription = function () {
        if (dlrWin) dlrWin.close();
        if (svWin) svWin.close();
        if (caseWin) caseWin.close();

        if (routeWin) {
            if (routeWin.element.is(":hidden")) {
                routeWin.open();
            }
            routeWin.refresh();
        }
        else {
            routeWin = $("#RouteDescWindow").kendoWindow({
                actions: ["Close"],
                draggable: true,
                height: "500px",
                modal: false,
                resizable: true,
                title: "Route description",
                width: "700px",
                content: "RouteDescription.htm"
            }).data("kendoWindow");
        }
    }

    self.CalculateDeparture = function () {
        var openDayNum, timeParts, now, todayNum, dt, hr, min;

        if (self.chkOpen()) {
            var dateelements = self.selDate().split("-");
            var openDate = new Date(dateelements[2], dateelements[1] - 1, dateelements[0]);
            openDayNum = openDate.getDay();
            timeParts = self.selTime().split(":");
            now = new Date();
            todayNum = now.getDay();

            if (timeParts.length != 2) {
                alert("Incorrect time format!");
                return;
            }

            hr = parseInt(timeParts[0]);
            min = parseInt(timeParts[1]);

            dt = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hr, min, 0, 0);

            if (openDayNum != todayNum) {
                if (openDayNum > todayNum) {
                    dt.setDate(dt.getDate() + (openDayNum - todayNum));
                }
                else {
                    dt.setDate(dt.getDate() + ((openDayNum + 7) - todayNum));
                }
            }

            return ToXmlUtcDateTime(dt);
        }
        else {
            return ToXmlUtcDateTime(new Date());
        }
    }
    //======================Dealer===============
    self.SearchDealerId = function () {
        if (self.dealerId()) {
            if (globalvm.latitude() && globalvm.longitude()) {
                self.noResults(false);
                self.ResetResourceSearch();
                self.selService("nf");

                ShowLoading("btnDealerId");

                $.ajax({
                    cache: false,
                    async: true,
                    type: "GET",
                    dataType: "json",
                    url: "../api/SearchResources?providercode=" + providercode + "&dlr=" + self.dealerId() + "&bdlat=" + globalvm.latitude() + "&bdlon=" + globalvm.longitude() + "&dir=" + self.roadCalcDirection() + "&unit=" + globalvm.Settings().distanceunit,
                    contentType: "application/json;charset=utf-8",
                    timeout: requestTimeout,
                    success: ProcessResults,
                    error: function (e) { HideLoading(); DisplayError(); }
                });
            }
            else {
                alert("Please select a breakdown location first");
            }
        }
        else {
            alert("Please provide a dealer id");
        }
    };

    self.DealerDetails = function () {
        if (svWin) svWin.close();
        if (routeWin) routeWin.close();
        if (caseWin) caseWin.close();

        if (dlrWin) {
            if (dlrWin.element.is(":hidden")) {
                dlrWin.open();
            }
            dlrWin.refresh();
        }
        else {
            dlrWin = $("#DealerDetailsWindow").kendoWindow({
                actions: ["Close"],
                draggable: true,
                height: "450px",
                modal: false,
                resizable: true,
                title: "Dealer details",
                width: "450px",
                content: "DealerDetails.htm"
            }).data("kendoWindow");
        }
    };

    //=============PostalCode===============
    self.SearchPostalCode = function () {
        if (globalvm.latitude() && globalvm.longitude()) {
            self.noResults(false);
            self.ResetResourceSearch();
            self.selService("nf");

            ShowLoading("btnPostalCode");

            if (globalvm.breakdownCountry() != "" && globalvm.breakdownPostalCode() != "") {
                self.DoSearchPostalCode();
            }
            else {
                if (globalvm.href() != "") {
                    $.ajax({
                        cache: false,
                        async: true,
                        type: "GET",
                        dataType: "jsonp",
                        url: globalvm.href(),
                        contentType: "application/json;charset=utf-8",
                        timeout: requestTimeout,
                        success: function (data) {
                            if (data) {
                                globalvm.breakdownCountry(data.location && data.location.address && data.location.address.countryCode ? data.location.address.countryCode : "");
                                globalvm.breakdownPostalCode(data.location && data.location.address && data.location.address.postalCode ? data.location.address.postalCode : "");
                                self.DoSearchPostalCode();
                            };
                        },
                        error: function (xhr, status, e) {
                            DisplayError("The place lookup failed");
                            var err = eval("(" + xhr.responseText + ")");
                            LogError("The place lookup failed", "URL: " + globalvm.href() + "\nExtra info: " + GetExtraErrorInfo(err));
                        }
                    });
                }
                else {
                    alert("Please select a breakdown location first");
                }
            }
        }
        else {
            alert("Please select a breakdown location first");
        }
    };

    self.DoSearchPostalCode = function () {
        $.ajax({
            cache: false,
            async: true,
            type: "GET",
            dataType: "json",
            url: "../api/SearchResources?providercode=" + providercode + "&ctry=" + globalvm.breakdownCountry() + "&pc=" + globalvm.breakdownPostalCode() + "&bdlat=" + globalvm.latitude() + "&bdlon=" + globalvm.longitude() + "&dir=" + self.roadCalcDirection() + "&unit=" + globalvm.Settings().distanceunit,
            contentType: "application/json;charset=utf-8",
            timeout: requestTimeout,
            success: ProcessResults,
            error: function (e) { HideLoading(); DisplayError(); }
        });
    };

    //====================VANSFORDEALER==============
    self.GetVansForDealer = function (index) {
        var parameters = "";
        var dlrrowid = self.SearchResResults()[index].dealerrowid;
        var vansforselecteddealer = $.grep(self.vansForDealers(), function (e) { return e.dealerrowid == dlrrowid; });

        if (vansforselecteddealer.length == 0) {
            var params = GetSearchParams();
            params.dealerrowid = dlrrowid;

            //MA: we need this for Service Vans!
            params.aoi_dealer_row_id = self.SearchResResults()[index].aoi_dealer_row_id;
            if (params.aoi_dealer_row_id !== null) console.debug(params.aoi_dealer_row_id)
            self.SearchResResults()[index].vansearch(false);

            $.ajax({
                cache: false,
                async: true,
                type: "POST",
                dataType: "json",
                url: "../api/Vans",
                data: JSON.stringify(params),
                contentType: "application/json;charset=utf-8",
                timeout: requestTimeout,
                success: ProcessVansForDealer,
                error: function (e) { DisplayError(); }
            });
        }
    };

    ProcessVansForDealer = function (data) {
        var marker, resourceIcon, resourceIconLeaflet;
        var coord;

        if (data) {
            if (data.length > 0) {
                for (var i = 0; i < data.length; i++) {
                    //create Icon
                    resourceIconLeaflet = L.icon({
                        iconUrl: imageLocation + data[i].image,
                        iconAnchor: [40, 25]
                    });
                    //create marker with event click  and add to the layer
                    var m = new MyMarker([data[i].location.latitude, data[i].location.longitude], {
                        icon: resourceIconLeaflet,
                        riseOnHover: true
                    });
                    m.setZIndexOffset(zIndexVansForDealer);
                    m.setOldZIndex(zIndexVansForDealer);
                    zIndexVansForDealer--;
                    m.setData({ index: i, parentIndex: self.SelectedResIndex(), dlrrowid: data[i].dealerrowid });
                    m.setDefIcon(resourceIconLeaflet);
                    m.addTo(resourceLayerGroup).on('click', function (evt) {
                        //alert(evt.target.zIndex);
                        self.SelectVanForDealer(evt.target.getData().parentIndex, evt.target.getData().index, evt.target.getData().dlrrowid, null, true);
                    });

                    //init as observable

                    data[i].flags = ko.observable();
                    data[i].routeactive = ko.observable(false);
                    data[i].time = ko.observable(data[i].time);
                    data[i].distance = ko.observable(data[i].distance);
                    data[i].marker = ko.observable(m);
                }

                mainMap.fitBounds(mainGroupLayer.getBounds());
                self.vansForDealers($.merge(self.vansForDealers(), data));
                self.SelectVanForDealer(self.SelectedResIndex(), 0, data[0].dealerrowid, null, false);
            }
        }
    }

    self.SelectVanForDealer = function (parentIndex, index, dealerrowid, event, showdetails) {
        var selectedIcon;
        var selectedIconLeaflet;;
        //data render
        if (parentIndex != self.SelectedResIndex() || index != self.selectedVanForDealerIndex()) {
            self.SelectedResIndex(parentIndex);
            self.selectedVanForDealerIndex(index);
            //First, filter the resultset based on dealerrowid. Then, select the correct one according to the index
            var filtered = self.FilterVans(dealerrowid);
            self.selectedResource(filtered[index]);

            if (routeWin) routeWin.close();
            if (dlrWin) dlrWin.close();
            if (caseWin && caseWin.element.is(":visible")) { caseWin.refresh(); }

            if (self.selectedResource().dealer) {
                globalvm.Resource(self.selectedResource().dealer.dealerid + " - " + self.selectedResource().dealer.name);
            }
            else {
                globalvm.Resource(self.selectedResource().servicevan.license + " - " + self.selectedResource().servicevan.m4t + " - " + self.selectedResource().servicevan.dealerid);
            }
            selectedIconLeaflet = L.icon({ iconUrl: imageLocation + self.selectedResource().imagesel, iconAnchor: [40, 25] }
                );
            if (clickedMarker) {
                clickedMarker.setIcon(clickedMarker.getDefIcon());
                clickedMarker.setZIndexOffset(clickedMarker.getOldZIndex());
            }
            self.selectedResource().marker().setIcon(selectedIconLeaflet);
            //bring selected marker to front
            self.selectedResource().marker().setZIndexOffset(1001);
            clickedMarker = self.selectedResource().marker();

        }

        if (showdetails) self.VanDetails();

        return true;
    }

    self.FilterVans = function (dlrrowid) {
        return ko.utils.arrayFilter(self.vansForDealers(), function (item) {
            return item.dealerrowid == dlrrowid;
        });
    }

    self.VanDetails = function () {
        if (dlrWin) dlrWin.close();
        if (routeWin) routeWin.close();
        if (caseWin) caseWin.close();

        if (svWin) {
            if (svWin.element.is(":hidden")) {
                svWin.open();
            }
        }
        else {
            svWin = $("#VanDetailsWindow").kendoWindow({
                actions: ["Close"],
                draggable: true,
                height: "300px",
                modal: false,
                resizable: true,
                title: "Service van details",
                width: "350px",
                content: "VanDetails.htm"
            }).data("kendoWindow");
        }
    }

    self.ShowCases = function () {
        if (dlrWin) dlrWin.close();
        if (svWin) svWin.close();
        if (routeWin) routeWin.close();

        if (caseWin) {
            caseWin.refresh();
            if (caseWin.element.is(":hidden")) {
                caseWin.open();
            }
        }
        else {
            caseWin = $("#CasesWindow").kendoWindow({
                actions: ["Close"],
                draggable: true,
                height: "400px",
                modal: false,
                resizable: true,
                title: "Cases",
                width: "400px",
                content: "Cases.htm"
            }).data("kendoWindow");
        }
    }

    FilterFlags = function (flags) {
        var flagString = "";
        if (flags != null) {
            $.each(flags, function (index, value) {
                if ($.inArray(value, ignoreflags) < 0) {
                    flagString += (flagString != "" ? ", " : "") + value;
                }
            });
        }

        return flagString;
    }

    self.UpdateLocalTime = function () {
        var offset = 0;
        if (globalvm.utcOffset()) {
            offset = globalvm.utcOffset();
        }
        var calculated = moment().utc().add(offset, 's');
        resourceviewmodel.selDate(calculated.format('DD-MM-YYYY'));
        resourceviewmodel.selTime(PadLeft(calculated.hour(), "0", 2) + ":" + PadLeft(calculated.minute(), "0", 2));
    }
}

resourceviewmodel = new ResourceViewModel();
ko.applyBindings(resourceviewmodel, $("#PanelResource")[0]);

//# sourceURL=ResourceViewModel.js