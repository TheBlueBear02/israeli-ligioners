// Initialize variables for globe interaction
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let earthGroup;  // Use a group to handle rotations more easily
let scene, camera, renderer;
let markers = [];
const raycaster = new THREE.Raycaster(); // Create a raycaster
const mouse = new THREE.Vector2(); // Create a mouse vector for raycasting
let baseDiskSize = 0.2; // Increase the base size for the disks

// Variables for touch zoom
let initialDistance = null; // To store the initial distance between two touch points
let initialCameraZ = null; // To store the initial camera position on zoom

// Function to convert latitude/longitude to 3D position
function latLngToVector3(lat, lng, radius) {
    const phi = (90 - lat) * Math.PI / 180;
    const theta = (lng + 180) * Math.PI / 180;
    
    return new THREE.Vector3(
        -radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
    );
}

// Function to calculate age from date of birth
function calculateAge(dateOfBirth) {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    
    // Adjust age if the birthday hasn't occurred yet this year
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

// Initialize the globe
function init() {
    // Get container
    const container = document.getElementById('globe-container');
    
    // Create scene
    scene = new THREE.Scene();
    // Set the scene background to transparent
    scene.background = new THREE.Color(0x000000); // This line can be removed or set to null
    
    // Create camera
    camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 4.5; // Change the default zoom level to 5.5
    
    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);
    
    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 3, 5);
    scene.add(directionalLight);
    
    // Create a group for the earth and all its elements
    earthGroup = new THREE.Group();
    scene.add(earthGroup);
    
    // Set initial rotation of the globe (in radians)
    earthGroup.rotation.x = Math.PI / 6; // Adjust this value for the desired angle (e.g., 30 degrees)
    earthGroup.rotation.y = Math.PI /-1.5; // Adjust this value for the desired angle (e.g., 45 degrees)
    
    // Load Earth texture
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load('static/images/earth_textures/earth_texture1.jpg', function(texture) {
        // Create Earth sphere with texture
        const earthGeometry = new THREE.SphereGeometry(2, 64, 64);
        const earthMaterial = new THREE.MeshPhongMaterial({
            map: texture, // Apply the texture
            emissive: 0x000000,
            specular: 0x112233,
            shininess: 10, // Reduce shininess for less reflection
            color: 0x000000 // Change this to black
        });
        const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
        earthGroup.add(earthMesh);
    });
    
    // Add coordinate grid lines
    addCoordinateGrid();
    
    // Add country borders
    loadCountryBorders();
    
    // Add data points
    addDataPoints();
    
    // Add event listeners for interactive globe rotation
    container.addEventListener('mousedown', handleMouseDown);
    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    
    window.addEventListener('mousemove', handleMouseMove, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchend', handleTouchEnd);
    
    // Add mouse wheel event listener for zooming to the globe container
    container.addEventListener('wheel', handleMouseWheel);
    
    // Add extra event listener to handle case when mouse leaves the window
    window.addEventListener('mouseleave', handleMouseUp);
    
    // Handle window resize
    window.addEventListener('resize', handleResize);
    
    // Start animation loop
    animate();
}

// Handle mouse wheel event for zooming
function handleMouseWheel(event) {
    event.preventDefault(); // Prevent default scrolling behavior
    event.stopPropagation(); // Stop the event from propagating to the window

    const container = document.getElementById('globe-container');
    const rect = container.getBoundingClientRect(); // Get the bounding rectangle of the globe container

    // Check if the mouse is over the globe container
    if (event.clientX >= rect.left && event.clientX <= rect.right &&
        event.clientY >= rect.top && event.clientY <= rect.bottom) {
        const zoomSpeed = 0.01; // Adjust zoom speed for smaller jumps
        const minZoom = 3; // Minimum zoom level
        const maxZoom = 10; // Maximum zoom level

        // Adjust camera position based on scroll direction
        camera.position.z += event.deltaY * zoomSpeed;

        // Clamp the camera position to the defined limits
        camera.position.z = Math.max(minZoom, Math.min(maxZoom, camera.position.z));

        // Log the current zoom level
        console.log(`Current Zoom Level: ${camera.position.z}`);

        // Adjust disk sizes based on zoom level
        const zoomFactor = (camera.position.z - minZoom) / (maxZoom - minZoom);
        const newSize = baseDiskSize * (1 + zoomFactor); // Calculate new size based on zoom (reverse logic)
        markers.forEach(marker => {
            marker.geometry.dispose(); // Dispose of the old geometry
            marker.geometry = new THREE.PlaneGeometry(newSize, newSize); // Create a new geometry with the updated size
            marker.material.needsUpdate = true; // Mark material for update
        });
    }
}

