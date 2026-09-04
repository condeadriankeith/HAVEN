import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html, Grid, Float } from '@react-three/drei';
import * as THREE from 'three';
import {
  Sun,
  Moon,
  Sunset,
  Sunrise,
  Compass,
  Focus,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { playClickFeedback } from '../utils/sound';

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

// Procedural high-resolution window texture generator for nocturnal skyscraper illumination
function createFacadeTexture(seed = 1) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#0b0f19';
  ctx.fillRect(0, 0, 256, 256);

  const cols = 10;
  const rows = 14;
  const winW = 14;
  const winH = 9;
  const gapX = 10;
  const gapY = 8;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const pseudoRand = Math.sin(r * 17.3 + c * 31.7 + seed * 9.1) * 10000;
      const val = pseudoRand - Math.floor(pseudoRand);

      if (val > 0.42) {
        // Lit window (golden warm office or cyan penthouse)
        const isWarm = val > 0.65;
        ctx.fillStyle = isWarm ? '#ffd88a' : '#7fe7ff';
        ctx.shadowColor = isWarm ? '#ffc252' : '#38bdf8';
        ctx.shadowBlur = 4;
      } else {
        // Dark unlit window
        ctx.fillStyle = '#141d2e';
        ctx.shadowBlur = 0;
      }
      ctx.fillRect(c * (winW + gapX) + 12, r * (winH + gapY) + 10, winW, winH);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1.5, 3);
  return texture;
}

// 3D City Landmarks & Architecture (Bacolod Central Metropolitan Core)
const CITY_BLOCKS = [
  // Bacolod City Plaza, Government & Civic Landmark Core
  { x: -5, z: -5, w: 24, d: 22, h: 32, name: 'Bacolod City Hall & Central Annex', color: '#1a243b' },
  { x: 26, z: -8, w: 20, d: 26, h: 48, name: 'Lacson Cyber Park Tower', color: '#131e33' },
  { x: -30, z: -10, w: 18, d: 20, h: 26, name: 'San Sebastian Cathedral Block', color: '#24202b' },
  { x: 32, z: 24, w: 28, d: 22, h: 38, name: 'Riverside Medical Center Trauma Block', color: '#14283c' },
  { x: -24, z: 30, w: 22, d: 24, h: 34, name: 'Capitol Park Administration Complex', color: '#1b263a' },
  { x: 0, z: 38, w: 32, d: 20, h: 28, name: 'Negros Occidental Provincial Capitol', color: '#252e42' },
  { x: -48, z: 6, w: 24, d: 28, h: 36, name: 'SM City Bacolod Lifestyle Complex', color: '#131c2d' },
  { x: 52, z: -26, w: 24, d: 22, h: 30, name: 'The Doctors Hospital Bacolod', color: '#16293d' },
  { x: -12, z: -40, w: 26, d: 18, h: 42, name: 'Ayala Malls Capitol Central Tower', color: '#121d30' },
  { x: 44, z: 12, w: 18, d: 20, h: 22, name: 'Bacolod Police Precinct 1 Station', color: '#192236' },
  { x: -38, z: -32, w: 20, d: 24, h: 26, name: 'Bredco Port Harbor Terminal', color: '#1a2638' },
  { x: 18, z: -44, w: 22, d: 20, h: 38, name: 'Lacson Tourism Strip High-Rise', color: '#152033' },
  { x: -52, z: -16, w: 18, d: 18, h: 20, name: 'Bacolod Public Plaza Heritage Pavilion', color: '#2a2624' },
  { x: 22, z: 48, w: 26, d: 24, h: 32, name: 'Burgos Avenue Commercial Center', color: '#162236' },
  { x: -28, z: -52, w: 28, d: 20, h: 25, name: 'South Bus Terminal Station', color: '#1b2233' },
  // Secondary Infill Blocks for dense urban feel
  { x: 8, z: 8, w: 14, d: 16, h: 24, name: 'City Quad Financial Center', color: '#141e30' },
  { x: -8, z: 14, w: 16, d: 14, h: 20, name: 'Central Post Office Building', color: '#182234' },
  { x: 14, z: -24, w: 16, d: 18, h: 28, name: 'Lacson Heritage Commercial House', color: '#192438' },
  { x: -20, z: -20, w: 16, d: 18, h: 22, name: 'Gatuslao Street Retail Arcade', color: '#1a2336' },
  { x: 38, z: -42, w: 20, d: 18, h: 26, name: 'Bacolod Diagnostic Center', color: '#15283c' },
  { x: -42, z: 38, w: 18, d: 18, h: 22, name: 'Provincial Health Operations Office', color: '#172738' },
  { x: -60, z: 10, w: 18, d: 20, h: 24, name: 'Manokan Country Promenade', color: '#202430' },
  { x: 60, z: -10, w: 20, d: 22, h: 32, name: 'CL Montelibano Avenue Complex', color: '#141e30' },
];

