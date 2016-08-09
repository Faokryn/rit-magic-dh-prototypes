var $toggleables = $(".toggle");

$toggleables.each( function (i, t) {
    var $t = $(t);
    $t.children("button").first().on("click", function (evt) {
        evt.preventDefault();
        $t.children("div").first().slideToggle();
        $t.toggleClass("open");
    });
});
