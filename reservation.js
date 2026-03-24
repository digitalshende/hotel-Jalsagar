// 🔥 Your Firebase Configuration (Replace with your own)
const firebaseConfig = {
       apiKey: "AIzaSyDwHlMKLkukQ_fpubU98rEMxYmfPoRZ0kI",
  authDomain: "hotel-jalsagar.firebaseapp.com",
  projectId: "hotel-jalsagar",
  storageBucket: "hotel-jalsagar.firebasestorage.app",
  messagingSenderId: "873304480297",
  appId: "1:873304480297:web:1137c0b2c01fe1a7c71a38",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Initialize EmailJS (Replace with your Public Key)
(function () {
    emailjs.init("YOUR_PUBLIC_KEY");
})();

// Form Submit
document.getElementById("reservationForm").addEventListener("submit", function (e) {
    e.preventDefault();

    let name = document.getElementById("name").value;
    let email = document.getElementById("email").value;
    let phone = document.getElementById("phone").value;
    let date = document.getElementById("date").value;
    let time = document.getElementById("time").value;
    let guests = document.getElementById("guests").value;
    let message = document.getElementById("message").value;

    let newReservation = database.ref("reservations").push();

    newReservation.set({
        name: name,
        email: email,
        phone: phone,
        date: date,
        time: time,
        guests: guests,
        message: message
    }).then(function () {

        document.getElementById("responseMessage").innerText =
            "✅ Table Reserved Successfully!";

        document.getElementById("reservationForm").reset();

    }).catch(function (error) {

        document.getElementById("responseMessage").innerText =
            "❌ Error saving data!";
    });

    // Optional EmailJS
    emailjs.send("YOUR_SERVICE_ID", "YOUR_TEMPLATE_ID", {
        name: name,
        email: email,
        phone: phone,
        date: date,
        time: time,
        guests: guests,
        message: message
    });
});