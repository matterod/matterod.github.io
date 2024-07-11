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

    database.ref().on("value", function(snap){
        Led1Status = snap.val().Led1Status;
        Led2Status = snap.val().Led2Status;

        if(Led1Status == "1"){    // check from the firebase
            document.getElementById("unact1").style.display = "none";
            document.getElementById("act1").style.display = "block";
        } else {
            document.getElementById("unact1").style.display = "block";
            document.getElementById("act1").style.display = "none";
        }

        if(Led2Status == "1"){    // check from the firebase
            document.getElementById("unact2").style.display = "none";
            document.getElementById("act2").style.display = "block";
        } else {
            document.getElementById("unact2").style.display = "block";
            document.getElementById("act2").style.display = "none";
        }
    });

    $(".toggle-btn1").click(function(){
        var firebaseRef = firebase.database().ref().child("Led1Status");

        if(Led1Status == "1"){    // post to firebase
            firebaseRef.set("0");
            Led1Status = "0";
        } else {
            firebaseRef.set("1");
            Led1Status = "1";
        }
    });

    $(".toggle-btn2").click(function(){
        var firebaseRef = firebase.database().ref().child("Led2Status");

        if(Led2Status == "1"){    // post to firebase
            firebaseRef.set("0");
            Led2Status = "0";
        } else {
            firebaseRef.set("1");
            Led2Status = "1";
        }
    });
});
