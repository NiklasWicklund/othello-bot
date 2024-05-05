import React from 'react';
import './App.css';

import { isPlaceable,isEmpty,applyFlips,evaluate,getBotMove,copyBoard,getScores,getPlaceableCells} from './utils';
function Othello() {

    const [board, setBoard] = React.useState([]);
    const [player, setPlayer] = React.useState(null);
    const [score, setScore] = React.useState([0, 0]);
    const [playingAs, setPlayingAs] = React.useState(null);
    const [acceptInput, setAcceptInput] = React.useState(true);
    const [placeableCells, setPlaceableCells] = React.useState([]);
    const [difficulty, setDifficulty] = React.useState(3);
    const resetBoard = () => {
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
        setBoard(newBoard);
        setScore(getScores(newBoard));
        setPlaceableCells([]);
        setPlayer(null);
        setPlayingAs(null);
        setAcceptInput(true);
    }


    
    const playCell = (i, j) => {
        if(!acceptInput) return; // Prevent multiple clicks
        setPlaceableCells([]);
        setAcceptInput(false);
        const newBoard = copyBoard(board);
        newBoard[i][j] = player;
        setBoard(newBoard);
        setTimeout(() => {
            const flippedBoard = applyFlips(newBoard, player, i, j);
        
            setBoard(flippedBoard);
            setTimeout(() => {
                const newScore = getScores(flippedBoard);
                setScore(newScore);
                setPlaceableCells(getPlaceableCells(flippedBoard, -player));
                setPlayer(-player);
                setAcceptInput(true);
                
            }
            , 100);
        }, 500);
    }
    const cellPressed = (i, j) => {
        if(player === playingAs && isPlaceable(board, player, i, j)) {
            playCell(i, j);
        }
    }

    React.useEffect(() => {
        resetBoard();
    }
    , []);

    React.useEffect(() => {
        if (player === -playingAs) { // Bot's turn
            setTimeout(() => {

                const [i,j] = getBotMove(board, player,difficulty);
                playCell(i, j);
            },100);
        }
    }
    , [player]);

    const startGameAs = (playerIs) => {
        setPlayingAs(playerIs);
        setPlayer(1);
        setPlaceableCells(getPlaceableCells(board, 1));
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
                            <option value={10}>Level 6 (Very Slow!!!)</option>

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
                            Black{playingAs === 1 ? ' (You)' : playingAs === null ? '' : ' (Bot)'}: {score[0]}
                        </th>
                        <th colSpan={1}>
                            White{playingAs === -1 ? ' (You)' : playingAs === null ? '' : ' (Bot)'}: {score[1]}
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
            <button onClick={resetBoard}>Reset</button>
        </div>
    );
}

export default Othello;