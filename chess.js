// Chess Game Implementation
class ChessGame {
    constructor() {
        this.board = this.initializeBoard();
        this.currentPlayer = 'white';
        this.selectedSquare = null;
        this.moveHistory = [];
        this.initializeDisplay();
    }

    initializeBoard() {
        const board = Array(8).fill(null).map(() => Array(8).fill(null));
        
        // Place white pieces
        board[7] = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'];
        board[6] = Array(8).fill('p');
        
        // Place black pieces
        board[0] = ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'];
        board[1] = Array(8).fill('P');
        
        return board;
    }

    initializeDisplay() {
        const chessboard = document.getElementById('chessboard');
        chessboard.innerHTML = '';
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                square.className = 'square';
                square.dataset.row = row;
                square.dataset.col = col;
                
                const piece = this.board[row][col];
                if (piece) {
                    square.textContent = this.getPieceSymbol(piece);
                }
                
                square.addEventListener('click', () => this.handleSquareClick(row, col));
                chessboard.appendChild(square);
            }
        }
        
        this.updateGameStatus();
    }

    getPieceSymbol(piece) {
        const symbols = {
            'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟',
            'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙'
        };
        return symbols[piece] || '';
    }

    handleSquareClick(row, col) {
        if (this.selectedSquare === null) {
            // Select a piece
            const piece = this.board[row][col];
            if (piece && this.isPlayerPiece(piece)) {
                this.selectedSquare = { row, col };
                this.highlightSquare(row, col);
            }
        } else {
            // Try to move the piece
            if (this.selectedSquare.row === row && this.selectedSquare.col === col) {
                this.selectedSquare = null;
                this.initializeDisplay();
            } else {
                this.movePiece(this.selectedSquare.row, this.selectedSquare.col, row, col);
                this.selectedSquare = null;
            }
        }
    }

    isPlayerPiece(piece) {
        if (this.currentPlayer === 'white') {
            return piece === piece.toLowerCase();
        } else {
            return piece === piece.toUpperCase();
        }
    }

    movePiece(fromRow, fromCol, toRow, toCol) {
        const piece = this.board[fromRow][fromCol];
        
        // For now, allow any move (simplified chess)
        if (this.isValidMove(piece, fromRow, fromCol, toRow, toCol)) {
            this.moveHistory.push({
                piece,
                from: { row: fromRow, col: fromCol },
                to: { row: toRow, col: toCol },
                captured: this.board[toRow][toCol]
            });
            
            this.board[toRow][toCol] = piece;
            this.board[fromRow][fromCol] = null;
            
            this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
            this.initializeDisplay();
        } else {
            this.initializeDisplay();
        }
    }

    isValidMove(piece, fromRow, fromCol, toRow, toCol) {
        // Basic move validation
        const samePiece = this.board[toRow][toCol];
        
        // Can't capture your own piece
        if (samePiece) {
            const isWhitePiece = samePiece === samePiece.toLowerCase();
            const movingWhite = piece === piece.toLowerCase();
            if (isWhitePiece === movingWhite) return false;
        }
        
        // Check piece-specific moves
        const pieceLower = piece.toLowerCase();
        
        switch (pieceLower) {
            case 'p': // Pawn
                return this.isValidPawnMove(piece, fromRow, fromCol, toRow, toCol);
            case 'n': // Knight
                return this.isValidKnightMove(fromRow, fromCol, toRow, toCol);
            case 'b': // Bishop
                return this.isValidBishopMove(fromRow, fromCol, toRow, toCol);
            case 'r': // Rook
                return this.isValidRookMove(fromRow, fromCol, toRow, toCol);
            case 'q': // Queen
                return this.isValidQueenMove(fromRow, fromCol, toRow, toCol);
            case 'k': // King
                return this.isValidKingMove(fromRow, fromCol, toRow, toCol);
            default:
                return false;
        }
    }

    isValidPawnMove(piece, fromRow, fromCol, toRow, toCol) {
        const isWhite = piece === piece.toLowerCase();
        const direction = isWhite ? -1 : 1;
        const startRow = isWhite ? 6 : 1;
        
        // Move forward
        if (fromCol === toCol && this.board[toRow][toCol] === null) {
            if (toRow === fromRow + direction) return true;
            if (fromRow === startRow && toRow === fromRow + 2 * direction) {
                return this.board[fromRow + direction][fromCol] === null;
            }
        }
        
        // Capture diagonally
        if (Math.abs(toCol - fromCol) === 1 && toRow === fromRow + direction) {
            return this.board[toRow][toCol] !== null;
        }
        
        return false;
    }

    isValidKnightMove(fromRow, fromCol, toRow, toCol) {
        const rowDiff = Math.abs(toRow - fromRow);
        const colDiff = Math.abs(toCol - fromCol);
        return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
    }

    isValidBishopMove(fromRow, fromCol, toRow, toCol) {
        const rowDiff = Math.abs(toRow - fromRow);
        const colDiff = Math.abs(toCol - fromCol);
        
        if (rowDiff !== colDiff) return false;
        
        return this.isPathClear(fromRow, fromCol, toRow, toCol);
    }

    isValidRookMove(fromRow, fromCol, toRow, toCol) {
        if (fromRow !== toRow && fromCol !== toCol) return false;
        
        return this.isPathClear(fromRow, fromCol, toRow, toCol);
    }

    isValidQueenMove(fromRow, fromCol, toRow, toCol) {
        return this.isValidRookMove(fromRow, fromCol, toRow, toCol) ||
               this.isValidBishopMove(fromRow, fromCol, toRow, toCol);
    }

    isValidKingMove(fromRow, fromCol, toRow, toCol) {
        const rowDiff = Math.abs(toRow - fromRow);
        const colDiff = Math.abs(toCol - fromCol);
        return rowDiff <= 1 && colDiff <= 1 && (rowDiff + colDiff > 0);
    }

    isPathClear(fromRow, fromCol, toRow, toCol) {
        const rowStep = toRow > fromRow ? 1 : toRow < fromRow ? -1 : 0;
        const colStep = toCol > fromCol ? 1 : toCol < fromCol ? -1 : 0;
        
        let currentRow = fromRow + rowStep;
        let currentCol = fromCol + colStep;
        
        while (currentRow !== toRow || currentCol !== toCol) {
            if (this.board[currentRow][currentCol] !== null) return false;
            currentRow += rowStep;
            currentCol += colStep;
        }
        
        return true;
    }

    highlightSquare(row, col) {
        const squares = document.querySelectorAll('.square');
        squares.forEach(sq => {
            if (sq.dataset.row == row && sq.dataset.col == col) {
                sq.style.backgroundColor = '#f39c12';
                sq.style.boxShadow = 'inset 0 0 10px rgba(243, 156, 18, 0.5)';
            }
        });
    }

    updateGameStatus() {
        const status = document.getElementById('gameStatus');
        const playerColor = this.currentPlayer === 'white' ? 'White' : 'Black';
        status.textContent = `${playerColor} to move`;
    }

    undoMove() {
        if (this.moveHistory.length > 0) {
            const move = this.moveHistory.pop();
            this.board[move.from.row][move.from.col] = move.piece;
            this.board[move.to.row][move.to.col] = move.captured;
            this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
            this.initializeDisplay();
        }
    }

    resetBoard() {
        this.board = this.initializeBoard();
        this.currentPlayer = 'white';
        this.moveHistory = [];
        this.initializeDisplay();
    }
}

// Initialize game
let game;

window.addEventListener('DOMContentLoaded', () => {
    game = new ChessGame();
});

function newGame() {
    game.resetBoard();
}

function undoMove() {
    game.undoMove();
}

function resetBoard() {
    game.resetBoard();
}

function scrollToPlay() {
    document.getElementById('play').scrollIntoView({ behavior: 'smooth' });
}
