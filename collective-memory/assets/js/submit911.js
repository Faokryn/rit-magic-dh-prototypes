var $alert;

// show the proper alert
if (~document.cookie.indexOf("submissionSuccess")){
    if (document.cookie.match(/submissionSuccess=[^;]*/i)[0].slice(18) == "true") {
        $alert = $("#alerts div.alert.alert-success");
        $alert.show();
        setTimeout(function () {
            $alert.alert("close");
        }, 10000);
    }
    else if (document.cookie.match(/submissionSuccess=[^;]*/i)[0].slice(18) == "false") {
        $alert = $("#alerts div.alert.alert-danger");
        $alert.show();
        setTimeout(function () {
            $alert.alert("close");
        }, 10000);
    }
}

// clear the submissionSuccess cookie
document.cookie = "submissionSuccess=; expires=" + new Date().toUTCString();

$("button[type=submit]").on("click", function (evt) {
    evt.preventDefault();
    var mapFilled, $email, $qFirstMoments, $qChange, $qImpacted, $qPassOn;

    $qFirstMoments = $("#q-first-moments textarea");
    $qChange = $("#q-change textarea");
    $qImpacted = $("#q-impacted textarea");
    mapFilled = $("#q-where-lat").val() && $("#q-where-lng").val();
    $qPassOn = $("#q-pass-on textarea");
    $email = $("#email input");



    // color the borders of any invalid inputs and the map container (if no location is selected) red
    $(".form-control, #mapContainer").removeClass("invalid");
    $(".form-control:invalid").addClass("invalid");
    if (!mapFilled) {
        $("#mapContainer").addClass("invalid");
    }

    // shift focus to the topmost invalid input
    if ($qFirstMoments.is(":invalid")) {
        $qFirstMoments.focus();
    }
    else if ($qChange.is(":invalid")) {
        $qChange.focus();
    }
    else if ($qImpacted.is(":invalid")) {
        $qImpacted.focus();
    }
    else if (!mapFilled) {
        $("#pac-input").focus();
    }
    else if ($qPassOn.is(":invalid")) {
        $qPassOn.focus();
    }
    else if ($email.is(":invalid")) {
        $email.focus();
    }
    else {
        $("form").submit();
    }

});