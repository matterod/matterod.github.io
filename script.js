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
    var Led1Status;
    var Led2Status;
    var Led3Status;
    var currentUser = null;
    var userNumber = null;
    var temperatureData = [];
    var chart = null;

    function updateButton(button, status) {
        if (status == "1") {
            button.text("Turn off " + button.attr('id'));
            button.removeClass("off").addClass("on");
        } else {
            button.text("Turn on " + button.attr('id'));
            button.removeClass("on").addClass("off");
        }
    }

    function showControlPanel() {
        $("#login-container").hide();
        $("#control-container").show();
    }

    function hideControlPanel() {
        $("#login-container").show();
        $("#control-container").hide();
        $(".button-container").hide();
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
        if (chart) chart.destroy();
        temperatureData = [];
    });

    function loadUserData() {
        $(".button-container").hide();
        $("#button-container" + userNumber).show();

        var ledStatusRef1 = database.ref('users/' + currentUser + '/Led1Status');
        var ledStatusRef2 = database.ref('users/' + currentUser + '/Led2Status');
        var ledStatusRef3 = database.ref('users/' + currentUser + '/Led3Status');
        var temperatureRef = database.ref('users/' + currentUser + '/Temperature');

        ledStatusRef1.on('value', function(snapshot) {
            var status = snapshot.val();
            Led1Status = status;
            updateButton($("#toggle1"), status);
        });

        ledStatusRef2.on('value', function(snapshot) {
            var status = snapshot.val();
            Led2Status = status;
            updateButton($("#toggle2"), status);
        });

        ledStatusRef3.on('value', function(snapshot) {
            var status = snapshot.val();
            Led3Status = status;
            updateButton($("#toggle3"), status);
        });

        temperatureRef.on('value', function(snapshot) {
            var temperature = snapshot.val();
            $("#temperature").text(temperature + ' °C');
            updateChart(temperature);
        });

        $("#toggle1").click(function(){
            ledStatusRef1.once('value').then(function(snapshot) {
                var currentStatus = snapshot.val();
                var newStatus = currentStatus === "1" ? "0" : "1";
                ledStatusRef1.set(newStatus);
                updateButton($("#toggle1"), newStatus);
            });
        });

        $("#toggle2").click(function(){
            ledStatusRef2.once('value').then(function(snapshot) {
                var currentStatus = snapshot.val();
                var newStatus = currentStatus === "1" ? "0" : "1";
                ledStatusRef2.set(newStatus);
                updateButton($("#toggle2"), newStatus);
            });
        });

        $("#toggle3").click(function(){
            ledStatusRef3.once('value').then(function(snapshot) {
                var currentStatus = snapshot.val();
                var newStatus = currentStatus === "1" ? "0" : "1";
                ledStatusRef3.set(newStatus);
                updateButton($("#toggle3"), newStatus);
            });
        });

        createChart();
    }

    function createChart() {
        var ctx = document.getElementById('temperatureChart').getContext('2d');
        chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Temperatura',
                    data: temperatureData,
                    borderColor: '#21ecf3',
                    backgroundColor: 'rgba(33, 236, 243, 0.2)',
                    pointBackgroundColor: '#21ecf3',
                    pointBorderColor: '#21ecf3',
                    fill: true,
                    tension: 0.1
                }]
            },
            options: {
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'minute'
                        },
                        title: {
                            display: true,
                            text: 'Tiempo'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Temperatura (°C)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        labels: {
                            color: '#ffffff'
                        }
                    }
                }
            }
        });
    }

    function updateChart(temperature) {
        var now = new Date();
        temperatureData.push({x: now, y: temperature});
        if (temperatureData.length > 20) {
            temperatureData.shift();
        }
        chart.data.labels.push(now);
        if (chart.data.labels.length > 20) {
            chart.data.labels.shift();
        }
        chart.update();
    }

    hideControlPanel();
});
