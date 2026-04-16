// Very Colorful & "Out of the Box" 3D Background
const init3DBackground = () => {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0015); // Deep vivid purple/black base
    scene.fog = new THREE.FogExp2(0x0a0015, 0.015);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 40;

    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // --- The Morphing Core (Abstract Art) ---
    // We use a complex Torus Knot as our central "sculpture"
    const knotGeometry = new THREE.TorusKnotGeometry(10, 3, 300, 20, 3, 4);
    
    // A highly reflective glass-like liquid material
    const knotMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xff00bb, 
        metalness: 0.1,
        roughness: 0.1,
        transmission: 0.9, // glass-like
        thickness: 2.0,
        envMapIntensity: 1.0,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
    });
    
    const knot = new THREE.Mesh(knotGeometry, knotMaterial);
    scene.add(knot);

    // --- Colorful Floating Elements ---
    const shapes = [];
    const colorPalette = [
        0xff0055, // Vivid Pink
        0x00ffcc, // Bright Cyan
        0xffcc00, // Vibrant Yellow
        0xbb00ff, // Neon Purple
        0x39ff14  // Toxic Green
    ];

    const geometries = [
        new THREE.OctahedronGeometry(2, 0),
        new THREE.TorusGeometry(2, 0.5, 16, 100),
        new THREE.ConeGeometry(2, 4, 4),
        new THREE.DodecahedronGeometry(2, 0),
        new THREE.IcosahedronGeometry(2, 0)
    ];

    for (let i = 0; i < 60; i++) {
        const geom = geometries[Math.floor(Math.random() * geometries.length)];
        const shapeColor = colorPalette[Math.floor(Math.random() * colorPalette.length)];
        
        // Some elements are solid, some are wireframe glowing
        const isWireframe = Math.random() > 0.6;
        
        let material;
        if (isWireframe) {
            material = new THREE.MeshBasicMaterial({
                color: shapeColor,
                wireframe: true,
                transparent: true,
                opacity: 0.8
            });
        } else {
            material = new THREE.MeshStandardMaterial({
                color: shapeColor,
                emissive: shapeColor,
                emissiveIntensity: 0.4,
                roughness: 0.2,
                metalness: 0.8
            });
        }

        const mesh = new THREE.Mesh(geom, material);
        
        // Scatter them widely in a sphere around the core
        const r = 15 + Math.random() * 40;
        const theta = Math.random() * 2 * Math.PI;
        const phi = Math.acos(2 * Math.random() - 1);
        
        mesh.position.x = r * Math.sin(phi) * Math.cos(theta);
        mesh.position.y = r * Math.sin(phi) * Math.sin(theta);
        mesh.position.z = r * Math.cos(phi) - 10;
        
        mesh.rotation.x = Math.random() * Math.PI;
        mesh.rotation.y = Math.random() * Math.PI;

        mesh.userData = {
            rotSpeedX: (Math.random() - 0.5) * 0.04,
            rotSpeedY: (Math.random() - 0.5) * 0.04,
            floatSpeed: (Math.random() - 0.5) * 0.05,
            pivotLimit: Math.random() * 2,
            initialY: mesh.position.y
        };

        shapes.push(mesh);
        scene.add(mesh);
    }

    // --- Dynamic Neon Lights ---
    // We add multiple rotating colored lights to illuminate the glass knot
    const redLight = new THREE.PointLight(0xff0055, 500, 100);
    const blueLight = new THREE.PointLight(0x00ffff, 500, 100);
    const yellowLight = new THREE.PointLight(0xffcc00, 500, 100);
    
    scene.add(redLight);
    scene.add(blueLight);
    scene.add(yellowLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    // Interactive Camera Parallax
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

    const clock = new THREE.Clock();

    const animate = function () {
        requestAnimationFrame(animate);
        const time = clock.getElapsedTime();

        // Parallax easing
        targetX = mouseX * 0.01;
        targetY = mouseY * 0.01;
        camera.position.x += (targetX - camera.position.x) * 0.05;
        camera.position.y += (-targetY - camera.position.y) * 0.05;
        camera.lookAt(scene.position);

        // Core Knot Animation
        knot.rotation.x = time * 0.15;
        knot.rotation.y = time * 0.2;
        knot.rotation.z = time * 0.1;
        
        // Make the knot change color dynamically through Hue
        const colorHue = (time * 0.05) % 1;
        knotMaterial.color.setHSL(colorHue, 1.0, 0.5);

        // Orbit Lights around the knot
        redLight.position.x = Math.sin(time * 0.8) * 15;
        redLight.position.y = Math.cos(time * 0.6) * 15;
        redLight.position.z = Math.sin(time * 0.5) * 15;
        
        blueLight.position.x = Math.sin(time * 1.2 + Math.PI) * 15;
        blueLight.position.y = Math.cos(time * 0.9 + Math.PI) * 15;
        blueLight.position.z = Math.sin(time * 0.7 + Math.PI) * 15;

        yellowLight.position.x = Math.sin(time * 0.5 + Math.PI/2) * 15;
        yellowLight.position.y = Math.cos(time * 1.1 + Math.PI/2) * 15;
        yellowLight.position.z = Math.sin(time * 0.4 + Math.PI/2) * 15;

        // Float & Rotate shapes
        shapes.forEach(shape => {
            shape.rotation.x += shape.userData.rotSpeedX;
            shape.rotation.y += shape.userData.rotSpeedY;
            
            // Gentle hovering up and down
            shape.position.y = shape.userData.initialY + Math.sin(time + shape.userData.initialY) * shape.userData.pivotLimit;
        });

        renderer.render(scene, camera);
    };

    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
};

document.addEventListener('DOMContentLoaded', init3DBackground);
