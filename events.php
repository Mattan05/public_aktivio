<?php

class EventDb {
    private static $adPercentage = 25;

    private static function connect() { //dubblering av kod
        $host = "localhost";
        $username = "app"; //byta lösenord för app
        $password = "1234"; //environment variabel
        $db = "aktivio";

        $con = new mysqli($host, $username, $password, $db);

        if ($con->connect_error) {
            return "Connection failed: " . $con->connect_error;
        }
        return $con;
    }

    public static function getCategories(){
        try{
            $con = self::connect();

            $query = "SELECT * FROM categories";
            $result = $con->query($query);

            $categories = [];
            while($row = $result->fetch_assoc()) {
                $categories[] = $row;
            }
            return $categories;

        }catch (mysqli_sql_exception $e) {
            throw new Exception($e->getMessage());
        } finally {
            $con->close();
        }
    }

    public static function getAds() {
        try {
            $con = self::connect();
            $query = "SELECT * FROM ads";
            $result = $con->query($query);
    
            $ads = [];
            while ($row = $result->fetch_assoc()) {
                $ads[] = $row;
            }
    
            return $ads;
    
        } catch (mysqli_sql_exception $e) {
            throw new Exception($e->getMessage());
        } finally {
            $con->close();
        }
    }
    
    public static function getEvents() {
        try {
            $con = self::connect();

            $query = "SELECT * FROM events JOIN categories ON events.category_id = categories.category_id";
            $result = $con->query($query);

            $data = [];
            while ($row = $result->fetch_assoc()) {
                $data[] = $row;
            }

               //gör en egen function för det
               $totalEvents = count($data);
               $numAds = round(($totalEvents * self::$adPercentage) / 100);

            // Hämta annonser från databasen
              $ads = self::getAds();

                // Lägg till annonser i datan
              foreach ($ads as $ad) {
                $numOf_pos = ($numAds * $ad['percent_pos']) / 100;
                for($i=0;$i < $numOf_pos; $i++){
                    array_splice($data, rand(1, count($data)- 1), 0, [[
                        'title' => $ad['ad_title'],
                        'description' => $ad['ad_description'],
                        'ad_link' => $ad['ad_link'],
                        'type' => 'ad'
                       ]]);
                }
            }

               if(count($ads)< $numAds){
                    $NumEmptySlots = $numAds - count($ads);
                    for($i=0; $i<$NumEmptySlots; $i++){
                        $ad = ["title"=>"Vill du ha din annons här?", "description"=>"Kontakta oss: dinemail@gmail.com", "ad_link"=>"dinlänkhär.se","type"=>"ad"];
                        //nu används inte ads databasen
                        array_splice($data, rand(1, count($data)-1), 0, [$ad]);
                    }
               }
            return $data;

        } catch (mysqli_sql_exception $e) {
            throw new Exception($e->getMessage());
        } finally {
            $con->close();
        }
    }

    public static function createEvent($data) {
        try {
            $con = self::connect();
            $query = "INSERT INTO events(userId, title, event_date, location, description, category_id) VALUES (?,?,?,?,?,?)"; //LÄGG TILL KATEGORI SEN , event_img ++ ?,
            $stmt = $con->prepare($query);
            $stmt->bind_param("issssi", $data['userId'], $data["title"], $data["event_date"], $data["location"], $data["description"], $data["category_id"]); //, $data["event_img"]
/* lägg in userId */
            if ($stmt->execute()) {
                return ["success" => "Event Created!", "id"=> $stmt->insert_id];
            } else {
                return ["error" => $stmt->error];
            }
        } catch (mysqli_sql_exception $e) {
            throw new Exception($e->getMessage());
        } finally {
            $con->close();
        }
    }

    public static function eventFileupload($name, $rowID){
        try{
            $con = self::connect();
            $query = "UPDATE events SET event_img = ? WHERE id = ?";
            $stmt = $con->prepare($query);
            $stmt->bind_param("si", $name, $rowID);
            if ($stmt->execute()) {
                return ["success" => "File uploaded", "event_img"=>$name];
            } else {
                return ["error" => $stmt->error];
            }

        }catch(Exception $e){
            throw new Exception($e->getMessage());
        }finally{
            $stmt->close();
            $con->close();
        }
    }

    static function getImageUrl($id){
        try{
            $con = self::connect();
            $query = "SELECT event_img FROM events WHERE id=?";
            $stmt = $con->prepare($query);
            $stmt->bind_param("i", $id);
            if ($stmt->execute()) {
                return $stmt->get_result()->fetch_assoc();
            }else{
                return ["error"=> $stmt->error];
            }
        }catch(Exception $e){
            return ["error"=> $e->getMessage()];
        }finally{
            $stmt->close();
            $con->close();
        }
    }

     public static function deleteEvent($id){
        try{
            $urlRes = self::getImageUrl($id)["event_img"];
            if (isset($urlRes['error'])) {
                return $urlRes;
            }

            $urlRes= explode('/', $urlRes);
            $img_link = end($urlRes);
            unlink("./client/src/event_image/". $img_link);

            $con = self::connect();
            $query = "DELETE FROM events where id=?";
            $stmt = $con->prepare($query);
            $stmt->bind_param("i", $id);
            if ($stmt->execute()) {
                return ["success"=> "Event Deleted","id"=> $id];
            }else{
                return ["error"=> $stmt->error];
            }

        }catch(mysqli_sql_exception $e){
            throw new Exception($e->getMessage());
        }finally{
         /*    $con->close();
            $stmt->close(); */
        }
    }

