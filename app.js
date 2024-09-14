const ROWS = 20;
const COLS = 20;
let grid = [];
let startNode = { row: 0, col: 0 };
let endNode = { row: ROWS - 1, col: COLS - 1 };
let isRunning = false;
let isMousePressed = false;
let currentAlgorithm = ""; // Track the current algorithm to color paths accordingly

function createGrid() {
    const gridElement = document.getElementById("grid");
    gridElement.innerHTML = "";
    gridElement.style.gridTemplateColumns = `repeat(${COLS}, 1fr)`;
    grid = [];

    for (let row = 0; row < ROWS; row++) {
        const currentRow = [];
        for (let col = 0; col < COLS; col++) {
            const cell = document.createElement("div");
            cell.className = "cell";
            cell.dataset.row = row;
            cell.dataset.col = col;

            cell.addEventListener("mousedown", () => handleMouseDown(row, col));
            cell.addEventListener("mouseenter", () => handleMouseEnter(row, col));
            cell.addEventListener("mouseup", handleMouseUp);

            gridElement.appendChild(cell);
            currentRow.push({
                row: row,
                col: col,
                isStart: row === startNode.row && col === startNode.col,
                isEnd: row === endNode.row && col === endNode.col,
                isVisited: false,
                isObstacle: false,
                previousNode: null,
                distance: Infinity,
                heuristic: Infinity,
                isPath: false,
            });
        }
        grid.push(currentRow);
    }
    grid[startNode.row][startNode.col].isStart = true;
    grid[endNode.row][endNode.col].isEnd = true;
    updateGridUI();
}

function updateGridUI() {
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
            const node = grid[row][col];
            cell.className = "cell";
            if (node.isStart) cell.classList.add("start");
            if (node.isEnd) cell.classList.add("end");
            if (node.isVisited) cell.classList.add("visited");
            if (node.isObstacle) cell.classList.add("obstacle");
            if (node.isPath) {
                switch (currentAlgorithm) {
                    case 'dijkstra':
                        cell.classList.add("path-dijkstra");
                        break;
                    case 'aStar':
                        cell.classList.add("path-astar");
                        break;
                    case 'bfs':
                        cell.classList.add("path-bfs");
                        break;
                    case 'dfs':
                        cell.classList.add("path-dfs");
                        break;
                    default:
                        cell.classList.add("path");
                }
            }
        }
    }
}

function handleMouseDown(row, col) {
    if (isRunning) return;
    const node = grid[row][col];
    if (!node.isStart && !node.isEnd) {
        node.isObstacle = !node.isObstacle;
        updateGridUI();
    }
    isMousePressed = true;
}

function handleMouseEnter(row, col) {
    if (isMousePressed && !grid[row][col].isStart && !grid[row][col].isEnd) {
        grid[row][col].isObstacle = !grid[row][col].isObstacle;
        updateGridUI();
    }
}

function handleMouseUp() {
    isMousePressed = false;
}

function clearGrid() {
    isRunning = false;
    grid = [];
    createGrid(); // Reinitialize the grid
    
    // Reset all node properties
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const node = grid[row][col];
            node.isVisited = false;
            node.isPath = false;
            node.distance = Infinity;
            node.heuristic = Infinity;
            node.previousNode = null;
            // If you have other properties that need resetting, do so here
        }
    }
    updateGridUI();
}


function visualizeAlgorithm(algorithm) {
    if (isRunning) return;
    isRunning = true;
    currentAlgorithm = algorithm; // Set the current algorithm for path coloring

    let visitedNodesInOrder;
    switch (algorithm) {
        case "dijkstra":
            visitedNodesInOrder = runDijkstra(grid, startNode, endNode);
            break;
        case "aStar":
            visitedNodesInOrder = runAStar(grid, startNode, endNode);
            break;
        case "bfs":
            visitedNodesInOrder = runBFS(grid, startNode, endNode);
            break;
        case "dfs":
            visitedNodesInOrder = runDFS(grid, startNode, endNode);
            break;
        default:
            break;
    }
    const pathNodes = getPathNodes();
    animateAlgorithm(visitedNodesInOrder, pathNodes);
}

function animateAlgorithm(visitedNodesInOrder, pathNodes) {
    for (let i = 0; i <= visitedNodesInOrder.length; i++) {
        if (i === visitedNodesInOrder.length) {
            // After all nodes are visited, animate the path
            setTimeout(() => {
                animatePath(pathNodes);
            }, 20 * i);  // Slower spread effect
            return;
        }
        setTimeout(() => {
            const node = visitedNodesInOrder[i];
            node.isVisited = true;
            updateGridUI();  // Update UI to show visited node
        }, 20 * i);  // Slow down the search animation
    }
}

function animatePath(pathNodes) {
    for (let i = 0; i < pathNodes.length; i++) {
        setTimeout(() => {
            const node = pathNodes[i];
            node.isPath = true;
            updateGridUI();  // Highlight the path
        }, 20 * i);  // Slower path animation
    }
}



function getPathNodes() {
    const pathNodes = [];
    let currentNode = grid[endNode.row][endNode.col];
    while (currentNode !== null && currentNode.previousNode !== null) {
        pathNodes.unshift(currentNode);
        currentNode = currentNode.previousNode;
    }
    return pathNodes;
}

/* Algorithms */

