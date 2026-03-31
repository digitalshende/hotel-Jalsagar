var config = {
  apiKey: "AIzaSyDwHlMKLkukQ_fpubU98rEMxYmfPoRZ0kI",
  authDomain: "hotel-jalsagar.firebaseapp.com",
  databaseURL: "https://hotel-jalsagar-default-rtdb.firebaseio.com",
  projectId: "hotel-jalsagar",
  storageBucket: "hotel-jalsagar.firebasestorage.app",
  messagingSenderId: "873304480297"
};

firebase.initializeApp(config);

var messagesRef = firebase.database().ref('messages');

document.getElementById('contactForm').addEventListener('submit', submitForm);

function submitForm(e){
  e.preventDefault();

  var name = getInputVal('name');
  var email = getInputVal('email');
  var phone = getInputVal('phone');
  var message = getInputVal('message');

  saveMessage(name, email, phone, message);

  document.querySelector('.alert').style.display = 'block';

  setTimeout(function(){
    document.querySelector('.alert').style.display = 'none';
  },3000);

  document.getElementById('contactForm').reset();
}

function getInputVal(id){
  return document.getElementById(id).value;
}

function saveMessage(name, email, phone, message){
  var newMessageRef = messagesRef.push();
  newMessageRef.set({
    name: name,
    email: email,
    phone: phone,
    message: message
  });
}