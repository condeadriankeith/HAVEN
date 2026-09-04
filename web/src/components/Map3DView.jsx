import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Grid, Float } from '@react-three/drei';
import * as THREE from 'three';

// Coordinate projection reference centered around Bacolod City Plaza (10.6765, 122.9509)
const REF_LAT = 10.6765;
const REF_LNG = 122.9509;
const SCALE = 45000;

function projectTo3D(lat, lng) {
  const x = (lng - REF_LNG) * SCALE * Math.cos((REF_LAT * Math.PI) / 180);
  const z = -(lat - REF_LAT) * SCALE;
  return [x, 0, z];
}

function unprojectFrom3D(x, z) {
  const lat = REF_LAT - z / SCALE;
  const lng = REF_LNG + x / (SCALE * Math.cos((REF_LAT * Math.PI) / 180));
  return { lat, lng };
}

// 3D Landmark & City Block Buildings (Bacolod Central Ops Grid)
const CITY_BLOCKS = [
  // Bacolod City Plaza & Surrounding Commercial Core
  { x: -5, z: -5, w: 22, d: 20, h: 28, name: 'Bacolod City Hall & Annex' },
  { x: 24, z: -8, w: 18, d: 24, h: 42, name: 'Lacson Cyber Park Tower' },
  { x: -28, z: -10, w: 16, d: 18, h: 22, name: 'San Sebastian Cathedral Block' },
  { x: 30, z: 22, w: 25, d: 20, h: 35, name: 'Riverside Medical Center' },
  { x: -22, z: 28, w: 20, d: 22, h: 30, name: 'Capitol Park Administration' },
  { x: 0, z: 35, w: 28, d: 18, h: 24, name: 'Negros Occidental Provincial Capitol' },
  { x: -45, z: 5, w: 20, d: 25, h: 32, name: 'SM City Bacolod Lifestyle Complex' },
  { x: 50, z: -25, w: 22, d: 20, h: 26, name: 'The Doctors Hospital' },
  { x: -10, z: -38, w: 24, d: 16, h: 38, name: 'Ayala Malls Capitol Central' },
  { x: 42, z: 10, w: 16, d: 18, h: 20, name: 'Bacolod Police Precinct 1' },
  { x: -35, z: -30, w: 18, d: 22, h: 25, name: 'Bredco Port Terminal' },
  { x: 15, z: -42, w: 20, d: 18, h: 34, name: 'Lacson Tourism Strip Building' },
  { x: -50, z: -15, w: 16, d: 16, h: 18, name: 'Bacolod Public Plaza Pavilion' },
  { x: 20, z: 45, w: 24, d: 22, h: 28, name: 'Burgos Avenue Commercial Center' },
  { x: -25, z: -50, w: 26, d: 18, h: 22, name: 'South Terminal Station' },
  // Additional surrounding density blocks
  { x: 8, z: 8, w: 12, d: 14, h: 18, name: 'City Quad Commercial' },
  { x: -8, z: 12, w: 14, d: 12, h: 16, name: 'Central Post Office' },
  { x: 12, z: -22, w: 15, d: 15, h: 24, name: 'Lacson St Heritage House' },
  { x: -18, z: -18, w: 14, d: 16, h: 20, name: 'Gatuslao Street Retail' },
  { x: 35, z: -40, w: 18, d: 16, h: 22, name: 'Bacolod Diagnostic Center' },
  { x: -40, z: 35, w: 16, d: 16, h: 19, name: 'Provincial Health Office' },
];

// Single 3D Extruded Building with Window Glint Material
function BuildingMesh({ block }) {
  const [hovered, setHovered] = useState(false);

  return (
    <mesh
      position={[block.x, block.h / 2, block.z]}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      <boxGeometry args={[block.w, block.h, block.d]} />
      <meshStandardMaterial
        color={hovered ? '#00f0a8' : '#151c2c'}
        roughness={0.25}
        metalness={0.7}
        emissive={hovered ? '#00f0a8' : '#0a101d'}
        emissiveIntensity={hovered ? 0.6 : 0.2}
      />
      {hovered && (
        <Html position={[0, block.h / 2 + 3, 0]} center>
          <div className="map3d-building-tooltip">
            <strong>{block.name}</strong>
            <span>Height: {block.h}m</span>
          </div>
        </Html>
      )}
    </mesh>
  );
}