// Dijkstra's Algorithm
function runDijkstra(grid, startNode, endNode) {
    const visitedNodesInOrder = [];
    const start = grid[startNode.row][startNode.col];
    start.distance = 0;
    const unvisitedNodes = [].concat(...grid);
    
    while (unvisitedNodes.length) {
        unvisitedNodes.sort((a, b) => a.distance - b.distance);
        const closestNode = unvisitedNodes.shift();
        
        if (closestNode.distance === Infinity) {
            showNoPathPopup();
            break;
        }
        if (closestNode.isObstacle) continue;
        
        closestNode.isVisited = true;
        visitedNodesInOrder.push(closestNode);
        
        if (closestNode === grid[endNode.row][endNode.col]) {
            return visitedNodesInOrder;
        }
        
        updateUnvisitedNeighbors(closestNode, grid);
    }
    
    showNoPathPopup();
    return visitedNodesInOrder;
}


// A* Algorithm (Fixed)
// Corrected A* Algorithm Implementation
function runAStar(grid, startNode, endNode) {
    const visitedNodesInOrder = [];
    const start = grid[startNode.row][startNode.col];
    const end = grid[endNode.row][endNode.col];
    
    // Initialize start node
    start.distance = 0;
    start.heuristic = getHeuristic(start, end);
    
    // Create a copy of all nodes to serve as the open list
    const openList = [].concat(...grid);
    
    while (openList.length) {
        // Sort the open list based on f = g + h
        openList.sort((a, b) => (a.distance + a.heuristic) - (b.distance + b.heuristic));
        const currentNode = openList.shift(); // Node with the smallest f value
        
        // Skip if the node is an obstacle
        if (currentNode.isObstacle) continue;
        
        // If the node's distance is Infinity, there's no path
        if (currentNode.distance === Infinity) {
            showNoPathPopup();
            return visitedNodesInOrder;
        }

        currentNode.isVisited = true;
        visitedNodesInOrder.push(currentNode);
        
        // If the end node is reached, terminate the search
        if (currentNode === end) return visitedNodesInOrder;
        
        // Explore neighbors
        const neighbors = getNeighbors(currentNode, grid);
        for (const neighbor of neighbors) {
            if (!neighbor.isVisited && !neighbor.isObstacle) {
                const tentativeG = currentNode.distance + 1; // Assuming uniform cost
                
                // If a shorter path to the neighbor is found
                if (tentativeG < neighbor.distance) {
                    neighbor.distance = tentativeG;
                    neighbor.heuristic = getHeuristic(neighbor, end);
                    neighbor.previousNode = currentNode;
                }
            }
        }
    }

    // If the loop completes without finding the end node
    showNoPathPopup();
    return visitedNodesInOrder;
}


// BFS Algorithm
function runBFS(grid, startNode, endNode) {
    const visitedNodesInOrder = [];
    const queue = [];
    const start = grid[startNode.row][startNode.col];
    
    queue.push(start);
    start.isVisited = true;
    
    while (queue.length) {
        const node = queue.shift();
        visitedNodesInOrder.push(node);
        
        if (node === grid[endNode.row][endNode.col]) {
            return visitedNodesInOrder;
        }
        
        const neighbors = getNeighbors(node, grid);
        for (const neighbor of neighbors) {
            if (!neighbor.isVisited && !neighbor.isObstacle) {
                neighbor.isVisited = true;
                neighbor.previousNode = node;
                queue.push(neighbor);
            }
        }
    }
    
    showNoPathPopup();
    return visitedNodesInOrder;
}


// DFS Algorithm
function runDFS(grid, startNode, endNode) {
    const visitedNodesInOrder = [];
    const stack = [];
    const start = grid[startNode.row][startNode.col];
    
    stack.push(start);
    start.isVisited = true;
    
    while (stack.length) {
        const node = stack.pop();
        visitedNodesInOrder.push(node);
        
        if (node === grid[endNode.row][endNode.col]) {
            return visitedNodesInOrder;
        }
        
        const neighbors = getNeighbors(node, grid);
        for (const neighbor of neighbors) {
            if (!neighbor.isVisited && !neighbor.isObstacle) {
                neighbor.isVisited = true;
                neighbor.previousNode = node;
                stack.push(neighbor);
            }
        }
    }

    showNoPathPopup();
    return visitedNodesInOrder;
}


function updateUnvisitedNeighbors(node, grid) {
    const neighbors = getNeighbors(node, grid);
    for (const neighbor of neighbors) {
        if (!neighbor.isVisited && !neighbor.isObstacle) {
            neighbor.distance = node.distance + 1;
            neighbor.previousNode = node;
        }
    }
}

function getNeighbors(node, grid) {
    const neighbors = [];
    const { row, col } = node;
    if (row > 0) neighbors.push(grid[row - 1][col]);
    if (row < ROWS - 1) neighbors.push(grid[row + 1][col]);
    if (col > 0) neighbors.push(grid[row][col - 1]);
    if (col < COLS - 1) neighbors.push(grid[row][col + 1]);
    return neighbors;
}

function getHeuristic(nodeA, nodeB) {
    return Math.abs(nodeA.row - nodeB.row) + Math.abs(nodeA.col - nodeB.col);
}

// Maze Generation
function generateRandomMaze() {
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            if (Math.random() < 0.3 && !grid[row][col].isStart && !grid[row][col].isEnd) {
                grid[row][col].isObstacle = true;
            } else {
                grid[row][col].isObstacle = false;
            }
        }
    }
    updateGridUI();
}

// Function to display a popup when no path is found
function showNoPathPopup() {
    setTimeout(() => {
        alert("No path could be found between the start and end nodes. Please try again!");
    }, 10); // Slight delay to ensure alert happens after visualization
}

// Initialize the grid
createGrid();
