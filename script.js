const DisplayController = (function () {
	const cellList = Array.from(document.querySelectorAll("div[data-cell]"));
	const boardContainer = document.querySelector("#boardContainer");
	const resetBtn = document.querySelector("#resetBtn");
	const resultTx = document.querySelector("#resultTx");
	const renderResult = (inputString) => (resultTx.innerText = inputString);
	const addEvent = (element, eventName, callBack) =>
		element.addEventListener(eventName, callBack);
	const render = (board) => {
		for (let i = 0; i < board.length; i++) {
			if (board[i] != "") {
				const cell = cellList[i];
				const icon = cell.querySelector(`.${board[i]}-icon`);
				cell.classList.add(board[i]);
				icon.classList.remove("hide");
				icon.classList.add("show");
			} else {
				const cell = cellList[i];
				cell.querySelector(".x-icon").classList.remove("show");
				cell.querySelector(".o-icon").classList.remove("show");
				cell.querySelector(".x-icon").classList.add("hide");
				cell.querySelector(".o-icon").classList.add("hide");
			}
		}
	};
	return { render, addEvent, boardContainer, renderResult, resetBtn };
})();

function player(playerIcon, isComputer) {
	const humanPlay = (event) => {
		const index = event.target.getAttribute("data-cell");
		if (!GameBoard.getEmptyCells(GameBoard.getBoard()).includes(index)) {
			GameBoard.updateBoard(playerIcon, index);
			DisplayController.render(GameBoard.getBoard());
		}
	};
	const computerPlay = () => {
		const optimalChoice = Game.minimax(GameBoard.getBoard(), "o").index;
		GameBoard.updateBoard(playerIcon, optimalChoice);
		DisplayController.render(GameBoard.getBoard());
	};
	const play = (input) =>
		isComputer ? computerPlay(input) : humanPlay(input);

	return { playerIcon, isComputer, play };
}

const GameBoard = (function () {
	let gameBoard = ["", "", "", "", "", "", "", "", ""];

	const updateBoard = (playerIcon, index) => {
		if (gameBoard[index] == "") gameBoard[index] = playerIcon;
	};
	const resetBoard = () => (gameBoard = ["", "", "", "", "", "", "", "", ""]);
	const getBoard = () => gameBoard;
	const isFull = () => getEmptyCells(gameBoard).length == 0;
	const getEmptyCells = (board) =>
		board
			.map((boardCell, index) => (boardCell == "" ? index : undefined))
			.filter((cell) => cell != undefined);
	return { getBoard, updateBoard, getEmptyCells, isFull, resetBoard };
})();

const Game = (function () {
	const playerOne = player("x", false);
	const playerTwo = player("o", true);
	let result = { winner: undefined, gameOver: false, isDraw: false };
	const winningCombos = [
		[0, 1, 2],
		[3, 4, 5],
		[6, 7, 8],
		[0, 3, 6],
		[1, 4, 7],
		[2, 5, 8],
		[0, 4, 8],
		[2, 4, 6],
	];
	const startGame = () => {
		DisplayController.addEvent(
			DisplayController.boardContainer,
			"click",
			playRound
		);
	};
	function finishGame() {
		showResult();
		DisplayController.boardContainer.removeEventListener(
			"click",
			playRound
		);
	}
	function resetGame() {
		GameBoard.resetBoard();
		DisplayController.render(GameBoard.getBoard());
		DisplayController.renderResult("");
		startGame();
	}
	function showResult() {
		if (result.winner == "x") DisplayController.renderResult("You Win :)");
		else if (result.winner == "o")
			DisplayController.renderResult("You Lose :(");
		else DisplayController.renderResult("It's a Draw :|");
	}
	const playRound = (event) => {
		if (event.target.hasAttribute("data-cell")) {
			playerOne.play(event);
			result = checkWinner(GameBoard.getBoard());
			if (!result.isDraw && !result.gameOver) {
				playerTwo.play();
				result = checkWinner(GameBoard.getBoard());
			} else {
				finishGame();
			}
			if (result.isDraw || result.gameOver) finishGame();
		}
	};
	function checkWinner(board) {
		for (let combo of winningCombos) {
			if (
				board[combo[0]] != "" &&
				board[combo[0]] == board[combo[1]] &&
				board[combo[1]] == board[combo[2]]
			)
				return { winner: board[combo[0]], gameOver: true, draw: false };
		}
		if (GameBoard.isFull())
			return { winner: undefined, gameOver: true, draw: true };
		else return { winner: undefined, gameOver: false, draw: false };
	}
	function minimax(newBoard, playerIcon) {
		let emptyCells = GameBoard.getEmptyCells(newBoard);
		let { winner, draw } = checkWinner(newBoard);

		if (winner == "x") return { score: -10 };
		else if (winner == "o") return { score: 10 };
		else if (draw) return { score: 0 };
		//an array to collect all the objects
		let moves = [];

		for (let i = 0; i < emptyCells.length; i++) {
			let move = {};
			move.index = emptyCells[i];

			//set the empty spot to the current player
			newBoard[move.index] = playerIcon;

			//here is the recursive minimax call on the opponent of the current player
			if (playerIcon == "o") {
				let g = minimax(newBoard, "x");
				move.score = g.score;
			} else {
				let g = minimax(newBoard, "o");
				move.score = g.score;
			}
			//reset the spot to empty
			newBoard[emptyCells[i]] = "";
			moves.push(move);
		}

		/*
		 *
		 * now we find the best move by looping over the moves
		 * we look for the move with the highest score if it's ai and the move with the lowest score if it's human.
		 *
		 *
		 */
		let bestMove;

		if (playerIcon == "o") {
			let bestScore = -10000; //looking for max so set it to lowest

			for (let i = 0; i < moves.length; i++) {
				if (moves[i].score > bestScore) {
					bestScore = moves[i].score;
					bestMove = i;
				}
			}
		} else {
			let bestScore = 10000;

			for (let i = 0; i < moves.length; i++) {
				if (moves[i].score < bestScore) {
					bestScore = moves[i].score;
					bestMove = i;
				}
			}
		}

		return moves[bestMove]; //return a move object with score and index properties we need the index to get the final result;
	}
	return { startGame, minimax, resetGame };
})();
DisplayController.addEvent(DisplayController.resetBtn, "click", Game.resetGame);
Game.startGame();
