function RouteDescriptionViewModel() {
    var self = this;
    var router;
    self.IE = ko.observable(window.clipboardData && clipboardData.setData);

    self.maneuvers = ko.computed(function () {
        return resourceviewmodel.selectedResource().maneuvers;
    });

    self.summary = ko.computed(function () {
        return resourceviewmodel.selectedResource().summary;
    });

    self.from = ko.computed(function () {
        return (resourceviewmodel.roadCalcDirection() == "f" ? globalvm.Breakdown() : globalvm.Resource());
    });

    self.to = ko.computed(function () {
        return (resourceviewmodel.roadCalcDirection() == "f" ? globalvm.Resource() : globalvm.Breakdown());
    });

    self.CopyAll = function () {
        var txt = FormatForCopy("From", self.from()) + "\n" + FormatForCopy("To", self.to()) + "\n" + self.ListManeuvers() + "\n" + self.FormatInstruction(self.summary());
        CopyToClipboard(txt);
    }

    self.ListManeuvers = function () {
        var res = "";
        $.each(self.maneuvers(), function (idx, val) {
            res += self.FormatInstruction(val) + "\n";
        });
        return res;
    }

    self.FormatInstruction = function (instruction) {
        var re = /<\/?span[^>]*>/g;
        return instruction.replace(re, "");
    }
}

routedescviewmodel = new RouteDescriptionViewModel();
ko.applyBindings(routedescviewmodel, $("#RouteDescription")[0]);

//# sourceURL=RouteDescriptionViewModel.js