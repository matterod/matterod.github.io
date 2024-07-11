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

    database.ref().on("value", function(snap){
        Led1Status = snap.val().Led1Status;
        Led2Status = snap.val().Led2Status;
        Led3Status = snap.val().Led3Status;

        updateButton($("#toggle1"), Led1Status);
        updateButton($("#toggle2"), Led2Status);
        updateButton($("#toggle3"), Led3Status);
    });

    $("#toggle1").click(function(){
        var firebaseRef = firebase.database().ref().child("Led1Status");

        if (Led1Status == "1") {
            firebaseRef.set("0");
            Led1Status = "0";
        } else {
            firebaseRef.set("1");
            Led1Status = "1";
        }
        updateButton($(this), Led1Status);
    });

    $("#toggle2").click(function(){
        var firebaseRef = firebase.database().ref().child("Led2Status");

        if (Led2Status == "1") {
            firebaseRef.set("0");
            Led2Status = "0";
        } else {
            firebaseRef.set("1");
            Led2Status = "1";
        }
        updateButton($(this), Led2Status);
    });

    $("#toggle3").click(function(){
        var firebaseRef = firebase.database().ref().child("Led3Status");

        if (Led3Status == "1") {
            firebaseRef.set("0");
            Led3Status = "0";
        } else {
            firebaseRef.set("1");
            Led3Status = "1";
        }
        updateButton($(this), Led3Status);
    });

    // Inicializar gráfico de temperatura
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

    // Actualizar gráfico de temperatura
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

    // Leer temperatura de Firebase y actualizar la página
    var temperatureRef = database.ref('Temperature');
    temperatureRef.on('value', function(snapshot) {
        var temperature = snapshot.val();
        $("#temperature").text(temperature + ' °C');
        updateChart(temperature);
    });

    // Crear gráfico al cargar la página
    createChart();
});
