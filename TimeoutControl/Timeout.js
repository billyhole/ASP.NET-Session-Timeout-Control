﻿Type.registerNamespace("AjaxControls");

AjaxControls.Timeout = function (element) {

    AjaxControls.Timeout.initializeBase(this, [element]);

    // self reference
    var myself = this;
    // countdown
    var countDownSeconds = null;
    var countDownDelegate = null;
    // timers
    var timerTimeout = null;
    var timerAboutToTimeout = null;
    var timerCountDown = null;
    // properties
    var timeoutMinutes = null;
    var aboutToTimeoutMinutes = null;
    var timeoutUrl = null;
    var countDownSpanId = null;

    var clientId = null;

    function countDown(e) {
        // countDownSeconds was computed originally in notify method
        var secs = countDownSeconds % 60;
        // we want to format it as minutes : seconds
        $('#' + countDownSpanId).text((parseInt(countDownSeconds / 60)) + ':' + ((secs < 10) ? '0' + secs : secs));

        // subtract one and loop back here in 1 second
        countDownSeconds -= 1;
        timerCountDown = setTimeout(countDownDelegate, 1000);
    }

    function resetTimers() {
        // clear all timers
        clearTimeout(timerAboutToTimeout);
        clearTimeout(timerTimeout);
        clearTimeout(timerCountDown);

        // setup the timer that controls when the warning appears
        var notifyDelegate = Function.createDelegate(myself, notify);
        timerAboutToTimeout = setTimeout(notifyDelegate, aboutToTimeoutMinutes * 60 * 1000);
        // setup the timer that controls when the redirect occurs (when session actually times out)
        var timeoutDelegate = Function.createDelegate(myself, myself.timeout);
        timerTimeout = setTimeout(timeoutDelegate, timeoutMinutes * 60 * 1000);
    }

    function notify(e) {
        // on open, the countdown will always start at exactly timeoutMinutes - aboutToTimeoutMinutes
        countDownSeconds = ((timeoutMinutes - aboutToTimeoutMinutes) * 60) - 1;
        $('#' + countDownSpanId).text((timeoutMinutes - aboutToTimeoutMinutes) + ':00');

        // now start our countdown
        countDownDelegate = Function.createDelegate(myself, countDown);
        myself.timerCountDown = setTimeout(countDownDelegate, 1000);

        // show the notification
        myself.show();
        // focus the window
        window.focus();
    }

    // MS AJAX required function
    this.initialize = function() {

        AjaxControls.Timeout.callBaseMethod(this, 'initialize');

        // ensure requirements are met
        if (typeof jQuery == 'undefined')
            alert('Error:  jQuery not found.');

        // make sure timers are reset on partial postbacks
        Sys.Application.add_load(Function.createDelegate(this, resetTimers));

        // allow any necessary one-time initialization/setup of notification
        this.setup();
    }

    // MS AJAX required function
    this.dispose = function() {
        $clearHandlers(this.get_element());
        AjaxControls.Timeout.callBaseMethod(this, 'dispose');
    }

    // public property accessors
    this.get_timeoutMinutes = function () {
        return timeoutMinutes;
    }

    this.set_timeoutMinutes = function (value) {
        if (timeoutMinutes !== value) {
            timeoutMinutes = value;
            this.raisePropertyChanged('timeoutMinutes');
        }
    }

    this.get_aboutToTimeoutMinutes = function () {
        return aboutToTimeoutMinutes;
    }

    this.set_aboutToTimeoutMinutes = function (value) {
        if (aboutToTimeoutMinutes !== value) {
            aboutToTimeoutMinutes = value;
            this.raisePropertyChanged('aboutToTimeoutMinutes');
        }
    }

    this.get_timeoutUrl = function () {
        return timeoutUrl;
    }

    this.set_timeoutUrl = function (value) {
        if (timeoutUrl !== value) {
            timeoutUrl = value;
            this.raisePropertyChanged('timeoutUrl');
        }
    }

    this.get_clientId = function () {
        return clientId;
    }

    this.set_clientId = function (value) {
        if (clientId !== value) {
            clientId = value;
            this.raisePropertyChanged('clientId');
        }
    }

    this.get_countDownSpanId = function () {
        return countDownSpanId;
    }

    this.set_countDownSpanId = function (value) {
        if (countDownSpanId !== value) {
            countDownSpanId = value;
            this.raisePropertyChanged('countDownSpanId');
        }
    }

    // use externally to reset timeout - use $find('whateverid').reset()
    this.reset = function () {
        // make sure notification is not visible
        this.hide();
        // reset session
        CallServer();
        // reset timers
        resetTimers();
    }
}

// overridable methods
AjaxControls.Timeout.prototype =
{
    // setup the notification (override if not using jquery UI)
    setup: function (e) {
        var ctl = this;
        var $clientId = $("#" + this.get_clientId());
        if (typeof $clientId.dialog != 'undefined') {
            $clientId.dialog({
                autoOpen: false,
                modal: true,
                buttons: {
                    "Ok": function () {
                        ctl.reset();
                    }
                }
            });
        }
    },

    // show the notification (override if not using jquery UI)
    show: function () {
        var $clientId = $("#" + this.get_clientId());
        if (typeof $clientId.dialog != 'undefined') {
            $clientId.dialog('open');
        }
    },

    // hide the notification (override if not using jquery UI)
    hide: function () {
        var $clientId = $("#" + this.get_clientId());
        if (typeof $clientId.dialog != 'undefined') {
            $clientId.dialog('close');
        }
    },

    // override if needing to do more than just redirect
    timeout: function () {
        // redirect to the specified timeout url
        window.location = this.get_timeoutUrl();
    }
}

AjaxControls.Timeout.registerClass('AjaxControls.Timeout', Sys.UI.Control);

if (typeof (Sys) !== 'undefined')
    Sys.Application.notifyScriptLoaded();

function ReceiveServerData(rValue) { }
