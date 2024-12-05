<?php
session_start();
if (!isset($_SESSION['loggedIn'])) {  //LADE TILL DETTA FÖR OM DET INTE FINNS EN COOKIE SÅ BLIR loggedin false 
        $_SESSION['loggedIn'] = false; 
    }
require_once("router.php");
require_once("users.php");
require_once("events.php");
require_once("debug.php");



function auth(){
    return isset($_SESSION['loggedIn']) && $_SESSION['loggedIn'] === true;
}


/* function checkAuth() {
    if (!auth()) {
        $_SESSION['loggedIn'] = false;
        return false; 
    }
    $_SESSION['loggedIn'] = true; 
    return true; 
} */

App::get('/', function(){
    include("client/dist/static.html"); 
    /* include("client/dist/index.html");  */
});

App::get('/auth', function(){
    if(isset($_SESSION['loggedIn']) && $_SESSION['loggedIn']){
 
            jsonResponse(["loggedIn"=> $_SESSION['loggedIn'], 'user'=> $_SESSION['user'], 'sessionId'=> $_SESSION['id']]);
            return;
        
    }

        jsonResponse(["loggedIn"=> $_SESSION['loggedIn']]); /* $_SESSION['loggedIn']] */
 });

App::post("/register", function(){
    $data =(array) json_decode(file_get_contents('php://input'));   
   
    header("Content-Type:application/json");
    
    if (containsBadWords($data["username"])) {
        jsonResponse(["error" => "Användarnamnet innehåller olämpliga ord"]);
        return;
    }

    if(strlen($data["password"])<6){
        echo json_encode(["error" => "Password must be at least 6 characters long"]); //funkar inte
        return;
    }

    $result = UserDb::register($data);
        if(!empty($result["success"])){
            echo json_encode(["success"=>$result["success"]]);


        /*  return json_encode(["success" => $result["success"]]); */
            /* echo "". $result["success"].""; */
        }elseif(!empty($result["error"])){

            echo json_encode(["error" => $result["error"]]);

            /* return json_encode(["error" => $result["error"]]); */
        }else {
            // Optional: Return a default error if no proper response is found
            echo json_encode(["error" => "An unknown error occurred during registration"]);
        }
});

App::post("/login", function(){
    $data =(array) json_decode(file_get_contents('php://input'));
    
    if(!$data["email"] || !$data["password"]){
        echo json_encode( value: ["error"=> "Ange både Email och Lösenord."]);
        return;
    }

    $result = UserDb::login($data);
    if(!empty($result['success'])){
        $_SESSION["loggedIn"] = true;
        $_SESSION['user']= $result['username'];
        $_SESSION['id'] = $result['id'];

        echo json_encode(['success'=> $result['success']]);

        /* echo json_encode([
            "success" => $result["success"],
            "session" => [
                "loggedIn" => $_SESSION["loggedIn"],
                "user" => $_SESSION['user'],
                "id" => $_SESSION['id']
            ]
        ]); */ //onödigt behöver bara $result
    }elseif(!empty($result["error"])){
        echo json_encode(["error" => $result["error"]]);
         //kolla om detta funkar eller om man behöver skriva echo json_encode(["error" => $result["error"]]);
    }else {
        // Optional: Return a default error if no proper response is found
        return json_encode(["error" => "An unknown error occurred during login"]);
    }
});

function containsBadWords($text) {
    $textLower = mb_strtolower($text, 'UTF-8'); 
    $badWords = ["neger", "nigger", "hora", "mongo", "cp", "nigga", "runka", "runkning", "fitta", "kuk", "slampa", "knulla", "röv", "n3ger", "retard", "chigga", "horunge", "bög", "transa", "porr",
                "anal", "porn", "bögporr", "niggas", "fuck", "fucking", "slakt", "döda", "sharmuta", "vagina", "snopp","snippa", "vagina", "vaginalt", "bajs", "kiss", 
                "mörda", "kill", "våldta", "rape", "idiot", "phising", "rasse", "rasist", "runka", "lesbian", "nazist", "palestina", "israel", "barnporr", "kocentrationläger",
                "hitler", "stalin", "gahbe", "puta","kurwa", "mammaknullare", "pappaknullare", "judejävel", "judeslakt"];
    foreach ($badWords as $word) {
        $wordLower = mb_strtolower($word, 'UTF-8'); 
        $reversedWord = strrev($wordLower); 
        
        if (strpos($textLower, $wordLower) !== false || strpos($textLower, $reversedWord) !== false) {
            return true;
        }
    }
    return false; 
}



