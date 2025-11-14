const WebSocket = require('ws');
const axios = require('axios');

// Test script to simulate complete flow: mobile alert -> route calculation -> map display

// Function to decode Google Maps encoded polyline
function decodePolyline(encoded) {
  try {
    if (!encoded) {
      console.warn('Empty encoded polyline');
      return [];
    }
    
    let index = 0;
    let lat = 0;
    let lng = 0;
    const coordinates = [];
    
    while (index < encoded.length) {
      // Decode latitude
      let shift = 0;
      let result = 0;
      let byte;
      
      do {
        byte = encoded.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);
      
      const dlat = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
      lat += dlat;
      
      // Decode longitude
      shift = 0;
      result = 0;
      
      do {
        byte = encoded.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);
      
      const dlng = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
      lng += dlng;
      
      // Convert from E5 format (1e-5) to decimal degrees
      const latitude = lat * 1e-5;
      const longitude = lng * 1e-5;
      
      coordinates.push([latitude, longitude]);
    }
    
    return coordinates;
  } catch (error) {
    console.error('Error decoding polyline:', error);
    return [];
  }
}

async function testCompleteRouteFlow() {
  console.log('Testing complete route flow...\n');
  
  // Connect to WebSocket server
  const ws = new WebSocket('ws://localhost:3000');
  
  ws.on('open', async function open() {
    console.log('Connected to WebSocket server');
    
    // Subscribe to emergency alerts (simulating mobile app behavior)
    ws.send(JSON.stringify({
      type: 'subscribe-emergency-alerts'
    }));
    
    // Simulate sending an emergency alert from mobile app
    console.log('Sending emergency alert from mobile app...');
    
    // This simulates the structure sent by the mobile app
    const mobileEmergencyData = {
      userId: 'USR-0001',
      contactInfo: {
        name: 'Mobile User',
        phone: '+1234567890',
        email: 'mobile@example.com'
      },
      location: {
        latitude: 10.6765,
        longitude: 122.9509,
        accuracy: 5,
        altitude: 10,
        heading: 90,
        speed: 0,
        address: 'Bacolod City, Philippines'
      },
      emergencyType: "Pet Health Emergency",
      timestamp: new Date().toISOString(),
      additionalDetails: "Pet needs immediate veterinary attention"
    };
    
    // Send the emergency alert in the format expected by the mobile app
    ws.send(JSON.stringify({
      type: 'new-emergency-alert',
      emergency: mobileEmergencyData
    }));
    
    console.log('Emergency alert sent from mobile app');
  });
  
  ws.on('message', async function incoming(data) {
    const message = JSON.parse(data);
    console.log('Received WebSocket message:', message.type);
    
    if (message.type === 'subscription-ack') {
      console.log('✓ Mobile app subscribed to emergency alerts');
    } else if (message.type === 'new-emergency-alert') {
      console.log('✓ Emergency alert broadcast received');
      console.log('Emergency ID:', message.emergency.emergencyId);
      console.log('Emergency Type:', message.emergency.emergencyType);
      console.log('Status:', message.emergency.status);
      
      // Now test the route calculation for this emergency
      try {
        const emergency = message.emergency;
        
        // Test coordinates (from vet hub to emergency location)
        const testData = {
          startLat: 10.6722,  // Vet hub
          startLng: 122.9443, // Vet hub
          endLat: emergency.location.latitude,
          endLng: emergency.location.longitude
        };
        
        console.log('\nCalculating route for emergency...');
        console.log('Start point (Vet Hub):', testData.startLat, testData.startLng);
        console.log('End point (Emergency):', testData.endLat, testData.endLng);
        
        // Make request to the new route endpoint
        const response = await axios.post('http://localhost:3000/api/v1/routes/shortest-path', testData);
        
        console.log('\nRoute calculation response status:', response.status);
        
        if (response.data.success && response.data.route) {
          console.log('✓ Route calculation successful!');
          console.log('Route polyline length:', response.data.route.length);
          console.log('Distance (km):', response.data.distance);
          console.log('Duration (seconds):', response.data.duration);
          
          // Test decoding the polyline
          const decodedCoordinates = decodePolyline(response.data.route);
          console.log('Decoded coordinates count:', decodedCoordinates.length);
          
          if (decodedCoordinates.length > 0) {
            console.log('✓ Polyline decoding successful!');
            console.log('First coordinate:', decodedCoordinates[0]);
            console.log('Last coordinate:', decodedCoordinates[decodedCoordinates.length - 1]);
          } else {
            console.log('✗ Polyline decoding failed');
          }
        } else {
          console.log('✗ Route calculation failed');
          console.log('Error:', response.data.error);
        }
      } catch (error) {
        console.error('Error testing route calculation:', error.message);
      }
      
      // Close WebSocket connection after testing
      setTimeout(() => {
        ws.close();
      }, 2000);
    }
  });
  
  ws.on('error', function error(err) {
    console.error('WebSocket error:', err);
  });
  
  ws.on('close', function close() {
    console.log('\nComplete route flow test completed.');
  });
}

// Run the test
testCompleteRouteFlow();