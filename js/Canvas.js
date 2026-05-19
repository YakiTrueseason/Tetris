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
    // V: {
    //     color: "pink",
    //     id: 8,
    //     shape: [
    //         [1, 0, 0, 1],
    //         [1, 0, 0, 1],
    //         [0, 0, 0, 0],
    //         [0, 1, 1, 0]
    //     ],
    // },
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
//ランダム生成（ランダム数字→文字→オブジェクトから取り出す）
const pieces = "TOLJSZI";
function randomPiece() {
    const type = pieces[Math.floor(Math.random() * pieces.length)]; //0~6の整数ランダム

    return TETROMINOS[type]; //テトリミノ定義が返る
}
// 落下処理（ゲームループ）ゲーム全体で使う状態管理
let dropCounter = 0; //落下時間管理
let dropInterval = 1000; //1000msごと落下　1秒1000ms
let lastTime = 0; //前回フレーム時間

// let GameOver = false; //ゲーム状態
// let paused = false; //ゲーム更新だけ止める
// let showReset = false; //ゲームリセット

//ゲーム状態一括管理 ゲームプレイ中
let gameState = "playing";

let score = 0; //スコアーは０スタート
let level = 1; //レベルは1スタート
let message = ""; //メッセージ
// let lines = 0; //スコア連続ライン消去

let nextPiece = randomPiece(); //次に出るブロック
// プレイヤー（現在のブロック）
const player = {
    pos: { x: 5, y: 0 }, //横５縦０から描画開始　５列目上端から
    matrix: randomPiece() //ランダムスタート
};


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
    drawMatrix(
        player.matrix.shape,
        player.pos,
        player.matrix.color
    );
    ctx.fillStyle = "white";
    ctx.font = "1px sans-serif";
    //次のテトリミノ表示
    ctx.fillText("NEXT", 13, 2);
    drawMatrix(
        nextPiece.shape,
        { x: 13, y: 3 },
        nextPiece.color
    );
    //スコア表示
    ctx.fillText("SCORE:" + score, 0.5, 1);
    //レベルアップ表示
    ctx.fillText(message, 0.5, 5);
    //ゲームオーバの表示
    if (gameState === "GameOver") {
        ctx.fillStyle = "white";
        ctx.font = "1px sans-serif";
        ctx.fillText("Game Over", 1.5, 7);
        ctx.fillText("PRESSR R", 1.5, 10);
        // console.log(GameOver);
    }
    // ゲーム更新停止　PAUSED画面
    if (gameState === "paused") {
        ctx.fillStyle = "white";
        ctx.font = "2px sans-serif";
        ctx.fillText("PAUSED", 1.5, 10);
    }
    // if (gameState === "gameover")
}