    public static function getEvent($id){
        try{
            $con = self::connect();
            $query = "SELECT * FROM events where id=?";
            $stmt = $con->prepare($query);
            $stmt->bind_param("i", $id);

            if ($stmt->execute()) {
                $resEvent = $stmt->get_result()->fetch_assoc();
                return ["success"=> "Event info selected", 
                        "data"=> $resEvent,

                        ];
            }else{
                return ["error"=> $stmt->error];
            }
            
        }catch(mysqli_sql_exception $e){
            throw new Exception($e->getMessage());
        }finally{
            $con->close();
            $stmt->close();
        }
    }

    public static function getEventById($id){
        try{
            $con = self::connect();

        $stmt = $con->prepare("SELECT * FROM events WHERE userId = ?");
        $stmt->bind_param('i', $id); 


        $stmt->execute();
        $result = $stmt->get_result();

            $array = [];
            while ($row = $result->fetch_assoc()) {
                $array[] = $row;
            }

            return $array;
            
        }catch(mysqli_sql_exception $e){
            throw new Exception($e->getMessage());
        }finally{
            $con->close();
        }
    }

    public static function addToFav($favoriteInfo){
        $con = null;
        $stmt = null;
        try{
            /* debug($favoriteInfo->userId); */
            if(self::checkFav($favoriteInfo)){
                return ["error"=>"Evenemanget är redan tillagt i favoriter"];
            }
            $con=self::connect();
            $stmt = $con->prepare("INSERT INTO favorites(user_id, event_id) VALUES(?,?)"); //skicka också med vilken användare
            $stmt->bind_param("ii",$favoriteInfo["userId"],$favoriteInfo["event_id"]); //om fel kolla userId o event_id
            if($stmt->execute()){
                $updateStmt = $con->prepare("UPDATE events SET like_count = like_count + 1 WHERE id = ?");
                $updateStmt->bind_param("i", $favoriteInfo["event_id"]);
                
            }
            if($updateStmt->execute()) {
                return ["success"=> "Event is added to favorite"];
            } else {
                return ["error"=>$stmt->error];
            }
            
        }catch(mysqli_sql_exception $e){
            throw new Exception($e->getMessage());
        }finally{
            if($con){
                $con->close();
            }
            if($stmt){
                $stmt->close();
            }
           
        }
    }
    private static function checkFav($favoriteInfo){
        try{
        $con=self::connect();
        $stmt = $con->prepare("SELECT * FROM favorites WHERE user_id=? AND event_id=?"); 
        $stmt->bind_param("ii",$favoriteInfo["userId"],$favoriteInfo["event_id"]); 

        if ($stmt->execute()) {
            $result = $stmt->get_result();
        }
          
        return $result->num_rows > 0;
    }catch(mysqli_sql_exception $e){
        throw new Exception($e->getMessage());
    }finally{
        if($con){
            $con->close();
        }
        if($stmt){
            $stmt->close();
        }
    }
    }

    public static function deleteFavorite($request){
        $stmt = null;
        try{
            $con = self::connect();
            $stmt= $con->prepare("DELETE FROM favorites WHERE user_id=? AND event_id=?");
            $stmt->bind_param("ii", $request['userId'], $request['event_id']);
            if($stmt->execute()){
                $updateStmt = $con->prepare("UPDATE events SET like_count = like_count - 1 WHERE id = ?");
                $updateStmt->bind_param("i", $request["event_id"]);
                
            }
            if($updateStmt->execute()) {
                return ["success"=>"Fav Deleted"];
            } else {
                return ["error"=> $stmt->error];
            }
        }catch(mysqli_sql_exception $e){
            throw new Exception($e->getMessage());
        }finally{
            if($con){
                $con->close();
            }
            if($stmt){
                $stmt->close();
            }
    }
}

    public static function isFavorite($userId, $eventId){
        try{
            $con = self::connect();
            $stmt = $con->prepare("SELECT COUNT(*) FROM favorites WHERE user_id=? AND event_id=?");
            $stmt->bind_param("ii", $userId, $eventId);
            if($stmt->execute()){
                $stmt->bind_result($count); //FÖRSTÅ SEN
                $stmt->fetch();
                $isFavorite = $count > 0;
                return ["success"=>$isFavorite];
            }
            return ["error"=>$stmt->error];

        }catch(mysqli_sql_exception $e){
            throw new Exception($e->getMessage());
        }finally{
            if($con){
                 $con->close();
            }      
            if($stmt){
                $stmt->close();
            }      
        }
    }

    public static function loadAllFavorites($activeUser){
        try{
            $con = self::connect();
            $query = "
            SELECT e.id AS event_id, e.title, e.description, e.event_date, e.event_img, e.like_count
            FROM favorites f
            INNER JOIN events e ON f.event_id = e.id
            WHERE f.user_id = ?
        ";
        
        $stmt = $con->prepare($query);
        $stmt->bind_param("i", $activeUser);

        if ($stmt->execute()) {
            $result = $stmt->get_result();
            $favorites = [];
            while ($row = $result->fetch_assoc()) {
                $favorites[] = $row;
            }
            return ['success' => $favorites];
        } else {
            return ['error' => 'Could not execute query'];
        }

        }catch(mysqli_sql_exception $e){
            throw new Exception($e->getMessage());
        }finally{
            if($con){
                 $con->close();
            }      
        }
    }

    

}