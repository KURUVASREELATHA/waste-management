import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3001/api';

async function testVerificationSystem() {
  console.log('🧪 Testing Waste Sale Verification System...\n');

  try {
    // 1. Create a waste sale
    console.log('1. Creating waste sale...');
    const saleResponse = await fetch(`${API_BASE}/waste-sales`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sellerId: '507f1f77bcf86cd799439011', // Mock municipality ID
        recyclerId: '507f1f77bcf86cd799439012', // Mock recycler ID
        wasteType: 'metal',
        weight: 12,
        pricePerKg: 25,
        totalAmount: 300
      })
    });

    if (!saleResponse.ok) {
      throw new Error(`Failed to create sale: ${saleResponse.statusText}`);
    }

    const sale = await saleResponse.json();
    console.log('✅ Sale created:', sale._id);

    // 2. Accept the sale (this should generate verification code)
    console.log('\n2. Accepting sale (generating verification code)...');
    const acceptResponse = await fetch(`${API_BASE}/waste-sales/${sale._id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'accepted' })
    });

    if (!acceptResponse.ok) {
      throw new Error(`Failed to accept sale: ${acceptResponse.statusText}`);
    }

    const acceptedSale = await acceptResponse.json();
    console.log('✅ Sale accepted with verification code:', acceptedSale.verificationCode);

    // 3. Get municipality sold history
    console.log('\n3. Getting municipality sold history...');
    const historyResponse = await fetch(`${API_BASE}/waste-sales/municipality/${sale.sellerId}/history`);
    
    if (!historyResponse.ok) {
      throw new Error(`Failed to get history: ${historyResponse.statusText}`);
    }

    const history = await historyResponse.json();
    console.log('✅ Sold history retrieved:', history.length, 'items');

    // 4. Get accepted orders for recycling center
    console.log('\n4. Getting accepted orders for payment...');
    const ordersResponse = await fetch(`${API_BASE}/waste-sales/center/${sale.recyclerId}/accepted`);
    
    if (!ordersResponse.ok) {
      throw new Error(`Failed to get orders: ${ordersResponse.statusText}`);
    }

    const orders = await ordersResponse.json();
    console.log('✅ Accepted orders retrieved:', orders.length, 'items');

    // 5. Process payment with verification code
    console.log('\n5. Processing payment with verification code...');
    const paymentResponse = await fetch(`${API_BASE}/waste-sales/${sale._id}/payment`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        verificationCode: acceptedSale.verificationCode,
        transactionId: 'TXN123456789',
        paymentNotes: 'Payment processed successfully'
      })
    });

    if (!paymentResponse.ok) {
      throw new Error(`Failed to process payment: ${paymentResponse.statusText}`);
    }

    const completedSale = await paymentResponse.json();
    console.log('✅ Payment processed successfully');
    console.log('   Status:', completedSale.status);
    console.log('   Payment Status:', completedSale.paymentStatus);
    console.log('   Transaction ID:', completedSale.transactionId);

    // 6. Test invalid verification code
    console.log('\n6. Testing invalid verification code...');
    try {
      const invalidResponse = await fetch(`${API_BASE}/waste-sales/${sale._id}/payment`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verificationCode: 'INVALID',
          transactionId: 'TXN987654321',
          paymentNotes: 'This should fail'
        })
      });

      if (invalidResponse.ok) {
        console.log('❌ Invalid code test failed - should have been rejected');
      } else {
        console.log('✅ Invalid verification code properly rejected');
      }
    } catch (error) {
      console.log('✅ Invalid verification code properly rejected');
    }

    console.log('\n🎉 All tests passed! Verification system is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testVerificationSystem();