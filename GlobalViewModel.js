function GlobalViewModel() {
    var self = this;
    var url = "../api/settings/";

    self.Settings = ko.observable();
    self.breakdownCountry = ko.observable();
    self.breakdownPostalCode = ko.observable();
    self.latitude = ko.observable();
    self.longitude = ko.observable();
    self.countries = ko.observableArray([]);
    self.Breakdown = ko.observable();
    self.Resource = ko.observable();
    self.updateBreakdown = ko.observable();
    self.updateCoord = ko.observable();
    self.updateResource = ko.observable();
    self.href = ko.observable();
    self.utcOffset = ko.observable();
    self.rawUtcOffset = ko.observable();
    self.localtime = ko.observable();
    self.timezoneid = ko.observable();
    self.timezonename = ko.observable();

    self.paramCountry = callparams.ctry;
    self.paramBrand = callparams.br;
    self.paramDivision = callparams.div;;

	//MA
    
    self.standAlone = ko.computed(function () {
        if (!callparams.type) return true;
        return (callparams.type == "");
    });

    url += (callparams.usr ? callparams.usr : "DEFAULT");

    //$.support.cors = true; //Necessary for IE
    $.ajax({ cache: false,
        async: true,
        type: "GET",
        dataType: "json",
        url: url,
        contentType: "application/json;charset=utf-8",
        timeout: requestTimeout,
        success: function (data) {
            self.Settings(data);
            self.updateBreakdown(data.updatebreakdown);
            self.updateCoord(data.updatecoordinates);
            self.updateResource(data.updateresource);
            //overwrite the username because this could be the default record and we want to store it using the user's name
            if (callparams.usr && callparams.usr != "") self.Settings().userid = callparams.usr;
        },
        error: function (xhr, status, e) {
            DisplayError();
        }
    });

    //Load countries here because they need to be loaded before the Breakdown panel opens
    $.ajax({ cache: false,
        async: true,
        type: "GET",
        dataType: "json",
        url: "../api/countries",
        contentType: "application/json;charset=utf-8",
        timeout: requestTimeout,
        success: function (data) {
            self.countries(data);
        },
        error: function (e) { DisplayError(); }
    });

    self.Ok = function () {
        CollectAndSendData(false);
    };

    CollectAndSendData = function (overflow) {
        var returndata =
            {
                type: callparams.type,
                id: callparams.id,
                updatebreakdown: self.updateBreakdown(),
                updatecoordinates: self.updateCoord(),
                updateresource: self.updateResource(),
                dealerrowid: (resourceviewmodel && resourceviewmodel.selectedResource() && resourceviewmodel.selectedResource().dealer ? resourceviewmodel.selectedResource().dealer.rowid : ""),
                roaddistcalc: (resourceviewmodel ? resourceviewmodel.roadCalc() : false),
                distance: (resourceviewmodel && resourceviewmodel.selectedResource() ? resourceviewmodel.selectedResource().distance() : 0),
                distunit: self.Settings().distanceunit,
                time: (resourceviewmodel && resourceviewmodel.selectedResource() ? resourceviewmodel.selectedResource().time() : ""),
                vanrowid: (resourceviewmodel && resourceviewmodel.selectedResource() && resourceviewmodel.selectedResource().servicevan ? resourceviewmodel.selectedResource().servicevan.rowid : ""),
                license: (resourceviewmodel && resourceviewmodel.selectedResource() && resourceviewmodel.selectedResource().servicevan ? resourceviewmodel.selectedResource().servicevan.license : ""),
                status: (resourceviewmodel && resourceviewmodel.selectedResource() && resourceviewmodel.selectedResource().servicevan ? resourceviewmodel.selectedResource().servicevan.status : ""),
                techid: (resourceviewmodel && resourceviewmodel.selectedResource() && resourceviewmodel.selectedResource().servicevan ? resourceviewmodel.selectedResource().servicevan.techid : ""),
                vandealerrowid: (resourceviewmodel && resourceviewmodel.selectedResource() && resourceviewmodel.selectedResource().servicevan ? resourceviewmodel.selectedResource().servicevan.dealerrowid : ""),
                unavailablevans: GetUnavailableVans(overflow),
                excessmileage: (resourceviewmodel && resourceviewmodel.selectedResource() ? resourceviewmodel.selectedResource().excess_mileage : ""),
                excesscharge: (resourceviewmodel && resourceviewmodel.selectedResource() ? resourceviewmodel.selectedResource().excess_charge : ""),
                timezoneid: self.timezoneid(),
                receivedCountryParam: self.paramCountry,
                receivedBrandParam: self.paramBrand,
                receivedDivisionParam: self.paramDivision
            };

        //Only if the "poi" parameter was provided return the POI data
        if (callparams.poi && callparams.poi != "")
            returndata.poi = (breakdownviewmodel ? breakdownviewmodel.selectedBreakdown().label : "");

        if (self.updateBreakdown() && breakdownviewmodel.selectedBreakdown().href != "") {
            //Places API search result: go to url in "href" to get address details
            $.ajax({ cache: false,
                async: true,
                type: "GET",
                dataType: "jsonp",
                url: breakdownviewmodel.selectedBreakdown().href,
                contentType: "application/json;charset=utf-8",
                timeout: requestTimeout,
                success: function (data) {
                    if (data) {
                        returndata.country = (data.location && data.location.address && data.location.address.countryCode ? data.location.address.countryCode : "");
                        returndata.postalcode = (data.location && data.location.address && data.location.address.postalCode ? data.location.address.postalCode : "");
                        returndata.city = (data.location && data.location.address && data.location.address.city ? data.location.address.city : "");
                        returndata.subcity = "";
                        returndata.street = (data.location && data.location.address && data.location.address.street ? data.location.address.street : "");
                        returndata.streetnr = (data.location && data.location.address && data.location.address.house ? data.location.address.house : "");
                        returndata.latitude = (data.location && data.location.position ? data.location.position[0] : "");
                        returndata.longitude = (data.location && data.location.position ? data.location.position[1] : "");
                        returndata.state = (data.location && data.location.address && data.location.address.state ? data.location.address.state : "");

                    };
                    if (overflow) {
                        ReturnOverflowData(returndata);
                    }
                    else {
                        ReturnData(returndata);
                    }
                },
                error: function (xhr, status, e) {
                    DisplayError("The place lookup failed");
                    var err = eval("(" + xhr.responseText + ")");
                    LogError("The place lookup failed", "URL: " + breakdownviewmodel.selectedBreakdown().href + "\nExtra info: " + GetExtraErrorInfo(err));
                }
            });
        }
        else {
            //"Normal" search result
            returndata.country = (breakdownviewmodel ? breakdownviewmodel.selectedBreakdown().countrycode : "");
            returndata.postalcode = (breakdownviewmodel ? breakdownviewmodel.selectedBreakdown().postalCode : "");
            returndata.city = (breakdownviewmodel ? breakdownviewmodel.selectedBreakdown().city : "");
            returndata.subcity = (breakdownviewmodel ? breakdownviewmodel.selectedBreakdown().district : "");
            returndata.street = (breakdownviewmodel ? breakdownviewmodel.selectedBreakdown().street : "");
            returndata.streetnr = (breakdownviewmodel ? breakdownviewmodel.selectedBreakdown().houseNumber : "");
            returndata.latitude = (breakdownviewmodel ? breakdownviewmodel.selectedBreakdown().latitude : "");
            returndata.longitude = (breakdownviewmodel ? breakdownviewmodel.selectedBreakdown().longitude : "");
            returndata.state = (breakdownviewmodel ? breakdownviewmodel.selectedBreakdown().state : "");


            if (overflow) {
                ReturnOverflowData(returndata);
            }
            else {
                ReturnData(returndata);
            }
        }
    };

    ReturnData = function (data) {
        ShowLoading("btnOK");

        if (data.type === "ENPD")
        {
            HideLoading();
            top.postMessage(data, "*");
        }
        else
        {
            $.ajax({
                cache: false,
                async: true,
                type: "POST",
                dataType: "json",
                url: "../api/Return",
                data: JSON.stringify(data),
                contentType: "application/json;charset=utf-8",
                timeout: requestTimeout,
                success: function (result) {
                    if (!result) {
                        HideLoading();
                        //invalidDealerMessage comes from config.js
                        var message = invalidDealerMessage;
                        alertify
                            .alert(message).setHeader('<strong> Invalid Selection </strong>');

                        //alertify
                        //  .alert("Invalid Selection", message, function () {
                        //      alertify.message('OK');
                        //  });
                    }
                    else {
                        HideLoading(); top.postMessage("GIS OK", "*");
                    }
                },
                error: function (e) { HideLoading(); DisplayError(); }
            });
        }
    }

    ReturnOverflowData = function (data) {
        ShowLoading("btnOverflow");

        $.ajax({ cache: false,
            async: true,
            type: "POST",
            dataType: "json",
            url: "../api/Overflow",
            data: JSON.stringify(data),
            contentType: "application/json;charset=utf-8",
            timeout: requestTimeout,
            success: function () { HideLoading(); top.postMessage("GIS OK", "*"); },
            error: function (e) { HideLoading(); DisplayError(); }
        });
    }

    GetUnavailableVans = function (overflow) {
        var vans = new Array();
        if (resourceviewmodel) {
            if (overflow) {
                //Get all not available service vans
                for (var i = 0; i < resourceviewmodel.SearchResResults().length; i++) {
                    if (resourceviewmodel.SearchResResults()[i].servicevan) {
                        if (resourceviewmodel.SearchResResults()[i].servicevan.status != "Available") {
                            vans.push(new UnavailableVan(resourceviewmodel.SearchResResults()[i].servicevan.rowid, self.CreateDescription(resourceviewmodel.SearchResResults()[i]), resourceviewmodel.SearchResResults()[i].servicevan.status, resourceviewmodel.SearchResResults()[i].servicevan.techid, resourceviewmodel.SearchResResults()[i].servicevan.dealerrowid));
                        }
                    }
                }
            }
            else {
                //OK button: Get all not available vans in the list BEFORE THE SELECTED ONE
                for (var i = 0; i < resourceviewmodel.SelectedResIndex(); i++) {
                    if (resourceviewmodel.SearchResResults()[i].servicevan) {
                        if (resourceviewmodel.SearchResResults()[i].servicevan.status != "Available") {
                            vans.push(new UnavailableVan(resourceviewmodel.SearchResResults()[i].servicevan.rowid, self.CreateDescription(resourceviewmodel.SearchResResults()[i]), resourceviewmodel.SearchResResults()[i].servicevan.status, resourceviewmodel.SearchResResults()[i].servicevan.techid, resourceviewmodel.SearchResResults()[i].servicevan.dealerrowid));
                        }
                    }
                }
            }
        }
        return vans;
    };

    self.CreateDescription = function(searchResult) {
    var summ = "";
        if (searchResult && searchResult.servicevan) {
            summ = searchResult.servicevan.dealerid + ", " + searchResult.servicevan.license;
            summ += (searchResult.time() ? ", " + searchResult.time() : "");
            summ += ", " + searchResult.servicevan.status;
        }
        return summ;
    };

    self.Cancel = function () {
        top.postMessage("GIS CANCEL", "*");
    };

    self.Overflow = function () {
        CollectAndSendData(true);
    };

    self.Close = function () {
        debugger;
        window.close(); //top.postMessage("GIS CLOSE", "*");
    };
}

globalvm = new GlobalViewModel();
ko.applyBindings(globalvm, $("#buttonsContainer")[0]);

//# sourceURL=GlobalViewModel.js