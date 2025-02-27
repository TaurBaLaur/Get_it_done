<?php
    $jsonFile = 'todos.json';

    $jsonContent = file_exists($jsonFile) ? file_get_contents($jsonFile) : '[]';
    $jsonArray = json_decode($jsonContent, true);

    if ($_SERVER["REQUEST_METHOD"] === "POST") {
        $data = json_decode(file_get_contents("php://input"), true);
    
        if (isset($data["index"])) {
            $index = intval($data["index"]);
            array_splice($jsonArray, $index, 1);

            file_put_contents($jsonFile, json_encode($jsonArray, JSON_PRETTY_PRINT));
    
            echo json_encode(["success" => true, "deletedIndex" => $index]);
        } elseif(isset($data["text"])){
            $jsonArray[] = $data;
            file_put_contents($jsonFile, json_encode($jsonArray, JSON_PRETTY_PRINT));
            echo json_encode(["status" => "success"]);
        } else {
            echo json_encode(["success" => false, "error" => "Index not provided"]);
        }
    } else {
        echo json_encode(["success" => false, "error" => "Invalid request method"]);
    }
?>