App::post("/create", function(){

    if (!Auth()) { 
        jsonResponse(["error" => "Unauthorized access"]);
        return; 
    }

    $data =(array) json_decode(file_get_contents('php://input'));


    if (containsBadWords($data["title"])) {
        jsonResponse(["error" => "Titeln innehåller olämpliga ord"]);
        return;
    }

    if (containsBadWords($data["description"])) {
        jsonResponse(["error" => "Beskrivningen innehåller olämpliga ord"]);
        return;
    }

    $data["userId"] = $_SESSION["id"];
    /* $eventDate = new DateTime($data["event_date"]);
        $data["event_date"] = $eventDate->format('m-d-Y'); */
    /* echo json_encode( ["error"=>$data["userId"]]); */
    if(empty($data["userId"]) || empty($data["title"]) || empty($data["event_date"]) || empty($data["location"]) || empty($data["description"]) || empty($data["category_id"]) /* || empty($data["event_img"]) */){
        jsonResponse(["error" => "Ange alla fält"]);
        return;
    }
    
    //kolla så att location finns.  OpenStreetMap Nominatim
    //kolla att title är lämpliga ord samma med description
    //event date är rätt format regex//förbestämt i 
    //får inte vara utanför sverige

    $result = EventDb::createEvent($data);

    if(!empty($result['success'])){
        jsonResponse($result);
    }elseif(!empty($result["error"])){
        jsonResponse(["error" => $result["error"]]);
    }else {
        jsonResponse(["error" => "An unknown error occurred during create"]); //gör jsonresponse på alla...
    }

    //GÖR DARK/LIGHT MODE
});

App::post("/events/upload", function(){
    if (!Auth()) { 
        jsonResponse(["error" => "Unauthorized access"]);
        return; 
    }
    $rowID = $_POST['event_id'];

    if (!isset($_FILES["event_img"])) {
        jsonResponse(["error" => "File is undefined"]);
        return;
    }

    $name = "event_". uniqid(true);
    $ext = Upload::getExt($_FILES["event_img"]["name"]);
   /*  echo $_FILES["event_img"]["name"]; */

    if(!Upload::checkExt($ext)){
        jsonResponse(["error"=>"Wrong Extention"]);
        return;
    }
    if(!Upload::checkSize($_FILES["event_img"])){
        jsonResponse(["error"=> "Image is too big"]);
        return;
    }

    $name = "client/src/event_image/".$name .".". $ext;

   /*  echo $name; */

    $result = EventDb::eventFileupload($name, $rowID);

    if(!empty($result['success'])){
        move_uploaded_file($_FILES["event_img"]["tmp_name"], $name);
        jsonResponse($result);
    }elseif(!empty($result["error"])){
        jsonResponse($result);
    }else {
        jsonResponse(["error" => "An unknown error occurred during create"]); //gör jsonresponse på alla...
    }
});

class Upload{
    public static function getExt($fileName){
        $ext = explode(".", $fileName);
        $length = count($ext) -1;
        return $ext[$length];
    }

    public static function checkExt($ext){
        $extensions = [
            "jpg" => "true",
            "JPG" => "true",
            "jpeg" => "true",
            "JPEG" => "true",
            "png" => "true",
            "PNG" => "true",
            "gif" => "true",
            "GIF" => "true",
            "HEIF"=> "true",
            "HEIC"=> "true",
            "webp" => "true",
            "WEBP" => "true",
        ];
        if(empty($extensions[$ext])) return false;
        return true;
    }

    public static function checkSize($file){
        if($file["size"]>2000000) return false;
        return true;
    }
}

App::get("/events", function(){

    $result = EventDb::getEvents();
    jsonResponse($result);
});

App::get("/categories", function(){
    $categories = EventDb::getCategories();
    jsonResponse($categories);
});

App::delete('/event/delete/$id', function($id){
    if (!Auth()) { 
        jsonResponse(["error" => "Unauthorized access"]);
        return; 
    }
    $del = EventDb::deleteEvent($id);
    jsonResponse($del);
});

App::get('/event/$id', function($id){
    $res = EventDb::getEvent($id);
    jsonResponse($res);
});

App::get('/user', function(){
    if (!Auth()) { 
        jsonResponse(["error" => "Unauthorized access"]);
        return; 
    }
    $user = UserDb::getUser($_SESSION["id"]);
    jsonResponse($user);
});