// Major Roads Network in 3D
const ROAD_ARTERIES = [
  // Lacson Street (North-South Main Spine)
  { points: [[20, 0.15, -80], [20, 0.15, 80]], width: 4.5, name: 'Lacson Street Expressway' },
  // Burgos Avenue (East-West Major Cross)
  { points: [[-80, 0.15, 20], [80, 0.15, 20]], width: 4, name: 'Burgos Avenue' },
  // Rizal Street
  { points: [[-80, 0.15, -15], [80, 0.15, -15]], width: 3.5, name: 'Rizal Street' },
  // Gatuslao Street
  { points: [[-18, 0.15, -80], [-18, 0.15, 80]], width: 3.2, name: 'Gatuslao Street' },
  // San Juan Street
  { points: [[-45, 0.15, -80], [-45, 0.15, 80]], width: 3, name: 'San Juan Street' },
];

// Streetlamp Array along Lacson Street & Burgos Ave
const STREETLAMPS = [
  { x: 23, z: -55 }, { x: 23, z: -25 }, { x: 23, z: 5 }, { x: 23, z: 35 }, { x: 23, z: 65 },
  { x: 17, z: -40 }, { x: 17, z: -10 }, { x: 17, z: 20 }, { x: 17, z: 50 },
  { x: -50, z: 22 }, { x: -20, z: 22 }, { x: 10, z: 22 }, { x: 40, z: 22 }, { x: 65, z: 22 },
];

// Time of Day Profiles
function getTimeProfile(mode) {
  let effectiveMode = mode;
  if (mode === 'AUTO') {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 7) effectiveMode = 'DAWN';
    else if (hour >= 7 && hour < 17) effectiveMode = 'DAY';
    else if (hour >= 17 && hour < 19) effectiveMode = 'SUNSET';
    else effectiveMode = 'NIGHT';
  }

  switch (effectiveMode) {
    case 'DAWN':
      return {
        name: 'Dawn Ops',
        sky: '#141226',
        fog: '#1a1630',
        ambientColor: '#2b2344',
        ambientIntensity: 1.8,
        sunColor: '#ff9a76',
        sunIntensity: 2.6,
        sunPos: [80, 50, 60],
        groundColor: '#121222',
        windowGlow: 0.6,
        streetlampsOn: true,
        icon: Sunrise,
      };
    case 'DAY':
      return {
        name: 'Midday Ops',
        sky: '#0f172a',
        fog: '#152138',
        ambientColor: '#4a628a',
        ambientIntensity: 2.2,
        sunColor: '#ffffff',
        sunIntensity: 3.5,
        sunPos: [60, 150, 40],
        groundColor: '#1a2336',
        windowGlow: 0.2,
        streetlampsOn: false,
        icon: Sun,
      };
    case 'SUNSET':
      return {
        name: 'Sunset Ops',
        sky: '#1a0f1d',
        fog: '#241328',
        ambientColor: '#4a2538',
        ambientIntensity: 1.9,
        sunColor: '#ff6230',
        sunIntensity: 3.0,
        sunPos: [-90, 45, -50],
        groundColor: '#1a1420',
        windowGlow: 0.8,
        streetlampsOn: true,
        icon: Sunset,
      };
    case 'NIGHT':
    default:
      return {
        name: 'Night Ops (Live)',
        sky: '#060812',
        fog: '#080c18',
        ambientColor: '#1c2847',
        ambientIntensity: 1.6,
        sunColor: '#93c5fd', // Moonlight
        sunIntensity: 2.4,
        sunPos: [70, 160, 80],
        groundColor: '#0a0e1a',
        windowGlow: 1.3,
        streetlampsOn: true,
        icon: Moon,
      };
  }
}

