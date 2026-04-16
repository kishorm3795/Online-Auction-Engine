// Professional, Highly Aesthetic & Distributed 3D Background
const init3DBackground = () => {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060214); // Very deep, premium indigo-black
    scene.fog = new THREE.FogExp2(0x060214, 0.015);

    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 50;

    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // --- Elegant Color Palette ---
    // Professional but colorful: Rich Teals, Deep Violets, Rose Golds, Sapphires
    const colorPalette = [
        0x0ea5e9, // Bright Azure
        0x8b5cf6, // Vibrant Violet
        0x14b8a6, // Teal
        0xf43f5e, // Rose Gold / Soft Ruby
        0x3b82f6  // Sapphire Blue
    ];

    const shapes = [];
    
    // Create materials for drifting objects
    const createMaterial = (colorCode) => {
        // A mix of solid metallic and translucent glass-like materials
        const isGlass = Math.random() > 0.4;
        if (isGlass) {
            return new THREE.MeshPhysicalMaterial({
                color: colorCode,
                metalness: 0.1,
                roughness: 0.1,
                transmission: 0.9, // glass-like look
                thickness: 1.5,
                transparent: true,
                opacity: 0.8
            });
        } else {
            return new THREE.MeshStandardMaterial({
                color: colorCode,
                emissive: colorCode,
                emissiveIntensity: 0.2, // Subtle glow
                roughness: 0.3,
                metalness: 0.8
            });
        }
    };

    const geometries = [
        new THREE.IcosahedronGeometry(Math.random() * 2 + 1, 0),
        new THREE.OctahedronGeometry(Math.random() * 2 + 1, 0),
        new THREE.TetrahedronGeometry(Math.random() * 2 + 1, 0)
    ];

    const boundaryX = 60;
    const boundaryY = 40;
    const boundaryZ = 40;

    // Distribute 150 objects everywhere across the screen
    for (let i = 0; i < 150; i++) {
        const geom = geometries[Math.floor(Math.random() * geometries.length)];
        const colorC = colorPalette[Math.floor(Math.random() * colorPalette.length)];
        const material = createMaterial(colorC);
        
        const mesh = new THREE.Mesh(geom, material);
        
        // Randomize positions widely across the whole volume
        mesh.position.x = (Math.random() - 0.5) * boundaryX * 2;
        mesh.position.y = (Math.random() - 0.5) * boundaryY * 2;
        mesh.position.z = (Math.random() - 0.5) * boundaryZ * 2; // Spread across Z to create depth
        
        mesh.rotation.x = Math.random() * Math.PI;
        mesh.rotation.y = Math.random() * Math.PI;

        // Give each object a unique drift velocity
        mesh.userData = {
            dx: (Math.random() - 0.5) * 0.05,
            dy: (Math.random() - 0.5) * 0.05,
            dz: (Math.random() - 0.5) * 0.05,
            rx: (Math.random() - 0.5) * 0.02,
            ry: (Math.random() - 0.5) * 0.02,
        };

        shapes.push(mesh);
        scene.add(mesh);
    }

    // --- Subdued, Professional Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    // Soft drifting directional lights to interact with the glass
    const light1 = new THREE.PointLight(0x8b5cf6, 200, 150); // Violet
    const light2 = new THREE.PointLight(0x0ea5e9, 200, 150); // Azure
    const light3 = new THREE.PointLight(0xf43f5e, 200, 150); // Rose
    
    scene.add(light1);
    scene.add(light2);
    scene.add(light3);

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

        // Smooth Parallax
        targetX = mouseX * 0.015;
        targetY = mouseY * 0.015;
        camera.position.x += (targetX - camera.position.x) * 0.05;
        camera.position.y += (-targetY - camera.position.y) * 0.05;
        camera.lookAt(scene.position);

        // Move the soft lights slowly
        light1.position.set(Math.sin(time * 0.3) * 30, Math.cos(time * 0.2) * 20, Math.sin(time * 0.5) * 20);
        light2.position.set(Math.cos(time * 0.4) * 30, Math.sin(time * 0.3) * 20, Math.cos(time * 0.6) * 20);
        light3.position.set(Math.sin(time * 0.5) * 30, Math.cos(time * 0.4) * 20, Math.cos(time * 0.3) * 20);

        // Drift objects everywhere
        shapes.forEach(shape => {
            // Apply velocities
            shape.position.x += shape.userData.dx;
            shape.position.y += shape.userData.dy;
            shape.position.z += shape.userData.dz;

            // Apply rotations
            shape.rotation.x += shape.userData.rx;
            shape.rotation.y += shape.userData.ry;
            
            // Screen Wrapping Logic (if they drift out of boundary, loop to the other side)
            if (shape.position.x > boundaryX) shape.position.x = -boundaryX;
            else if (shape.position.x < -boundaryX) shape.position.x = boundaryX;
            
            if (shape.position.y > boundaryY) shape.position.y = -boundaryY;
            else if (shape.position.y < -boundaryY) shape.position.y = boundaryY;
            
            if (shape.position.z > boundaryZ) shape.position.z = -boundaryZ;
            else if (shape.position.z < -boundaryZ) shape.position.z = boundaryZ;
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
