// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
app=angular.module('starter', ['ionic', 'ngCordova', 'ngStorage'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
});

app.config(function($stateProvider, $urlRouterProvider){
     $stateProvider.state("meteo", {
        url:"/meteo",
        templateUrl:"templates/meteo.html",
         controller:"MeteoCtrl"
    });
    $stateProvider.state("infoMeteo", {
        url:"/infoMeteo/:city",
        templateUrl:"templates/infoMeteo.html",
        controller:"InfoMeteoCtrl"
    });
    $stateProvider.state("contact", {
        url:"/contact",
        templateUrl:"templates/contact.html"
    });
    $stateProvider.state("geo", {
        url:"/geo",
        templateUrl:"templates/geo.html",
        controller:"GeoCtrl"
    });
    $stateProvider.state("config", {
        url:"/config",
        templateUrl:"templates/config.html"
    });
    $stateProvider.state("live", {
        url:"/live/:temperature/:windSpeed",
        templateUrl:"templates/live.html",
        controller:"liveCtrl"
    });
    $urlRouterProvider.otherwise("meteo");
});

app.controller("MeteoCtrl", function($scope, $state){
   $scope.getMeteo = function(ville){
      $state.go("infoMeteo",{
          city:ville
      })
   };
});

app.controller("InfoMeteoCtrl", function($scope, $stateParams, $http, $ionicLoading){

    url= "http://api.openweathermap.org/data/2.5/forecast/dailly?q="+$stateParams.city+"&APPID=5e21a5422be97e02b21efc48ef3b1e6c";
    $ionicLoading.show({
       template:"patience is the key..."
    });
    $http.get(url)
        .success(function(data){
        $scope.meteo = data;
            $ionicLoading.hide();
       })
        .error(function(err){
            $ionicLoading.hide();
        });


});

app.controller("GeoCtrl", function($cordovaGeolocation, $scope, $http, $state, $q){

  // in an ideal world, this getCurrentPosition would be in a service
  // to abstract away any interaction with $q

    function getCurrentPosition() {
      /*
        I made this a function so we can recall it. If for example the user clicks the 
        GPS Forecast button very quickly, the $scope.position is not set and the myWeather function breaks
        So as soon as controller as initialised, we try to get the scope.position
       */
      
      var options = {
        timeout:10000,
        enableHighAccuracy:true
      };

      return $cordovaGeolocation.getCurrentPosition(options)
      .then(function(position) {
        console.log(position)

         $scope.position = position; // scope.position is set here
          var latLng=new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
          var mapOtions = {
              center:latLng,
              zoom: 16,
              mapTypeId: google.maps.MapTypeId.ROADMAP
          };

          var theMap = new google.maps.Map(document.getElementById("map"), mapOtions);
          var marker = new google.maps.Marker({
              position:latLng,
              map:theMap
          });

          return $q.resolve("ahdgjbhb") 
          // $q.resolve() creates a promise and resolves it instantly. We need this in case
          // we're recalling this function from our myWeather function. It is needed to notify 
          // myWeather that $cordovaGeolocation.getCurrentPosition successfully ran,
          // meaning scope.position is set successfully

      }, function(err) {
        // if there's an error, scope.position is not set. Ooops!
         console.log(err);
         return $q.reject(err);
         // $q.reject() creates a promise that fails instantly. This means the function
         // didn't run successfully, and in case we're calling this from another function
         // like myWeather, it notifies that we couldn't successfully get the position
      });
    }
    getCurrentPosition(); // we call the function immediately

    function getData() {
      /*
      we make this a separate function just to minimise code duplication. That's the only reason
       */

      var latitude = $scope.position.coords.latitude;
      var longitude = $scope.position.coords.longitude;

      var queryString =
        'http://api.openweathermap.org/data/2.5/weather?lat='
        + latitude + '&lon=' + longitude +"&APPID=5e21a5422be97e02b21efc48ef3b1e6c" + '&units=imperial';

      $http.get(queryString).then(function(result) { 
        // note I changed from '.success() to .then() above. The .success() is deprecated'
        console.log(result)
        $scope.data = result.data;
        $state.go("live", {
            temperature:(result.data.main.temp -32 ) * 5/9,
            windSpeed: (result.data.wind.speed) * 1.609344
        })

      }, function(e) {
        console.log(e)
      })
    }

    $scope.myWeather = function () {
      // let's first check if scope.position is already set. If already set,
      // we proceed, otherwise, we call the getCurrentPosition function to rety

      if ($scope.position) {
        getData(); // that's why i made this a function so we wouldn't have to type it here and in the else block
      } else {
        // scope.position is not set, let's retry
        getCurrentPosition().then(function(data) {
          // if we're here, it means we successfully ran getCurrentPosition, let's proceed as normal
          // the 'data' we get here is what we returned from $q.resolve() above
          console.log(data)
          getData(); // that's why i made this a function so we wouldn't have to type it here and in the if block above
        }, function(err) {
          // if we're here, we couldn't run getCurrentPosition successfully, we might alert the user here
          // or run some other function or retry. Your choice
          console.log(err)
        });
        
      }
    }
});


app.controller("liveCtrl", function($scope, $stateParams){

    $scope.temperature = $stateParams.temperature;
    $scope.windSpeed   = $stateParams.windSpeed;

});
