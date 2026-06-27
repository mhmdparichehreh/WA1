// server/game-engine.js

// Helper function to generate a random integer between min and max (inclusive)
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Checks if a ship can be safely placed at the target coordinates
const canPlaceShip = (grid, size, row, col, isVertical, gridSize) => {
    // 1. Check if the ship goes out of bounds
    if (isVertical && row + size > gridSize) return false;
    if (!isVertical && col + size > gridSize) return false;

    // 2. Check for overlapping and adjacency (including diagonals)
    // We check from row-1 to row+size (or row+1) to ensure the 1-cell water gap
    const startRow = Math.max(0, row - 1);
    const endRow = Math.min(gridSize - 1, isVertical ? row + size : row + 1);
    const startCol = Math.max(0, col - 1);
    const endCol = Math.min(gridSize - 1, isVertical ? col + 1 : col + size);

    for (let r = startRow; r <= endRow; r++) {
        for (let c = startCol; c <= endCol; c++) {
            if (grid[r][c] !== null) {
                return false; // Found another ship nearby!
            }
        }
    }
    return true;
};

// Generates an empty grid and places all requested ships
export const generateGameGrid = (gridSize, shipsConfig) => {
    // Initialize an empty NxN grid with null
    const grid = Array.from({ length: gridSize }, () => Array(gridSize).fill(null));
    const ships = [];

    // Loop through each ship size we need to place
    for (let i = 0; i < shipsConfig.length; i++) {
        const shipSize = shipsConfig[i];
        let placed = false;
        let attempts = 0;

        while (!placed && attempts < 1000) {
            attempts++;
            const isVertical = Math.random() < 0.5;
            const row = getRandomInt(0, gridSize - 1);
            const col = getRandomInt(0, gridSize - 1);

            if (canPlaceShip(grid, shipSize, row, col, isVertical, gridSize)) {
                const shipCells = [];
                
                // Place the ship on the grid
                for (let j = 0; j < shipSize; j++) {
                    const r = isVertical ? row + j : row;
                    const c = isVertical ? col : col + j;
                    grid[r][c] = i; // Store the ship ID (its index) in the grid
                    shipCells.push({ row: r, col: c });
                }
                
                ships.push({
                    id: i,
                    size: shipSize,
                    sunk: false,
                    hits: 0,
                    cells: shipCells
                });
                placed = true;
            }
        }

        if (!placed) {
            throw new Error('Could not place all ships. Grid might be too crowded.');
        }
    }

    return { grid, ships };
};

// Exam configurations for difficulties
export const getDifficultyConfig = (difficulty) => {
    switch (difficulty) {
        case 'Easy':
            // 8x8 grid provides plenty of space for these ships
            return { gridSize: 8, ships: [4, 3, 2, 2], maxTorpedoes: 35 };
        case 'Intermediate':
            // 10x10 grid is standard Battleship size
            return { gridSize: 10, ships: [5, 4, 3, 3, 2, 2, 2], maxTorpedoes: 55 };
        case 'Hard':
            // 12x12 grid for the largest fleet
            return { gridSize: 12, ships: [5, 5, 4, 4, 3, 3, 3, 2, 2, 2], maxTorpedoes: 80 };
        default:
            return { gridSize: 8, ships: [4, 3, 2, 2], maxTorpedoes: 35 }; 
    }
};