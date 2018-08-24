"use strict";

 angular.module('config', [])

.constant('ENV', {serverURL:'http://www.proteomaps.local/api/index.php',imageURL:'http://www.proteomaps.local/api/image_get.php',withCredentials:false,debugInfoEnabled:true,CORS:true})

;