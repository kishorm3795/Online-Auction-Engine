// Advanced 3D Animated Background using Three.js
const init3DBackground = () => {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617); // Extremely deep blue/black
    scene.fog = new THREE.FogExp2(0x020617, 0.02);

    // Camera setup
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 30;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // optimize for high DPI

    // --- Core Data Rings ---
    const ringGroup = new THREE.Group();
    scene.add(ringGroup);

    const ringMaterial = new THREE.MeshStandardMaterial({
        color: 0x3b82f6,
        emissive: 0x1d4ed8,
        emissiveIntensity: 0.5,
        wireframe: true,
        transparent: true,
        opacity: 0.4
    });

    const ringGeometry1 = new THREE.TorusGeometry(10, 0.2, 16, 100);
    const ring1 = new THREE.Mesh(ringGeometry1, ringMaterial);
    ring1.rotation.x = Math.PI / 2;
    ringGroup.add(ring1);

    const ringGeometry2 = new THREE.TorusGeometry(12, 0.1, 16, 100);
    const ring2 = new THREE.Mesh(ringGeometry2, new THREE.MeshStandardMaterial({
        color: 0x00d2ff, wireframe: true, transparent: true, opacity: 0.3
    }));
    ring2.rotation.x = Math.PI / 3;
    ringGroup.add(ring2);

    const ringGeometry3 = new THREE.TorusGeometry(15, 0.05, 16, 100);
    const ring3 = new THREE.Mesh(ringGeometry3, new THREE.MeshStandardMaterial({
        color: 0x60a5fa, transparent: true, opacity: 0.2
    }));
    ring3.rotation.x = Math.PI / 4;
    ringGroup.add(ring3);

    // --- Floating Polyhedrons ---
    const shapes = [];
    const solidMaterialParams = {
        color: 0x0f172a,
        emissive: 0x1e3a8a,
        emissiveIntensity: 0.2,
        transparent: true,
        opacity: 0.8,
        roughness: 0.1,
        metalness: 0.9,
        flatShading: true
    };
    
    const wireframeMaterial = new THREE.MeshBasicMaterial({
        color: 0x00d2ff,
        wireframe: true,
        transparent: true,
        opacity: 0.3
    });

    const geometries = [
        new THREE.IcosahedronGeometry(1.5, 0),
        new THREE.OctahedronGeometry(1.2, 0),
        new THREE.TetrahedronGeometry(1.5, 0)
    ];

    const solidMaterial = new THREE.MeshStandardMaterial(solidMaterialParams);

    for (let i = 0; i < 25; i++) {
        const geom = geometries[Math.floor(Math.random() * geometries.length)];
        
        // Group to hold solid + wireframe outline
        const shapeGroup = new THREE.Group();
        
        const mesh = new THREE.Mesh(geom, solidMaterial);
        const wireScale = 1.05;
        const meshWire = new THREE.Mesh(geom, wireframeMaterial);
        meshWire.scale.set(wireScale, wireScale, wireScale);
        
        shapeGroup.add(mesh);
        shapeGroup.add(meshWire);
        
        // Random positioning within a torus range
        const radius = 10 + Math.random() * 15;
        const angle = Math.random() * Math.PI * 2;
        const yOffset = (Math.random() - 0.5) * 15;
        
        shapeGroup.position.x = Math.cos(angle) * radius;
        shapeGroup.position.z = Math.sin(angle) * radius - 10;
        shapeGroup.position.y = yOffset;
        
        // Random rotation
        shapeGroup.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);

        // Velocity for animation
        shapeGroup.userData = {
            rx: (Math.random() - 0.5) * 0.02,
            ry: (Math.random() - 0.5) * 0.02,
            orbitSpeed: 0.001 + Math.random() * 0.003,
            angle: angle,
            radius: radius
        };

        shapes.push(shapeGroup);
        scene.add(shapeGroup);
    }

    // --- Particle Data Stream ---
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 2000;
    
    const posArray = new Float32Array(particlesCount * 3);
    for(let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 60;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.08,
        color: 0x60a5fa,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });
    
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x00d2ff, 100, 100);
    pointLight1.position.set(10, 10, 10);
    scene.add(pointLight1);
    
    const pointLight2 = new THREE.PointLight(0x3b82f6, 100, 100);
    pointLight2.position.set(-10, -10, 10);
    scene.add(pointLight2);

    // Mouse interactivty
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX - windowHalfX);
        mouseY = (event.clientY - windowHalfY);
    });

    // --- Animation Loop ---
    const clock = new THREE.Clock();

    const animate = function () {
        requestAnimationFrame(animate);
        const elapsedTime = clock.getElapsedTime();

        // Parallax effect with mouse
        targetX = mouseX * 0.001;
        targetY = mouseY * 0.001;
        ringGroup.rotation.y += 0.05 * (targetX - ringGroup.rotation.y);
        ringGroup.rotation.x += 0.05 * (targetY - ringGroup.rotation.x);
        
        // Rotate rings
        ring1.rotation.z = elapsedTime * 0.1;
        ring2.rotation.y = elapsedTime * 0.15;
        ring3.rotation.x = elapsedTime * 0.2;
        ring3.rotation.z = elapsedTime * 0.05;

        // Animate floating polyhedrons in orbit
        shapes.forEach(shape => {
            shape.rotation.x += shape.userData.rx;
            shape.rotation.y += shape.userData.ry;
            
            // Orbit calculation
            shape.userData.angle += shape.userData.orbitSpeed;
            shape.position.x = Math.cos(shape.userData.angle) * shape.userData.radius;
            shape.position.z = Math.sin(shape.userData.angle) * shape.userData.radius - 10;
        });

        // Gently move particle stream
        particlesMesh.position.y = Math.sin(elapsedTime * 0.2) * 2;
        particlesMesh.rotation.y = elapsedTime * 0.05;

        renderer.render(scene, camera);
    };

    animate();

    // Handle Resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
};

document.addEventListener('DOMContentLoaded', init3DBackground);