// Add coordinate grid lines
function addCoordinateGrid() {
    const gridMaterial = new THREE.LineBasicMaterial({ color: 0x444444, transparent: true, opacity: 0.3 });
    
    // Latitude lines
    for (let lat = -80; lat <= 80; lat += 20) {
        const points = [];
        
        for (let lng = 0; lng <= 360; lng += 5) {
            const position = latLngToVector3(lat, lng, 2.01);
            points.push(position);
        }
        
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, gridMaterial);
        earthGroup.add(line);
    }
    
    // Longitude lines
    for (let lng = 0; lng < 360; lng += 20) {
        const points = [];
        
        for (let lat = -90; lat <= 90; lat += 5) {
            const position = latLngToVector3(lat, lng, 1.01);
            points.push(position);
        }
        
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, gridMaterial);
        earthGroup.add(line);
    }
}

// Load and add country borders
function loadCountryBorders() {
    const loader = new THREE.FileLoader();
    
    // Load TopoJSON data for country boundaries
    loader.load(
        'https://unpkg.com/world-atlas@2/countries-110m.json', 
        function(data) {
            try {
                const topoJson = JSON.parse(data);
                // Convert TopoJSON to GeoJSON
                const geoJson = topojson.feature(topoJson, topoJson.objects.countries);
                
                // Check if features exist
                if (geoJson.features && Array.isArray(geoJson.features)) {
                    drawCountryBorders(geoJson);
                } else {
                    console.error("GeoJSON does not contain features array:", geoJson);
                }
            } catch (error) {
                console.error("Error parsing TopoJSON data:", error);
            }
        },
        function(xhr) {
            // Optional: Progress logging can be added here if needed
        },
        function(error) {
            console.error("Error loading TopoJSON data:", error);
        }
    );
}

// Function to draw country borders from GeoJSON
function drawCountryBorders(geoJson) {
    const features = geoJson.features;
    
    // Create a material for the country borders
    const borderMaterial = new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: false,
        opacity: .1,
        linewidth: .1
    });
    
    let bordersAdded = 0;
    
    // Process each country
    features.forEach(feature => {
        const coordinates = feature.geometry.coordinates;
        
        // Handle different geometry types (Polygon or MultiPolygon)
        if (feature.geometry.type === 'Polygon') {
            drawPolygon(coordinates[0], borderMaterial);
            bordersAdded++;
        } else if (feature.geometry.type === 'MultiPolygon') {
            coordinates.forEach(polygon => {
                drawPolygon(polygon[0], borderMaterial);
                bordersAdded++;
            });
        }
    });
}

// Function to draw a single polygon
function drawPolygon(coordinates, material) {
    if (!coordinates || coordinates.length < 3) {
        console.warn("Invalid polygon coordinates:", coordinates);
        return;
    }
    
    const points = [];
    
    // Convert each point to 3D position
    coordinates.forEach(coord => {
        if (Array.isArray(coord) && coord.length >= 2) {
            // GeoJSON uses [longitude, latitude] format
            const position = latLngToVector3(coord[1], coord[0], 2.03);
            points.push(position);
        }
    });
    
    if (points.length < 3) {
        console.warn("Not enough valid points to draw polygon");
        return;
    }
    
    // Create line geometry and add to the globe
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geometry, material);
    earthGroup.add(line);
}

// Function to fetch player data from the backend
async function fetchPlayerData() {
    try {
        const response = await fetch('/players');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const players = await response.json();
        return players;
    } catch (error) {
        console.error('Error fetching player data:', error);
        return [];
    }
}