// Single Extruded 3D Building with Procedural Windows & Glowing Rooftop
function BuildingWithWindows({ block, timeProfile }) {
  const [hovered, setHovered] = useState(false);
  const facadeTexture = useMemo(() => createFacadeTexture(block.h + block.w), [block.h, block.w]);

  return (
    <group position={[block.x, 0, block.z]}>
      {/* Main Extruded Building Mesh with Window Glints */}
      <mesh
        position={[0, block.h / 2, 0]}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
      >
        <boxGeometry args={[block.w, block.h, block.d]} />
        <meshStandardMaterial
          color={hovered ? '#00f0a8' : block.color}
          roughness={0.3}
          metalness={0.65}
          map={facadeTexture}
          emissive={hovered ? '#00f0a8' : '#38bdf8'}
          emissiveIntensity={hovered ? 0.8 : (timeProfile.windowGlow * 0.35)}
        />
      </mesh>

      {/* Rooftop Glowing Edge Trim */}
      <mesh position={[0, block.h + 0.2, 0]}>
        <boxGeometry args={[block.w + 0.4, 0.4, block.d + 0.4]} />
        <meshBasicMaterial
          color={hovered ? '#00f0a8' : '#00e5ff'}
          transparent
          opacity={hovered ? 0.9 : 0.45}
        />
      </mesh>

      {/* Rooftop Telemetry Antenna with Aircraft Warning Beacon */}
      {block.h > 35 && (
        <group position={[0, block.h, 0]}>
          <mesh position={[0, 4, 0]}>
            <cylinderGeometry args={[0.15, 0.3, 8, 8]} />
            <meshBasicMaterial color="#94a3b8" />
          </mesh>
          <mesh position={[0, 8.2, 0]}>
            <sphereGeometry args={[0.5, 8, 8]} />
            <meshBasicMaterial color="#ff2a44" />
          </mesh>
          <pointLight position={[0, 8.2, 0]} color="#ff2a44" intensity={1.5} distance={15} />
        </group>
      )}

      {/* Building Hover Tooltip */}
      {hovered && (
        <Html position={[0, block.h + 5, 0]} center>
          <div className="map3d-building-tooltip">
            <strong>{block.name}</strong>
            <span>Height: {block.h}m • Bacolod Urban Grid</span>
          </div>
        </Html>
      )}
    </group>
  );
}

// Street Lighting Network (Lamps casting warm pools of light)
function StreetlightNetwork({ enabled }) {
  if (!enabled) return null;

  return (
    <group>
      {STREETLAMPS.map((lamp, i) => (
        <group key={i} position={[lamp.x, 0, lamp.z]}>
          {/* Lamp Post Pole */}
          <mesh position={[0, 4.5, 0]}>
            <cylinderGeometry args={[0.15, 0.2, 9, 8]} />
            <meshStandardMaterial color="#475569" metalness={0.8} />
          </mesh>
          {/* Lamp Fixture Arm */}
          <mesh position={[0.6, 8.8, 0]} rotation={[0, 0, -Math.PI / 4]}>
            <cylinderGeometry args={[0.1, 0.1, 1.8, 8]} />
            <meshStandardMaterial color="#475569" metalness={0.8} />
          </mesh>
          {/* Glowing Lamp Luminaire */}
          <mesh position={[1.2, 8.6, 0]}>
            <sphereGeometry args={[0.5, 8, 8]} />
            <meshBasicMaterial color="#ffea9f" />
          </mesh>
          {/* Point Light Casting Ambient Road Illumination */}
          <pointLight
            position={[1.2, 8.6, 0]}
            color="#ffd97d"
            intensity={2.2}
            distance={26}
            decay={2}
          />
        </group>
      ))}
    </group>
  );
}

