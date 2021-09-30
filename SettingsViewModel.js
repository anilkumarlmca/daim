function SettingsViewModel() {
    var self = this;
    self.distUnits = new Array({ code: "K", name: "Km" }, { code: "M", name: "Miles" });
    self.settingsEnabled = ko.observable(callparams.usr && callparams.usr != "" ? true : false);

    self.countries = ko.computed(function () {
        return globalvm.countries();
    });

    //$.support.cors = true; //Necessary for IE
    if (globalvm.countries().length == 0) {
        $.ajax({ cache: false,
            async: true,
            type: "GET",
            dataType: "json",
            url: "../api/countries",
            contentType: "application/json;charset=utf-8",
            timeout: requestTimeout,
            success: function (data) {
                globalvm.countries(data);
            },
            error: function (e) { DisplayError(); }
        });
    }
    
    self.defaultCountry = ko.computed({
        read: function () {
            return globalvm.Settings().defaultcountry;
        },
        write: function (value) {
            globalvm.Settings().defaultcountry = value;
        },
        owner: this
    });

    self.distUnit = ko.computed({
        read: function () {
            return globalvm.Settings().distanceunit;
        },
        write: function (value) {
            globalvm.Settings().distanceunit = value;
        },
        owner: this
    });

    self.updateBreakdown = ko.computed({
        read: function () {
            return globalvm.Settings().updatebreakdown;
        },
        write: function (value) {
            globalvm.Settings().updatebreakdown = value;
        },
        owner: this
    });

    self.updateCoordinates = ko.computed({
        read: function () {
            return globalvm.Settings().updatecoordinates;
        },
        write: function (value) {
            globalvm.Settings().updatecoordinates = value;
        },
        owner: this
    });

    self.updateResource = ko.computed({
        read: function () {
            return globalvm.Settings().updateresource;
        },
        write: function (value) {
            globalvm.Settings().updateresource = value;
        },
        owner: this
    });

    self.maxNum1 = ko.computed({
        read: function () {
            return globalvm.Settings().maxnum1;
        },
        write: function (value) {
            globalvm.Settings().maxnum1 = value;
        },
        owner: this
    });

    self.maxNum2 = ko.computed({
        read: function () {
            return globalvm.Settings().maxnum2;
        },
        write: function (value) {
            globalvm.Settings().maxnum2 = value;
        },
        owner: this
    });

    self.maxNum3 = ko.computed({
        read: function () {
            return globalvm.Settings().maxnum3;
        },
        write: function (value) {
            globalvm.Settings().maxnum3 = value;
        },
        owner: this
    });

    self.maxDist1 = ko.computed({
        read: function () {
            return globalvm.Settings().maxdist1;
        },
        write: function (value) {
            globalvm.Settings().maxdist1 = value;
        },
        owner: this
    });

    self.maxDist2 = ko.computed({
        read: function () {
            return globalvm.Settings().maxdist2;
        },
        write: function (value) {
            globalvm.Settings().maxdist2 = value;
        },
        owner: this
    });

    self.maxDist3 = ko.computed({
        read: function () {
            return globalvm.Settings().maxdist3;
        },
        write: function (value) {
            globalvm.Settings().maxdist3 = value;
        },
        owner: this
    });

    self.maxTime1 = ko.computed({
        read: function () {
            return globalvm.Settings().maxtime1;
        },
        write: function (value) {
            globalvm.Settings().maxtime1 = value;
        },
        owner: this
    });

    self.maxTime2 = ko.computed({
        read: function () {
            return globalvm.Settings().maxtime2;
        },
        write: function (value) {
            globalvm.Settings().maxtime2 = value;
        },
        owner: this
    });

    self.maxTime3 = ko.computed({
        read: function () {
            return globalvm.Settings().maxtime3;
        },
        write: function (value) {
            globalvm.Settings().maxtime3 = value;
        },
        owner: this
    });

    self.Save = function () {
        ValidateOptions();
        if (formValid) {
            $.ajax({ cache: false,
                async: true,
                type: "POST",
                dataType: "json",
                url: "../api/settings",
                data: JSON.stringify(globalvm.Settings()),
                contentType: "application/json;charset=utf-8",
                timeout: requestTimeout,
                success: function () { alert("The new settings have been stored and will be used the next time GIS is opened."); },
                error: function (e) { DisplayError(); }
            });
        }
        else {
            alert("An incorrect option value was used.\nPlease provide a valid number in the highlighted box.\nThe new settings have not been stored!");
        }
    };
}

settingsviewmodel = new SettingsViewModel();
ko.applyBindings(settingsviewmodel, $("#PanelSettings")[0]);

//# sourceURL=SettingsViewModel.js