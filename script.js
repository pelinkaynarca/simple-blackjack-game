// Deck of Cards API URL
const apiUrl = "https://www.deckofcardsapi.com/api/deck";

// Game state
let deckId;
let playerCards = [];
let dealerCards = [];
let playerSum = 0;
let dealerSum = 0;
let gameEnded = false;

// DOM elements
const logo = document.getElementById("blackjackLogo");
const cardsClass = document.getElementsByClassName("cards");
const startButton = document.getElementById("startButton");
const hitButton = document.getElementById("hitButton");
const standButton = document.getElementById("standButton");
const restartButton = document.getElementById("restartButton");
const message = document.getElementById("message");
const playerCardsContainer = document.getElementById("playerCardImages");
const dealerCardsContainer = document.getElementById("dealerCardImages");
const playerSumDisplay = document.getElementById("playerSum");
const dealerSumDisplay = document.getElementById("dealerSum");

// Start the game
function startGame() {
    // Reset the game state
    playerCards = [];
    dealerCards = [];
    playerSum = 0;
    dealerSum = 0;
    gameEnded = false;

    // Hide or display buttons
    for (const card of cardsClass) {
        card.style.display = "block";
    }

    logo.style.cssText = "width: 50px; position: fixed; top: 0; right: 0; margin: 20px";
    startButton.style.display = "none";
    hitButton.style.display = "block";
    standButton.style.display = "block";
    restartButton.style.display = "none";

    message.textContent = "Let's play! Hit or Stand!";

    // Shuffle a new deck
    fetch(`${apiUrl}/new/shuffle/?deck_count=1`)
        .then(response => response.json())
        .then(data => {
            deckId = data.deck_id;
            drawCards(2, playerCardsContainer, playerCards, playerSumDisplay);
            drawCards(2, dealerCardsContainer, dealerCards, dealerSumDisplay);
        });
}

// Draw a card from the deck and add it to a container
function drawCards(count, container, cardArray, SumDisplay) {
    fetch(`${apiUrl}/${deckId}/draw/?count=${count}`)
        .then(response => response.json())
        .then(data => {
            data.cards.forEach(card => {
                const cardElement = document.createElement("img");
                cardElement.src = card.image;
                cardElement.style.height = "200px";

                // Create a card container and add the card to it
                const cardContainer = document.createElement("div");
                cardContainer.classList.add("cardContainer");
                cardContainer.appendChild(cardElement);

                // Styles for the cardContainer
                cardContainer.style.cssText = "border: 4px solid goldenrod; margin: 5px; display: inline-flex; padding: 5px; border-radius: 15px";

                // Add the card container to the specified container
                container.appendChild(cardContainer);

                cardArray.push(card);
                SumDisplay.textContent = calculateSum(cardArray);
            });

            if (calculateSum(cardArray) >= 21) {
                endGame();
            }
        });
}



// Calculate the Sum value of the cards
function calculateSum(cards) {
    let Sum = 0;
    let hasAce = false;

    for (const card of cards) {
        const value = card.value;
        if (value === "ACE") {
            hasAce = true;
            Sum += 11;
        } else if (["KING", "QUEEN", "JACK"].includes(value)) {
            Sum += 10;
        } else {
            Sum += parseInt(value);
        }
    }

    if (hasAce && Sum > 21) {
        Sum -= 10; // Change the value of one Ace from 11 to 1
    }

    return Sum;
}

// Player hits for a new card
function hit() {
    drawCards(1, playerCardsContainer, playerCards, playerSumDisplay);
}

// Player stands and dealer takes their turn
function stand() {

    while (calculateSum(dealerCards) < 17) {
        drawCards(1, dealerCardsContainer, dealerCards, dealerSumDisplay);
    }

    endGame();
}

// End the game and determine the winner
function endGame() {
    gameEnded = true;
    hitButton.style.display = "none";
    standButton.style.display = "none";
    restartButton.style.display = "block";

    const playerSum = calculateSum(playerCards);
    const dealerSum = calculateSum(dealerCards);

     // Calculate the absolute differences
     const playerDifference = Math.abs(21 - playerSum);
     const dealerDifference = Math.abs(21 - dealerSum);

    if (playerSum > 21 || dealerSum === 21 || playerDifference > dealerDifference) {
        message.textContent = "Dealer wins!";
    } else if (dealerSum > 21 || playerSum === 21 || dealerDifference > playerDifference ) {
        message.textContent = "Player wins!";
    } else if (dealerSum = playerSum) {
        message.textContent = "It's a tie!";
    }
}

// Restart the game without showing the "Start Game" button
function restartGame() {
    // Reset the card containers
    playerCardsContainer.innerHTML = "";
    dealerCardsContainer.innerHTML = "";

    startGame();
}