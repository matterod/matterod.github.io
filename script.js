
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

	database.ref().on("value", function(snap){
		Led1Status = snap.val().Led1Status;
		if(Led1Status == "1"){    // check from the firebase
			//$(".Light1Status").text("The light is off");
			document.getElementById("unact").style.display = "none";
			document.getElementById("act").style.display = "block";
		} else {
			//$(".Light1Status").text("The light is on");
			document.getElementById("unact").style.display = "block";
			document.getElementById("act").style.display = "none";
		}
	});

    $(".toggle-btn").click(function(){
		var firebaseRef = firebase.database().ref().child("Led1Status");

		if(Led1Status == "1"){    // post to firebase
			firebaseRef.set("0");
			Led1Status = "0";
		} else {
			firebaseRef.set("1");
			Led1Status = "1";
		}
	})
});