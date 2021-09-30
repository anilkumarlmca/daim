function CasesViewModel() {
    var self = this;
    self.IE = ko.observable(window.clipboardData && clipboardData.setData);

    self.vehicleId = ko.computed(function () {
        if (resourceviewmodel.selectedResource() && resourceviewmodel.selectedResource().servicevan) {
            return resourceviewmodel.selectedResource().servicevan.rowid;
        }

        return "";
    });

    self.cases = ko.observableArray();

    $(document).ready(function () {
        //$.support.cors = true; //Necessary for IE
        $.ajax({ cache: false,
            async: true,
            type: "GET",
            dataType: "json",
            url: "../api/cases/" + self.vehicleId(),
            contentType: "application/json;charset=utf-8",
            timeout: requestTimeout,
            success: function (data) { self.cases(data); },
            error: function (e) { DisplayError(); }
        });

        $("#CasePanel").kendoPanelBar({
            expandMode: "single"
        });
    });

    self.CopyAll = function (data) {
        var txt = FormatForCopy("Customer", data.customer) + "\n" + FormatForCopy("License plate", data.license) + "\n" + FormatForCopy("VIN", data.vin) + "\n" + FormatForCopy("Symptom", data.symptom) + "\n" +
                  FormatForCopy("CAR", UTCToLocal(data.car)) + "\n" + FormatForCopy("ETA", UTCToLocal(data.etar)) + "\n" + FormatForCopy("ATA", UTCToLocal(data.atar)) + "\n" + FormatForCopy("ETC", UTCToLocal(data.etcr)) + "\n" +
                  FormatForCopy("ATC", UTCToLocal(data.atcr));
        CopyToClipboard(txt);
    }
}

casesviewmodel = new CasesViewModel();
ko.applyBindings(casesviewmodel, $("#CaseDetails")[0]);

//# sourceURL=CasesViewModel.js