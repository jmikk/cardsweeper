// ==UserScript==
// @name         Can you guess the card? Guess wrong and they all go boom
// @version      3.1
// @description  Find the Bomb or lose all the cards, try and defuse a card that's not a bomb, BLOW IT UP! Will junk cards and remove their corresponding containers after animations have played, with junk confirmation turned off.
// @author       9003
// @match        https://www.nationstates.net/*page=deck*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // Add CSS for explosion effect and buttons
    const style = document.createElement('style');
    style.innerHTML = `
        .deckcard.exploding::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%; /* Full card width */
            height: 100%; /* Full card height */
            background: url('https://i.imgur.com/POgPFOp.png') no-repeat center center;
            background-size: cover;
            opacity: 0; /* Start invisible */
            z-index: 10; /* Ensure it overlays the card */
            animation: explosion-overlay 2.5s ease-out forwards; /* Match GIF duration */
        }

        .deckcard.exploding {
            position: relative;
            animation: fadeout-card 2.5s ease-out forwards; /* Match GIF duration */
        }

        @keyframes explosion-overlay {
            0% { opacity: 0; }
            10% { opacity: 1; } /* Explosion becomes visible early */
            100% { opacity: 0; } /* Fades out by the end */
        }

        @keyframes fadeout-card {
            0% { opacity: 1; transform: scale(1); }
            100% { opacity: 0; transform: scale(0); } /* Shrinks and disappears */
        }

        .deckcard-buttons {
            display: flex;
            gap: 5px;
            margin-bottom: 10px;
            justify-content: center;
        }

        .deckcard-buttons button {
            padding: 5px 10px;
            font-size: 12px;
            cursor: pointer;
        }

        .deckcard { pointer-events: auto; cursor: pointer; }
    `;
    document.head.appendChild(style);

    // Check if "Tap cards to reveal..." is present
    function isRevealMessagePresent() {
        return document.body.textContent.includes('Tap cards to reveal...');
    }

    // Add defuse buttons and handle card clicks
    function addBehaviorToCards() {
        const cards = Array.from(document.querySelectorAll('.deckcard')); // Get all deck cards
        const junkButtons = Array.from(document.querySelectorAll('.deckcard-junk-button'));
        if (cards.length !== 5 || junkButtons.length !== 5) return; // Ensure there are exactly 5 cards and junk buttons

        // Set all junk buttons' rarity to "uncommon"
        junkButtons.forEach((junkButton) => {
            junkButton.dataset.rarity = "uncommon";
        });

        // Randomly pick one card to be the bomb
        const bombIndex = Math.floor(Math.random() * cards.length);

        // Function to remove the corresponding card's container after animation
        const removeContainerAfterAnimation = (cardElement) => {
            const container = cardElement.closest('.deckcard-container');
            if (container) {
                setTimeout(() => {
                    container.remove();
                }, 2500); // Wait for the animation duration before removing
            }
        };

        cards.forEach((card, index) => {
            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'deckcard-buttons';

            // Create defuse button
            const defuseButton = document.createElement('button');
            defuseButton.textContent = 'Defuse';
            defuseButton.addEventListener('click', (event) => {
                defuseButton.remove();
                const junkButton = junkButtons[index];
                if (junkButton) {
                    junkButton.click(); // Click the junk button for the current card
                }
                if (index === bombIndex) {
                    // Flip all other cards' backs safely
                    cards.forEach((otherCard, otherIndex) => {
                        if (otherIndex !== bombIndex) {
                            otherCard.classList.remove('flipped');
                        }
                    });
                }
                removeContainerAfterAnimation(card); // Remove the card's container after animation
            });

            buttonContainer.appendChild(defuseButton);
            card.parentNode.insertBefore(buttonContainer, card); // Place buttons directly above the card

            // Add click event to the card
            card.addEventListener('click', () => {
                if (!card.classList.contains('flipped')) {
                    card.classList.add('flipped'); // Play the original flip effect
                    setTimeout(() => {
                        if (index === bombIndex) {
                            // Trigger explosion for all cards and click their junk buttons
                            junkButtons.forEach((junkButton) => {
                                const cardElement = junkButton.closest('.deckcard');
                                if (cardElement) {
                                    alert("Play fair click the button to blow up your card")
                                    cardElement.classList.add('exploding'); // Add explosion effect
                                    setTimeout(() => junkButton.click(), 2500); // Click junk button after animation
                                    removeContainerAfterAnimation(cardElement); // Remove the card's container after animation
                                }
                            });
                        }
                    }, 500); // Delay to align with the flip effect
                }
            });
        });
    }

    // Initialize the script if the reveal message is present
    if (isRevealMessagePresent()) {
        addBehaviorToCards();
    }
})();
