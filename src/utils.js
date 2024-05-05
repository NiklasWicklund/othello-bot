


function isCell(x, y) {
    return x >= 0 && x < 8 && y >= 0 && y < 8;
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

function negamax(board, player, depth, alpha = -Infinity, beta = Infinity) {

    if (depth === 0 || isTerminal(board)) {
        return {value: evaluate(board) * player, move: null};
    }

    let placeableCells = getPlaceableCells(board, player);
    // If no placeable cells, pass the turn as the rules say
    if (placeableCells.length === 0) {
        return negamax(board, -player, depth - 1, -beta, -alpha);
    }

    let bestValue = -Infinity;
    let bestMove = null;

    for (let [i, j] of placeableCells) {
        let newBoard = copyBoard(board);
        newBoard[i][j] = player;
        newBoard = applyFlips(newBoard, player, i, j);
        let result = negamax(newBoard, -player, depth - 1, -beta, -alpha);
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
export function getBotMove(board, player, depth) {
    let newBoard = copyBoard(board);
    let result = negamax(newBoard, player, depth);
    return result.move;
}

function numberOfTilesPlaced(board, player) {
    let count = 0;
    for (let row of board) {
        for (let cell of row) {
            if (cell === player) count++;
        }
    }
    return count;
}
export function getPlaceableCells(board, player) {

    // Each player have 32 tiles, if they have placed all of them, they can only pass
    if (numberOfTilesPlaced(board, player) === 32) return [];

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

export function isTerminal(board) {

    return getPlaceableCells(board, 1).length === 0 && getPlaceableCells(board, -1).length === 0;
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
    let newBoard = copyBoard(board);
    // Player placed at i, j now flip the opponent's cells
    let directions = [
        [0, 1], [0, -1], [1, 0], [-1, 0],
        [1, 1], [1, -1], [-1, 1], [-1, -1]
    ];
    for (let d of directions) {
        let [dx, dy] = d;
        let x = i + dx, y = j + dy;
        if(!isCell(x, y)) continue;
        let cellsToFlip = [];
        let playerAtEnd = false;
        while (isCell(x, y)) {
            if (board[x][y] === 0) break;
            if (board[x][y] === player) {
                playerAtEnd = true;
                break;
            }
            cellsToFlip.push([x, y]);
            x += dx;
            y += dy;
        }
        if(playerAtEnd){
            for (let [x, y] of cellsToFlip) {
                newBoard[x][y] = player;
            }
        }
        
        
    }
    return newBoard;
}