// Add data point markers
async function addDataPoints() {
    const players = await fetchPlayerData(); // Fetch player data

    players.forEach(player => {
        // Define minimum and maximum distances from the globe
        const minDistance = 2.3; // Minimum distance from the globe
        const maxDistance = 2.9; // Maximum distance from the globe

        // Generate a random distance within the specified range
        const randomDistance = Math.random() * (maxDistance - minDistance) + minDistance;

        // Calculate position on the globe using the random distance
        const basePosition = latLngToVector3(player.lat, player.lng, randomDistance); 
        
        // Define a vertical offset range
        const verticalOffset = Math.random() * 0.2 - 0.1; // Random offset between -0.1 and 0.1

        // Apply the vertical offset to the Y-coordinate
        const position = new THREE.Vector3(basePosition.x, basePosition.y + verticalOffset, basePosition.z);
        
        // Create a smaller disk geometry for circular appearance
        const size = baseDiskSize; // Use base size for the disks
        const diskGeometry = new THREE.PlaneGeometry(size, size); // Create a flat disk
        
        // Load the player's image as a texture
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(
            player.image, // Assuming player.image contains the URL to the player's image
            function(texture) {
                // Create a circular texture material
                const diskMaterial = new THREE.MeshBasicMaterial({ 
                    map: texture, 
                    side: THREE.DoubleSide, 
                    transparent: true // Allow transparency for circular effect
                }); 
                const disk = new THREE.Mesh(diskGeometry, diskMaterial);
                
                // Store data with the disk
                disk.userData = player; // Store the entire player data
                
                // Set position
                disk.position.copy(position);
                
                // Make the disk face the camera
                disk.lookAt(camera.position); // Make the disk face the camera
                
                // Add disk to the earth group
                earthGroup.add(disk);
                
                // Store reference to disk
                markers.push(disk);

                // Draw line from the globe point to the player image
                const globePosition = latLngToVector3(player.lat, player.lng, 2.01); // Position on the globe
                const lineMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 }); // Line color
                const points = [globePosition, position]; // Start and end points of the line
                const geometry = new THREE.BufferGeometry().setFromPoints(points);
                const line = new THREE.Line(geometry, lineMaterial);
                earthGroup.add(line); // Add line to the earth group
            },
            undefined, // onProgress callback
            function(error) {
                console.error('Error loading texture for player:', player.name, error);
            }
        );

        // Fetch next games for the player
        fetchNextGames(player.team); // Assuming player_number is the ID for the team
    });
}

