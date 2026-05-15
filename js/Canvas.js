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

// テトリミノ定義（2次元配列で表現） 全部４×４に統一
const TETROMINOS = {
    T: {
        color: "purple",
        id: 1,
        shape: [
            [0, 0, 0, 0],
            [0, 0, 1, 0],
            [0, 1, 1, 1],
            [0, 0, 0, 0]
        ]
    },
    O: {
        color: "yellow",
        id: 2,
        shape: [
            [0, 0, 0, 0],
            [0, 1, 1, 0],
            [0, 1, 1, 0],
            [0, 0, 0, 0]
        ]
    },
    L: {
        color: "orange",
        id: 3,
        shape: [
            [0, 0, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 1, 1],
            [0, 0, 0, 0]
        ],
    },
    J: {
        color: "blue",
        id: 4,
        shape: [
            [0, 0, 0, 0],
            [0, 0, 0, 1],
            [0, 1, 1, 1],
            [0, 0, 0, 0]
        ],
    },
    S: {
        color: "green",
        id: 5,
        shape: [
            [0, 0, 0, 0],
            [0, 0, 1, 1],
            [0, 1, 1, 0],
            [0, 0, 0, 0]
        ],
    },
    Z: {
        color: "red",
        id: 6,
        shape: [
            [0, 0, 0, 0],
            [0, 1, 1, 0],
            [0, 0, 1, 1],
            [0, 0, 0, 0]
        ],
    },
    I: {
        color: "cyan",
        id: 7,
        shape: [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [1, 1, 1, 1],
            [0, 0, 0, 0]
        ],
    },
    V: {
        color: "pink",
        id: 8,
        shape: [
            [1, 0, 0, 1],
            [1, 0, 0, 1],
            [0, 0, 0, 0],
            [0, 1, 1, 0]
        ],
    },
};
// 回転
function rotate(matrix) {
    //縦横同じの転置（行列入れ替え）
    for (let y = 0; y < matrix.length; y++) {
        for (let x = 0; x < y; x++) {
            [
                matrix[x][y],
                matrix[y][x]
            ] = [
                    matrix[y][x],
                    matrix[x][y]
                ];
        }
    }
    //行反転
    matrix.forEach(row => row.reverse());
}
// 描画処理(テトリミノの描画)
function drawMatrix(matrix, offset, color) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) { //1なら描画する
                //現在落下中のブロックの色
                ctx.fillStyle = color;
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
const pieces = "TOLJSZIV";
function randomPiece() {
    const type = pieces[Math.floor(Math.random() * pieces.length)]; //0~6の整数ランダム

    return TETROMINOS[type]; //テトリミノ定義が返る
}
// 落下処理（ゲームループ）ゲーム全体で使う状態管理
let dropCounter = 0; //落下時間管理
let dropInterval = 1000; //1000msごと落下　1秒1000ms
let lastTime = 0; //前回フレーム時間

let GameOver = false; //ゲーム状態

//描画 画面を毎フレーム描き直す
function draw() {
    //塗る色を黒にする
    ctx.fillStyle = "black";
    //画面全体を黒で塗る
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    //盤面の色
    ctx.fillStyle = "gray";
    //2次元配列の描画開始位置
    drawMatrix(board, { x: 0, y: 0 });
    drawMatrix(player.matrix.shape, player.pos, player.matrix.color);
    //ゲームオーバの表示の仕方
    if (GameOver) {
        ctx.fillStyle = "white";
        ctx.font = "1px sans-serif";
        ctx.fillText("Game Over", 1.5, 10);
        console.log(GameOver);
    }
}

//再起ループ  ゲームロジック　計算
function update(time = 0) {
    const delta = time - lastTime; //前回から何ms経ったか
    lastTime = time; //今回を次回用に保存

    if (!GameOver) {
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
                //ゲームオーバー判定
                //出現時に衝突するかどうか　衝突したらGame Over
                if (collide(board, player)) {
                    GameOver = true;

                    // return; //関数終了　以降全部中断
                }
            }
            dropCounter = 0; //時間リセット
        }
    }
    draw();
    //次の画面更新時にupdate()を呼ぶ　毎フレーム実行
    requestAnimationFrame(update);
}
update();
// 衝突判定　移動後の位置を見て行けるかどうか判定
function collide(board, player) {
    const matrix = player.matrix.shape;
    const pos = player.pos;
    //行を順番に見る
    for (let y = 0; y < matrix.length; y++) {
        //列を見る　結果、全部のマスを見る
        for (let x = 0; x < matrix[y].length; x++) {
            //ブロックがあるかどうか
            if (matrix[y][x] !== 0) {
                //画面上の本当の位置を計算
                const newY = y + pos.y;
                const newX = x + pos.x;
                //壁判定
                if (newX < 0 || newX >= COL) {
                    return true;
                }
                //床判定
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
    return false;
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
// 落下中のブロックを盤面に固定処理
function merge(board, player) {
    //ブロック全マスを見る
    player.matrix.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            //ブロックあるかどうか
            if (value !== 0) {
                //盤面に書き込む　boardにブロックが保存される
                board[y + player.pos.y][x + player.pos.x] = player.matrix.id;
            }
        });
    });
}
// ライン消去
function sweep() {
    //下から見て横から見て
    outer: for (let y = board.length - 1; y >= 0; y--) {
        for (let x = 0; x < board[y].length; x++) {
            //空マスあるか　あったらこの行は消せない為、次へ行く
            if (board[y][x] === 0) continue outer;
        }
        //盤面の配列を削除
        board.splice(y, 1);
        //空行を先頭に追加する
        board.unshift(Array(COL).fill(0));
        //上が一個下にずれてその行を見逃す為、同じ行をもう一回見る
        y++;
    }
}
// キーボード操作
document.addEventListener("keydown", e => { //そのキーを押した瞬間イベントが開始される
    if (e.key === "ArrowLeft") {
        //１減らす　左へ移動
        player.pos.x--;
        //ぶつかったら、元に戻す
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
    if (e.key === "ArrowUp") {
        //正方形行列を前提にした回転
        rotate(player.matrix.shape);
        if (collide(board, player)) {
            //９０度×３＝270度　元に戻る
            rotate(player.matrix.shape);
            rotate(player.matrix.shape);
            rotate(player.matrix.shape);
        }
    }
});