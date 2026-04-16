// 3D Animated Background using Three.js
const init3DBackground = () => {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050a1f); // Deep navy blue/black

    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 15;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Objects
    const shapes = [];
    const materialParams = {
        color: 0x00d2ff, // Neon cyan
        wireframe: true,
        transparent: true,
        opacity: 0.5
    };
    
    const solidMaterialParams = {
        color: 0x3b82f6,
        transparent: true,
        opacity: 0.8,
        roughness: 0.2,
        metalness: 0.8
    };

    // Add some random floating geometries
    const geometries = [
        new THREE.IcosahedronGeometry(2, 0),
        new THREE.OctahedronGeometry(1.5, 0),
        new THREE.TetrahedronGeometry(2, 0),
        new THREE.TorusGeometry(1.5, 0.4, 16, 100)
    ];

    const wireframeMaterial = new THREE.MeshBasicMaterial(materialParams);
    const solidMaterial = new THREE.MeshStandardMaterial(solidMaterialParams);

    for (let i = 0; i < 20; i++) {
        const isWireframe = Math.random() > 0.5;
        const geom = geometries[Math.floor(Math.random() * geometries.length)];
        const mesh = new THREE.Mesh(geom, isWireframe ? wireframeMaterial : solidMaterial);
        
        // Random positioning
        mesh.position.x = (Math.random() - 0.5) * 40;
        mesh.position.y = (Math.random() - 0.5) * 30;
        mesh.position.z = (Math.random() - 0.5) * 20 - 5;
        
        // Random rotation
        mesh.rotation.x = Math.random() * Math.PI;
        mesh.rotation.y = Math.random() * Math.PI;

        // Velocity for animation
        mesh.userData = {
            rx: (Math.random() - 0.5) * 0.01,
            ry: (Math.random() - 0.5) * 0.01,
            px: (Math.random() - 0.5) * 0.02,
            py: (Math.random() - 0.5) * 0.02,
        };

        shapes.push(mesh);
        scene.add(mesh);
    }

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040); // Soft white light
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x00d2ff, 2, 100);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);
    
    const pointLight2 = new THREE.PointLight(0x3b82f6, 2, 100);
    pointLight2.position.set(-5, -5, 5);
    scene.add(pointLight2);

    // Animation Loop
    const animate = function () {
        requestAnimationFrame(animate);

        shapes.forEach(shape => {
            shape.rotation.x += shape.userData.rx;
            shape.rotation.y += shape.userData.ry;
            
            shape.position.x += shape.userData.px;
            shape.position.y += shape.userData.py;
            
            // Boundary wrap around
            if (shape.position.x > 20) shape.position.x = -20;
            if (shape.position.x < -20) shape.position.x = 20;
            if (shape.position.y > 15) shape.position.y = -15;
            if (shape.position.y < -15) shape.position.y = 15;
        });

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
