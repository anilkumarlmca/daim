function CoordinateConverterViewModel() {
    var self = this;

    var patternDD = "^\\-?\\d{1,3}\\.\\d+$|^\\-?\\d{1,3}$";
    var patternDMS = "^([ENSW])(\\d+)[\\- ](\\d+)[\\- ](\\d+)$";
    var patternDDM = "^([ENSW])(\\d+) (\\d+\\.?\\d*)$";
    var patternCAC = "^(\\-?)(\\d{0,3})(\\d{0,2})(\\d{1,2})$";

    self.DDLatitude = ko.observable();
    self.DDLongitude = ko.observable();
    self.DMSLatitude = ko.observable();
    self.DMSLongitude = ko.observable();
    self.CACLatitude = ko.observable();
    self.CACLongitude = ko.observable();
    self.DDMLatitude = ko.observable();
    self.DDMLongitude = ko.observable();

    self.DDLatitudeOK = ko.observable(true);
    self.DDLongitudeOK = ko.observable(true);
    self.DMSLatitudeOK = ko.observable(true);
    self.DMSLongitudeOK = ko.observable(true);
    self.CACLatitudeOK = ko.observable(true);
    self.CACLongitudeOK = ko.observable(true);
    self.DDMLatitudeOK = ko.observable(true);
    self.DDMLongitudeOK = ko.observable(true);

    self.allOK = ko.computed(function () {
        return (self.DDLatitudeOK() && self.DDLongitudeOK() && self.DMSLatitudeOK() && self.DMSLongitudeOK() &&
                self.CACLatitudeOK() && self.CACLongitudeOK() && self.DDMLatitudeOK() && self.DDMLongitudeOK());
    });

    self.DDLatitudeChange = function () {
        ClearDMS("LAT");
        ClearCAC("LAT");
        ClearDDM("LAT");
        self.DDLatitudeOK(DDValidate(self.DDLatitude(), "LAT"));
        if (self.DDLatitudeOK()) {
            self.DMSLatitude(DDToDMSOrCAC(self.DDLatitude(), "LAT", "DMS"));
            self.CACLatitude(DDToDMSOrCAC(self.DDLatitude(), "LAT", "CAC"));
            self.DDMLatitude(DDToDDM(self.DDLatitude(), "LAT"));
        }
        return true; //for IE8
    };

    self.DDLongitudeChange = function () {
        ClearDMS("LON");
        ClearCAC("LON");
        ClearDDM("LON");
        self.DDLongitudeOK(DDValidate(self.DDLongitude(), "LON"));
        if (self.DDLongitudeOK()) {
            self.DMSLongitude(DDToDMSOrCAC(self.DDLongitude(), "LON", "DMS"));
            self.CACLongitude(DDToDMSOrCAC(self.DDLongitude(), "LON", "CAC"));
            self.DDMLongitude(DDToDDM(self.DDLongitude(), "LON"));
        }
        return true; //for IE8
    };

    self.DMSLatitudeChange = function () {
        ClearDD("LAT");
        ClearCAC("LAT");
        ClearDDM("LAT");
        self.DMSLatitudeOK(DMSValidate(self.DMSLatitude(), "LAT"));
        if (self.DMSLatitudeOK()) {
            self.DDLatitude(DMSToDD(self.DMSLatitude()));
            self.CACLatitude(DDToDMSOrCAC(self.DDLatitude(), "LAT", "CAC"));
            self.DDMLatitude(DDToDDM(self.DDLatitude(), "LAT"));
        }
        return true; //for IE8
    };

    self.DMSLongitudeChange = function () {
        ClearDD("LON");
        ClearCAC("LON");
        ClearDDM("LON");
        self.DMSLongitudeOK(DMSValidate(self.DMSLongitude(), "LON"));
        if (self.DMSLongitudeOK()) {
            self.DDLongitude(DMSToDD(self.DMSLongitude()));
            self.CACLongitude(DDToDMSOrCAC(self.DDLongitude(), "LON", "CAC"));
            self.DDMLongitude(DDToDDM(self.DDLongitude(), "LON"));
        }
        return true; //for IE8
    };

    self.CACLatitudeChange = function () {
        ClearDD("LAT");
        ClearDMS("LAT");
        ClearDDM("LAT");
        self.CACLatitudeOK(CACValidate(self.CACLatitude(), "LAT"));
        if (self.CACLatitudeOK()) {
            self.DDLatitude(CACToDD(self.CACLatitude()));
            self.DMSLatitude(DDToDMSOrCAC(self.DDLatitude(), "LAT", "DMS"));
            self.DDMLatitude(DDToDDM(self.DDLatitude(), "LAT"));
        }
        return true; //for IE8
    };

    self.CACLongitudeChange = function () {
        ClearDD("LON");
        ClearDMS("LON");
        ClearDDM("LON");
        self.CACLongitudeOK(CACValidate(self.CACLongitude(), "LON"));
        if (self.CACLongitudeOK()) {
            self.DDLongitude(CACToDD(self.CACLongitude()));
            self.DMSLongitude(DDToDMSOrCAC(self.DDLongitude(), "LON", "DMS"));
            self.DDMLongitude(DDToDDM(self.DDLongitude(), "LON"));
        }
        return true; //for IE8
    };

    self.DDMLatitudeChange = function () {
        ClearDD("LAT");
        ClearDMS("LAT");
        ClearCAC("LAT");
        self.DDMLatitudeOK(DDMValidate(self.DDMLatitude(), "LAT"));
        if (self.DDMLatitudeOK()) {
            self.DDLatitude(DDMToDD(self.DDMLatitude()));
            self.DMSLatitude(DDToDMSOrCAC(self.DDLatitude(), "LAT", "DMS"));
            self.CACLatitude(DDToDMSOrCAC(self.DDLatitude(), "LAT", "CAC"));
        }
        return true; //for IE8
    };

    self.DDMLongitudeChange = function () {
        ClearDD("LON");
        ClearDMS("LON");
        ClearCAC("LON");
        self.DDMLongitudeOK(DDMValidate(self.DDMLongitude(), "LON"));
        if (self.DDMLongitudeOK()) {
            self.DDLongitude(DDMToDD(self.DDMLongitude()));
            self.DMSLongitude(DDToDMSOrCAC(self.DDLongitude(), "LON", "DMS"));
            self.CACLongitude(DDToDMSOrCAC(self.DDLongitude(), "LON", "CAC"));
        }
        return true; //for IE8
    };

    self.ClearAll = function () {
        ClearDD("LAT");
        ClearDD("LON");
        ClearDMS("LAT");
        ClearDMS("LON");
        ClearCAC("LAT");
        ClearCAC("LON");
        ClearDDM("LAT");
        ClearDDM("LON");
    }

    function ClearDD(part) {
        if (part == "LAT") {
            self.DDLatitude("");
            self.DDLatitudeOK(true);
        }
        else {
            self.DDLongitude("");
            self.DDLongitudeOK(true);
        }
    }

    function ClearDMS(part) {
        if (part == "LAT") {
            self.DMSLatitude("");
            self.DMSLatitudeOK(true);
        }
        else {
            self.DMSLongitude("");
            self.DMSLongitudeOK(true);
        }
    }

    function ClearCAC(part) {
        if (part == "LAT") {
            self.CACLatitude("");
            self.CACLatitudeOK(true);
        }
        else {
            self.CACLongitude("");
            self.CACLongitudeOK(true);
        }
    }

    function ClearDDM(part) {
        if (part == "LAT") {
            self.DDMLatitude("");
            self.DDMLatitudeOK(true);
        }
        else {
            self.DDMLongitude("");
            self.DDMLongitudeOK(true);
        }
    }

    function DDValidate(val, part) {
        var re = new RegExp(patternDD, "i");
        if (re.test(val) == false) return false;
        var limit = (part == "LAT" ? 90 : 180);
        return (Math.abs(parseFloat(val)) <= limit);
    }

    function DMSValidate(val, part) {
        var re = new RegExp(patternDMS, "i");
        if (re.test(val) == false) return false;
        var arr = re.exec(val);
        var limit = (part == "LAT" ? 90 : 180);
        return Math.abs(parseInt(RegExp.$2)) <= limit;
    }

    function DDMValidate(val, part) {
        var re = new RegExp(patternDDM, "i");
        if (re.test(val) == false) return false;
        var arr = re.exec(val);
        var limit = (part == "LAT" ? 90 : 180);
        return Math.abs(parseInt(RegExp.$2)) <= limit;
    }

    function CACValidate(val, part) {
        var re = new RegExp(patternCAC, "i");
        val = PadCACCoordinate(val);
        if (re.test(val) == false) return false;
        var arr = re.exec(val);
        var limit = (part == "LAT" ? 90 : 180);
        return Math.abs(parseInt(RegExp.$2)) <= limit;
    }

    function DDToDMSOrCAC(val, part, type) {
        var deg, min, sec, dir;

        var absVal = Math.abs(val);
        //Degrees is integer part of the double
        deg = Math.floor(absVal);

        //Multiply the remainder (i.e. the decimal part) by 60 
        //and take the integer part as minutes
        absVal -= deg;
        absVal *= 60;
        min = Math.floor(absVal);

        //Multiply the remainder (i.e. the decimal part) by 60 
        //and take the integer part as seconds
        absVal -= min;
        absVal *= 60;
        sec = Math.round(absVal);

        //Get the direction ("N", "S", "E" or "W") based on value and part
        dir = GetDirection(val, part);

        if (type == "DMS") {
            return dir + deg + "-" + min + "-" + sec;
        }
        else {
            return (val < 0 ? "-" : "") + deg + PadLeft(min, "0", 2) + PadLeft(sec, "0", 2);
        }
    }

    function DDToDDM(val, part) {
        var deg, min, dir;

        var absVal = Math.abs(val);
        //Degrees is integer part of the double
        deg = Math.floor(absVal);

        //Multiply the remainder (i.e. the decimal part) by 60 
        //This is the decimal minutes part
        absVal -= deg;
        absVal *= 60;
        min = absVal;

        //Get the direction ("N", "S", "E" or "W") based on value and part
        dir = GetDirection(val, part);

        return dir + deg + " " + Round(min);
    }

    function DMSToDD(val) {
        var result = 0;
        var re = new RegExp(patternDMS, "i");
        var arr = re.exec(val);

        result = parseInt(RegExp.$2) + Round((parseInt(RegExp.$3) + (parseInt(RegExp.$4) / 60)) / 60);
        if (RegExp.$1.toUpperCase() == "S" || RegExp.$1.toUpperCase() == "W") result *= -1;

        return result;
    }

    function CACToDD(val) {
        var result = 0;

        val = PadCACCoordinate(val);

        var re = new RegExp(patternCAC, "i");
        var arr = re.exec(val);

        result = parseInt(RegExp.$2) + Round((parseInt(RegExp.$3) + (parseInt(RegExp.$4) / 60)) / 60);

        if (RegExp.$1 == "-") result *= -1;

        return result;
    }

    function DDMToDD(val) {
        var result = 0;
        var re = new RegExp(patternDDM, "i");
        var arr = re.exec(val);

        result = parseInt(RegExp.$2) + Round(parseFloat(RegExp.$3) / 60);
        if (RegExp.$1.toUpperCase() == "S" || RegExp.$1.toUpperCase() == "W") result *= -1;

        return result;
    }

    function GetDirection(val, part) {
        if (part == "LAT") {
            return (val >= 0 ? "N" : "S");
        }
        else {
            return (val >= 0 ? "E" : "W");
        }
    }

    function PadLeft(input, padChar, length) {
        var result = input.toString();

        while (result.length < length) result = padChar + result;

        return result;
    }

    function Round(num) {
        return Math.round(num * 100000000) / 100000000;
    }

    function PadCACCoordinate(input) {
        var isNegative = false;
        var result = input.toString();

        if (result.charAt(0) == "-") {
            isNegative = true;
            result = result.substr(1);
        }

        while (result.length < 7) result = "0" + result;

        if (isNegative) result = "-" + result;

        return result;
    }
}

var coordconvviewmodel = new CoordinateConverterViewModel();
ko.applyBindings(coordconvviewmodel, $("#coordConv")[0]);

//# sourceURL=CoordinateConverterViewModel.js