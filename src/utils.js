


function isCell(x, y) {
    return x >= 0 && x < 8 && y >= 0 && y < 8;
}



export function getStartingBoard() {
    const newBoard = [
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, -1, 1, 0, 0, 0],
        [0, 0, 0, 1, -1, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0]
    
    ]

    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 7; j++) {
            newBoard[i][j] = 1;
            
        }
    }
    return newBoard;
}
export function isEmpty(board, i, j) {
    return board[i][j] === 0;
}
export function isPlaceable(board, player, i, j) {
    if (board === undefined || board.length === 0) return false;
    // Cell needs to be empty and have an adjacent opponent cell and a player cell in the same direction
    if (board[i][j] !== 0) return false;
    let directions = [
        [0, 1], [0, -1], [1, 0], [-1, 0],
        [1, 1], [1, -1], [-1, 1], [-1, -1]
    ];
    for (let d of directions) {
        let [dx, dy] = d;
        let x = i + dx, y = j + dy;
        let found = false;
        if(!isCell(x, y)) continue;
        // The adjacent cell should be the opponent's cell
        let isOpponentCell = board[x][y] === player * -1;
        if (!isOpponentCell) continue;
        while (isCell(x, y)) {
            if (board[x][y] === 0) break;
            if (board[x][y] === player) {
                found = true;
                break;
            }
            x += dx;
            y += dy;
        }
        if (found) return true;
    }
    return false;
}

function negamax(board, player, depth, alpha = -Infinity, beta = Infinity, numberOfTilesPlaced = null) {

    console.log("Number of tiles placed: ", numberOfTilesPlaced)
    /*
    Negamax algorithm with alpha-beta pruning

    Parameters:
        board: 2D array representing the board state
        player: 1 or -1, the player for whom to calculate the best move
        depth: the depth of the search tree
        alpha: the best value that the maximizing player can guarantee
        beta: the best value that the minimizing player can guarantee
        numberOfTilesPlaced: an array with the number of tiles placed for each player, needed if tiles are limited to 32 per player
    
    Returns:
        An object with the value of the best move and the move itself
    */
    if (depth === 0 || isTerminal(board, numberOfTilesPlaced)) {
        return {value: evaluate(board) * player, move: null};
    }

    let placeableCells = getPlaceableCells(board, player, numberOfTilesPlaced);
    // If no placeable cells, pass the turn as the rules say
    if (placeableCells.length === 0) {
        return negamax(board, -player, depth - 1, -beta, -alpha, numberOfTilesPlaced);
    }

    //let rankedPlaceableCells = rankPlaceableCells(board, player, placeableCells);

    let bestValue = -Infinity;
    let bestMove = null;
    for (let [i, j] of placeableCells) {
        let newBoard = copyBoard(board);
        let newNumberOfTilesPlaced = numberOfTilesPlaced === null ? null : {...numberOfTilesPlaced, [player]: numberOfTilesPlaced[player] + 1}
        newBoard[i][j] = player;
        newBoard = applyFlips(newBoard, player, i, j);
        let result = negamax(newBoard, -player, depth - 1, -beta, -alpha, newNumberOfTilesPlaced);
        let value = -result.value;
        if (value > bestValue) {
            bestValue = value;
            bestMove = [i, j];
        }
        alpha = Math.max(alpha, value);
        if (alpha >= beta) break;
    }

    return {value: bestValue, move: bestMove};

}
export function copyBoard(board) {
    return board.map(row => row.slice());
}
export function getBotMove(board, player, depth, numberOfTilesPlaced = null) {
    let newBoard = copyBoard(board);
    let result = negamax(newBoard, player, depth, -Infinity,Infinity,numberOfTilesPlaced);
    return result.move;
}

export function getPlaceableCells(board, player, numberOfTilesPlaced = null) {

    /*
    Get all placeable cells for a player

    Parameters:
        board: 2D array representing the board state
        player: 1 or -1, the player for whom to get the placeable cells
        numberOfTilesPlaced: an array with the number of tiles placed for each player, needed if tiles are limited to 32 per player

    Returns:
        An array with the coordinates of the placeable cells
    */
    if (numberOfTilesPlaced !== null && numberOfTilesPlaced[player] >= 32){
        return []; // Placed all tiles, can't place more
    }
    let placeableCells = [];
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            if (isPlaceable(board, player, i, j)) {
                placeableCells.push([i, j]);
            }
        }
    }
    return placeableCells;
}
export function rankPlaceableCells(board, player, placeableCells) {
    // Rank placeable cells by the number of flips they would cause
    let rankedCells = [];
    for (let [i, j] of placeableCells) {
        let newBoard = copyBoard(board);
        newBoard[i][j] = player;
        newBoard = applyFlips(newBoard, player, i, j);
        let score = getScores(newBoard)[player > 0 ? 0 : 1]; //Index 0 is black score, index 1 is white score
        rankedCells.push({cell: [i, j], score: score});
    }
    rankedCells.sort((a, b) => b.score - a.score);
    // turn the array of objects into an array of [i, j] arrays
    return rankedCells.map(cell => cell.cell);
}


export function isTerminal(board, numberOfTilesPlaced = null) {

    let placeableWhite = getPlaceableCells(board, -1, numberOfTilesPlaced);
    let placeableBlack = getPlaceableCells(board, 1, numberOfTilesPlaced);
    console.log("White can place: ", placeableWhite.length !== 0);
    console.log("Black can place: ", placeableBlack.length !== 0);
    return getPlaceableCells(board, 1, numberOfTilesPlaced).length === 0 && getPlaceableCells(board, -1, numberOfTilesPlaced).length === 0;
}
export function evaluate(board) {
    let score = 0;
    for (let row of board) {
        for (let cell of row) {
            score += cell;
        }
    }
    return score;
}

export function getScores(board) {
    let blackScore = 0;
    let whiteScore = 0;
    for (let row of board) {
        for (let cell of row) {
            if (cell === 1) blackScore++;
            if (cell === -1) whiteScore++;
        }
    }
    return [blackScore, whiteScore];
}
export function applyFlips(board, player, i, j) {

    /*
        Apply flips to the board after a player placed a tile in a cell

        Parameters:
            board: 2D array representing the board state
            player: 1 or -1, the player who placed the tile
            i: the row of the cell
            j: the column of the cell
        
        Returns:
            A new board with the flips applied
    */
    let newBoard = copyBoard(board);
    // Player placed at i, j now flip the opponent's cells
    let directions = [
        [0, 1], [0, -1], [1, 0], [-1, 0],
        [1, 1], [1, -1], [-1, 1], [-1, -1]
    ];
    /* 
        Goes through all directions and checks for flips:
        - If an adjacent opponent cell is found, keep going in that direction
        - If a player cell is eventually found in that direction flip all the opponent's cells in that direction.
    */
    for (let d of directions) {
        let [dx, dy] = d;
        let x = i + dx, y = j + dy;
        if(!isCell(x, y)) continue;
        let cellsToFlip = [];
        let playerAtEnd = false;
        while (isCell(x, y)) {
            if (board[x][y] === 0) break;
            if (board[x][y] === player) {
                //Stops at first current player cell found
                playerAtEnd = true;
                break;
            }
            cellsToFlip.push([x, y]);
            x += dx;
            y += dy;
        }
        // Found player cell at the end, flip the opponent's cells between placed cell and player cell
        if(playerAtEnd){
            for (let [x, y] of cellsToFlip) {
                newBoard[x][y] = player;
            }
        }
        
        
    }
    return newBoard;
}