// Capitol Lagoon Reflecting Pool with Water Shimmer
function CapitolLagoonPool() {
  return (
    <group position={[-12, 0.08, 48]}>
      {/* Water Plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[36, 18]} />
        <meshStandardMaterial
          color="#0d2847"
          roughness={0.12}
          metalness={0.9}
          emissive="#083358"
          emissiveIntensity={0.5}
        />
      </mesh>
      {/* Lagoon Stone Border */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <ringGeometry args={[18, 19.5, 32]} />
        <meshStandardMaterial color="#334155" roughness={0.7} />
      </mesh>
      <Html position={[0, 1.5, 0]} center distanceFactor={140}>
        <div className="map3d-park-label">
          ⛲ Capitol Lagoon Reflecting Pool
        </div>
      </Html>
    </group>
  );
}

// Glowing 3D Animated Route Line with Moving Ambulance Vehicle
function Route3DAnimated({ coordinates = [] }) {
  const vehicleRef = useRef();
  const headlightRef = useRef();

  const points3D = useMemo(() => {
    if (!coordinates || coordinates.length < 2) return [];
    return coordinates.map(([lat, lng]) => {
      const [x, , z] = projectTo3D(lat, lng);
      return new THREE.Vector3(x, 0.8, z);
    });
  }, [coordinates]);

  const curve = useMemo(() => {
    if (points3D.length < 2) return null;
    return new THREE.CatmullRomCurve3(points3D);
  }, [points3D]);

  useFrame(({ clock }) => {
    if (curve && vehicleRef.current) {
      const t = (clock.getElapsedTime() * 0.14) % 1;
      const pos = curve.getPointAt(t);
      vehicleRef.current.position.copy(pos);
      const tangent = curve.getTangentAt(t);
      vehicleRef.current.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tangent);
    }
    if (headlightRef.current) {
      // Flashing dual-color siren
      const flash = Math.sin(clock.getElapsedTime() * 12) > 0;
      headlightRef.current.color.set(flash ? '#ff2a44' : '#00e5ff');
    }
  });

  if (!curve || points3D.length < 2) return null;

  return (
    <group>
      {/* 3D Glowing Mint Route Ribbon */}
      <mesh>
        <tubeGeometry args={[curve, 120, 0.6, 12, false]} />
        <meshBasicMaterial color="#00f0a8" />
      </mesh>

      {/* Luminous Neon Cyan Ambient Tube */}
      <mesh>
        <tubeGeometry args={[curve, 70, 1.8, 10, false]} />
        <meshBasicMaterial color="#00e5ff" transparent opacity={0.35} />
      </mesh>

      {/* 3D Animated Responder Emergency Ambulance */}
      <group ref={vehicleRef} position={points3D[0]}>
        {/* Ambulance Body */}
        <mesh position={[0, 1.2, 0]}>
          <boxGeometry args={[1.8, 1.5, 3.8]} />
          <meshStandardMaterial color="#ffffff" metalness={0.7} roughness={0.2} />
        </mesh>
        {/* Siren Bar */}
        <mesh position={[0, 2.1, 0]}>
          <boxGeometry args={[1.2, 0.3, 0.6]} />
          <meshBasicMaterial color="#ff2a44" />
        </mesh>
        {/* Flashing Emergency Light */}
        <pointLight ref={headlightRef} position={[0, 2.5, 0]} intensity={6} distance={30} />
      </group>
    </group>
  );
}

// 3D Emergency Beacon with Pulsing Volumetric Light Column
function Emergency3DBeacon({ emergency, isSelected, onSelect }) {
  const [x, , z] = useMemo(() => projectTo3D(emergency.lat, emergency.lng), [emergency.lat, emergency.lng]);
  const pillarRef = useRef();

  useFrame(({ clock }) => {
    if (pillarRef.current) {
      const pulse = 1 + Math.sin(clock.getElapsedTime() * 4.5) * 0.2;
      pillarRef.current.scale.set(pulse, 1, pulse);
    }
  });

  const beaconColor = isSelected ? '#ff2a44' : '#00e5ff';

  return (
    <group position={[x, 0, z]}>
      {/* Vertical High-Intensity Light Column */}
      <mesh ref={pillarRef} position={[0, 25, 0]}>
        <cylinderGeometry args={[0.4, 1.2, 50, 16]} />
        <meshBasicMaterial color={beaconColor} transparent opacity={0.55} />
      </mesh>

      {/* Concentric Ground Radar Rings */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.25, 0]}>
        <ringGeometry args={[2.5, 3.4, 32]} />
        <meshBasicMaterial color={beaconColor} transparent opacity={0.85} />
      </mesh>

      {/* Floating 3D Emergency Pin */}
      <Float speed={3.5} rotationIntensity={0.2} floatIntensity={1.8}>
        <mesh
          position={[0, 9, 0]}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(emergency);
          }}
        >
          <sphereGeometry args={[2.2, 24, 24]} />
          <meshStandardMaterial
            color={beaconColor}
            emissive={beaconColor}
            emissiveIntensity={1.6}
            roughness={0.2}
          />
          <pointLight color={beaconColor} intensity={5} distance={35} />
        </mesh>
      </Float>

      {/* Floating Incident Label */}
      <Html position={[0, 16, 0]} center distanceFactor={140}>
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