// Glowing 3D Route Line with moving vehicle head
function Route3DRibbon({ coordinates = [] }) {
  const vehicleRef = useRef();

  const points3D = useMemo(() => {
    if (!coordinates || coordinates.length < 2) return [];
    return coordinates.map(([lat, lng]) => {
      const [x, , z] = projectTo3D(lat, lng);
      return new THREE.Vector3(x, 0.6, z);
    });
  }, [coordinates]);

  const curve = useMemo(() => {
    if (points3D.length < 2) return null;
    return new THREE.CatmullRomCurve3(points3D);
  }, [points3D]);

  useFrame(({ clock }) => {
    if (curve && vehicleRef.current) {
      const t = (clock.getElapsedTime() * 0.12) % 1;
      const pos = curve.getPointAt(t);
      vehicleRef.current.position.copy(pos);
      const tangent = curve.getTangentAt(t);
      vehicleRef.current.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tangent);
    }
  });

  if (!curve || points3D.length < 2) return null;

  return (
    <group>
      {/* 3D Tube for main glowing route */}
      <mesh>
        <tubeGeometry args={[curve, 100, 0.45, 8, false]} />
        <meshBasicMaterial color="#00f0a8" />
      </mesh>

      {/* Outer ambient glow tube */}
      <mesh>
        <tubeGeometry args={[curve, 60, 1.2, 8, false]} />
        <meshBasicMaterial color="#00e5ff" transparent opacity={0.25} />
      </mesh>

      {/* 3D Animated Responder Vehicle Head */}
      <mesh ref={vehicleRef} position={points3D[0]}>
        <sphereGeometry args={[1.2, 16, 16]} />
        <meshStandardMaterial color="#ffffff" emissive="#00f0a8" emissiveIntensity={1.8} />
        {/* Trailing emergency beacon light */}
        <pointLight color="#00f0a8" intensity={4} distance={20} />
      </mesh>
    </group>
  );
}

