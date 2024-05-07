import React from 'react';
import './App.css';

import { isPlaceable,isEmpty,applyFlips,getBotMove,copyBoard,getScores,getPlaceableCells, isTerminal,getStartingBoard} from './utils';
function Othello() {

    /*Game logic*/
    const [board, setBoard] = React.useState([]);
    const [player, setPlayer] = React.useState(null);
    const [score, setScore] = React.useState([0, 0]);
    const [playingAs, setPlayingAs] = React.useState(null);
    const [acceptInput, setAcceptInput] = React.useState(true);
    const [placeableCells, setPlaceableCells] = React.useState([]);
    const [difficulty, setDifficulty] = React.useState(3);

    /* Mostly frontend logic */
    const [finalResultString, setFinalResultString] = React.useState(null);
    const [bestScoreAchieved, setBestScoreAchieved] = React.useState(null);
    const [inGame, setInGame] = React.useState(false);
    const [numberOfPlacedTiles, setNumberOfPlacedTiles] = React.useState({'-1': 2, '1': 2}); // 1 is black, -1 is white
    const [lastMove, setLastMove] = React.useState({'1': 'N/A', '-1': 'N/A'}); // Used for visuals


    const updateBestScore = (score) => {
        if (bestScoreAchieved === null || score > bestScoreAchieved.score) {
            console.log("Updating best score to: ", score);
            setBestScoreAchieved({playingAs: playingAs === 1 ? 'Black' : 'White', score: score});
        }
    }
    const resetGame = () => {
        let newBoard = getStartingBoard();
        

        // TODO: Restructure to remove many of these states
        setBoard(newBoard);
        setScore(getScores(newBoard));
        setPlaceableCells([]);
        setPlayer(null);
        setPlayingAs(null);
        setAcceptInput(true);
        setNumberOfPlacedTiles({'-1': 2, '1': 2});
        setFinalResultString(null);
        setLastMove({'1': 'N/A', '-1': 'N/A'});
    }
    
    const checkWin = (board) => {
        /*
        Check if the game is over, if it is, set the final result string

        Parameters:
            board (Array): The current game board, sent as a parameter to avoid using unupdated state or when using board which is not the current game board
        */
        if(board === null || board.length === 0) return;
        if (isTerminal(board,numberOfPlacedTiles)) {
            setInGame(false);
            const [blackScore, whiteScore] = getScores(board);
            let playerScore = playingAs === 1 ? blackScore : whiteScore;
            let botScore = playingAs === -1 ? blackScore : whiteScore;
            setTimeout(() => {
                //Use timeout to make sure everything is rendered and updated before showing the result
                if (playerScore > botScore) {
                    setFinalResultString('You won!');
                    updateBestScore(playerScore);
                } else if (botScore > playerScore) {
                    setFinalResultString('Bot won!');
                } else {
                    setFinalResultString('It\'s a tie!');
                }
            },50);
        }
    }
    const playCell = (i, j) => {
        /*
            Play a cell, place a tile in the cell and apply flips

            Makes use of multiple timeouts to slow down the game and make it more visually appealing and comprehensible
        */
        if(!acceptInput || !inGame) return; // Prevent multiple clicks
        setPlaceableCells([]); // Used for visuals (and some logic), remove placeable cells as a placement is made
        setAcceptInput(false); // check to prevent multiple clicks
        const newBoard = copyBoard(board);
        newBoard[i][j] = player;

        setLastMove(prev => {
            return {...prev, [player]: num2char(j+1) + (i+1)}
        }
        );

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

    const switchTurnToPlayer = (player) => {
        checkWin(board);
        setPlayer(player);
        setPlaceableCells(getPlaceableCells(board, player,numberOfPlacedTiles));
    }

    React.useEffect(() => {
        if(playingAs === null || !inGame) return;
        if (player === -playingAs) { // Bot's turn

            // Needs to check outside negamax as the first move by bot needs to be placeable
            // but it can skip turns if no moves are available deeper in the search tree
            if (placeableCells.length === 0) {

                switchTurnToPlayer(-player);
                setLastMove(prev => {
                    return {...prev, [-player]: 'Skip'}
                }
                );
                return;
            }
            setTimeout(() => {
                const move = getBotMove(board, player,difficulty,numberOfPlacedTiles);
                if(move !== null) {
                    playCell(move[0], move[1]);
                } else {
                    switchTurnToPlayer(-player);
                    setLastMove(prev => {
                        return {...prev, [-player]: 'Skip'}
                    }
                    );
                }
            },100);
        }else if(player === playingAs){
            if(placeableCells.length === 0){
                switchTurnToPlayer(-player);
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
    
    const getGameStatusText = () => {
        if (finalResultString !== null && !inGame) {
            return finalResultString;
        }
        if (playingAs === null) {
            return 'Choose a color to start';
        }
        return playingAs === player ? 'Your turn' : 'Bots turn';
    }

    const num2char = (num) => {
        return String.fromCharCode(num + 64);
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
                        <hr/>
                        <div className='credits'>
                            <p>Created by <a href='https://niklaswicklund.github.io/NiklasWicklund/' target='_blank'>Niklas Wicklund</a></p>
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
                                <p>Best win: {bestScoreAchieved !== null ? (bestScoreAchieved.score + ' as ' + bestScoreAchieved.playingAs): 'N/A'}</p>
                            </th>
                        </tr>
                        <tr>
                            <th colSpan={2}>
                                <h2>
                                {
                                    getGameStatusText()
                                }
                                </h2>
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
                        <tr
                            className='last-move-row'
                        >
                            <th colSpan={1}>
                                Last move: {lastMove[1]}
                            </th>
                            <th colSpan={1}>
                                Last move: {lastMove[-1]}
                            </th>
                        </tr>
                    </thead>
                </table>
                <table 
                    className={'game-table ' + (!acceptInput ? 'disable-input ' : '' + (!inGame ? 'grey-out' : ''))}
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
                                        {i === 0 && 
                                            <div className='column-number'>
                                                {num2char(j+1)}
                                            </div>
                                        }
                                        {j === 0 &&
                                            <div className='row-number'>
                                                {i+1}
                                            </div>
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