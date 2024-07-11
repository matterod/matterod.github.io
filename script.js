var firebaseConfig = {
    apiKey: "AIzaSyANGLfDfRnsIfN3k-COWI22Y0bi8emK4Os",
    authDomain: "esp32rinconada.firebaseapp.com",
    databaseURL: "https://esp32rinconada-default-rtdb.firebaseio.com",
    projectId: "esp32rinconada",
    storageBucket: "esp32rinconada.appspot.com",
    messagingSenderId: "82707406557",
    appId: "1:82707406557:web:62f5993a30a39b7f130534",
    measurementId: "G-84QEWN29ZH"
};

firebase.initializeApp(firebaseConfig);

$(document).ready(function(){
    var database = firebase.database();
    var currentUser = null;
    var userNumber = null;

    function showControlPanel() {
        $("#login-container").hide();
        $("#control-container").show();
    }

    function hideControlPanel() {
        $("#login-container").show();
        $("#control-container").hide();
    }

    $("#login-button").click(function(){
        var username = $("#username").val();
        var password = $("#password").val();

        database.ref('users/' + username).once('value').then(function(snapshot) {
            var userData = snapshot.val();
            if (userData && userData.password === password) {
                currentUser = username;
                userNumber = username.match(/\d+/)[0]; // Extrae el número del usuario
                showControlPanel();
                loadUserData();
            } else {
                $("#login-error").text("Invalid username or password.");
            }
        }).catch(function(error) {
            console.error('Error:', error);
            $("#login-error").text("An error occurred.");
        });
    });

    $("#logout-button").click(function(){
        currentUser = null;
        hideControlPanel();
    });

    function loadUserData() {
        // Mostrar solo el botón correspondiente al usuario
        $(".button-container").hide(); // Oculta todos los botones
        $("#button-container" + userNumber).show(); // Muestra solo el botón del usuario

        var ledStatusRef = database.ref('users/' + currentUser + '/Led' + userNumber + 'Status');
        var temperatureRef = database.ref('users/' + currentUser + '/Temperature' + userNumber);

        ledStatusRef.on('value', function(snapshot) {
            var status = snapshot.val();
            updateButton($("#toggle" + userNumber), status);
        });

        temperatureRef.on('value', function(snapshot) {
            var temperature = snapshot.val();
            $("#temperature").text(temperature + ' °C');
        });

        $("#toggle" + userNumber).click(function(){
            ledStatusRef.once('value').then(function(snapshot) {
                var currentStatus = snapshot.val();
                var newStatus = currentStatus === "1" ? "0" : "1";
                ledStatusRef.set(newStatus);
                updateButton($("#toggle" + userNumber), newStatus);
            });
        });
    }

    function updateButton(button, status) {
        if (status == "1") {
            button.text("Turn off LED");
            button.removeClass("off").addClass("on");
        } else {
            button.text("Turn on LED");
            button.removeClass("on").addClass("off");
        }
    }

    hideControlPanel();
});