async function fetchNextGames(teamName) {
    try {
        const response = await fetch(`/next_games/${teamName}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const gamesData = await response.json();
        
        // Log the gamesData to inspect its structure
        console.log('Fetched Next Games Data:', gamesData);
        
        // Display the next games
        displayNextGames(gamesData);
    } catch (error) {
        console.error('Error fetching next games:', error);
    }
}

function displayNextGames(gamesData) {
    const gamesList = document.getElementById('games-list');
    gamesList.innerHTML = ''; // Clear previous games

    // Check if gamesData has the expected structure
    if (gamesData && gamesData.next_games && Array.isArray(gamesData.next_games)) {
        gamesData.next_games.forEach(game => {
            // Ensure game has the expected properties
            if (game.league && game.home_team && game.away_team && game.date) {
                const date = new Date(game.date).toLocaleString(); // Format date

                // Create a new list item with better structure
                const listItem = document.createElement('div');
                listItem.classList.add('game-item'); // Add a class for styling

                // Create elements for better structure
                const leagueElement = document.createElement('div');
                leagueElement.classList.add('game-league');
                leagueElement.textContent = game.league;

                const teamsElement = document.createElement('div');
                teamsElement.classList.add('game-teams');

                // Create image elements for teams
                const homeImage = document.createElement('img');
                homeImage.src = game.home_image;
                homeImage.alt = `${game.home_team} logo`;
                homeImage.classList.add('team-image');

                const awayImage = document.createElement('img');
                awayImage.src = game.away_image;
                awayImage.alt = `${game.away_team} logo`;
                awayImage.classList.add('team-image');

                teamsElement.appendChild(homeImage);
                teamsElement.appendChild(document.createTextNode(` ${game.home_team} vs ${game.away_team} `));
                teamsElement.appendChild(awayImage);

                const dateElement = document.createElement('div');
                dateElement.classList.add('game-date');
                dateElement.textContent = date;

                // Append elements to the list item
                listItem.appendChild(leagueElement);
                listItem.appendChild(teamsElement);
                listItem.appendChild(dateElement);

                // Append the list item to the games list
                gamesList.appendChild(listItem);
            } else {
                console.warn('Game data is missing expected properties:', game);
            }
        });
    } else {
        const listItem = document.createElement('div');
        listItem.textContent = 'No upcoming games found.';
        gamesList.appendChild(listItem);
    }
}

// Mouse down event handler
function handleMouseDown(e) {
    e.preventDefault();
    isDragging = true;
    previousMousePosition = {
        x: e.clientX || e.pageX,
        y: e.clientY || e.pageY
    };
}

// Mouse move event handler
function handleMouseMove(e) {
    if (isDragging) {
        // Existing code for globe rotation
        e.preventDefault();
        const currentPosition = {
            x: e.clientX || e.pageX,
            y: e.clientY || e.pageY
        };
        
        const deltaMove = {
            x: currentPosition.x - previousMousePosition.x,
            y: currentPosition.y - previousMousePosition.y
        };
        
        // Rotate the globe based on mouse movement
        const rotationSpeed = 0.005;
        earthGroup.rotation.y += deltaMove.x * rotationSpeed;
        earthGroup.rotation.x += deltaMove.y * rotationSpeed;
        
        previousMousePosition = currentPosition;
    } else {
        // Update mouse position for raycasting
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

        // Update the raycaster with the camera and mouse position
        raycaster.setFromCamera(mouse, camera);

        // Calculate objects intersecting the picking ray
        const intersects = raycaster.intersectObjects(markers);

        // Tooltip handling
        const tooltip = document.getElementById('tooltip');
        const container = document.getElementById('globe-container'); // Get the globe container
        if (intersects.length > 0) {
            const player = intersects[0].object.userData; // Get player data from the intersected object
            const age = calculateAge(player.date_of_birth); // Calculate age
            tooltip.innerHTML = `
                <div class="player-name">${player.name} <span class="player-number">#${player.player_number}</span></div>
                <div>Age: ${age}</div>
                <div>Team: ${player.team}</div>
                <div>${player.city}, ${player.country}</div>
            `;
            tooltip.style.display = 'block';

            // Calculate the position of the tooltip based on the marker's position
            const markerPosition = intersects[0].point; // Get the position of the intersected marker

            // Convert marker position to screen coordinates
            const vector = markerPosition.project(camera);
            const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
            const y = (-(vector.y * 0.5) + 0.5) * window.innerHeight;

            // Adjust the tooltip position based on the camera's zoom level
            const zoomFactor = camera.position.z / 5; // Assuming 5 is the base zoom level
            const tooltipOffsetX = 10; // Horizontal offset for better visibility
            const tooltipOffsetY = 30; // Vertical offset for better visibility

            tooltip.style.left = `${x + tooltipOffsetX}px`; // Adjust horizontal position
            tooltip.style.top = `${y - tooltip.offsetHeight - tooltipOffsetY}px`; // Adjust vertical position
            
            // Change cursor to pointer
            container.style.cursor = 'pointer';
        } else {
            tooltip.style.display = 'none'; // Hide tooltip if not hovering over a disk
            // Reset cursor to grab when hovering over the globe
            container.style.cursor = 'grab';
        }
    }
}

// Mouse up event handler
function handleMouseUp(e) {
    isDragging = false; // Reset dragging state
    const container = document.getElementById('globe-container'); // Get the globe container
    container.style.cursor = 'default'; // Reset cursor to default when mouse is released
}

// Touch start handler for mobile
function handleTouchStart(e) {
    e.preventDefault();  // Prevent default to avoid scrolling
    if (e.touches.length === 1) {
        isDragging = true;
        previousMousePosition = {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY
        };
    } else if (e.touches.length === 2) {
        // Store the initial distance between the two touch points
        initialDistance = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
        );
        initialCameraZ = camera.position.z; // Store the initial camera position
    }
}

// Touch end handler for mobile
function handleTouchEnd(e) {
    isDragging = false; // Reset dragging state
}

// Touch move handler for mobile
function handleTouchMove(e) {
    if (isDragging && e.touches.length === 1) {
        e.preventDefault();  // Prevent default to avoid scrolling
        const currentPosition = {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY
        };
        
        const deltaMove = {
            x: currentPosition.x - previousMousePosition.x,
            y: currentPosition.y - previousMousePosition.y
        };
        
        // Rotate the globe based on touch movement
        const rotationSpeed = 0.003;
        earthGroup.rotation.y += deltaMove.x * rotationSpeed;
        earthGroup.rotation.x += deltaMove.y * rotationSpeed;
        
        previousMousePosition = currentPosition;
    } else if (e.touches.length === 2) {
        // Calculate the new distance between the two touch points
        const newDistance = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
        );

        // Calculate the zoom factor based on the distance change
        const zoomFactor = initialDistance / newDistance; // Reverse the zoom factor

        // Adjust the camera position based on the zoom factor
        camera.position.z = initialCameraZ * zoomFactor;

        // Clamp the camera position to the defined limits
        const minZoom = 4; // Minimum zoom level
        const maxZoom = 6; // Maximum zoom level
        camera.position.z = Math.max(minZoom, Math.min(maxZoom, camera.position.z));
    }
}

// Handle window resize
function handleResize() {
    const container = document.getElementById('globe-container');
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    // Slow automatic rotation when not dragging
    if (!isDragging) {
        earthGroup.rotation.y += 0.001;
    }
    
    // Update orientation of circles to face the camera
    markers.forEach(marker => {
        marker.lookAt(camera.position);
    });
    
    renderer.render(scene, camera);
}

// Initialize the application
window.addEventListener('load', init);