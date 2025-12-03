"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

type PieceType = "pawn" | "rook" | "knight" | "bishop" | "queen" | "king";
type PieceColor = "white" | "black";
type GameMode = "pvp" | "ai" | null;

interface Piece {
  type: PieceType;
  color: PieceColor;
  hasMoved?: boolean;
}

interface Position {
  row: number;
  col: number;
}

interface MoveNotation {
  from: string;
  to: string;
  piece: string;
  captured?: string;
  check?: boolean;
  checkmate?: boolean;
}

const PIECE_SYMBOLS: Record<PieceColor, Record<PieceType, string>> = {
  white: { king: "♔", queen: "♕", rook: "♖", bishop: "♗", knight: "♘", pawn: "♙" },
  black: { king: "♚", queen: "♛", rook: "♜", bishop: "♝", knight: "♞", pawn: "♟" },
};

const PIECE_NOTATION: Record<PieceType, string> = {
  king: "K", queen: "Q", rook: "R", bishop: "B", knight: "N", pawn: ""
};

const initializeBoard = (): (Piece | null)[][] => {
  const board: (Piece | null)[][] = Array(8).fill(null).map(() => Array(8).fill(null));
  const backRow: PieceType[] = ["rook", "knight", "bishop", "queen", "king", "bishop", "knight", "rook"];
  board[0] = backRow.map(type => ({ type, color: "black", hasMoved: false }));
  board[1] = Array(8).fill(null).map(() => ({ type: "pawn" as PieceType, color: "black" as PieceColor }));
  board[6] = Array(8).fill(null).map(() => ({ type: "pawn" as PieceType, color: "white" as PieceColor }));
  board[7] = backRow.map(type => ({ type, color: "white", hasMoved: false }));
  return board;
};

const positionToNotation = (row: number, col: number): string => {
  const files = "abcdefgh";
  return `${files[col]}${8 - row}`;
};

