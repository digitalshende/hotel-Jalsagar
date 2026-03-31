// ==================== FIREBASE CONFIG ====================
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

// ==================== EMAILJS INIT ====================
emailjs.init("ZHkLZYsP6CYq8CI2S"); // Your Public Key

// ==================== FORM SUBMISSION ====================
document.getElementById('orderForm').addEventListener('submit', function(e) {
    e.preventDefault();

    // Get form values
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const product = document.getElementById('product').value.trim();
    const quantity = document.getElementById('quantity').value;

    // Basic validation
    if (!name || !email || !product || !quantity) {
        showMessage('Please fill in all fields.', 'error');
        return;
    }

    // Disable button to prevent double submission
    const submitBtn = document.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Processing...';

    // Prepare order object for Firebase
    const orderData = {
        name: name,
        email: email,
        product: product,
        quantity: quantity,
        timestamp: new Date().toISOString()
    };

    // Save to Firebase Realtime Database under 'orders'
    const ordersRef = database.ref('orders');
    ordersRef.push(orderData)
        .then((firebaseResult) => {
            console.log('? Firebase write successful', firebaseResult);
            // After Firebase success, send email via EmailJS
            return emailjs.send(
                'service_7lutdrk',      // Your EmailJS Service ID
                'template_tea067n',      // Your EmailJS Template ID
                {
                    from_name: name,
                    from_email: email,
                    product_name: product,
                    quantity: quantity,
                    reply_to: email
                }
            );
        })
        .then((emailResult) => {
            console.log('? Email sent successfully', emailResult);
            showMessage('Order placed successfully! Check your email for confirmation.', 'success');
            document.getElementById('orderForm').reset();
        })
        .catch((error) => {
            // This will catch errors from either Firebase or EmailJS
            console.error('? Error in process:', error);
            showMessage('Something went wrong. Please try again. Check console for details.', 'error');
        })
        .finally(() => {
            // Re-enable the submit button
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit Order';
        });
});

// Helper function to display messages
function showMessage(text, type) {
    const msgDiv = document.getElementById('message');
    msgDiv.textContent = text;
    msgDiv.className = type; // 'success' or 'error'
    setTimeout(() => {
        msgDiv.textContent = '';
        msgDiv.className = '';
    }, 5000);
}