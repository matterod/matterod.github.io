var firebaseConfig = {
    apiKey: "tu_api_key",
    authDomain: "tu_auth_domain",
    databaseURL: "tu_database_url",
    projectId: "tu_project_id",
    storageBucket: "tu_storage_bucket",
    messagingSenderId: "tu_messaging_sender_id",
    appId: "tu_app_id",
    measurementId: "tu_measurement_id"
};

firebase.initializeApp(firebaseConfig);

$(document).ready(function(){
    var database = firebase.database();
    var currentUser = null;
    var userNumber = null;
    var temperatureRef = null;
    var ledStatusRef = null;
    var temperatureData = []; // Array para almacenar los datos de temperatura para el gráfico
    var chart = null; // Variable para almacenar la instancia del gráfico

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
        if (chart) chart.destroy(); // Destruye el gráfico al cerrar sesión
        temperatureData = []; // Limpia los datos del gráfico
        chart = null; // Restablece la instancia del gráfico
    });

    function loadUserData() {
        // Mostrar solo el botón correspondiente al usuario
        $(".button-container").hide(); // Oculta todos los botones
        $("#button-container" + userNumber).show(); // Muestra solo el botón del usuario

        ledStatusRef = database.ref('users/' + currentUser + '/Led' + userNumber + 'Status');
        temperatureRef = database.ref('users/' + currentUser + '/Temperature' + userNumber);

        ledStatusRef.on('value', function(snapshot) {
            var status = snapshot.val();
            updateButton($("#toggle" + userNumber), status);
        });

        temperatureRef.on('value', function(snapshot) {
            var temperature = snapshot.val();
            $("#temperature").text(temperature + ' °C');
            updateChart(temperature); // Actualiza el gráfico con la nueva temperatura
        });

        $("#toggle" + userNumber).click(function(){
            ledStatusRef.once('value').then(function(snapshot) {
                var currentStatus = snapshot.val();
                var newStatus = currentStatus === "1" ? "0" : "1";
                ledStatusRef.set(newStatus);
                updateButton($("#toggle" + userNumber), newStatus);
            });
        });

        createChart(); // Crea el gráfico al cargar los datos del usuario
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
                    tension: 0.1
                }]
            },
            options: {
                scales: {
                    x: {
                        type: 'realtime',
                        realtime: {
                            duration: 600000, // Duración en milisegundos para mantener los datos (10 minutos)
                            refresh: 1000, // Frecuencia de actualización en milisegundos (1 segundo)
                            delay: 2000, // Retraso inicial en milisegundos (2 segundos)
                            onRefresh: function(chart) {
                                // Actualiza el gráfico con los nuevos datos
                                chart.data.datasets.forEach(function(dataset) {
                                    dataset.data.push({
                                        x: Date.now(),
                                        y: temperatureData.length > 0 ? temperatureData[temperatureData.length - 1].y : null
                                    });
                                });
                            }
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
        var now = Date.now();
        temperatureData.push({ x: now, y: parseFloat(temperature) });
        if (temperatureData.length > 20) {
            temperatureData.shift();
        }
        if (chart) {
            chart.update(); // Actualiza el gráfico cuando se agregan nuevos datos
        }
    }

    hideControlPanel(); // Oculta los botones al cargar la página
});
