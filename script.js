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
    var temperatureRef = null;
    var ledStatusRef = null;
    var temperatureData = [];
    var chart = null;

    function showControlPanel() {
        $("#login-container").hide();
        $("#control-container").show();
    }

    function hideControlPanel() {
        $("#login-container").show();
        $("#control-container").hide();
        $(".button-container").hide(); // Oculta todos los botones por defecto
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
                createChart(); // Asegúrate de crear el gráfico antes de cargar los datos
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
        if (temperatureRef) temperatureRef.off();
        if (ledStatusRef) ledStatusRef.off();
        if (chart) chart.destroy();
        temperatureData = [];
        chart = null; // Asegúrate de restablecer el gráfico
    });

    function loadUserData() {
        $(".button-container").hide();
        $("#button-container" + userNumber).show();
    
        ledStatusRef = database.ref('users/' + currentUser + '/Led' + userNumber + 'Status');
        temperatureRef = database.ref('users/' + currentUser + '/TemperatureReadings');
    
        ledStatusRef.on('value', function(snapshot) {
            var status = snapshot.val();
            updateButton($("#toggle" + userNumber), status);
        });
    
        temperatureRef.on('value', function(snapshot) {
            var readings = snapshot.val();
            temperatureData = [];
            var latestTemperature = null;
            for (var timestamp in readings) {
                var temperature = readings[timestamp];
                temperatureData.push({ x: new Date(parseInt(timestamp)), y: temperature });
                latestTemperature = temperature; // Actualiza la temperatura más reciente
            }
            if (latestTemperature !== null) {
                $("#temperature").text(latestTemperature + " °C"); // Muestra la temperatura más reciente
            }
            if (chart) {
                chart.data.datasets[0].data = temperatureData;
                chart.update();
            }
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

    function createChart() {
        var ctx = document.getElementById('temperatureChart').getContext('2d');
        chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [], // Las etiquetas se actualizarán en tiempo real
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
        temperatureData.push({ x: now, y: temperature });
        if (temperatureData.length > 20) {
            temperatureData.shift();
        }
        chart.data.labels.push(now);
        if (chart.data.labels.length > 20) {
            chart.data.labels.shift();
        }
        chart.update();
    }

    hideControlPanel(); // Oculta los botones al cargar la página
});
