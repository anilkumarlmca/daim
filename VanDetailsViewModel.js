function VanDetailsViewModel() {
    var self = this;

    self.IE = ko.observable(window.clipboardData && clipboardData.setData);

    self.selectedResult = ko.computed(function () {
        return resourceviewmodel.selectedResource();
    });

    self.dealerid = ko.computed(function () {
        return (self.selectedResult() && self.selectedResult().servicevan ? self.selectedResult().servicevan.dealerid : "");
    });

    self.status = ko.computed(function () {
        return (self.selectedResult() && self.selectedResult().servicevan ? self.selectedResult().servicevan.status : "");
    });

    self.license = ko.computed(function () {
        return (self.selectedResult() && self.selectedResult().servicevan ? self.selectedResult().servicevan.license : "");
    });

    self.m4t = ko.computed(function () {
        return (self.selectedResult() && self.selectedResult().servicevan ? self.selectedResult().servicevan.m4t : "");
    });

    self.time = ko.computed(function () {
        return (self.selectedResult() && self.selectedResult().servicevan ? self.selectedResult().time() : "");
    });

    self.distance = ko.computed(function () {
        return (self.selectedResult() ? self.selectedResult().distance() : "");
    });

    self.language = ko.computed(function () {
        return (self.selectedResult() && self.selectedResult().servicevan ? self.selectedResult().servicevan.language : "");
    });

    self.coordinates = ko.computed(function () {
        return (self.selectedResult() ? self.selectedResult().location.latitude + ", " + self.selectedResult().location.longitude : "");
    });

    self.updated = ko.computed(function () {
        return (self.selectedResult() && self.selectedResult().servicevan ? UTCToLocal(self.selectedResult().servicevan.updated) : "");
    });

    self.summary = ko.computed(function () {
        var summ = "";
        if (self.selectedResult() && self.selectedResult().servicevan) {
            summ = self.selectedResult().servicevan.dealerid + ", " + self.selectedResult().servicevan.license;
            summ += (self.selectedResult().time() ? ", " + self.selectedResult().time() : "");
            summ += ", " + self.selectedResult().servicevan.status;
        }
        return summ;
    });

    self.CopyAll = function (data) {
        var txt = FormatForCopy("Status", data.status()) + "\n" + FormatForCopy("License plate", data.license()) + "\n" + FormatForCopy("Dealer id", data.dealerid()) + "\n" + FormatForCopy("M4T login", data.m4t()) + "\n" +
                  FormatForCopy("Driving time", data.time()) + "\n" + FormatForCopy("Distance", data.distance()) + "\n" + FormatForCopy("Language", data.language()) + "\n" + FormatForCopy("Coordinates", data.coordinates()) + "\n" +
                  FormatForCopy("Position last updated", data.updated()) + "\n" + FormatForCopy("Summary", data.summary());
        CopyToClipboard(txt);
    }
}

vandetailsviewmodel = new VanDetailsViewModel();
ko.applyBindings(vandetailsviewmodel, $("#VanDetails")[0]);

//# sourceURL=VanDetailsViewModel.js