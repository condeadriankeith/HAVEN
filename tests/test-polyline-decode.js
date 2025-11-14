// Test script to verify polyline decoding functionality

// Function to decode Google Maps encoded polyline (same as in mobile app)
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

// Test with the polyline from our previous test
const testPolyline = "igc`A{nkmVGPQl@EPENa@tAt@V]rAyGsB{Ac@WIICqC{@pAcEvBmHRs@Le@La@FYJUHYt@cCnAyDDMeA_@i@Qw@Yk@SmC}@wAe@aBk@_A[yAe@K@wCaA";

console.log('Testing polyline decoding...\n');
console.log('Encoded polyline:', testPolyline);

const decodedCoordinates = decodePolyline(testPolyline);

console.log('\nDecoded coordinates count:', decodedCoordinates.length);
console.log('First few coordinates:');
for (let i = 0; i < Math.min(5, decodedCoordinates.length); i++) {
  console.log(`  Point ${i + 1}: [${decodedCoordinates[i][0]}, ${decodedCoordinates[i][1]}]`);
}

console.log('\nLast few coordinates:');
for (let i = Math.max(0, decodedCoordinates.length - 5); i < decodedCoordinates.length; i++) {
  console.log(`  Point ${i + 1}: [${decodedCoordinates[i][0]}, ${decodedCoordinates[i][1]}]`);
}

console.log('\n✓ Polyline decoding test completed successfully!');