App::get("/logout", function(){
    if (!Auth()) { 
        jsonResponse(["error" => "Unauthorized access"]);
        return; 
    }
  /*   session_regenerate_id(true); */
    session_destroy();
    session_unset();
    jsonResponse(["success" => "loggedOut"]);
  /*   echo "Logged out"; */
    /* jsonResponse(["loggedOut"=>true]); */
});

App::put("/updatePassword", function(){
    if (!Auth()) { 
        jsonResponse(["error" => "Unauthorized access"]);
        return; 
    }

    $passwordData =(array) json_decode(file_get_contents('php://input'));
    
    if(!$passwordData["realPassword"] || !$passwordData["currentPassword"] || !$passwordData["newPassword"] || !$passwordData["confirmPassword"]){
        echo json_encode( value: ["error"=> "Ange både Email och Lösenord."]);
        return;
    }

    if(strlen($passwordData["newPassword"])<6){
        echo json_encode(["error" => "Password must be at least 6 characters long"]); //funkar inte
        return;
    }

    /*  echo $passwordData["realPassword"] ." ". $passwordData["currentPassword"] ." ". $passwordData["newPassword"] ." ". $passwordData["confirmPassword"]; 
     return; */

    if(!password_verify($passwordData["currentPassword"], $passwordData["realPassword"])) {
        echo jsonResponse(["error"=> "Tidigare lösenord, matchar inte"]);
        return;
    }

    if($passwordData["confirmPassword"] !== $passwordData["newPassword"]) {
        echo jsonResponse(["error" => "Bekräfelse lösenordet matchar inte"]);
        return;
    }

    $result = UserDb::updatePassword($passwordData["newPassword"], $passwordData["id"]); 
     jsonResponse($result);
});

App::put("/updateProfile", function(){
    if (!Auth()) { 
        jsonResponse(["error" => "Unauthorized access"]);
        return; 
    }
 /*    if (containsBadWords($data["title"])) {
        jsonResponse(["error" => "Titeln innehåller olämpliga ord"]);
        return;
    } */

    
    $profileData =(array) json_decode(file_get_contents('php://input'));
    if(!empty($profileData["email"])){
        if (containsBadWords($profileData["email"])) {
            jsonResponse(["error" => "Emailen innehåller olämpliga ord"]);
            return;
        }
        $emailRes = UserDb::updateEmail($profileData['email'], $profileData['id']);
        jsonResponse($emailRes);
    }if(!empty($profileData['username'])){
        if (containsBadWords($profileData["username"])) {
            jsonResponse(["error" => "Användarnamnet innehåller olämpliga ord"]);
            return;
        }
        $usernameRes = UserDb::updateUsername($profileData['username'], $profileData['id']);
        jsonResponse($usernameRes);
    }
});

App::get('/userEvents/$id', function($id){
    if (!Auth()) { 
        jsonResponse(["error" => "Unauthorized access"]);
        return; 
    }
    $res = EventDb::getEventById($id);
    jsonResponse( $res);
});

App::post('/addFavorite', function(){
    if (!Auth()) { 
        jsonResponse(["error" => "Unauthorized access"]);
        return; 
    }

    //SKA BARA KUNNA LÄGGA TILL EN GÅNG
    $favoriteInfo =(array) json_decode(file_get_contents('php://input'));
    $favRes = EventDb::addToFav($favoriteInfo);
    jsonResponse($favRes);
});

App::delete("/removeFavorite", function(){
    if (!Auth()) { 
        jsonResponse(["error" => "Unauthorized access"]);
        return; 
    }

    $request =(array) json_decode(file_get_contents('php://input'));
    $deleteRes = EventDb::deleteFavorite($request);
    jsonResponse($deleteRes);
});

App::get("/isFavorite", function(){
    if (!Auth()) { 
        jsonResponse(["error" => "Unauthorized access"]);
        return; 
    }

    $userId = $_GET['userId'];
    $eventId =$_GET['eventId'];

    $isFavRes = EventDb::isFavorite($userId, $eventId);

    jsonResponse($isFavRes);
});

App::get("/loadFavorites", function(){
    if (!Auth()) { 
        jsonResponse(["error" => "Unauthorized access"]);
        return; 
    }
    $userId = $_GET['userId'];
    $favorites = EventDb::loadAllFavorites($userId);
    jsonResponse($favorites);
    
});

App::get("/adInquiry", function(){
//HA ETT FORMULÄR SOM KAN SKICKAS IN TYP IDK..
});