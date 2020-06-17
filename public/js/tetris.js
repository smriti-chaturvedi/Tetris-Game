const canvas = document.getElementById("tetris")
const ctx = canvas.getContext("2d")
const nextCanvas = document.getElementById("next")
const ctx2 = nextCanvas.getContext("2d")
const scoreElement = document.getElementById("score")

const ROW = 20
const COL = 10

const SQ = 25
const VACANT = "BLACK"

const ROW2 = 6
const COL2 = 6

function drawSquare(ctxt,x,y,color) 
{
    ctxt.fillStyle = color
    ctxt.fillRect(x*SQ,y*SQ,SQ,SQ)

    ctxt.strokeStyle = "WHITE"
    ctxt.strokeRect(x*SQ,y*SQ,SQ,SQ)
}

let board = []
for(r=0;r<ROW;r++)
{
    board[r] = []
    for(c=0;c<COL;c++)
    {
        board[r][c] = VACANT
    }
}

function drawBoard () {
    for(r=0;r<ROW;r++)
    {
        for(c=0;c<COL;c++)
        {
            drawSquare(ctx,c,r,board[r][c])
        }
    }
}

drawBoard()

let nextBoard = []
for(r=0;r<ROW2;r++){
    nextBoard[r] = []
    for(c=0;c<COL2;c++){
        nextBoard[r][c] = VACANT
    }
}

function drawNextBoard () {
    for(r=0;r<ROW2;r++)
    {
        for(c=0;c<COL2;c++){
            drawSquare(ctx2, c,r,nextBoard[r][c])
        }
    }
}

drawNextBoard()

const PIECES = [
    [Z, "RED"],
    [S, "GREEN"],
    [T, "YELLOW"],
    [O, "BLUE"],
    [L, "PURPLE"],
    [I, "CYAn"],
    [J, "ORANGE"]
]

function randomPiece() {
    let r = Math.floor(Math.random() * PIECES.length)
    return new Piece(PIECES[r][0], PIECES[r][1])
}

let p = randomPiece()
let next = randomPiece()
console.log(next)


function Piece(tetromino, color) {
    this.tetromino = tetromino
    this.color = color
    
    this.tetrominoN = 0
    this.activeTetromino = this.tetromino[this.tetrominoN]

    this.x = 3
    this.y = -2
}

Piece.prototype.fill = function(ctx,color) {
    if(ctx == ctx2)
    {
        for(r=0;r<this.activeTetromino.length;r++){
            for(c=0;c<this.activeTetromino.length;c++){
                if(this.activeTetromino[r][c]){
                    drawSquare(ctx,1+c,1+r, color)
                }
            }
        }
    }
    else{
        for(r=0;r<this.activeTetromino.length;r++){
            for(c=0;c<this.activeTetromino.length;c++){
                if(this.activeTetromino[r][c]){
                    drawSquare(ctx,this.x +c, this.y +r, color)
                }
            }
        }
    }
}

Piece.prototype.draw = function(ctx) {
    this.fill(ctx,this.color)
}

Piece.prototype.undraw = function(ctx) {
    this.fill(ctx,VACANT)
}

Piece.prototype.moveDown = function() {
    if(!this.collision(0,1, this.activeTetromino)) {
        this.undraw(ctx)
        this.y++
        this.draw(ctx)
    }
    else {
        this.lock()
        next.undraw(ctx2)
        p = next
        next = randomPiece()
        next.draw(ctx2)
        console.log(next)
    }
}

Piece.prototype.moveRight = function() {
    if(!this.collision(1, 0 , this.activeTetromino)) {
        this.undraw(ctx)
        this.x++
        this.draw(ctx)
    }
}

Piece.prototype.moveLeft = function() {
    if(!this.collision(-1, 0 , this.activeTetromino)) {
        this.undraw(ctx)
        this.x--
        this.draw(ctx)
    }
}

Piece.prototype.rotate = function() {
    let nextPattern = this.tetromino[(this.tetrominoN + 1) % this.tetromino.length]
    let kick = 0
    if(this.collision(0,0,nextPattern)) {
        if(this.x > COL/2){
            kick = -1
        }else {
            kick = 1
        }
    }
    if(!this.collision(kick,0, nextPattern)) {
        this.undraw(ctx)
        this.x += kick
        this.tetrominoN = (this.tetrominoN + 1) % this.tetromino.length
        this.activeTetromino = this.tetromino[this.tetrominoN]
        this.draw(ctx)
    }
}

let score = 0

Piece.prototype.lock = function() {
    for(r=0;r<this.activeTetromino.length;r++){
        for(c=0;c<this.activeTetromino.length;c++){
            if(!this.activeTetromino[r][c]){
                continue
            }
            if(this.y + r < 0){
                alert("Game Over")
                gameOver = true
                break
            }
            board[this.y + r][this.x + c] = this.color
        }
    }
    for(r=0;r<ROW;r++){
        let isRowFull = true
        for(c=0;c<COL;c++){
            isRowFull = isRowFull && board[r][c] != VACANT
        }
        if(isRowFull) {
            for(y=r; y>1 ; y--) {
                for(c=0;c<COL;c++){
                    board[y][c] = board[y-1][c]
                }
            }
            for(c=0;c<COL;c++){
                board[0][c] = VACANT
            }
            score += 10
        }
    }
    drawBoard()
    scoreElement.innerHTML = score
}

Piece.prototype.collision = function (x,y,piece) {
    for(r=0;r<piece.length;r++){
        for(c=0;c<piece.length;c++){
            if(!piece[r][c]){
                continue
            }
            let newX = this.x + c + x
            let newY = this.y + r + y
            if(newX <0 || newX >= COL || newY >= ROW){
                return true
            }
            if(newY < 0){
                continue
            }
            if(board[newY][newX] != VACANT){
                return true
            }
        }
    }
    return false
}

document.addEventListener("keydown", CONTROL)

function CONTROL(e){
    if(e.keyCode == 37){
        p.moveLeft()
        dropStart = Date.now()
    }else if(e.keyCode == 38){
        p.rotate()
        dropStart = Date.now()
    }else if(e.keyCode == 39){
        p.moveRight()
        dropStart = Date.now()
    }else if(e.keyCode == 40){
        p.moveDown()
    }
}

let dropStart = Date.now()
let gameOver = false
next.draw(ctx2)
function drop () {
    let now = Date.now()
    let delta = now - dropStart
    if(delta > 1000)
    {
        p.moveDown()
        dropStart = Date.now()
    }
    if(!gameOver){
        requestAnimationFrame(drop)
    }
}

drop()