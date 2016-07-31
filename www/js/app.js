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

app.controller("GeoCtrl", function($cordovaGeolocation, $scope, $http, $state){


    $scope.myWeather = function (){
                Latitude = $scope.position.coords.latitude;
                Longitude = $scope.position.coords.longitude;

                var queryString =
                    'http://api.openweathermap.org/data/2.5/weather?lat='
                    + Latitude + '&lon=' + Longitude +"&APPID=5e21a5422be97e02b21efc48ef3b1e6c" + '&units=imperial';

                $http.get(queryString)
                    .success(function(data){
                        $scope.data = data;
                        $state.go("live",{
                            temperature:(data.main.temp -32 ) * 5/9,
                            windSpeed: (data.wind.speed) * 1.609344
                        })
                    })



            }

  var options={
      timeout:10000,
      enableHighAccuracy:true
  };


  $cordovaGeolocation.getCurrentPosition(options)
      .then(function(position){

         $scope.position = position;
          var latLng=new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
          var mapOtions = {
              center:latLng,
              zoom: 16,
              mapTypeId: google.maps.MapTypeId.ROADMAP
          };
          theMap = new google.maps.Map(document.getElementById("map"), mapOtions);
          marker = new google.maps.Marker({
              position:latLng,
              map:theMap
          });


      },
  function(err){
         console.log(err);
  });


});


app.controller("liveCtrl", function($scope, $stateParams){

    $scope.temperature = $stateParams.temperature;
    $scope.windSpeed   = $stateParams.windSpeed;

});