var firebaseConfig = {
    apiKey: "AIzaSyANGLfDfRnsIfN3k-COWI22Y0bi8emK4Os",  // Reemplaza con tu clave API
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
    var temperatureRef = null;
    var ledStatusRef = null;
    var temperatureData = [];

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
            temperatureData = [];
            Plotly.purge('temperature-graph');
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
            temperatureData = [];
            var latestTemperature = null;
            snapshot.forEach(function(childSnapshot) {
                var reading = childSnapshot.val();
                var timestamp = childSnapshot.key;
                temperatureData.push({ x: new Date(parseInt(timestamp)), y: reading });
                latestTemperature = reading; // Actualiza la temperatura más reciente
            });
            if (latestTemperature !== null) {
                $("#temperature").text(latestTemperature + " °C"); // Muestra la temperatura más reciente
            }
            Plotly.react('temperature-graph', [getTemperatureTrace(temperatureData)], getLayout());
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
        Plotly.newPlot('temperature-graph', [getTemperatureTrace([])], getLayout());
    }

    function getTemperatureTrace(data) {
        return {
            x: data.map(d => d.x),
            y: data.map(d => d.y),
            type: 'scatter',
            mode: 'lines',
            name: 'Temperatura',
            line: { color: '#21ecf3' }
        };
    }

    function getLayout() {
        return {
            title: 'Temperatura Actual',
            xaxis: {
                title: 'Tiempo',
                rangeselector: {
                    buttons: [
                        { count: 1, label: '1h', step: 'hour', stepmode: 'backward' },
                        { count: 6, label: '6h', step: 'hour', stepmode: 'backward' },
                        { count: 1, label: '1d', step: 'day', stepmode: 'backward' },
                        { count: 7, label: '1w', step: 'day', stepmode: 'backward' },
                        { step: 'all' }
                    ]
                },
                rangeslider: { visible: true },
                type: 'date'
            },
            yaxis: {
                title: 'Temperatura (°C)'
            }
        };
    }

    hideControlPanel(); // Oculta los botones al cargar la página
});
