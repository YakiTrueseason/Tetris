// 画面を作る
const canvas = document.getElementById("tetris");
const ctx = canvas.getContext("2d");

const BLOCK_SIZE = 20;

ctx.scale(BLOCK_SIZE, BLOCK_SIZE);
// 盤面を作る
const ROW = 20;
const COL = 12;

const board = Array.from({ length: ROW }, () =>
    Array(COL).fill(0));
// テトリミノ定義（2次元配列で表現）
const TETROMINOS = {
    T: [
        [0, 1, 0],
        [1, 1, 1],
        [0, 0, 0]
    ],
    O: [
        [1, 1],
        [1, 1]
    ],
    L: [
        [1, 0, 0],
        [1, 1, 1]
    ],
    J: [
        [0, 0, 1],
        [1, 1, 1]
    ],
    S: [
        [0, 1, 1],
        [1, 1, 0]
    ],
    Z: [
        [1, 1, 0],
        [0, 1, 1]
    ],
    I: [
        [1],
        [1],
        [1],
        [1]
    ],
};
// 描画処理(テトリミノの描画)
function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) { //1なら描画する
                //描画位置を表す
                ctx.fillRect(
                    x + offset.x,
                    y + offset.y,
                    1,
                    1
                );
            }
        });
    });
}
// プレイヤー（現在のブロック）
const player = {
    pos: { x: 5, y: 0 }, //横５縦０から描画開始　５列目上端から
    matrix: TETROMINOS.T //Tからスタート
};
//ランダム生成（ランダム数字→文字→オブジェクトから取り出す）
const pieces = "TOLJSZI";
function randomPiece() {
    const type = pieces[Math.floor(Math.random() * pieces.length)]; //0~6の整数ランダム

    return TETROMINOS[type]; //テトリミノ定義が返る
}
// 落下処理（ゲームループ）
let dropCounter = 0; //どれくらい時間経ったか
let dropInterval = 1000; //1000msごと落下　1秒1000ms
let lastTime = 0; //前回updateした時間
//描画
function draw() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "gray";
    drawMatrix(board, { x: 0, y: 0 });

    ctx.fillStyle = "cyan";
    drawMatrix(player.matrix, player.pos);
}
//再起ループ
function update(time = 0) {
    const delta = time - lastTime; //前回から何ms経ったか
    lastTime = time; //今回を次回用に保存
    //経過時間を加算
    dropCounter += delta;
    //1秒経ったら1マス下へ
    if (dropCounter > dropInterval) {
        player.pos.y++;
        if (collide(board, player)) { //ボードにぶつかったかどうか
            player.pos.y--; //戻す
            merge(board, player); //盤面固定
            sweep(); //ラインを一掃する
            player.pos.y = 0;
            player.pos.x = 5;
            player.matrix = randomPiece(); //新ブロックを出す
        }
        dropCounter = 0; //時間リセット
    }
    draw();
    //次の画面更新時にupdate()を呼ぶ　毎フレーム実行
    requestAnimationFrame(update);
}
update();
// 衝突判定
function collide(board, player) {

    const matrix = player.matrix;
    const pos = player.pos;

    for (let y = 0; y < matrix.length; y++) {
        for (let x = 0; x < matrix[y].length; x++) {
            if (matrix[y][x] !== 0) {

                const newY = y + pos.y;
                const newX = x + pos.x;
                //壁
                if (newX < 0 || newX >= COL) {
                    return true;
                }
                //床
                if (newY >= ROW) {
                    return true;
                }
                //ブロック衝突
                if (board[newY][newX] !== 0) {
                    return true;
                }
            }
        }
    }
    // const [m, o] = [player.matrix, player.pos];

    // for (let y = 0; y < m.length; y++) {
    //     for (let x = 0; x < m[y].length; x++) {
    //         if (m[y][x] !== 0 &&
    //             (board[y + o.y] &&
    //                 board[y + o.y][x + o.x]) !== 0) {
    //             return true;
    //         }
    //     }
    // }
    return false;
}
// 固定処理
function merge(board, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                board[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}
// ライン消去
function sweep() {
    outer: for (let y = board.length - 1; y >= 0; y--) {
        for (let x = 0; x < board[y].length; x++) {
            if (board[y][x] === 0) continue outer;
        }
        board.splice(y, 1);
        board.unshift(Array(COL).fill(0));
        y++;
    }
}
// 操作
document.addEventListener("keydown", e => {
    if (e.key === "ArrowLeft") {
        player.pos.x--;
        if (collide(board, player)) {
            player.pos.x++;
        }
    }
    if (e.key === "ArrowRight") {
        player.pos.x++;
        if (collide(board, player)) {
            player.pos.x--;
        }
    }
    if (e.key === "ArrowDown") {
        player.pos.y++;
        if (collide(board, player)) {
            player.pos.y--;
        }
    }
});