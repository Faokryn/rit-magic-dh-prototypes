/*
    Controls the
*/

//////////////////////////////////////////////
//      Constants and Global Variables      //
//////////////////////////////////////////////

var MAX_FILES, fileCount, newFileNum;

MAX_FILES = 5;
MAX_FILE_SIZE = 15728640; // 15 MB

fileCount = 0;
newFileNum = 1;

/////////////////////////
//      Functions      //
/////////////////////////

// logs the contents of the specified file to the console
function fileReport(num) {
    var fileId, i;

    if (num < 0 || num > MAX_FILES) {
        console.error("Acceptable value: 0-" + MAX_FILES + ". Use \"0\" for all.");
    }
    else if (num == 0) {
        i = 0;
        while (i < MAX_FILES) {
            fileReport(i++ + 1);
        }
    }
    else {
        fileId = "#f" + num + "-";

        console.log("File " + num + " file: "        + $(fileId + "file").val()        + "\n" +
                    "File " + num + " title: "       + $(fileId + "title").val()       + "\n" +
                    "File " + num + " description: " + $(fileId + "description").val() + "\n" +
                    "File " + num + " date: "        + $(fileId + "date").val()        + "\n" +
                    "File " + num + " time: "        + $(fileId + "time").val()        + "\n" +
                    "File " + num + " location: "    + $(fileId + "location").val()    + "\n" +
                    "File " + num + " permissions: " + $(fileId + "permissions").val() + "\n\n"
        );
    }
}

// gets the name of the specified file
function getFileName(fileId) {
    var $fileInput = $(fileId + "-file");
    return $fileInput.val().slice($fileInput.val().lastIndexOf("\\") + 1);
}

// fills the modal's file input textbox and the file display textbox with the name of the specified file
function displayFileName(fileId) {
    var name = getFileName(fileId);
    $("#file input[type=text]").val(name);
    $(fileId + "-display input").val(name);
}

// saves the metadata inputs for the specified file from the modal's inputs
// note: does not transfer the file input back to the form. This is handled on the modal close event (see below)
function saveFileData(fileId) {
    // only proceed if the source file exists
    if ($(fileId + "-file").val()) {
        // set the input values in the form to the input values from the modal
        $(fileId + "-title").val($("#title input").val());
        $(fileId + "-description").val($("#description textarea").val());
        $(fileId + "-date").val($("#date input").val());
        $(fileId + "-time").val($("#time input").val());
        $(fileId + "-location").val($("#location input").val());
        $(fileId + "-permissions").val($("#permissions label.active input").val());
    }
}

// loads the metadata inputs for the specified file into the modal's inputs
function loadFileData(fileId) {
    // only proceed if the source file exists
    if ($(fileId + "-file").val()) {
        // set destination inputs' values to the source inputs' values
        $("#title input").val($(fileId + "-title").val());
        $("#description textarea").val($(fileId + "-description").val());
        $("#date input").val($(fileId + "-date").val());
        $("#time input").val($(fileId + "-time").val());
        $("#location input").val($(fileId + "-location").val());
        $("#permissions-" + $(fileId + "-permissions").val()).prop("checked", true);
    }
}

function checkFileSize(fileId) {
    var $fileInput, $fileSizeTxt;

    $fileInput = $(fileId + "-file");
    $fileSizeTxt = $("#file-size-txt");

    if ($fileInput[0].files && $fileInput[0].files[0] && $fileInput[0].files[0].size > MAX_FILE_SIZE) {
        $fileInput.val("");
        $("#file input[type=text]").val("");
        $fileSizeTxt.addClass("invalid");
    }
    else {
        $fileSizeTxt.removeClass("invalid");
    }
}

// loads the file input for the specified file into the modal
function loadFileInput(fileId) {
    var $fileInput = $(fileId + "-file");
    // move the file input into the modal
    $("#file div.file-upload-group span").append($fileInput);
    // bind the modal's file input textbox to display the file name from the file input
    $fileInput.on("change", displayFileName.bind(this, fileId));
    $fileInput.on("change", checkFileSize.bind(this, fileId));
    $fileInput.trigger("change");
}

// clears all inputs associated with a file from the form, including the file itself
function removeFile(fileId) {
    // clears all inputs associated with the file, including the file itself
    $(fileId + " input," + fileId + " textarea").val("");
    // hides the file's display
    $("#unadded-files").append($(fileId + "-display"));
    // $(fileId + "-display").hide();

    // if all file slots were filled, and this opens a new one
    if (fileCount-- == MAX_FILES) {
        // set newFileNum to this file
        newFileNum = parseInt(fileId.slice(2), 10);
        // show the add file button
        $("#new-file-btn").show();
    }
}

// clears the fields of the modal.
// note: does not clear the file input or transfer it back to the form.
//       This is handled on the modal close event (see below)
function clearModalFields() {
    $("#file input[type=text]").val("");
    $("#title input").val("");
    $("#description textarea").val("");
    $("#date input").val("2001-09-11"); // default to September 11, 2001 for the date
    $("#time input").val("");
    $("#location input").val("");
    // permissions is not reset, i.e. default to their last used permissions settings
}

//////////////////////////////
//      Event Handlers      //
//////////////////////////////

// prevent buttons meant to open modals from submitting the form
$("button[data-toggle=modal]").on("click", function (evt) {
    evt.preventDefault();
});

// when the "Add File" button is clicked
$("#new-file-btn").on("click", function () {
    var $saveFileBtn, fileId;

    $saveFileBtn = $("#add-file-btn");
    fileId = "#f" + newFileNum;

    // load the file input into the modal
    loadFileInput(fileId);

    // set the click handler on the "Add" button in the Add File modal
    $saveFileBtn.off("click");
    $saveFileBtn.on("click", function (evt) {
        saveFileData(fileId);

        // if a file was added, show the file display
        if ($(fileId + "-file").val()) {
            $("#added-files").append($(fileId + "-display"));
        }

        // hide "Add File" button, if applicable, or else determine the next file to fill
        if (++fileCount == MAX_FILES) {
            $("#new-file-btn").hide();
        }
        else {
            while ($("#f" + newFileNum + "-file").val()) {
                if (++newFileNum > MAX_FILES) {
                    newFileNum = 1;
                }
            }
        }

        clearModalFields();
    });
});

// TODO: Implement Edit functionality.  See https://github.com/faokryn/rit-magic-dh-prototypes/issues/4
// when any Edit File button (pencil) is clicked
// $(".edit-file-btn").on("click", function (evt) {
//     var fileId = $(this).data("file-id");
//     loadFileInput(fileId);
//     loadFileData(fileId);
// });

// When the add file modal closes, move the file input back to the form
$("#add-file-modal").on("hide.bs.modal", function (evt) {
    var $fileInput = $("#file input[type=file]");
    $("#" + $fileInput.attr("id").slice(0,2)).prepend($fileInput);
});

// when any Delete File button (trash) is clicked
$(".delete-file-btn").on("click", function (evt) {
    var $confirmRemoveBtn, fileId;

    $confirmRemoveBtn = $("#confirm-remove");
    fileId = $(this).data("file-id");

    // change file name displayed in warning text
    $("#file-name").html(getFileName(fileId));

    // create an event listener to clear the correct file if Remove is clicked
    $confirmRemoveBtn.off("click");
    $confirmRemoveBtn.on("click", removeFile.bind(this, fileId));
});
