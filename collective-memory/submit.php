<?php

function errorOut($msg) {
    echo "<br><strong style=\"color:#FF0000;\">Error:</strong><br>" . $msg;
    setCookie("submissionSuccess", "false", time() + 600, "/");
    header("Location: http://collectivememory.cias.rit.edu/");
    // if there's a problem with the redirect, at least don't continue
    exit;
}

// these must be filled out on production installs
$pdo_dns = "";
$pdo_usr = "";
$pdo_pwd = "";

try {
    // Connect to the database
    echo "Connecting to DB...<br>";
    $conn = new PDO($pdo_dns, $pdo_usr, $pdo_pwd);

    // Set PDO to throw exceptions when errors occur
    echo "Setting error mode...<br>";
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // TODO: investigate prepared statements for queries with no user input.
    //       See https://github.com/faokryn/rit-magic-dh-prototypes/issues/2
    echo "Forming query to create table \"users\"...<br>";
    $qry_create_users = $conn->prepare("CREATE TABLE IF NOT EXISTS users (
                                            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                                            fname VARCHAR(32),
                                            lname VARCHAR(32),
                                            email VARCHAR(64) NOT NULL)"
    );
    echo "Forming query to create table \"responses\"...<br>";
    $qry_create_responses = $conn->prepare("CREATE TABLE IF NOT EXISTS responses (
                                                id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                                                user INT UNSIGNED NOT NULL,
                                                q_first_moments TEXT NOT NULL,
                                                q_change TEXT NOT NULL,
                                                q_impacted TEXT NOT NULL,
                                                q_where_lat FLOAT NOT NULL,
                                                q_where_lng FLOAT NOT NULL,
                                                q_pass_on TEXT NOT NULL,
                                                q_cell_phone BOOL NOT NULL)"
    );
    echo "Forming query to create table \"files\"...<br>";
    $qry_create_files = $conn->prepare("CREATE TABLE IF NOT EXISTS files (
                                            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                                            response INT UNSIGNED NOT NULL,
                                            file MEDIUMBLOB NOT NULL,
                                            title VARCHAR(64),
                                            description TEXT,
                                            fdate DATE,
                                            ftime TIME,
                                            location VARCHAR(255),
                                            permissions ENUM('public', 'restricted', 'private') NOT NULL)"
    );

    echo "Executing query to create table \"users\"...<br>";
    $qry_create_users->execute();

    echo "Executing query to create table \"responses\"...<br>";
    $qry_create_responses->execute();

    echo "Executing query to create table \"files\"...<br>";
    $qry_create_files->execute();
}
catch (PDOException $e) {
    errorOut($e->getMessage());
}