// Central Vet Command Operations HQ
function VetHQ3D({ lat, lng }) {
  const [x, , z] = useMemo(() => projectTo3D(lat, lng), [lat, lng]);
  const searchlightRef = useRef();

  useFrame(({ clock }) => {
    if (searchlightRef.current) {
      searchlightRef.current.rotation.y = clock.getElapsedTime() * 0.8;
    }
  });

  return (
    <group position={[x, 0, z]}>
      {/* HQ Base Cylinder */}
      <mesh position={[0, 4, 0]}>
        <cylinderGeometry args={[3.5, 4.5, 8, 32]} />
        <meshStandardMaterial color="#0b172a" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Rotating Searchlight */}
      <group ref={searchlightRef} position={[0, 8.5, 0]}>
        <mesh rotation={[Math.PI / 4, 0, 0]} position={[0, 10, 10]}>
          <coneGeometry args={[4, 25, 16, 1, true]} />
          <meshBasicMaterial color="#00e5ff" transparent opacity={0.25} side={THREE.DoubleSide} />
        </mesh>
      </group>

      <pointLight position={[0, 9, 0]} color="#00e5ff" intensity={4} distance={30} />

      <Html position={[0, 12, 0]} center distanceFactor={140}>
        <div className="map3d-hq-badge">
          🏥 HAVEN Central Vet Command
        </div>
      </Html>
    </group>
  );
}

// Interactive Ground Plane with Click-to-Pick GPS
function GroundPlane({ onLocationPicked, color }) {
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0, 0]}
      onClick={(e) => {
        const pt = e.point;
        const coords = unprojectFrom3D(pt.x, pt.z);
        if (onLocationPicked) {
          onLocationPicked(coords);
        }
      }}
    >
      <planeGeometry args={[1400, 1400]} />
      <meshStandardMaterial color={color} roughness={0.85} metalness={0.2} />
    </mesh>
  );
}

