<?php

class UserDb{
    private static function connect(){
        $host = "localhost";
        $username = "app";
        $password = "1234";
        $db = "aktivio";

        $con = new mysqli($host,$username, $password, $db);

        if($con->connect_error){
            return "Connection failed: " . $con->connect_error;
        }
        return $con;
    }

    public static function getUsers(){
        try{
            $con = self::connect();
    
            $query = "SELECT * FROM users";
            $result = $con->query($query);
            /* if (count($result)> 0){ } */
            $data = [];
        
            while($row = $result->fetch_assoc()){
                $data[]=$row;
            }
            return $data;

        }catch (mysqli_sql_exception $e) {
            throw new Exception($e->getMessage());
        }finally{
            $con->close();
        }
      
    }

    public static function isEmailRegistered($data){
        try{
            $con = self::connect();

            $stmt = $con->prepare("SELECT * FROM users WHERE email = ?");
            $stmt->bind_param("s", $data);
            $stmt->execute();

            $result = $stmt->get_result();
          
            return $result->num_rows > 0;

        }catch (mysqli_sql_exception $e) {
            throw new Exception($e->getMessage());
        }finally{
            $stmt->close();
             $con->close();
        }
    }

    public static function register($data){
       /*  $con = null; //hm
        $stmt = null; */

        try{
            $con = self::connect();

            //check if the user email is already registered
            $emailExists = self::isEmailRegistered($data["email"]);

            if($emailExists == true){
                return ["error"=> 'Emailen finns redan'];
            }

            if(!preg_match('/^[a-zA-Z0-9_]+$/', $data["username"])){
                return ['error'=> 'Användarnamnet får endast innehålla bokstäver, siffror och understreck'];
            }

            if (!filter_var($data["email"], FILTER_VALIDATE_EMAIL)) {
                return ['error'=> 'Invalid email format.'];
            }

            $data["password"] = password_hash($data["password"], PASSWORD_DEFAULT, ["cost"=>12]);
            //kolla även att det finns en skapad genom att typ skicka epost bekräfelse eller något

            //är username lämpligt? //finns det redan en

            $stmt = $con->prepare("INSERT INTO users(username, email, password) VALUES (?, ?, ?)");

            if (!$stmt) {
                return ['error' => 'Failed to prepare the statement'];
            }

            $stmt->bind_param("sss", $data["username"], $data["email"], $data["password"]);

            if ($stmt->execute()) {
                // execute används för statement och sqlinjection och retunerar true eller false beroende på hur det gick
                return ["success"=> "User Created!"];
            } else {
                return ["error"=> $stmt->error];         
            }
            
         
        }catch(mysqli_sql_exception $e) {
            throw new Exception($e->getMessage());
        }
        finally{
            if ($stmt) {
                $stmt->close();
            }
            if ($con) {
                $con->close();
            }
        }
        /*     if (isset($stmt)) {
                $stmt->close(); // Ensure the statement is closed
            } */
    }

    public static function login($data){
        try{
            $con = self::connect();

      /*       $exists = self::isEmailRegistered($data["email"]);
            if($exists==false){
                return ["error"=> "Emailen är inte registrerad"];
            } */

            $stmt = $con->prepare("SELECT * FROM users WHERE email = ?");
            $stmt->bind_param("s", $data["email"]);
            $stmt->execute();

             $result = $stmt->get_result();

             if ($result->num_rows > 0) {
                 $user = $result->fetch_assoc(); // Hämta hela raden som associerad array
             }else{
                return ["error"=> "Emailen är inte registrerad"];
             }

            if(password_verify($data['password'], $user['password'])){
                return ["success" => "User logged in", "username"=> $user['username'], "id" => $user["id"]];
            }else{
                return ["error"=> "Wrong login details"];
            }

        }catch(mysqli_sql_exception $e) {
            throw new Exception($e->getMessage());
        }
        
    }

    public static function getUser($userId){
        try{
            $con = self::connect();
            $query = "SELECT * FROM users WHERE id=?";
            $stmt = $con->prepare($query);
            $stmt->bind_param("i", $userId);

            if ($stmt->execute()) {
                $user = $stmt->get_result()->fetch_assoc();
                return ["success"=> "User info selected", 
                        "data"=> $user,
                ];
            }else{
                return ["error"=> $stmt->error];
            }
        }catch(mysqli_sql_exception $e) {
            throw new Exception($e->getMessage());
        }finally{
            $con->close();
            $stmt->close();
        }
    }
    public static function updatePassword($newPassword, $id){
        try{
            $con = self::connect();

            $newPassword = password_hash($newPassword, PASSWORD_DEFAULT, ["cost"=>12]);

            $stmt = $con->prepare("UPDATE users set password = ? WHERE id = ?");

            if (!$stmt) {
                return ['error' => 'Failed to prepare the statement'];
            }

            $stmt->bind_param("si", $newPassword, $id);

            if ($stmt->execute()) {
                return ["success"=> "Password Updated!"];
            } else {
                return ["error"=> $stmt->error];         
            }
            
         
        }catch(mysqli_sql_exception $e) {
            throw new Exception($e->getMessage());
        }
        finally{
            if ($stmt) {
                $stmt->close();
            }
            if ($con) {
                $con->close();
            }
        }
    }

    public static function updateUsername($newUsername, $id){
        try{
           $con = self::connect();
           if(!preg_match('/^[a-zA-Z0-9_]+$/', $newUsername)){
            return ['error'=> 'Användarnamnet får endast innehålla bokstäver, siffror och understreck'];
        }

        $stmt = $con->prepare('UPDATE users SET username = ? WHERE id = ?');
        $stmt->bind_param('si', $newUsername, $id);
        if($stmt->execute()){
            return ["success"=>"Username uppdaterades"];
        }
        return ["error"=> $stmt->error];
        }catch(mysqli_sql_exception $e) {
            throw new Exception($e->getMessage());
        }finally{
            if($stmt){
                $stmt->close();
            }
            if($con){
                $con->close();
            }
        }
    }

    public static function updateEmail($newEmail, $id){
        try{
            $con = self::connect();
            $emailExists = self::isEmailRegistered($newEmail);

            if($emailExists == true){
                return ["error"=> 'Emailen finns redan'];
            }

            if (!filter_var($newEmail, FILTER_VALIDATE_EMAIL)) {
                return ['error'=> 'Invalid email format.'];
            }
            $stmt = $con->prepare('UPDATE users SET email = ? WHERE id = ?');
            $stmt->bind_param('si', $newEmail, $id);
            if($stmt->execute()){
                return ['success'=> "Email Updated"];
            }
            return ['error'=> $stmt->error];
        }catch(mysqli_sql_exception $e) {
            throw new Exception($e->getMessage());
        }finally{
            if($stmt){
                $stmt->close();
            }
            if($con){
                $con->close();
            }
        }
    }

}