if (!empty($_REQUEST["email"])           &&
    !empty($_REQUEST["q-first-moments"]) &&
    !empty($_REQUEST["q-change"])        &&
    !empty($_REQUEST["q-impacted"])      &&
    !empty($_REQUEST["q-where-lat"])     &&
    !empty($_REQUEST["q-where-lng"])     &&
    !empty($_REQUEST["q-pass-on"])       &&
    !empty($_REQUEST["q-cell-phone"])
) {

    // TODO: validate/sanitize input. See https://github.com/faokryn/rit-magic-dh-prototypes/issues/1
    $email = $_REQUEST["email"];

    try {
        echo "Forming query to add user...<br>";
        $qry_insert_user = $conn->prepare("INSERT INTO users (fname, lname, email) VALUES (:fname, :lname, :email)");

        echo "Forming query to add response...<br>";
        $qry_insert_response = $conn->prepare("INSERT INTO responses (user, q_first_moments, q_change, q_impacted,
                                                    q_where_lat, q_where_lng, q_pass_on, q_cell_phone)
                                                    VALUES (:user, :q_first_moments, :q_change, :q_impacted,
                                                    :q_where_lat, :q_where_lng, :q_pass_on, :q_cell_phone)"
        );

        echo "Forming query to add file...<br>";
        $qry_insert_file = $conn->prepare("INSERT INTO files (response, file, title, description, fdate, ftime, location,
                                                permissions) VALUES (:response, :file, :title, :description, :fdate,
                                                :ftime, :location, :permissions)"
        );

        echo "Forming query to get last inserted ID...<br>";
        $qry_last_id = $conn->prepare("SELECT LAST_INSERT_ID()");


        // TODO: validate/sanitize input. See https://github.com/faokryn/rit-magic-dh-prototypes/issues/1
        $fname = $_REQUEST["fname"];
        $lname = $_REQUEST["lname"];

        echo "Executing query to add user...<br>";
        $qry_insert_user->execute(Array(":fname" => $fname,
                                        ":lname" => $lname,
                                        ":email" => $email)
        );

        echo "Getting last inserted ID...<br>";
        $qry_last_id->execute();
        $user = $qry_last_id->fetch()[0];

        // TODO: validate/sanitize input. See https://github.com/faokryn/rit-magic-dh-prototypes/issues/1
        $q_first_moments = $_REQUEST["q-first-moments"];
        $q_change = $_REQUEST["q-change"];
        $q_impacted = $_REQUEST["q-impacted"];
        $q_where_lat = $_REQUEST["q-where-lat"];
        $q_where_lng = $_REQUEST["q-where-lng"];
        $q_pass_on = $_REQUEST["q-pass-on"];
        $q_cell_phone = $_REQUEST["q-cell-phone"];

        echo "Executing query to add response...<br>";
        $qry_insert_response->execute(Array(":user" => $user,
                                            ":q_first_moments" => $q_first_moments,
                                            ":q_change" => $q_change,
                                            ":q_impacted" => $q_impacted,
                                            ":q_where_lat" => $q_where_lat,
                                            ":q_where_lng" => $q_where_lng,
                                            ":q_pass_on" => $q_pass_on,
                                            ":q_cell_phone" => $q_cell_phone)
        );

        echo "Getting last inserted ID...<br>";
        $qry_last_id->execute();
        $response = $qry_last_id->fetch()[0];

        // TODO: check and add files in a loop based on MAX_FILES in fileCollection.js
        //       See https://github.com/faokryn/rit-magic-dh-prototypes/issues/3

        // Add File 1, if applicable
        if ($_REQUEST["f1-file"]) {

            // TODO: validate/sanitize input. See https://github.com/faokryn/rit-magic-dh-prototypes/issues/1
            $file           = $_REQUEST["f1-file"];
            $title          = $_REQUEST["f1-title"];
            $description    = $_REQUEST["f1-description"];
            $fdate          = $_REQUEST["f1-date"];
            $ftime          = $_REQUEST["f1-time"];
            $location       = $_REQUEST["f1-location"];
            $permissions    = $_REQUEST["f1-permissions"];

            echo "Executing query to add File 1...<br>";
            $qry_insert_file->execute(Array(   ":response" => $response,
                                                ":file" => $file,
                                                ":title" => $title,
                                                ":description" => $description,
                                                ":fdate" => $fdate,
                                                ":ftime" => $ftime,
                                                ":location" => $location,
                                                ":permissions" => $permissions)
            );
        }

        // Add File 2, if applicable
        if ($_REQUEST["f2-file"]) {

            // TODO: validate/sanitize input. See https://github.com/faokryn/rit-magic-dh-prototypes/issues/1
            $file           = $_REQUEST["f2-file"];
            $title          = $_REQUEST["f2-title"];
            $description    = $_REQUEST["f2-description"];
            $fdate          = $_REQUEST["f2-date"];
            $ftime          = $_REQUEST["f2-time"];
            $location       = $_REQUEST["f2-location"];
            $permissions    = $_REQUEST["f2-permissions"];

            echo "Executing query to add File 2...<br>";
            $qry_insert_file->execute(Array(   ":response" => $response,
                                                ":file" => $file,
                                                ":title" => $title,
                                                ":description" => $description,
                                                ":fdate" => $fdate,
                                                ":ftime" => $ftime,
                                                ":location" => $location,
                                                ":permissions" => $permissions)
            );
        }

        // Add File 3, if applicable
        if ($_REQUEST["f3-file"]) {

            // TODO: validate/sanitize input. See https://github.com/faokryn/rit-magic-dh-prototypes/issues/1
            $file           = $_REQUEST["f3-file"];
            $title          = $_REQUEST["f3-title"];
            $description    = $_REQUEST["f3-description"];
            $fdate          = $_REQUEST["f3-date"];
            $ftime          = $_REQUEST["f3-time"];
            $location       = $_REQUEST["f3-location"];
            $permissions    = $_REQUEST["f3-permissions"];

            echo "Executing query to add File 3...<br>";
            $qry_insert_file->execute(Array(   ":response" => $response,
                                                ":file" => $file,
                                                ":title" => $title,
                                                ":description" => $description,
                                                ":fdate" => $fdate,
                                                ":ftime" => $ftime,
                                                ":location" => $location,
                                                ":permissions" => $permissions)
            );
        }

        // Add File 4, if applicable
        if ($_REQUEST["f4-file"]) {

            // TODO: validate/sanitize input. See https://github.com/faokryn/rit-magic-dh-prototypes/issues/1
            $file           = $_REQUEST["f4-file"];
            $title          = $_REQUEST["f4-title"];
            $description    = $_REQUEST["f4-description"];
            $fdate          = $_REQUEST["f4-date"];
            $ftime          = $_REQUEST["f4-time"];
            $location       = $_REQUEST["f4-location"];
            $permissions    = $_REQUEST["f4-permissions"];

            echo "Executing query to add File 4...<br>";
            $qry_insert_file->execute(Array(   ":response" => $response,
                                                ":file" => $file,
                                                ":title" => $title,
                                                ":description" => $description,
                                                ":fdate" => $fdate,
                                                ":ftime" => $ftime,
                                                ":location" => $location,
                                                ":permissions" => $permissions)
            );
        }

        // Add File 5, if applicable
        if ($_REQUEST["f5-file"]) {

            // TODO: validate/sanitize input. See https://github.com/faokryn/rit-magic-dh-prototypes/issues/1
            $file           = $_REQUEST["f5-file"];
            $title          = $_REQUEST["f5-title"];
            $description    = $_REQUEST["f5-description"];
            $fdate          = $_REQUEST["f5-date"];
            $ftime          = $_REQUEST["f5-time"];
            $location       = $_REQUEST["f5-location"];
            $permissions    = $_REQUEST["f5-permissions"];

            echo "Executing query to add File 5...<br>";
            $qry_insert_file->execute(Array(   ":response" => $response,
                                                ":file" => $file,
                                                ":title" => $title,
                                                ":description" => $description,
                                                ":fdate" => $fdate,
                                                ":ftime" => $ftime,
                                                ":location" => $location,
                                                ":permissions" => $permissions)
            );
        }
    }
    catch (PDOException $e) {
        errorOut($e->getMessage());
    }
}
else {
    errorOut("One or more required values were not set");
}

echo "<br><strong style=\"color:#00CC00;\">Success!</strong><br>";
setCookie("submissionSuccess", "true", time() + 600, "/");
header("Location: http://collectivememory.cias.rit.edu");
