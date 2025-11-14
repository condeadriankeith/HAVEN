const axios = require('axios');

// Test script to verify route calculation functionality

async function testRouteCalculation() {
  console.log('Testing route calculation...\n');
  
  try {
    // Test coordinates (from vet hub to a point in Bacolod City)
    const testData = {
      startLat: 10.6722,
      startLng: 122.9443,
      endLat: 10.6765,
      endLng: 122.9509
    };
    
    console.log('Sending route calculation request...');
    console.log('Start point (Vet Hub):', testData.startLat, testData.startLng);
    console.log('End point:', testData.endLat, testData.endLng);
    
    // Make request to the new route endpoint
    const response = await axios.post('http://localhost:3000/api/v1/routes/shortest-path', testData);
    
    console.log('\nResponse status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
    if (response.data.success && response.data.route) {
      console.log('\n✓ Route calculation successful!');
      console.log('Route polyline length:', response.data.route.length);
      console.log('Distance (km):', response.data.distance);
      console.log('Duration (seconds):', response.data.duration);
    } else {
      console.log('\n✗ Route calculation failed');
      console.log('Error:', response.data.error);
    }
  } catch (error) {
    console.error('Error testing route calculation:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Run the test
testRouteCalculation();