// Camera Helper for Smooth Focus Actions
function CameraDirector({ selectedEmergency, cameraMode }) {
  const { camera } = useThree();
  const controlsRef = useRef();

  useEffect(() => {
    if (cameraMode === 'TOP_DOWN') {
      camera.position.set(0, 220, 0);
      camera.lookAt(0, 0, 0);
    } else if (cameraMode === 'VET_HQ') {
      const [x, , z] = projectTo3D(10.6765, 122.9509);
      camera.position.set(x + 25, 35, z + 40);
      camera.lookAt(x, 8, z);
    } else if (selectedEmergency) {
      const [x, , z] = projectTo3D(selectedEmergency.lat, selectedEmergency.lng);
      camera.position.set(x + 30, 45, z + 45);
      camera.lookAt(x, 10, z);
    } else {
      camera.position.set(0, 95, 135);
      camera.lookAt(0, 0, 0);
    }
  }, [selectedEmergency, cameraMode, camera]);

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.06}
      maxPolarAngle={Math.PI / 2.05}
      minDistance={15}
      maxDistance={400}
    />
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
  const [timeMode, setTimeMode] = useState('AUTO'); // 'AUTO', 'NIGHT', 'DAY', 'SUNSET', 'DAWN'
  const [cameraMode, setCameraMode] = useState('DEFAULT'); // 'DEFAULT', 'TOP_DOWN', 'VET_HQ'

  const timeProfile = useMemo(() => getTimeProfile(timeMode), [timeMode]);
  const hqCoords = { lat: 10.6765, lng: 122.9509 };

  const cycleTimeMode = () => {
    playClickFeedback();
    const modes = ['AUTO', 'NIGHT', 'DAY', 'SUNSET', 'DAWN'];
    const next = modes[(modes.indexOf(timeMode) + 1) % modes.length];
    setTimeMode(next);
  };

  return (
    <div className="map3d-container">
      <Canvas
        camera={{ position: [0, 95, 135], fov: 46, near: 0.5, far: 1200 }}
        style={{ width: '100%', height: '100%', background: timeProfile.sky }}
      >
        {/* Dynamic Live Lighting Engine */}
        <ambientLight color={timeProfile.ambientColor} intensity={timeProfile.ambientIntensity} />
        <hemisphereLight
          skyColor={timeProfile.sky}
          groundColor={timeProfile.groundColor}
          intensity={1.2}
        />
        <directionalLight
          position={timeProfile.sunPos}
          intensity={timeProfile.sunIntensity}
          color={timeProfile.sunColor}
          castShadow
        />
        <fog attach="fog" args={[timeProfile.fog, 90, 480]} />

        {/* Camera and Navigation Director */}
        <CameraDirector
          selectedEmergency={selectedEmergency}
          cameraMode={cameraMode}
        />

        {/* Tactical Illuminated Ground Grid */}
        <Grid
          position={[0, 0.05, 0]}
          args={[650, 650]}
          cellSize={10}
          cellThickness={0.7}
          cellColor="#121d33"
          sectionSize={40}
          sectionThickness={1.4}
          sectionColor="#1e345b"
          fadeDistance={380}
          fadeStrength={1.5}
        />

        {/* Clickable Ground Plane */}
        <GroundPlane
          onLocationPicked={onLocationPicked}
          color={timeProfile.groundColor}
        />

        {/* Roads & Avenues */}
        {ROAD_ARTERIES.map((artery, idx) => (
          <group key={idx}>
            <mesh position={[artery.points[0][0], 0.12, artery.points[0][2]]}>
              <boxGeometry
                args={[
                  Math.abs(artery.points[1][0] - artery.points[0][0]) || artery.width,
                  0.1,
                  Math.abs(artery.points[1][2] - artery.points[0][2]) || artery.width,
                ]}
              />
              <meshStandardMaterial color="#111828" roughness={0.8} />
            </mesh>
          </group>
        ))}

        {/* Streetlight Illumination Network */}
        <StreetlightNetwork enabled={timeProfile.streetlampsOn} />

        {/* Capitol Lagoon Reflecting Pool */}
        <CapitolLagoonPool />

        {/* 3D Extruded Buildings with Lit Windows */}
        {CITY_BLOCKS.map((block, idx) => (
          <BuildingWithWindows
            key={idx}
            block={block}
            timeProfile={timeProfile}
          />
        ))}

        {/* Central Vet Command HQ */}
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

        {/* 3D Animated Glowing Route with Ambulance Vehicle */}
        {routeCoordinates && routeCoordinates.length > 1 && (
          <Route3DAnimated coordinates={routeCoordinates} />
        )}
      </Canvas>

      {/* Floating 3D HUD Controls Toolbar */}
      <div className="map3d-floating-toolbar">
        {/* Time of Day Lighting Toggle */}
        <button
          className="map3d-tool-chip"
          onClick={cycleTimeMode}
          title="Toggle Time of Day Lighting"
        >
          <timeProfile.icon size={14} className="text-amber" />
          <span>{timeProfile.name}</span>
          <Sparkles size={11} className="text-muted" />
        </button>

        <div className="map3d-chip-divider" />

        {/* Camera Shortcuts */}
        <button
          className={`map3d-tool-chip ${cameraMode === 'DEFAULT' ? 'active' : ''}`}
          onClick={() => {
            playClickFeedback();
            setCameraMode('DEFAULT');
          }}
          title="Reset 3D Perspective"
        >
          <RotateCcw size={13} />
          <span>Reset View</span>
        </button>

        <button
          className={`map3d-tool-chip ${cameraMode === 'TOP_DOWN' ? 'active' : ''}`}
          onClick={() => {
            playClickFeedback();
            setCameraMode('TOP_DOWN');
          }}
          title="Satellite Top-Down View"
        >
          <Compass size={13} />
          <span>Satellite Top-Down</span>
        </button>

        <button
          className={`map3d-tool-chip ${cameraMode === 'VET_HQ' ? 'active' : ''}`}
          onClick={() => {
            playClickFeedback();
            setCameraMode('VET_HQ');
          }}
          title="Focus Vet HQ Command"
        >
          <Focus size={13} />
          <span>Focus Vet HQ</span>
        </button>
      </div>

      {/* Bottom Hint */}
      <div className="map3d-hud-hint">
        <span>Left Click + Drag to Orbit • Right Click to Pan • Scroll to Zoom • Click on ground to dispatch</span>
      </div>
    </div>
  );
}
