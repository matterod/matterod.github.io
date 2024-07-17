var firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT_ID.firebaseio.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID",
    measurementId: "YOUR_MEASUREMENT_ID"
};

firebase.initializeApp(firebaseConfig);

$(document).ready(function(){
    var database = firebase.database();
    var currentUser = null;
    var temperatureRef = null;
    var ledStatusRef = null;
    var temperatureData = [];
    var chart = null;

    function showControlPanel() {
        $("#login-container").hide();
        $("#control-container").show();
        updateTime();
    }

    function hideControlPanel() {
        $("#login-container").show();
        $("#control-container").hide();
        $(".button-container").hide(); // Oculta todos los botones por defecto
    }

    $("#login-button").click(function(){
        var provider = new firebase.auth.GoogleAuthProvider();
        firebase.auth().signInWithPopup(provider)
            .then((result) => {
                currentUser = result.user;
                var uid = currentUser.uid; // Obtener el UID del usuario autenticado
                console.log("Usuario autenticado con UID:", uid);
                
                showControlPanel();
                createChart(); // Asegúrate de crear el gráfico antes de cargar los datos
                loadUserData(uid); // Pasar el UID para cargar datos específicos del usuario
            })
            .catch((error) => {
                $("#login-error").text("Login failed: " + error.message);
                console.error('Error:', error);
            });
    });

    $("#logout-button").click(function(){
        firebase.auth().signOut().then(() => {
            currentUser = null;
            hideControlPanel();
            if (temperatureRef) temperatureRef.off();
            if (ledStatusRef) ledStatusRef.off();
            if (chart) chart.destroy();
            temperatureData = [];
            chart = null; // Asegúrate de restablecer el gráfico
        });
    });

    function loadUserData(uid) {
        $(".button-container").hide(); // Ocultar los contenedores de botones por defecto

        // Referencias a la base de datos de Firebase
        ledStatusRef = database.ref('users/' + uid + '/LedStatus');
        temperatureRef = database.ref('users/' + uid + '/TemperatureReadings');

        ledStatusRef.on('value', function(snapshot) {
            var status = snapshot.val();
            updateButton($("#toggle1"), status); // Actualizar el botón con el estado del LED
            $("#button-container1").show(); // Mostrar el contenedor del botón
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

        $("#toggle1").click(function(){
            ledStatusRef.once('value').then(function(snapshot) {
                var currentStatus = snapshot.val();
                var newStatus = currentStatus === "1" ? "0" : "1";
                ledStatusRef.set(newStatus);
                updateButton($("#toggle1"), newStatus);
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
                datasets: [{
                    label: 'Temperatura',
                    data: temperatureData,
                    borderColor: '#21ecf3',
                    backgroundColor: 'rgba(33, 236, 243, 0.2)',
                    pointBackgroundColor: '#21ecf3',
                    pointBorderColor: '#21ecf3',
                    fill: true,
                    tension: 0.4
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
                    },
                    zoom: {
                        pan: {
                            enabled: true,
                            mode: 'x',
                        },
                        zoom: {
                            wheel: {
                                enabled: true,
                            },
                            pinch: {
                                enabled: true
                            },
                            mode: 'x',
                        }
                    }
                }
            }
        });
    }

    function updateChart(temperature) {
        var now = new Date();
        temperatureData.push({ x: now, y: temperature });
        if (temperatureData.length > 336) {
            temperatureData.shift();
        }
        chart.update();
    }

    function updateTime() {
        setInterval(() => {
            const now = new Date();
            const options = { weekday: 'long', hour: '2-digit', minute: '2-digit' };
            $("#time").text(now.toLocaleDateString('es-ES', options));
        }, 1000);
    }

    hideControlPanel(); // Oculta los botones al cargar la página
});
