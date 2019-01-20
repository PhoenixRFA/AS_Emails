var as = as || {};

as.tools = {
    guidGenerator: function () {
        var S4 = function () {
            return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        };
        return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
    },
    isEmail: function (email) {
        reg = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
        if (email !== undefined)
            if (email.match(reg))
                return true;
        return false;
    },
    isInt: function(value){ 
        if((parseFloat(value) == parseInt(value)) && !isNaN(value)){
            return true;
        } else { 
            return false;
        } 
    },
    smallGuidGenerator: function (count) {
        if (!count) count = 4;
        var res = as.tools.guidGenerator().substr(0, count)
        return res;
    },
    addDays: function (date, days) {
        var myDate = new Date(date);
        myDate.setDate(myDate.getDate() + days);
        return myDate;
    },
    addHours: function (date, hours) {
        var d2 = new Date(date);
        d2.setHours(d2.getHours() + hours);
        return d2;
    },
    addMinutes: function (date, minutes) {
        return new Date(date.getTime() + minutes * 60000);
    },
    addSeconds: function (date, seconds) {
        return new Date(date.getTime() + seconds * 1000);
    },
    insertAtCursor: function (myField, myValue) {
        var res = 0; // позиция начала
        //IE support
        if (document.selection) {
            myField.focus();
            sel = document.selection.createRange();
            sel.text = myValue;
        }
            //MOZILLA and others
        else if (myField.selectionStart || myField.selectionStart == '0') {
            var startPos = myField.selectionStart;
            res = startPos;
            var endPos = myField.selectionEnd;
            myField.value = myField.value.substring(0, startPos)
                + myValue
                + myField.value.substring(endPos, myField.value.length);
            myField.selectionStart = startPos + myValue.length;
            myField.selectionEnd = startPos + myValue.length;
        } else {
            res = myField.value.length;
            myField.value += myValue;
        }
        return res;
    },
    createSelection: function (field, start, end) {
        if (field.createTextRange) {
            var selRange = field.createTextRange();
            selRange.collapse(true);
            selRange.moveStart('character', start);
            selRange.moveEnd('character', end);
            selRange.select();
        } else if (field.setSelectionRange) {
            field.setSelectionRange(start, end);
        } else if (field.selectionStart) {
            field.selectionStart = start;
            field.selectionEnd = end;
        }
        field.focus();
    },
    getURLParameterByName: function (URL, name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(URL);
        return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    },
    getUrlHash: function () {
        //IE Proof - URL Hash Grab - returns complete hash value   /urk/#dsdsd
        var res = "";
        if (document.URL.indexOf('#') >= 0) {
            res = document.URL.substr(document.URL.indexOf('#') + 1);
        }
        return res;
    },
    getUrlHashParameters: function () {
        var res = [];
        var hash = as.tools.getUrlHash();
        var ps = hash.split("&");
        $.each(ps, function (i, p) {
            var el = p.split("=");
            if (el.length > 1) {
                var item = {};
                item.name = el[0];
                item.value = el[1];
                res.push(item);
            }
        });
        return res;
    },
};