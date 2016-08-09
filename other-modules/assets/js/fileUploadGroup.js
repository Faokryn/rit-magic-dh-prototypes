$(".file-upload-group").each(function (i, uploadGroup) {
    var $dropdown, $dropdownLink, $fileInput, $fileNameDisplay, $uploadGroup;

    $uploadGroup = $(uploadGroup);

    $dropdown = $uploadGroup.find("button[data-toggle=dropdown]");
    $dropdownLink = $uploadGroup.find("a");
    $fileInput = $uploadGroup.find("input[type=file]");
    $fileNameDisplay = $uploadGroup.find("input[type=text]");
    $permissionsInfo = $uploadGroup.find("[data-toggle=modal]");

    // Display file name in text input
    $fileInput.change(function () {
        $fileNameDisplay.val($fileInput.val().slice($fileInput.val().lastIndexOf("\\") + 1));
    });

    // Set dropdown to change on clicking an option
    $dropdown.click(function (evt) {
        evt.preventDefault();
    });
    $dropdownLink.each(function (i, link) {
        $(link).click(function (evt) {
            $dropdown.html(link.innerHTML + " <span class=\"caret\"></span>");
        });
    });

    // Initialize modal buttons
    $permissionsInfo.click(function (evt) {
        evt.preventDefault();
    });
});
