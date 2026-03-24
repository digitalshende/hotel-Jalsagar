// ==================== CONFIGURATION ====================
const firebaseConfig = {
   apiKey: "AIzaSyC1Td2zrBIRb5JvdaNKwoK_6aTHVUqP2rA",
    authDomain: "sample2026-db0f9.firebaseapp.com",
    databaseURL: "https://sample2026-db0f9-default-rtdb.firebaseio.com",
    projectId: "sample2026-db0f9",
    storageBucket: "sample2026-db0f9.firebasestorage.app",
    messagingSenderId: "591014040082",
    appId: "1:591014040082:web:00baaac378af50bb4e7ecb"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const functions = firebase.functions();

// Initialize Stripe (publishable key - safe to expose)
const stripe = Stripe('YOUR_STRIPE_PUBLISHABLE_KEY');
0
// Initialize EmailJS
emailjs.init("YOUR_EMAILJS_PUBLIC_KEY");

// ==================== STATE MANAGEMENT ====================
let orderData = {};
let paymentIntent = null;
let cardElement = null;
let stripeElements = null;

// ==================== DOM ELEMENTS ====================
const orderForm = document.getElementById('orderForm');
const paymentSection = document.getElementById('paymentSection');
const successSection = document.getElementById('successSection');
const continueBtn = document.getElementById('continueToPayment');
const backBtn = document.getElementById('backToOrder');
const submitPaymentBtn = document.getElementById('submitPayment');
const cardElementDiv = document.getElementById('cardElement');
const cardErrors = document.getElementById('cardErrors');
const paymentSummary = document.getElementById('paymentSummary');
const orderIdSpan = document.getElementById('orderId');
const messageDiv = document.getElementById('message');

// ==================== EVENT HANDLERS ====================

// Continue to payment
continueBtn.addEventListener('click', async () => {
    // Validate order form
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const product = document.getElementById('product').value.trim();
    const quantity = document.getElementById('quantity').value;
    const amount = document.getElementById('amount').value;

    if (!name || !email || !product || !quantity || !amount) {
        showMessage('Please fill in all fields.', 'error');
        return;
    }

    if (amount <= 0) {
        showMessage('Please enter a valid amount.', 'error');
        return;
    }

    // Store order data
    orderData = {
        name, email, product, quantity, amount: parseFloat(amount)
    };

    // Show payment summary
    paymentSummary.innerHTML = `
        <p><strong>${product}</strong>   ${quantity}</p>
        <p>Total: $${amount}</p>
        <p>Customer: ${name}</p>
    `;

    // Initialize Stripe Elements if not already done
    if (!stripeElements) {
        stripeElements = stripe.elements();
        cardElement = stripeElements.create('card', {
            style: {
                base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': { color: '#aab7c4' }
                }
            }
        });
        cardElement.mount('#cardElement');
        
        // Validate card input as user types
        cardElement.on('change', ({error}) => {
            cardErrors.textContent = error ? error.message : '';
        });
    }

    // Switch to payment section
    orderForm.style.display = 'none';
    paymentSection.style.display = 'block';
    updateProgress(2);
});

// Back to order form
backBtn.addEventListener('click', () => {
    paymentSection.style.display = 'none';
    orderForm.style.display = 'block';
    updateProgress(1);
});

// Process payment
submitPaymentBtn.addEventListener('click', async () => {
    submitPaymentBtn.disabled = true;
    submitPaymentBtn.innerHTML = '<span class="spinner"></span> Processing...';

    try {
        // 1. Create payment intent via Firebase Cloud Function
        const createPaymentIntent = functions.httpsCallable('createPaymentIntent');
        const result = await createPaymentIntent({
            amount: orderData.amount,
            currency: 'usd',
            orderData: orderData
        });

        paymentIntent = result.data;
        
        // 2. Confirm the payment with Stripe
        const {error, paymentIntent: confirmedIntent} = await stripe.confirmCardPayment(
            paymentIntent.clientSecret,
            {
                payment_method: {
                    card: cardElement,
                    billing_details: {
                        name: orderData.name,
                        email: orderData.email
                    }
                }
            }
        );

        if (error) {
            throw new Error(error.message);
        }

        // 3. Payment successful - save additional data to Firebase
        await database.ref('orders').child(paymentIntent.orderId).update({
            paymentConfirmed: true,
            paymentMethod: 'card',
            updatedAt: firebase.database.ServerValue.TIMESTAMP
        });

        // 4. Send confirmation email via EmailJS
        await emailjs.send(
            'YOUR_SERVICE_ID',
            'YOUR_TEMPLATE_ID',
            {
                from_name: orderData.name,
                from_email: orderData.email,
                product_name: orderData.product,
                quantity: orderData.quantity,
                amount: orderData.amount,
                order_id: paymentIntent.orderId,
                reply_to: orderData.email
            }
        );

        // 5. Show success message
        orderIdSpan.textContent = paymentIntent.orderId;
        paymentSection.style.display = 'none';
        successSection.style.display = 'block';
        updateProgress(3);
        
        showMessage('Payment successful! Check your email for confirmation.', 'success');

    } catch (error) {
        console.error('Payment error:', error);
        showMessage(`Payment failed: ${error.message}`, 'error');
        
        // Update payment status in Firebase
        if (paymentIntent?.orderId) {
            await database.ref('orders').child(paymentIntent.orderId).update({
                paymentStatus: 'failed',
                errorMessage: error.message
            });
        }
    } finally {
        submitPaymentBtn.disabled = false;
        submitPaymentBtn.textContent = 'Pay Now';
    }
});

// New order button
document.getElementById('newOrder').addEventListener('click', () => {
    // Reset form
    orderForm.reset();
    paymentSection.style.display = 'none';
    successSection.style.display = 'none';
    orderForm.style.display = 'block';
    updateProgress(1);
    
    // Clear Stripe Elements
    if (cardElement) {
        cardElement.clear();
    }
});

// ==================== HELPER FUNCTIONS ====================

function updateProgress(step) {
    const steps = document.querySelectorAll('.step');
    steps.forEach((s, index) => {
        if (index + 1 === step) {
            s.classList.add('active');
        } else {
            s.classList.remove('active');
        }
    });
}

function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = type;
    setTimeout(() => {
        messageDiv.textContent = '';
        messageDiv.className = '';
    }, 5000);
}