//再起ループ  ゲームロジック　計算
function update(time = 0) {
    const delta = time - lastTime; //前回から何ms経ったか
    lastTime = time; //今回を次回用に保存

    if (gameState === "playing") {
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
                //完全コピー
                player.matrix = structuredClone(nextPiece);
                //次のテトリミノを出す
                // player.matrix = nextPiece;
                drawMatrix(
                    nextPiece.shape,
                    { x: 13, y: 3 },
                    nextPiece.color
                );
                //新ブロックを出す
                nextPiece = randomPiece();
                // player.matrix = randomPiece();
                //ゲームオーバー判定
                //出現時に衝突するかどうか　衝突したらGame Over
                if (collide(board, player)) {
                    gameState = "GameOver";
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
        //ライン消去の度にスコアが100増える
        score += 100;
        console.log('kara', score);
        // lines++;
        //レベルアップ　３００点ごとに100msレベル上昇
        if (score >= level * 300) {
            level++;
            dropInterval -= 100;
            //最低速度制限 マイナス速度にならない為に
            if (dropInterval < 100) {
                dropInterval = 100;
            }
            message = `LEVEL UP!LV.${level}`
            console.log(message);
            //一定時間後に消す
            setTimeout(() => {
                message = "";
            }, 1000);
        }
        //上が一個下にずれてその行を見逃す為、同じ行をもう一回見る
        y++;
    }
}
//スコア管理　ゲームデータ　横1列（行）揃った場合、スコアが100増える
function scores() {
    //ラベルを下から1行ずつ上を見る　一番下＝ｙ＝19　全部で20行
    outer: for (let y = board.length - 1; y >= 0; y--) {
        //横1列全部見る　ｘ＝左から右
        for (let x = 0; x < board[y].length; x++) {
            //そのマスが空かどうか　0があれば行が完成ならず　この行チェック終了次へ
            if (board[y][x] === 0) continue outer;
        }
        //配列削除
        board.splice(y, 1);
        //上に空行追加
        board.unshift(Array(COL).fill(0));
        //100点加算
        score += 100;
        //ライン連続消去加算
        // if (lines === 1) score += 100;
        // if (lines === 2) score += 300;
        // if (lines === 3) score += 500;
        // if (lines === 4) score += 800;
        //y--で新19行目を見逃すので、y++で相殺　同じ行をもう一回見る
        y++;
    }
}
//ゲームリセット
function resetGame() {
    //盤面リセット
    board.forEach(row => row.fill(0));
    //プレイヤー位置
    player.pos.x = 5;
    player.pos.y = 0;
    //新ブロック
    player.matrix = randomPiece();
    //状態
    // GameOver = false;
    // paused = false;
    gameState = "playing";
    //時間
    dropCounter = 0;
    //スコア
    score = 0;
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
    // 右に移動
    if (e.key === "ArrowRight") {
        player.pos.x++;
        if (collide(board, player)) {
            player.pos.x--;
        }
    }
    // 下に移動
    if (e.key === "ArrowDown") {
        player.pos.y++;
        if (collide(board, player)) {
            player.pos.y--;
        }
    }
    // 上の矢印を押すと回転　壁キックあり
    if (e.key === "ArrowUp") {
        //正方形行列を前提にした回転
        rotate(player.matrix.shape);
        //壁キック方法を順番に試す
        //ずらす候補　どれなら回転できるか
        const kicks = [0, 1, -1, 2, -2];
        const oldX = player.pos.x;
        let rotated = false;
        //配列を順番に取り出す
        for (let offset of kicks) {
            //毎回元の位置から試す
            player.pos.x = oldX + offset;
            //回転成功したらこの位置で終了
            if (!collide(board, player)) {
                rotated = true;
                // return;
                break;
            }
        }
        //全部失敗
        if (!rotated) {
            player.pos.x = oldX;
            //９０度×３＝270度　元に戻る
            for (let i = 0; i < 3; i++) {
                rotate(player.matrix.shape);
            }
            // rotate(player.matrix.shape);
            // rotate(player.matrix.shape);
            // rotate(player.matrix.shape);
        }
        // //元の位置に保存
        // const oldX = player.pos.x;
        // //衝突したら
        // if (collide(board, player)) {
        //     //右に
        //     player.pos.x++;
        //     //また衝突したら
        //     if (collide(board, player)) {
        //         //左へ2マス
        //         player.pos.x -= 2;
        //         //また衝突したら
        //         if (collide(board, player)) {
        //             //元の位置へ戻す
        //             player.pos.x = oldX;

        //         }
        //     }
        // }
    }
    //ハードドロップ　スペースキーで一気に落下
    if (e.key === "s") {
        while (!collide(board, player)) {
            player.pos.y++;
        }
        player.pos.y--;
    }
    //ゲーム更新停止 pを押すとテトリミノが止まる
    if (e.key === "p") {
        if (gameState === "playing") {
            gameState = "paused";
            //pをもう一度押すと動き出す
        } else if (gameState === "paused") {
            gameState = "playing";
        }
    }
    //ゲームリセット　rを押すと最初からスタート
    if (e.key === "r") {
        resetGame()
    }
});