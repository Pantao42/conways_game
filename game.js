class GameOfLife {
    constructor(canvas, cellSize = 10) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.cellSize = cellSize;
        this.updateGridSize();
        this.grid = this.createGrid();
        this.isRunning = false;
        this.intervalId = null;
        this.speed = 100; // Standardgeschwindigkeit in Millisekunden

        // Event-Listener für Mausklicks
        this.canvas.addEventListener('click', (event) => this.handleClick(event));
    }

    updateGridSize() {
        this.cols = Math.floor(this.canvas.width / this.cellSize);
        this.rows = Math.floor(this.canvas.height / this.cellSize);
    }

    resize(width, height) {
        // Stoppe die Simulation, falls sie läuft
        this.stop();
        
        // Speichere das aktuelle Grid
        const oldGrid = this.grid;
        const oldCols = this.cols;
        const oldRows = this.rows;

        // Aktualisiere Canvas-Größe
        this.canvas.width = width;
        this.canvas.height = height;
        this.updateGridSize();

        // Erstelle neues Grid
        this.grid = this.createGrid();

        // Kopiere alte Daten in das neue Grid, soweit möglich
        const minRows = Math.min(oldRows, this.rows);
        const minCols = Math.min(oldCols, this.cols);
        
        for (let row = 0; row < minRows; row++) {
            for (let col = 0; col < minCols; col++) {
                this.grid[row][col] = oldGrid[row][col];
            }
        }

        this.draw();
    }

    createGrid() {
        return Array(this.rows).fill().map(() => Array(this.cols).fill(false));
    }

    handleClick(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const col = Math.floor(x / this.cellSize);
        const row = Math.floor(y / this.cellSize);
        
        if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
            this.grid[row][col] = !this.grid[row][col];
            this.draw();
        }
    }

    randomize() {
        this.grid = this.grid.map(row => 
            row.map(() => Math.random() > 0.7)
        );
        this.draw();
    }

    clear() {
        this.grid = this.createGrid();
        this.draw();
    }

    countNeighbors(row, col) {
        let count = 0;
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) continue;
                const newRow = (row + i + this.rows) % this.rows;
                const newCol = (col + j + this.cols) % this.cols;
                if (this.grid[newRow][newCol]) count++;
            }
        }
        return count;
    }

    nextGeneration() {
        const newGrid = this.createGrid();
        
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const neighbors = this.countNeighbors(row, col);
                const cell = this.grid[row][col];

                if (cell && (neighbors === 2 || neighbors === 3)) {
                    newGrid[row][col] = true;
                } else if (!cell && neighbors === 3) {
                    newGrid[row][col] = true;
                }
            }
        }

        this.grid = newGrid;
        this.draw();
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.grid[row][col]) {
                    this.ctx.fillStyle = '#000';
                    this.ctx.fillRect(
                        col * this.cellSize,
                        row * this.cellSize,
                        this.cellSize - 1,
                        this.cellSize - 1
                    );
                }
            }
        }
    }

    setSpeed(speed) {
        this.speed = speed;
        if (this.isRunning) {
            this.stop();
            this.start();
        }
    }

    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.intervalId = setInterval(() => this.nextGeneration(), this.speed);
        }
    }

    stop() {
        if (this.isRunning) {
            this.isRunning = false;
            clearInterval(this.intervalId);
        }
    }
}

// Initialisierung
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const game = new GameOfLife(canvas);
    
    // Größenänderung
    document.getElementById('applySize').addEventListener('click', () => {
        const width = document.getElementById('gridWidth').value * game.cellSize;
        const height = document.getElementById('gridHeight').value * game.cellSize;
        game.resize(width, height);
    });

    // Geschwindigkeitssteuerung
    document.getElementById('speedControl').addEventListener('input', (e) => {
        const speed = 1000 - e.target.value; // Invertiere den Wert, damit höher = schneller
        game.setSpeed(speed);
    });

    // Spielsteuerung
    document.getElementById('startBtn').addEventListener('click', () => game.start());
    document.getElementById('stopBtn').addEventListener('click', () => game.stop());
    document.getElementById('clearBtn').addEventListener('click', () => game.clear());
    document.getElementById('randomBtn').addEventListener('click', () => game.randomize());

    // Initial zeichnen
    game.draw();
}); 