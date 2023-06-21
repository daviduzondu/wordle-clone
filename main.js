import "./style.css"
import Toastify from 'toastify-js'
let app = document.querySelector("#app");
let board = document.querySelector("#board");
let loading = document.querySelector("#loading");
let keys = "QWERTYUIOPASDFGHJKLZXCVBNM".split("");
let restartBtn = document.querySelector("#restart-btn");
let showBtn = document.querySelector("#show-btn");
keys.push("Backspace");
let keyrow = document.querySelector(".keyrow");
let boardContent = [
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
];
let currentRow = 0;
let currentBox = 0;
let secretWord;

for (let i = 0; i <= 5; i++) {
    let row = document.createElement('div')
    for (let y = 0; y <= 4; y++) {
        let box = document.createElement('span');
        row.appendChild(box);
        row.className = `row-${i + 1}`
    }
    board.appendChild(row);
}


keys.forEach(entry => {
    let key = document.createElement("button");
    if (entry === "*") {
        key.innerText = "Backspace";
    } else {
        key.innerText = entry;
    }
    key.className = "key"
    key.setAttribute("data-key", entry.toUpperCase());
    key.addEventListener("click", () => {
        insertKey(entry.toUpperCase())
        setTimeout(() => {
            document.querySelector(`button[data-key=${entry.toUpperCase()}]`).blur();
        }, 250)
    })
    keyrow.append(key);
})


let rows = [...document.querySelectorAll('div')].filter(x => x.className.includes("row-"));
let boxes = [];
rows.forEach(row => [...row.children].forEach(child => boxes.push(child)))

function getNewWord() {
    fetch("https://random-word-api.herokuapp.com/word?length=5").then(res => {
        return res.json();
    }).then(data => {
        secretWord = data[0].toUpperCase();
        main();
    });
}


function main() {
    loading.style.display = "none";
    boxes.forEach((box) => {
        box.classList.add("empty");
    })

    window.addEventListener('keyup', (e) => {
        if (isValidCharacter(e.key)) {
            document.querySelector(`button[data-key=${e.key.toUpperCase()}]`).focus();
            document.querySelector(`button[data-key=${e.key.toUpperCase()}]`).click();
            setTimeout(() => {
                document.querySelector(`button[data-key=${e.key.toUpperCase()}]`).blur();
            }, 250)
        }
    })

    showBtn.addEventListener('click', () => {
        if (currentRow > 4) {
            // alert(`Alright fine! the answer is ${secretWord}`)
            Toastify({
                text: `Alright fine! the answer is ${secretWord}`,
                duration: 2500,
                className: "alert",
            }).showToast();
        }
        else {
            Toastify({
                text: `${4 - currentRow} tries before you can view the answer.`,
                duration: 2500, // `top` or `bottom`
                className: "alert",
                position: "center",
            }).showToast();
        }
    })

    restartBtn.addEventListener('click', () => {
        location.reload();
    })
    function isValidCharacter(val) {
        return (val.match(/^[a-zA-Z]+$/) && (val.length === 1 || val === "Backspace"))
    }
}

function renderBox(row, box, data) {
    [...document.querySelector(`.row-${row}`).children][box].innerText = data;
}

function evaluate(row) {
    let guess = boardContent[row].join('').toUpperCase();
    [...guess].forEach((entry, i) => {
        if (secretWord.includes(entry)) {
            if (entry === secretWord[i]) {
                // Set the keyboard key color
                document.querySelector(`button[data-key=${entry.toUpperCase()}]`).style.backgroundColor = "green";
                // Set the box color
                [...document.querySelector(`.row-${row + 1}`).children][i].style.backgroundColor = "green";
            } else {
                document.querySelector(`button[data-key=${entry.toUpperCase()}]`).style.backgroundColor = "yellow";;
                [...document.querySelector(`.row-${row + 1}`).children][i].style.backgroundColor = "yellow";
            }
        } else {
            document.querySelector(`button[data-key=${entry.toUpperCase()}]`).style.backgroundColor = "grey";;
            [...document.querySelector(`.row-${row + 1}`).children][i].style.backgroundColor = "grey";
        }
    })
}

function insertKey(key) {
    if (key === "Backspace".toUpperCase() && currentRow < boardContent.length) {
        boardContent[currentRow][currentBox] = 0;
        if (currentBox !== 0) {
            currentBox--;
            renderBox(currentRow + 1, currentBox, "");
        }
    } else {
        if (currentRow < boardContent.length) {
            boardContent[currentRow][currentBox] = key;
            renderBox(currentRow + 1, currentBox, key);
            currentBox++;
        }
        if (currentRow < boardContent.length && boardContent[currentRow][currentBox] !== 0) {
            evaluate(currentRow);
            currentBox = 0;
            currentRow++;
        }
    }
}

getNewWord();