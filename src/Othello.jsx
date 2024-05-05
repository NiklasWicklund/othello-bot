import React from 'react';
import './App.css';

import { isPlaceable,isEmpty,applyFlips,evaluate,getBotMove,copyBoard,getScores,getPlaceableCells, isTerminal,getStartingBoard} from './utils';
function Othello() {

    const [board, setBoard] = React.useState([]);
    const [player, setPlayer] = React.useState(null);
    const [score, setScore] = React.useState([0, 0]);
    const [playingAs, setPlayingAs] = React.useState(null);
    const [acceptInput, setAcceptInput] = React.useState(true);
    const [placeableCells, setPlaceableCells] = React.useState([]);

    const [inGame, setInGame] = React.useState(false);
    const [difficulty, setDifficulty] = React.useState(3);

    const [numberOfPlacedTiles, setNumberOfPlacedTiles] = React.useState({'-1': 2, '1': 2});


    const resetGame = () => {

        let newBoard = getStartingBoard();
        

        setBoard(newBoard);
        setScore(getScores(newBoard));
        setPlaceableCells([]);
        setPlayer(null);
        setPlayingAs(null);
        setAcceptInput(true);
        setNumberOfPlacedTiles({'-1': 2, '1': 2});
    }
    const clearBoard = () => {
        setBoard(getStartingBoard());
        setScore([2, 2]);
    }


    
    const checkWin = (board) => {
        if(board === null || board.length === 0) return;
        let endGame = isTerminal(board,numberOfPlacedTiles)
        console.log("End game: ", endGame);
        if (endGame) {
            setInGame(false);
            const [blackScore, whiteScore] = getScores(board);
            setTimeout(() => {
                
                if (blackScore > whiteScore) {
                    let s = playingAs === 1 ? 'You won!' : 'You lost :(';
                    alert(s);
                } else if (whiteScore > blackScore) {
                    let s = playingAs === -1 ? 'You won!' : 'You lost :(';
                    alert(s);
                } else {
                    alert('It\'s a tie!');
                }
                resetGame();
            },50);
        }
    }
    const playCell = (i, j) => {
        
        if(!acceptInput) return; // Prevent multiple clicks
        setPlaceableCells([]); // Used for visuals, remove placeable cells as a placement is made
        setAcceptInput(false); // check to prevent multiple clicks
        const newBoard = copyBoard(board);
        newBoard[i][j] = player;

        setNumberOfPlacedTiles(prev => {
            return {...prev, [player]: prev[player] + 1}
        });

        setBoard(newBoard);
        setTimeout(() => {
            const flippedBoard = applyFlips(newBoard, player, i, j);
        
            setBoard(flippedBoard);
            setTimeout(() => {
                const newScore = getScores(flippedBoard);
                setScore(newScore);
                checkWin(flippedBoard);
                setPlayer(-player);
                setPlaceableCells(getPlaceableCells(flippedBoard, -player,numberOfPlacedTiles));
                setAcceptInput(true);
            }
            , 100);
        }, 500);
    }
    const cellPressed = (i, j) => {
        if(player === playingAs && isPlaceable(board, player, i, j)) {
            // Player's turn, can't place on bot's turn or on non-placeable cells, double check
            playCell(i, j);
        }
    }

    React.useEffect(() => {
        resetGame();
    }
    , []);

    React.useEffect(() => {
        if(playingAs === null || !inGame) return;
        if (player === -playingAs) { // Bot's turn
            setTimeout(() => {
                console.log("Calling from frontend with numberOfPlacedTiles: ", numberOfPlacedTiles);
                const move = getBotMove(board, player,difficulty,numberOfPlacedTiles);
                if(move !== null) {
                    playCell(move[0], move[1]);
                } else {
                    checkWin(board);
                    setPlayer(-player);

                }
            },100);
        }else if(player === playingAs){
            if(placeableCells.length === 0){
                checkWin(board);
                setPlayer(-player);
            }
        }
    }
    , [player]);


    const startGameAs = (playerIs) => {
        setPlayingAs(playerIs);
        setPlayer(1);
        setInGame(true);
        setPlaceableCells(getPlaceableCells(board, 1,numberOfPlacedTiles));
    }
    const cellClassName = (i, j) => {

        // Only show placeable cells if it's the player's turn
        if (placeableCells.some(([x, y]) => x === i && y === j) && player === playingAs){
            return 'placeable';
        }
        if (isEmpty(board, i, j)) {
            return 'unplaceable empty';
        }
        return 'unplaceable';
    }
    return (
        <div>
            {playingAs === null &&
                <div className='overlay'>
                    <div className='overlay-content'>
                        <h3>Lets play Othello!</h3>
                        <div className='select-color'>
                            <button onClick={() => startGameAs(1)}>Play as Black</button>
                            <button onClick={() => startGameAs(-1)}>Play as White</button>
                        </div>
                        <label htmlFor="dropdown">Choose difficulty:</label>
                        <select
                            value={difficulty}
                            onChange={(e) => setDifficulty(parseInt(e.target.value))}
                        >
                            <option value={1}>Level 1 (Fast)</option>
                            <option value={2}>Level 2</option>
                            <option value={3}>Level 3</option>
                            <option value={5}>Level 4</option>
                            <option value={7}>Level 5 (Slow)</option>
                        </select>
                        <div>
                            <a href='https://www.worldothello.org/about/about-othello/othello-rules/official-rules/english' target='_blank'>Rules (External Link)</a>
                        </div>
                    </div>

                </div>
            }
            <div className='board-container'>
                <table
                    className='score-table'
                >
                    <thead>
                    <tr>
                        <th colSpan={2}>
                            {playingAs === null ? 'Game has not started' : playingAs === player ? 'Your turn' : 'Bots turn'}
                        </th>
                    </tr>
                    <tr
                        className='score-row'
                    >
                        <th colSpan={1}>
                            ({32 - numberOfPlacedTiles[1]}) Black{playingAs === 1 ? ' (You)' : playingAs === null ? '' : ' (Bot)'}: {score[0]}
                        </th>
                        <th colSpan={1}>
                            ({32 - numberOfPlacedTiles[-1]}) White{playingAs === -1 ? ' (You)' : playingAs === null ? '' : ' (Bot)'}: {score[1]}
                        </th>
                    </tr>
                    </thead>
                </table>
                <table 
                    className={'game-table ' + (acceptInput ? '' : 'disable-table')}
                >
                    <tbody>
                        {board.map((row, i) => (
                            <tr key={i}>
                                {row.map((cell, j) => (
                                    <td 
                                        key={j}
                                        onClick={() => cellPressed(i, j)}
                                        className={cellClassName(i, j)}
                                    >
                                        {cell !== 0 && 
                                        <div className={'tile ' + (cell === 1 ? 'black' : 'white')}></div>
                                        }
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <button onClick={resetGame}>Reset</button>
        </div>
    );
}

export default Othello;