// 3D Emergency Beacon with pulsing vertical light beam
function Emergency3DBeacon({ emergency, isSelected, onSelect }) {
  const [x, , z] = useMemo(() => projectTo3D(emergency.lat, emergency.lng), [emergency.lat, emergency.lng]);
  const pillarRef = useRef();

  useFrame(({ clock }) => {
    if (pillarRef.current) {
      const pulse = 1 + Math.sin(clock.getElapsedTime() * 4) * 0.15;
      pillarRef.current.scale.set(pulse, 1, pulse);
    }
  });

  const beaconColor = isSelected ? '#ff2b44' : '#00e5ff';

  return (
    <group position={[x, 0, z]}>
      {/* Vertical light pillar */}
      <mesh ref={pillarRef} position={[0, 20, 0]}>
        <cylinderGeometry args={[0.3, 0.8, 40, 16]} />
        <meshBasicMaterial color={beaconColor} transparent opacity={0.45} />
      </mesh>

      {/* Base radar ripple rings on ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.2, 0]}>
        <ringGeometry args={[1.8, 2.4, 32]} />
        <meshBasicMaterial color={beaconColor} transparent opacity={0.8} />
      </mesh>

      {/* Floating 3D Emergency Icon / Pin */}
      <Float speed={3} rotationIntensity={0.2} floatIntensity={1.5}>
        <mesh
          position={[0, 8, 0]}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(emergency);
          }}
        >
          <sphereGeometry args={[1.8, 24, 24]} />
          <meshStandardMaterial
            color={beaconColor}
            emissive={beaconColor}
            emissiveIntensity={1.2}
            roughness={0.2}
          />
          <pointLight color={beaconColor} intensity={3} distance={25} />
        </mesh>
      </Float>

      {/* Floating HUD Label matching Reference 2 */}
      <Html position={[0, 14, 0]} center distanceFactor={140}>
        <div
          className={`map3d-pin-badge ${isSelected ? 'selected' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(emergency);
          }}
        >
          <span className="map3d-pin-icon">🚨</span>
          <span className="map3d-pin-title">{emergency.petName || emergency.title}</span>
          <span className="map3d-pin-tag">{emergency.priority || 'Critical'}</span>
        </div>
      </Html>
    </group>
  );
}

// Central Vet Command HQ in 3D
function VetHQ3D({ lat, lng }) {
  const [x, , z] = useMemo(() => projectTo3D(lat, lng), [lat, lng]);

  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 3, 0]}>
        <cylinderGeometry args={[2.5, 3.2, 6, 24]} />
        <meshStandardMaterial color="#00e5ff" emissive="#00e5ff" emissiveIntensity={0.6} />
      </mesh>
      <Html position={[0, 9, 0]} center distanceFactor={140}>
        <div className="map3d-hq-badge">
          🏥 HAVEN Vet Command HQ
        </div>
      </Html>
    </group>
  );
}

// Click listener to pick GPS points on the 3D ground plane
function GroundPicker({ onLocationPicked }) {
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -0.05, 0]}
      onClick={(e) => {
        const pt = e.point;
        const coords = unprojectFrom3D(pt.x, pt.z);
        if (onLocationPicked) {
          onLocationPicked(coords);
        }
      }}
    >
      <planeGeometry args={[1200, 1200]} />
      <meshStandardMaterial color="#080b12" roughness={0.9} />
    </mesh>
  );
}

export default function Map3DView({
  emergencies = [],
  selectedEmergency = null,
  routeCoordinates = [],
  _routeInfo = null,
  onSelectEmergency,
  onLocationPicked,
}) {
  const hqCoords = { lat: 10.6765, lng: 122.9509 };

  return (
    <div className="map3d-container">
      <Canvas
        camera={{ position: [0, 85, 120], fov: 48, near: 0.5, far: 1000 }}
        style={{ width: '100%', height: '100%', background: '#07090e' }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[60, 120, 50]} intensity={1.5} color="#e6f0ff" />
        <pointLight position={[-40, 50, -40]} intensity={0.8} color="#00e5ff" />
        <fog attach="fog" args={['#07090e', 90, 450]} />

        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          maxPolarAngle={Math.PI / 2.05}
          minDistance={15}
          maxDistance={350}
        />

        {/* Tactical Dark Coordinate Grid */}
        <Grid
          position={[0, 0.02, 0]}
          args={[600, 600]}
          cellSize={10}
          cellThickness={0.7}
          cellColor="#0e1728"
          sectionSize={40}
          sectionThickness={1.2}
          sectionColor="#14233e"
          fadeDistance={350}
          fadeStrength={1.5}
        />

        {/* Clickable Ground */}
        <GroundPicker onLocationPicked={onLocationPicked} />

        {/* 3D City Buildings */}
        {CITY_BLOCKS.map((block, idx) => (
          <BuildingMesh key={idx} block={block} />
        ))}

        {/* Central Vet HQ */}
        <VetHQ3D lat={hqCoords.lat} lng={hqCoords.lng} />

        {/* 3D Emergency Beacons */}
        {emergencies.map((e) => (
          <Emergency3DBeacon
            key={e.id}
            emergency={e}
            isSelected={selectedEmergency && selectedEmergency.id === e.id}
            onSelect={onSelectEmergency}
          />
        ))}

        {/* Glowing 3D Animated Route */}
        {routeCoordinates && routeCoordinates.length > 1 && (
          <Route3DRibbon coordinates={routeCoordinates} />
        )}
      </Canvas>

      {/* 3D Viewport Controls / Instruction Hint */}
      <div className="map3d-hud-hint">
        <span>Left Click + Drag to Orbit • Right Click to Pan • Scroll to Zoom</span>
      </div>
    </div>
  );
}