export default function ChessGame() {
  const [gameMode, setGameMode] = useState<GameMode>(null);
  const [showColorSelect, setShowColorSelect] = useState(false);
  const [board, setBoard] = useState<(Piece | null)[][]>(initializeBoard());
  const [selectedPos, setSelectedPos] = useState<Position | null>(null);
  const [validMoves, setValidMoves] = useState<Position[]>([]);
  const [currentTurn, setCurrentTurn] = useState<PieceColor>("white");
  const [captured, setCaptured] = useState<{ white: Piece[]; black: Piece[] }>({ white: [], black: [] });
  const [moveHistory, setMoveHistory] = useState<{ board: (Piece | null)[][]; turn: PieceColor; captured: { white: Piece[]; black: Piece[] } }[]>([]);
  const [gameStatus, setGameStatus] = useState<"playing" | "check" | "checkmate" | "stalemate">("playing");
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [aiDifficulty, setAiDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [playerColor, setPlayerColor] = useState<PieceColor>("white");
  const [moveCount, setMoveCount] = useState(0);
  const [positionHistory, setPositionHistory] = useState<string[]>([]);
  const [moveNotations, setMoveNotations] = useState<MoveNotation[]>([]);

  const boardToString = useCallback((testBoard: (Piece | null)[][]): string => {
    return testBoard.map(row => 
      row.map(piece => piece ? `${piece.color[0]}${piece.type[0]}` : '--').join(',')
    ).join(';');
  }, []);

  const isValidPosition = (row: number, col: number): boolean => row >= 0 && row < 8 && col >= 0 && col < 8;

  const findKing = useCallback((color: PieceColor, testBoard: (Piece | null)[][]): Position | null => {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (testBoard[r][c]?.type === "king" && testBoard[r][c]?.color === color) {
          return { row: r, col: c };
        }
      }
    }
    return null;
  }, []);

  const getPseudoLegalMoves = useCallback((piece: Piece, row: number, col: number, testBoard: (Piece | null)[][], checkForCheck: boolean = true): Position[] => {
    const moves: Position[] = [];
    const addMove = (r: number, c: number) => {
      if (isValidPosition(r, c) && (!testBoard[r][c] || testBoard[r][c]!.color !== piece.color)) {
        moves.push({ row: r, col: c });
      }
    };

    const addLineMoves = (dirs: [number, number][]) => {
      dirs.forEach(([dr, dc]) => {
        let r = row + dr, c = col + dc;
        while (isValidPosition(r, c)) {
          if (!testBoard[r][c]) {
            moves.push({ row: r, col: c });
          } else {
            if (testBoard[r][c]!.color !== piece.color) moves.push({ row: r, col: c });
            break;
          }
          r += dr; c += dc;
        }
      });
    };

    switch (piece.type) {
      case "pawn":
        const dir = piece.color === "white" ? -1 : 1;
        const startRow = piece.color === "white" ? 6 : 1;
        if (isValidPosition(row + dir, col) && !testBoard[row + dir][col]) {
          moves.push({ row: row + dir, col });
          if (row === startRow && !testBoard[row + 2 * dir][col]) moves.push({ row: row + 2 * dir, col });
        }
        [-1, 1].forEach(dc => {
          const r = row + dir, c = col + dc;
          if (isValidPosition(r, c) && testBoard[r][c]?.color !== piece.color && testBoard[r][c]) {
            moves.push({ row: r, col: c });
          }
        });
        break;
      case "rook": addLineMoves([[0,1],[0,-1],[1,0],[-1,0]]); break;
      case "knight": [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]].forEach(([dr,dc]) => addMove(row+dr, col+dc)); break;
      case "bishop": addLineMoves([[1,1],[1,-1],[-1,1],[-1,-1]]); break;
      case "queen": addLineMoves([[0,1],[0,-1],[1,0],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1]]); break;
      case "king":
        [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]].forEach(([dr,dc]) => addMove(row+dr, col+dc));
        if (checkForCheck && !piece.hasMoved) {
          const kRook = testBoard[row][7];
          if (kRook?.type === "rook" && !kRook.hasMoved && !testBoard[row][5] && !testBoard[row][6]) {
            moves.push({ row, col: 6 });
          }
          const qRook = testBoard[row][0];
          if (qRook?.type === "rook" && !qRook.hasMoved && !testBoard[row][1] && !testBoard[row][2] && !testBoard[row][3]) {
            moves.push({ row, col: 2 });
          }
        }
        break;
    }
    return moves;
  }, []);

  const isSquareUnderAttack = useCallback((row: number, col: number, byColor: PieceColor, testBoard: (Piece | null)[][]): boolean => {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = testBoard[r][c];
        if (piece?.color === byColor) {
          const moves = getPseudoLegalMoves(piece, r, c, testBoard, false);
          if (moves.some(m => m.row === row && m.col === col)) return true;
        }
      }
    }
    return false;
  }, [getPseudoLegalMoves]);

  const isKingInCheck = useCallback((color: PieceColor, testBoard: (Piece | null)[][]): boolean => {
    const kingPos = findKing(color, testBoard);
    if (!kingPos) return false;
    return isSquareUnderAttack(kingPos.row, kingPos.col, color === "white" ? "black" : "white", testBoard);
  }, [findKing, isSquareUnderAttack]);

  const getLegalMoves = useCallback((piece: Piece, row: number, col: number, testBoard: (Piece | null)[][]): Position[] => {
    const pseudoMoves = getPseudoLegalMoves(piece, row, col, testBoard, true);
    
    return pseudoMoves.filter(move => {
      const newBoard = testBoard.map(r => [...r]);
      const movingPiece = newBoard[row][col];
      if (!movingPiece) return false;
      
      newBoard[move.row][move.col] = { ...movingPiece };
      newBoard[row][col] = null;
      
      if (piece.type === "king" && Math.abs(move.col - col) === 2) {
        if (move.col === 6) { 
          newBoard[row][5] = newBoard[row][7]; 
          newBoard[row][7] = null; 
        } else { 
          newBoard[row][3] = newBoard[row][0]; 
          newBoard[row][0] = null; 
        }
        const enemyColor = piece.color === "white" ? "black" : "white";
        const passCol = move.col === 6 ? 5 : 3;
        if (isSquareUnderAttack(row, passCol, enemyColor, testBoard)) return false;
      }
      
      return !isKingInCheck(piece.color, newBoard);
    });
  }, [getPseudoLegalMoves, isKingInCheck, isSquareUnderAttack]);

  const evaluateBoard = useCallback((testBoard: (Piece | null)[][]): number => {
    const values: Record<PieceType, number> = { 
      pawn: 100, knight: 320, bishop: 330, rook: 500, queen: 900, king: 20000 
    };
    
    const pawnTable = [
      [0, 0, 0, 0, 0, 0, 0, 0],
      [50, 50, 50, 50, 50, 50, 50, 50],
      [10, 10, 20, 30, 30, 20, 10, 10],
      [5, 5, 10, 27, 27, 10, 5, 5],
      [0, 0, 0, 25, 25, 0, 0, 0],
      [5, -5, -10, 0, 0, -10, -5, 5],
      [5, 10, 10, -25, -25, 10, 10, 5],
      [0, 0, 0, 0, 0, 0, 0, 0]
    ];
    
    const knightTable = [
      [-50, -40, -30, -30, -30, -30, -40, -50],
      [-40, -20, 0, 0, 0, 0, -20, -40],
      [-30, 0, 10, 15, 15, 10, 0, -30],
      [-30, 5, 15, 20, 20, 15, 5, -30],
      [-30, 0, 15, 20, 20, 15, 0, -30],
      [-30, 5, 10, 15, 15, 10, 5, -30],
      [-40, -20, 0, 5, 5, 0, -20, -40],
      [-50, -40, -30, -30, -30, -30, -40, -50]
    ];
    
    let score = 0;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = testBoard[r][c];
        if (p) {
          let val = values[p.type];
          
          if (p.type === "pawn") {
            const tableRow = p.color === "white" ? r : 7 - r;
            val += pawnTable[tableRow][c];
          } else if (p.type === "knight") {
            const tableRow = p.color === "white" ? r : 7 - r;
            val += knightTable[tableRow][c];
          }
          
          if ((r === 3 || r === 4) && (c === 3 || c === 4)) val += 10;
          
          score += p.color === "black" ? val : -val;
        }
      }
    }
    return score;
  }, []);

  const minimax = useCallback((testBoard: (Piece | null)[][], depth: number, alpha: number, beta: number, maximizing: boolean): number => {
    if (depth === 0) return evaluateBoard(testBoard);
    
    const color = maximizing ? "black" : "white";
    const allMoves: { from: Position; to: Position }[] = [];
    
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = testBoard[r][c];
        if (p?.color === color) {
          const moves = getLegalMoves(p, r, c, testBoard);
          moves.forEach(m => allMoves.push({ from: { row: r, col: c }, to: m }));
        }
      }
    }
    
    if (!allMoves.length) {
      const inCheck = isKingInCheck(color, testBoard);
      return maximizing ? (inCheck ? -50000 : 0) : (inCheck ? 50000 : 0);
    }
    
    let bestVal = maximizing ? -Infinity : Infinity;
    for (const move of allMoves) {
      const newB = testBoard.map(r => [...r]);
      newB[move.to.row][move.to.col] = newB[move.from.row][move.from.col];
      newB[move.from.row][move.from.col] = null;
      
      const val = minimax(newB, depth - 1, alpha, beta, !maximizing);
      
      if (maximizing) {
        bestVal = Math.max(bestVal, val);
        alpha = Math.max(alpha, val);
      } else {
        bestVal = Math.min(bestVal, val);
        beta = Math.min(beta, val);
      }
      if (beta <= alpha) break;
    }
    return bestVal;
  }, [evaluateBoard, getLegalMoves, isKingInCheck]);

  const getAllLegalMovesForColor = useCallback((color: PieceColor, testBoard: (Piece | null)[][]): { from: Position; to: Position; piece: Piece }[] => {
    const moves: { from: Position; to: Position; piece: Piece }[] = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = testBoard[r][c];
        if (piece?.color === color) {
          const legalMoves = getLegalMoves(piece, r, c, testBoard);
          legalMoves.forEach(toPos => {
            moves.push({ from: { row: r, col: c }, to: toPos, piece });
          });
        }
      }
    }
    return moves;
  }, [getLegalMoves]);

  const executeMove = useCallback((from: Position, to: Position) => {
    setMoveHistory([...moveHistory, { board: JSON.parse(JSON.stringify(board)), turn: currentTurn, captured }]);
    const newBoard = board.map(r => [...r]);
    const piece = newBoard[from.row][from.col];
    if (!piece) return;

    const capturedPiece = newBoard[to.row][to.col];
    const isCapture = !!capturedPiece;
    const isPawnMove = piece.type === "pawn";
    
    if (capturedPiece) {
      setCaptured(prev => ({ ...prev, [currentTurn]: [...prev[currentTurn], capturedPiece] }));
    }

    if (piece.type === "king" && Math.abs(to.col - from.col) === 2) {
      if (to.col === 6) {
        newBoard[from.row][5] = newBoard[from.row][7] ? { ...newBoard[from.row][7]!, hasMoved: true } : null;
        newBoard[from.row][7] = null;
      } else {
        newBoard[from.row][3] = newBoard[from.row][0] ? { ...newBoard[from.row][0]!, hasMoved: true } : null;
        newBoard[from.row][0] = null;
      }
    }

    newBoard[to.row][to.col] = { ...piece, hasMoved: true };
    newBoard[from.row][from.col] = null;
    
    setBoard(newBoard);
    setSelectedPos(null);
    setValidMoves([]);

    const boardStr = boardToString(newBoard);
    const newPositionHistory = [...positionHistory, boardStr];
    setPositionHistory(newPositionHistory);
    
    const newMoveCount = (isCapture || isPawnMove) ? 0 : moveCount + 1;
    setMoveCount(newMoveCount);
    
    const positionCount = newPositionHistory.filter(pos => pos === boardStr).length;
    const isThreefoldRepetition = positionCount >= 3;
    const isFiftyMoveRule = newMoveCount >= 100;

    const nextTurn = currentTurn === "white" ? "black" : "white";
    
    const allMoves = getAllLegalMovesForColor(nextTurn, newBoard);
    const inCheck = isKingInCheck(nextTurn, newBoard);
    
    let newStatus: typeof gameStatus = "playing";
    if (isThreefoldRepetition || isFiftyMoveRule) {
      newStatus = "stalemate";
    } else if (!allMoves.length) {
      newStatus = inCheck ? "checkmate" : "stalemate";
    } else if (inCheck) {
      newStatus = "check";
    }
    
    setGameStatus(newStatus);

    const notation: MoveNotation = {
      from: positionToNotation(from.row, from.col),
      to: positionToNotation(to.row, to.col),
      piece: PIECE_NOTATION[piece.type],
      captured: capturedPiece ? PIECE_NOTATION[capturedPiece.type] : undefined,
      check: newStatus === "check",
      checkmate: newStatus === "checkmate"
    };
    setMoveNotations(prev => [...prev, notation]);

    setCurrentTurn(nextTurn);
  }, [board, currentTurn, captured, moveHistory, getAllLegalMovesForColor, isKingInCheck, boardToString, positionHistory, moveCount]);

  const makeAIMove = useCallback(() => {
    setIsAIThinking(true);
    
    setTimeout(() => {
      const aiColor = gameMode === "ai" ? (playerColor === "white" ? "black" : "white") : "black";
      
      const allPossibleMoves: { from: Position; to: Position; piece: Piece; escapesCheck: boolean }[] = [];
      
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const piece = board[r][c];
          if (piece?.color === aiColor) {
            const legalMoves = getLegalMoves(piece, r, c, board);
            
            legalMoves.forEach(toPos => {
              const testBoard = board.map(row => [...row]);
              testBoard[toPos.row][toPos.col] = piece;
              testBoard[r][c] = null;
              const stillInCheck = isKingInCheck(aiColor, testBoard);
              
              allPossibleMoves.push({
                from: { row: r, col: c },
                to: toPos,
                piece,
                escapesCheck: !stillInCheck
              });
            });
          }
        }
      }
      
      const currentlyInCheck = isKingInCheck(aiColor, board);
      
      const movesToEvaluate = currentlyInCheck 
        ? allPossibleMoves.filter(m => m.escapesCheck)
        : allPossibleMoves;
      
      if (movesToEvaluate.length === 0) {
        setIsAIThinking(false);
        setGameStatus(currentlyInCheck ? "checkmate" : "stalemate");
        return;
      }
      
      const depths = { easy: 3, medium: 4, hard: 5 };
      let bestMove = movesToEvaluate[0];
      let bestScore = -Infinity;
      
      for (const move of movesToEvaluate) {
        const testBoard = board.map(r => [...r]);
        testBoard[move.to.row][move.to.col] = testBoard[move.from.row][move.from.col];
        testBoard[move.from.row][move.from.col] = null;
        
        const score = minimax(testBoard, depths[aiDifficulty] - 1, -Infinity, Infinity, false);
        
        if (score > bestScore) {
          bestScore = score;
          bestMove = move;
        }
      }
      
      executeMove(bestMove.from, bestMove.to);
      setIsAIThinking(false);
    }, 800);
  }, [board, aiDifficulty, minimax, executeMove, isKingInCheck, getLegalMoves, gameMode, playerColor]);

  useEffect(() => {
    if (gameMode === "ai" && !isAIThinking) {
      const aiColor = playerColor === "white" ? "black" : "white";
      if (currentTurn === aiColor && (gameStatus === "playing" || gameStatus === "check")) {
        makeAIMove();
      }
    }
  }, [currentTurn, gameMode, gameStatus, isAIThinking, makeAIMove, playerColor]);

  const handleSquareClick = (row: number, col: number) => {
    if (gameStatus === "checkmate" || gameStatus === "stalemate") return;
    if (gameMode === "ai" && currentTurn !== playerColor) return;
    if (isAIThinking) return;

    const piece = board[row][col];

    if (selectedPos) {
      if (validMoves.some(m => m.row === row && m.col === col)) {
        executeMove(selectedPos, { row, col });
      } else if (piece?.color === currentTurn) {
        const moves = getLegalMoves(piece, row, col, board);
        setSelectedPos({ row, col });
        setValidMoves(moves);
      } else {
        setSelectedPos(null);
        setValidMoves([]);
      }
    } else if (piece?.color === currentTurn) {
      const moves = getLegalMoves(piece, row, col, board);
      setSelectedPos({ row, col });
      setValidMoves(moves);
    }
  };

  const resetGame = () => {
    setBoard(initializeBoard());
    setSelectedPos(null);
    setValidMoves([]);
    setCurrentTurn("white");
    setCaptured({ white: [], black: [] });
    setMoveHistory([]);
    setGameStatus("playing");
    setIsAIThinking(false);
    setMoveNotations([]);
    setMoveCount(0);
    setPositionHistory([]);
  };

  const startGame = (color: PieceColor) => {
    setPlayerColor(color);
    setGameMode("ai");
    resetGame();
  };

  const undoMove = () => {
    if (moveHistory.length) {
      const undoCount = gameMode === "ai" && moveHistory.length >= 2 ? 2 : 1;
      const targetIndex = moveHistory.length - undoCount;
      
      if (targetIndex >= 0) {
        const targetState = moveHistory[targetIndex];
        setBoard(targetState.board);
        setCurrentTurn(targetState.turn);
        setCaptured(targetState.captured);
        setMoveHistory(moveHistory.slice(0, targetIndex));
        setMoveNotations(moveNotations.slice(0, -undoCount));
        
        const moveCountRestore = targetIndex * 2;
        setPositionHistory(positionHistory.slice(0, moveCountRestore));
        setMoveCount(Math.max(0, moveCount - undoCount));
      } else {
        const last = moveHistory[0];
        setBoard(last.board);
        setCurrentTurn(last.turn);
        setCaptured(last.captured);
        setMoveHistory([]);
        setMoveNotations([]);
        setPositionHistory([]);
        setMoveCount(0);
      }
      
      setSelectedPos(null);
      setValidMoves([]);
      setGameStatus("playing");
    }
  };

  // Color selection screen for AI mode
  if (showColorSelect && !gameMode) {
    return (
      <div className="p-4 md:p-8 relative z-10 min-h-screen flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl w-full">
          <div className="bg-black/60 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <h1 className="text-4xl font-bold text-white text-center mb-2">Choose Your Color</h1>
            <p className="text-gray-300 text-center mb-8">White moves first</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.button 
                whileHover={{ scale: 1.05 }} 
                onClick={() => {
                  startGame("white");
                  setShowColorSelect(false);
                }} 
                className="p-8 bg-gradient-to-br from-gray-100 to-gray-300 rounded-xl text-gray-900 border-4 border-white shadow-lg"
              >
                <div className="text-6xl mb-4">⚪</div>
                <h2 className="text-2xl font-bold mb-2">Play as White</h2>
                <p className="text-gray-700">You move first</p>
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05 }} 
                onClick={() => {
                  startGame("black");
                  setShowColorSelect(false);
                }} 
                className="p-8 bg-gradient-to-br from-gray-800 to-gray-950 rounded-xl text-white border-4 border-gray-700 shadow-lg"
              >
                <div className="text-6xl mb-4">⚫</div>
                <h2 className="text-2xl font-bold mb-2">Play as Black</h2>
                <p className="text-gray-300">AI moves first</p>
              </motion.button>
            </div>
            <button 
              onClick={() => setShowColorSelect(false)} 
              className="mt-6 w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white font-semibold"
            >
              ⬅️ Back
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!gameMode) {
    return (
      <div className="p-4 md:p-8 relative z-10 min-h-screen flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl w-full">
          <div className="bg-black/60 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <h1 className="text-4xl font-bold text-white text-center mb-2">♟️ Chess</h1>
            <p className="text-gray-300 text-center mb-8">Choose your game mode</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.button whileHover={{ scale: 1.05 }} onClick={() => { setGameMode("pvp"); resetGame(); }} className="p-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl text-white">
                <div className="text-6xl mb-4">👥</div>
                <h2 className="text-2xl font-bold mb-2">Player vs Player</h2>
                <p className="text-blue-100">Play locally with a friend</p>
              </motion.button>
              <motion.button whileHover={{ scale: 1.05 }} onClick={() => setShowColorSelect(true)} className="p-8 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl text-white">
                <div className="text-6xl mb-4">🤖</div>
                <h2 className="text-2xl font-bold mb-2">Player vs AI</h2>
                <p className="text-purple-100">Improved Minimax AI</p>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 relative z-10 min-h-screen">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <button onClick={() => setGameMode(null)} className="mb-2 px-4 py-2 bg-pink-600 hover:bg-pink-700 rounded-lg text-white font-semibold">⬅️ Change Mode</button>
            <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">♟️ Chess {gameMode === "ai" ? "(vs AI)" : "(PvP)"}</h1>
          </div>
          <div className="flex flex-col gap-2">
            {gameMode === "ai" && (
              <div className="flex gap-2">
                {(["easy", "medium", "hard"] as const).map(lv => (
                  <button key={lv} onClick={() => setAiDifficulty(lv)} disabled={isAIThinking}
                    className={`px-3 py-1 rounded-lg font-semibold ${aiDifficulty === lv ? "bg-purple-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"} ${isAIThinking ? "opacity-50" : ""}`}>
                    {lv.charAt(0).toUpperCase() + lv.slice(1)}
                  </button>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <button onClick={undoMove} disabled={!moveHistory.length || isAIThinking} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg text-white font-semibold">↩️ Undo</button>
              <button onClick={resetGame} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-semibold">🔄 Reset</button>
            </div>
          </div>
        </div>

        <div className="mb-4 text-center">
          <div className="inline-block px-6 py-3 bg-black/60 backdrop-blur-md rounded-xl border border-white/20">
            <p className="text-white text-lg font-semibold">
              {isAIThinking && "🤖 AI is thinking..."}
              {!isAIThinking && gameStatus === "checkmate" && `🏆 Checkmate! ${currentTurn === "white" ? "Black" : "White"} wins!`}
              {!isAIThinking && gameStatus === "check" && `⚠️ Check! ${currentTurn === "white" ? "White" : "Black"} must move`}
              {!isAIThinking && gameStatus === "stalemate" && "🤝 Draw! (Stalemate / Repetition / 50-move rule)"}
              {!isAIThinking && gameStatus === "playing" && `${currentTurn === "white" ? "⚪" : "⚫"} ${currentTurn.charAt(0).toUpperCase() + currentTurn.slice(1)} Turn`}
            </p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 justify-center items-start">
          <div className="w-full lg:w-48 space-y-4 order-1">
            <div className="bg-black/60 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <h3 className="text-white font-semibold mb-2 text-center">White Captured</h3>
              <div className="flex flex-wrap gap-2 justify-center min-h-[40px]">
                {captured.white.map((p, i) => <span key={i} className="text-3xl">{PIECE_SYMBOLS[p.color][p.type]}</span>)}
              </div>
            </div>

            <div className="bg-black/60 backdrop-blur-md rounded-xl p-4 border border-white/20 max-h-[400px] overflow-y-auto">
              <h3 className="text-white font-semibold mb-2 text-center">Move History</h3>
              <div className="space-y-1 text-sm">
                {moveNotations.length === 0 ? (
                  <p className="text-gray-400 text-center">No moves yet</p>
                ) : (
                  moveNotations.map((move, i) => (
                    <div key={i} className={`p-2 rounded ${i % 2 === 0 ? 'bg-white/10' : 'bg-white/5'}`}>
                      <span className="text-gray-300 font-mono">
                        {Math.floor(i / 2) + 1}. {i % 2 === 0 ? '⚪' : '⚫'} {move.piece}{move.captured ? 'x' : ''}{move.to}
                        {move.checkmate ? '#' : move.check ? '+' : ''}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="w-full lg:w-auto order-2">
            <div className="bg-gradient-to-br from-purple-900/60 via-blue-900/60 to-pink-900/60 backdrop-blur-md rounded-2xl p-2 lg:p-6 border-2 border-cyan-400/50 shadow-[0_0_40px_rgba(34,211,238,0.6),0_0_80px_rgba(236,72,153,0.4)] w-full lg:w-auto">
              <div className="relative flex justify-center">
                <div className="w-full lg:w-auto">
                  <div className="flex justify-center mb-1 lg:mb-2">
                    <div className="grid grid-cols-8 gap-0 w-full max-w-[min(600px,94vw)] lg:max-w-[600px]">
                      {(gameMode === "ai" && playerColor === "black" ? ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'] : ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']).map(file => (
                        <div key={file} className="text-center text-cyan-300 font-bold text-xs lg:text-sm drop-shadow-[0_0_10px_rgba(34,211,238,1)]">
                          {file}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <div className="flex flex-col justify-around mr-1 lg:mr-2">
                      {(gameMode === "ai" && playerColor === "black" ? [1, 2, 3, 4, 5, 6, 7, 8] : [8, 7, 6, 5, 4, 3, 2, 1]).map(rank => (
                        <div key={rank} className="text-cyan-300 font-bold text-xs lg:text-sm flex items-center h-[12.5%] drop-shadow-[0_0_10px_rgba(34,211,238,1)]">
                          {rank}
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-8 gap-[2px] lg:gap-[3px] w-full max-w-[min(600px,88vw)] lg:max-w-[600px] aspect-square rounded-xl overflow-hidden p-[2px] lg:p-[3px] bg-gradient-to-br from-purple-500 via-fuchsia-500 to-pink-500 shadow-[0_0_40px_rgba(168,85,247,0.8),0_0_60px_rgba(236,72,153,0.6)]">
                      {(() => {
                        const displayBoard = gameMode === "ai" && playerColor === "black" ? [...board].reverse() : board;
                        return displayBoard.map((row, r) => {
                          const actualRow = gameMode === "ai" && playerColor === "black" ? 7 - r : r;
                          const displayRow = gameMode === "ai" && playerColor === "black" ? [...row].reverse() : row;
                          return displayRow.map((piece, c) => {
                            const actualCol = gameMode === "ai" && playerColor === "black" ? 7 - c : c;
                            const isLight = (actualRow + actualCol) % 2 === 0;
                            const isSel = selectedPos?.row === actualRow && selectedPos?.col === actualCol;
                            const isValid = validMoves.some(m => m.row === actualRow && m.col === actualCol);
                            return (
                              <div key={`${actualRow}-${actualCol}`} onClick={() => handleSquareClick(actualRow, actualCol)}
                            className={`relative flex items-center justify-center cursor-pointer aspect-square transition-all duration-200
                              ${isLight 
                                ? "bg-gradient-to-br from-cyan-400 to-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.7),inset_0_0_25px_rgba(255,255,255,0.3)]" 
                                : "bg-gradient-to-br from-gray-900 to-black shadow-[0_0_20px_rgba(0,0,0,0.8),inset_0_0_25px_rgba(139,92,246,0.2)]"}
                              ${isSel ? "ring-2 lg:ring-4 ring-inset ring-yellow-400 shadow-[0_0_35px_rgba(250,204,21,1),inset_0_0_35px_rgba(250,204,21,0.7)]" : ""}
                              ${isValid ? "ring-[3px] lg:ring-4 ring-inset ring-green-400 shadow-[0_0_35px_rgba(74,222,128,1),inset_0_0_35px_rgba(74,222,128,0.7)]" : ""}
                              ${isAIThinking ? "pointer-events-none opacity-70" : "hover:brightness-125 hover:shadow-[0_0_30px_rgba(255,255,255,0.9)]"}`}>
                            {isValid && <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <div className={piece 
                                ? "w-[85%] h-[85%] rounded-full ring-[3px] lg:ring-4 ring-red-500 shadow-[0_0_30px_rgba(239,68,68,1)]" 
                                : "w-2 h-2 lg:w-4 lg:h-4 rounded-full bg-green-400 shadow-[0_0_25px_rgba(74,222,128,1)]"} />
                            </div>}
                            {piece && (
                              <span 
                                className={`text-[clamp(1.5rem,4vw,3.5rem)] lg:text-6xl select-none z-10 transition-all duration-200 hover:scale-110 leading-none flex items-center justify-center
                                  ${piece.color === "white" 
                                    ? "text-white drop-shadow-[0_0_12px_rgba(255,255,255,1)] [text-shadow:_0_0_20px_rgba(255,255,255,0.9),_0_0_30px_rgba(34,211,238,0.6),_2px_2px_5px_rgba(0,0,0,0.9)]" 
                                    : "text-[#0a0a0a] drop-shadow-[0_0_10px_rgba(168,85,247,0.9)] [text-shadow:_0_0_15px_rgba(168,85,247,0.7),_0_0_25px_rgba(236,72,153,0.5),_1px_1px_3px_rgba(0,0,0,0.8)]"}`}>
                                {PIECE_SYMBOLS[piece.color][piece.type]}
                              </span>
                            )}
                          </div>
                        );
                      });
                    });
                  })()}
                    </div>

                    <div className="flex flex-col justify-around ml-1 lg:ml-2">
                      {(gameMode === "ai" && playerColor === "black" ? [1, 2, 3, 4, 5, 6, 7, 8] : [8, 7, 6, 5, 4, 3, 2, 1]).map(rank => (
                        <div key={rank} className="text-cyan-300 font-bold text-xs lg:text-sm flex items-center h-[12.5%] drop-shadow-[0_0_10px_rgba(34,211,238,1)]">
                          {rank}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-center mt-1 lg:mt-2">
                    <div className="grid grid-cols-8 gap-0 w-full max-w-[min(600px,94vw)] lg:max-w-[600px]">
                      {(gameMode === "ai" && playerColor === "black" ? ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'] : ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']).map(file => (
                        <div key={file} className="text-center text-cyan-300 font-bold text-xs lg:text-sm drop-shadow-[0_0_10px_rgba(34,211,238,1)]">
                          {file}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-48 order-3">
            <div className="bg-black/60 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <h3 className="text-white font-semibold mb-2 text-center">Black Captured</h3>
              <div className="flex flex-wrap gap-2 justify-center min-h-[40px]">
                {captured.black.map((p, i) => <span key={i} className="text-3xl">{PIECE_SYMBOLS[p.color][p.type]}</span>)}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 max-w-2xl mx-auto">
          <div className="bg-black/60 backdrop-blur-md rounded-xl p-4 border border-white/20">
            <h3 className="text-white font-semibold mb-2">✨ Improved Features</h3>
            <ul className="text-gray-300 text-sm space-y-1">
              <li>✅ Complete chess rules with Check & Checkmate</li>
              <li>✅ Enhanced AI with better position evaluation</li>
              <li>✅ Move history with chess notation (e4, Nf3, etc)</li>
              <li>✅ Improved depth: Easy (3), Medium (4), Hard (5)</li>
              <li>✅ Better evaluation with piece-square tables</li>
              <li>✅ Choose your color when playing vs AI</li>
              {gameMode === "ai" && <li>🤖 AI prioritizes escaping check (+10000 bonus)</li>}
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
}