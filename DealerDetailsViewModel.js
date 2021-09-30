function DealerDetailsViewModel() {
    var self = this;
    self.IE = ko.observable(window.clipboardData && clipboardData.setData);

    self.dealerDetails = ko.observableArray([]);
    self.specialOpeningHours = ko.observableArray([]);


    self.selectedResult = ko.computed(function () {
        return resourceviewmodel.selectedResource();
    });

    self.dealerId = ko.computed(function () {
        var ret = "";
        if (self.selectedResult() && self.selectedResult().dealer) ret = self.selectedResult().dealer.dealerid;
        //else if (self.selectedResult() && self.selectedResult().servicevan) ret = self.selectedResult().servicevan.dealerid;
        return ret;
    });

    self.name = ko.computed(function () {
        return (self.selectedResult() && self.selectedResult().dealer ? self.selectedResult().dealer.name : "");
    });

    self.address = ko.computed(function () {
        var add = "";

        if (self.selectedResult() && self.selectedResult().dealer) {
            if (self.selectedResult().dealer.street) add += self.selectedResult().dealer.street;
            if (self.selectedResult().dealer.number) add += ", " + self.selectedResult().dealer.number;
            if (self.selectedResult().dealer.postalcode) add += ", " + self.selectedResult().dealer.postalcode;
            if (self.selectedResult().dealer.city) add += ", " + self.selectedResult().dealer.city;
        }
        return add;
    });

    self.country = ko.computed(function () {
        return (self.selectedResult() && self.selectedResult().dealer ? self.selectedResult().dealer.country : "");
    });

    self.phone = ko.computed(function () {
        return (self.selectedResult() && self.selectedResult().dealer ? self.selectedResult().dealer.phone : "");
    });

    self.fax = ko.computed(function () {
        return (self.selectedResult() && self.selectedResult().dealer ? self.selectedResult().dealer.fax : "");
    });

    self.language = ko.computed(function () {
        return (self.selectedResult() && self.selectedResult().dealer ? self.selectedResult().dealer.language : "");
    });

    self.coordinates = ko.computed(function () {
        return (self.selectedResult() ? self.selectedResult().location.latitude + ", " + self.selectedResult().location.longitude : "");
    });

    self.other = ko.computed(function () {
        return (self.selectedResult() && self.selectedResult().dealer ? self.selectedResult().dealer.other : "");
    });

	//MA: also show status
    self.status = ko.computed(function()
    {
        var sr = self.selectedResult();
        var s = ((sr && sr.dealer) ? sr.dealer.status : "");

        return s;
    });

    //MA: also show [AOI]
    self.is_aoi = ko.computed(function ()
    {
        var sr = self.selectedResult();
        var s = "";

        if (sr && sr.dealer)
        {
            if (sr.dealer.is_aoi != null)
                s = (sr.dealer.is_aoi ? "Yes" : "No");
        }

        return s;
    });

   
    self.timedifference = ko.computed(function () {
        var s = "";
      
        if (self.dealerDetails() && self.dealerDetails().length > 0) {
            return self.dealerDetails()[0].timedifference;
        }

        return s;
    });


    //MA: also show [XD Machine]
    self.hasXD_Machine = ko.computed(function ()
    {
        var sr = self.selectedResult();
        var s = "";

        if (sr && sr.dealer)
        {
            if (sr.dealer.has_xd_machine != null)
                s = (sr.dealer.has_xd_machine ? "Yes" : "No");
        }

        return s;
    });

    //MA: also build and show status reason
    self.status_reason = ko.computed(function()
    {
        var s = "";
        var sr = self.selectedResult();

        if (sr && sr.dealer)
        {
            //NOTE: we can also use LCase but who care?
            switch (sr.dealer.status.toLowerCase())
            {
                case "available":
                    break;

                case "check":
                    s = sr.dealer.check_reason;
                    break;

                case "not available":
                    s = sr.dealer.not_available_reason;
                    break;

                default:
                    break;
            }
        }

        return s;
    });

    //MA: also show timestamp if dealer is not available
    self.not_available_till = ko.computed(function ()
    {
        var s = "";
        var sr = self.selectedResult();

        if (sr && sr.dealer)
        {
            //NOTE: no need to check for status!
            if (sr.dealer.not_available_till != null)
            {
//TODO: localized format?            
                s = moment(sr.dealer.not_available_till, 'YYYY-MM-DDTHH:mm:ss').format('DD/MM/YYYY HH:mm:ss')
            }
        }

        return s;
    });
    var selectedDiv = $.grep(resourceviewmodel.Divisions(), function (e) { return e.id == resourceviewmodel.selDivision(); });
    var selectedClass = $.grep(resourceviewmodel.Classes(), function (e) { return e.id == resourceviewmodel.selClass(); });
    
    //$.support.cors = true; //Necessary for IE
    $.ajax({ cache: false,
        async: true,
        type: "GET",
        dataType: "json",
        url: "../api/SearchResources?providercode=" + providercode + "&dlrrowid=" + self.selectedResult().dealerrowid + "&div=" + selectedDiv[0].name + "&cls=" + selectedClass[0].name + "&addsvc=" + (resourceviewmodel.selAddSvc() != EMPTY ? resourceviewmodel.selAddSvc() : "") + "&svc=" + resourceviewmodel.selService(),
        contentType: "application/json;charset=utf-8",
        timeout: requestTimeout,
        success: function (data) {
            self.dealerDetails(data);
        },
        error: function (e) { DisplayError(); }
    });
    if (self.dealerId() !== "" && self.dealerId() !== null && self.dealerId()!== undefined) {
        $.ajax({
        cache: false,
        async: true,
        type: "GET",
        dataType: "json",
        url: "../api/SpecialOpeningHours/" + self.dealerId() + "?div=" + selectedDiv[0].name + "&svc=" + resourceviewmodel.selService(),
        contentType: "application/json;charset=utf-8",
        timeout: requestTimeout,
        success: function (data) {
            self.specialOpeningHours(data);
    },
        error: function (e) { DisplayError(); }
});
    }
    

    self.CopyAll = function (data) {
        var txt = FormatForCopy("Dealer id", data.dealerId()) + "\n" + FormatForCopy("Dealer name", data.name()) + "\n" + FormatForCopy("Address", data.address()) + "\n" + FormatForCopy("Country", data.country()) + "\n" +
                  FormatForCopy("Phone", data.phone()) + "\n" + FormatForCopy("Fax", data.fax()) + "\n" + FormatForCopy("Language", data.language()) + "\n" + FormatForCopy("Coordinates", data.coordinates()) + "\n" +
                  FormatForCopy("Opening hours", self.ListOpeningHours()) + FormatForCopy("Special opening hours", self.ListSpecialOpeningHours()) + 
                  FormatForCopy("Extra info", data.other());
        CopyToClipboard(txt);
    }

    self.ListOpeningHours = function () {
        var res = "";
        if (self.dealerDetails()) {
            $.each(self.dealerDetails(), function (idx, val) {
                res += (val.openingday ? val.openingday : "") + " " + (val.openfrom ? val.openfrom : "") + " - " + (val.openuntil ? val.openuntil : "") + 
                " " + (val.breakfrom ? val.breakfrom : "") + " - " + (val.breakuntil ? val.breakuntil : "") + "\n";
            });
        }
        return res;
    }

    self.ListSpecialOpeningHours = function () {
        var res = "";
        if (self.specialOpeningHours()) {
            $.each(self.specialOpeningHours(), function (idx, val) {
                res += (val.from ? moment(val.from, 'YYYY-MM-DDTHH:mm:ss').format('DD/MM/YYYY HH:mm:ss') : "") + " - " + (val.until ? moment(val.until, 'YYYY-MM-DDTHH:mm:ss').format('HH:mm:ss') : "") + "\n";
            });
        }
        return res;
    }
}

dealerdetailsviewmodel = new DealerDetailsViewModel();
ko.applyBindings(dealerdetailsviewmodel, $("#DealerDetails")[0]);

//# sourceURL=DealerDetailsViewModel.js