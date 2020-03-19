$(function() {
    let choices = ["rock", "paper", "scissors"];
    let mobile = window.matchMedia("(max-width: 850px)");

    class Player {
        constructor(name, type, choice, score, history, hand, active) {
            this.name = name;
            this.type = type;
            this.choice = choice;
            this.score = score;
            this.history = history;
            this.hand = hand;
            this.active = active;
            // this.strategies = [this.socialCycling, this.frequencyCounting, this.randomChoice];
            // this.currentStrategy = this.strategies[0];
            this.predictors = {
                socialCycling: { 
                    prediction: 0,
                    score: 0
                },
                antiSocialCycling: {
                    prediction: 0,
                    score: 0
                },
                frequencyCounting: {
                    prediction: 0,
                    score: 0
                },
                patternSearch: {
                    prediction: 0,
                    score: 0
                }
            };
            this.opponent = "";
            this.decayFactor = 0.9;
        }

        get successRate() {
            if (this.history.length == 0) {
                return 0.5;
            } else {
                let wins = 0;
                let numberOfGames = 0;
                for (let i = 0; i < this.history.length; i++) {
                    numberOfGames++;
                    if (this.history[i].outcome == 1) {
                        wins++;
                    }
                }

                return wins / numberOfGames;
            }
        }

        chooseStrategy() {

            let sC = this.predictors.socialCycling;
            let aSC = this.predictors.antiSocialCycling;
            let fC = this.predictors.frequencyCounting;
            let pS = this.predictors.patternSearch;

            sC.prediction = this.socialCycling();
            // console.log(this.name + " SC Prediction: " + sC.prediction);
            // console.log(this.name + " SC Score: " + sC.score);
            aSC.prediction = this.antiSocialCycling();

            fC.prediction = this.frequencyCounting();
            // console.log(this.name + " FC Prediction: " + fC.prediction);
            // console.log(this.name + " FC Score: " + fC.score);
            pS.prediction = this.patternSearch();
            // console.log(this.name + " PS Prediction: " + pS.prediction);
            // console.log(this.name + " PS Score: " + pS.score);

            let choice = Math.max(sC.score, aSC.score, fC.score, pS.score);
            // console.log(choice);

            switch (choice) {
                case sC.score:
                    console.log(this.name + ": Social Cycling");
                    return sC.prediction;
                    
                case aSC.score:
                    console.log(this.name + ": Anti-Social Cycling");
                    return aSC.prediction;

                case fC.score:
                    if (fC.prediction != - 1) {
                        console.log(this.name + ": Frequency Counting");
                        return fC.prediction;
                    }

                case pS.score:
                    if (pS.prediction != - 1) {
                        console.log(this.name + ": Pattern Search");
                        return pS.prediction;
                    }

                default:
                    console.log(this.name + ": Random Choice");
                    return this.randomChoice();

            }

        }

        updateStrategyScores() {
            let opponent = this.opponent;

            if (opponent.history.length > 0) {
                let opponentMove = opponent.history[opponent.history.length - 1].choice;
    
                let winningMove = opponentMove + 1;
                if (winningMove > 2) {
                    winningMove = 0;
                }

                let losingMove = opponentMove - 1;
                if (losingMove < 0) {
                    losingMove = 2;
                }
                
                let predictors = Object.entries(this.predictors);

                for (let i = 0; i < predictors.length; i++) {
                    let strategy = predictors[i][0];
                    let predictions = Object.entries(predictors[i][1]);
                    let currentPrediction = predictions[0][1];

                    if (currentPrediction == winningMove) {
                        this.predictors[strategy].score++;
                    } else if (currentPrediction == losingMove) {
                        this.predictors[strategy].score--;
                    }
                    this.predictors[strategy].score *= this.decayFactor;
                }

            }


        }

        randomChoice() {
            return Math.floor(Math.random() * 3); // choose at random
        }

        frequencyCounting() {

            let opponent = this.opponent;
            
            let rock = 0;
            let paper = 0;
            let scissors = 0;

            for (let i = 0; i < opponent.history.length; i++) {
                switch(opponent.history[i].choice) {
                    case 0:
                        rock++;
                        break;

                    case 1:
                        paper++;
                        break;

                    case 2:
                        scissors++;
                        break;
                }
            }

            let total = opponent.history.length;

            let rockProbability = rock / total;
            let paperProbability = paper / total;
            let scissorsProbability = scissors / total;

            if (rock > paper && rock > scissors) {
                if (probability(rockProbability)) {
                    return 1; // paper
                } else if (paper > scissors) {
                    if (probability(paperProbability)) {
                        return 2; // scissors
                    } else {
                        return -1; // no prediction
                    }
                } else {
                    if (probability(scissorsProbability)) {
                        return 0; // rock
                    } else {
                        return -1; // no prediction
                    }
                }
            } else if (paper > rock && paper > scissors) {
                if (probability(paperProbability)) {
                    return 2; // scissors
                } else if (rock > scissors) {
                    if (probability(rockProbability)) {
                        return 1; // paper
                    } else {
                        return -1; // no prediction
                    }
                } else {
                    if (probability(scissorsProbability)) {
                        return 0; // rock
                    } else {
                        return -1; // no prediction
                    }
                }
            } else if (scissors > rock && scissors > paper) {
                if (probability(scissorsProbability)) {
                    return 0; // rock
                } else if (rock > paper) {
                    if (probability(rockProbability)) {
                        return 1; // paper
                    } else {
                        return -1; // no prediction
                    }
                } else {
                    if (probability(paperProbability)) {
                        return 2; // scissors
                    } else {
                        return -1; // no prediction
                    }
                }
            } else {
                return -1; // no prediction
            }


        }

        socialCycling() {

            let opponent = this.opponent;

            let opponentPrevious = opponent.history[opponent.history.length - 1];
            let selfPrevious = this.history[this.history.length - 1];

            if (opponentPrevious.outcome == 1) { // you lost the last round so opponent will likely play the same hand again

                    if (opponentPrevious.choice == 2) { // opponent chose scissors
                        return 0; // choose rock
                    } else if (opponentPrevious.choice == 1) { // opponent chose paper
                        return 2; // choose scissors
                    } else { // opponent chose rock
                        return 1; // choose paper
                    }

            } else { // you won or tied last round so opponent will likely choose the hand that beats your last hand

                    if (selfPrevious.choice == 0) { // you chose rock last time, so opponent will likely choose paper
                        return 2; // choose scissors
                    } else if (selfPrevious.choice == 1) { // you chose paper last time, so opponent will likely choose scissors
                        return 0; // choose rock
                    } else { // you chose scissors last time, so opponent will likely choose rock
                        return 1; // choose paper
                    }

            }
        }

        antiSocialCycling() {
            let sC = this.socialCycling();

            if (sC == 0) {
                return 1;
            } else if (sC == 1) {
                return 2;
            } else if (sC == 2) {
                return 0;
            }

        }

        patternSearch () {

            let opponent = this.opponent;

            let rock = 0;
            let paper = 0;
            let scissors = 0;

            if (opponent.history.length > 3) {
                let allChoices = [];
                let pattern = [];

                pattern.push(opponent.history[opponent.history.length - 4].choice);
                pattern.push(opponent.history[opponent.history.length - 3].choice);
                pattern.push(opponent.history[opponent.history.length - 2].choice);
                pattern.push(opponent.history[opponent.history.length - 1].choice);

                // console.log("Pattern: " + pattern);

                for (let i = 0; i < opponent.history.length; i++) {
                    allChoices.push(opponent.history[i].choice);
                }

                for (let i = 0; i < allChoices.length; i++) {
                    for (let j = 0; j < pattern.length; j++) {
                        if (allChoices[i + j] != pattern[j]) {
                            break;
                        }

                        if (j == pattern.length - 1) {
                            if (allChoices[i + 1] == 0) {
                                rock++;
                            } else if (allChoices[i + 1] == 1) {
                                paper++;
                            } else if (allChoices[i + 1] == 2) {
                                scissors++;
                            }
                        }
                    }
                }

                let choice = Math.max(rock, paper, scissors);
    
                switch (choice) {
                    case rock:
                        return 1; // paper
    
                    case paper:
                        return 2; // scissors
    
                    case scissors:
                        return 0; // scissors
                }

            } else {
                return -1; // can't make prediction
            }
            
        }
    }


    let player1, player2, rounds;
    let round = 1;

    $('#startGame').click(function() {     
        let name = $('#player1Name').val();
        if (name == "") {
            name = "Player 1";
        }
        let type = $('input[name="player1Type"]:checked').val();
        player1 = new Player(name, type, "", 0, [], "#player1Hand", true);

        $('#player1ScoreboardName').html(player1.name + ":");

        name = $('#player2Name').val();
        if (name == "") {
            name = "Player 2";
        }
        type = $('input[name="player2Type"]:checked').val();
        player2 = new Player(name, type, "", 0, [], "#player2Hand", false);

        $('#player2ScoreboardName').html(player2.name + ":");

        player1.opponent = player2;
        player2.opponent = player1;

        rounds = $('#rounds').val();
        if (rounds == 0) {
            rounds = Infinity;
        }

        $('.setupScreen').toggleClass('hidden');
        $('.gameBoard').toggleClass('hidden');
        $('footer').toggleClass('hidden');

        if (mobile.matches) {
            $('.player1 button').toggleClass('hidden');
            $('.player2 button').toggleClass('hidden');
        }

        loadIn();

    });

    function loadIn() {
        $('header').removeClass('mobileSetupSize');
        $('.player1 .hand').addClass('loadPlayer1');
        $('.player2 .hand').addClass('loadPlayer2');
        $('.scoreboard').addClass('loadScoreboard');
        $('.rock').addClass('loadRock');
        $('.paper').addClass('loadPaper');
        $('.scissors').addClass('loadScissors');
        setTimeout(function() {
            $('.player1 .hand').removeClass('loadPlayer1');
            $('.player2 .hand').removeClass('loadPlayer2');
            $('.scoreboard').removeClass('loadScoreboard');
            $('.rock').removeClass('loadRock');
            $('.paper').removeClass('loadPaper');
            $('.scissors').removeClass('loadScissors');
            nextTurn();
        }, 1000);
    }

    $("#player1Rock").click(function() {
        player1.choice = 0;
        player1.active = false;
        $('.player1 button').attr('disabled', true);
        if (mobile.matches) {
            $('.player1 button').toggleClass('hidden');
        }
        player2.active = true;
        nextTurn();
    });

    $("#player1Paper").click(function() {
        player1.choice = 1;
        player1.active = false;
        $('.player1 button').attr('disabled', true);
        if (mobile.matches) {
            $('.player1 button').toggleClass('hidden');
        }
        player2.active = true;
        nextTurn();
    });

    $("#player1Scissors").click(function() {
        player1.choice = 2;
        player1.active = false;
        $('.player1 button').attr('disabled', true);
        if (mobile.matches) {
            $('.player1 button').toggleClass('hidden');
        }
        player2.active = true;
        nextTurn();
    });

    $("#player2Rock").click(function() {
        player2.choice = 0;
        player2.active = false;
        $('.player2 button').attr('disabled', true);
        if (mobile.matches) {
            $('.player2 button').toggleClass('hidden');
        }
        nextTurn();
    });

    $("#player2Paper").click(function() {
        player2.choice = 1;
        player2.active = false;
        $('.player2 button').attr('disabled', true);
        if (mobile.matches) {
            $('.player2 button').toggleClass('hidden');
        }
        nextTurn();
    });

    $("#player2Scissors").click(function() {
        player2.choice = 2;
        player2.active = false;
        $('.player2 button').attr('disabled', true);
        if (mobile.matches) {
            $('.player2 button').toggleClass('hidden');
        }
        nextTurn();
    });

    function nextTurn() {
        $('#round').html("Round: " + round);
        if (rounds < Infinity) {
            $('#round').append(' / ' + rounds);
        }
        $('#winner').html("");

        if (player1.active) {
            if (player1.type == 'computer') {
                player1.choice = computerDecision(player1, player2);
                player1.active = false;
                player2.active = true;
                nextTurn();
            } else {
                $('.player1 button').attr('disabled', false);
                if (mobile.matches) {
                    $('.player1 button').toggleClass('hidden');
                }
            }
        } else if (player2.active) {
            if (player2.type == 'computer') {
                player2.choice = computerDecision(player2, player1);
                player2.active = false;
                nextTurn();
            } else {
                $('.player2 button').attr('disabled', false);
                if (mobile.matches) {
                    $('.player2 button').toggleClass('hidden');
                }
            }
        } else {
            playGame();
        }

    }

    function playGame() {
        moveHand(player1.hand, 0);
        moveHand(player2.hand, 0);
        shakeHands();
        setTimeout(function() {
            presentHands();
            let winner = findWinner();
            updateScoreboard(winner);
            updateHistory(player1, player2, winner);
            updateHistory(player2, player1, winner);
            $('.menu').toggleClass('hidden');
            if (round >= rounds) {
                $('#newGame').addClass('hidden');
                $('#nextRound').html('End Game');
            }
            round++;
            // console.log(player1.name + " success rate: " + player1.successRate);
            // console.log(player2.name + " success rate: " + player2.successRate);
        }, 1200);
    }

    function endGame() {
        if (player1.score > player2.score) {
            $('.player1 .hand').addClass('winnerPlayer1');
            $('.player2 .hand').addClass('loserPlayer2');
            moveHand(player1.hand, 3);
            setTimeout(function() {
                $('.player2 .hand').addClass('hidden');
                $('.player2 .choices').addClass('disappear');
                $('.player2 .playArea').addClass('hidden');
                $('.player2 .endScreen').removeClass('hidden');
                fillEndScreen(player1, player2);
                $('#newGame').removeClass('hidden');
                $('#nextRound').addClass('hidden');
            }, 1500);
        } else if (player2.score > player1.score) {
            $('.player2 .hand').addClass('winnerPlayer2');
            $('.player1 .hand').addClass('loserPlayer1');
            moveHand(player2.hand, 3);
            setTimeout(function() {
                $('.player1 .hand').addClass('hidden');
                $('.player1 .choices').addClass('disappear');
                $('.player1 .playArea').addClass('hidden');
                $('.player1 .endScreen').removeClass('hidden');
                fillEndScreen(player2, player1);
                $('#newGame').removeClass('hidden');
                $('#nextRound').addClass('hidden');
            }, 1500);
        } else {
            $('#newGame').removeClass('hidden');
            $('#nextRound').addClass('hidden');
            $('#winner').html('DRAW!');
            $('#winner').addClass('drawText');
        }
    }

    function fillEndScreen(winner, loser) {
        $('#winner').html("");
        $('.endScreen').html(winner.name + " wins!");
        $('.endScreen').append("<br>Success Rate: " + (winner.successRate * 100).toFixed(1) + "%");
        // $('.endScreen').append("<br><br>" + loser.name + "'s success rate: " + (loser.successRate * 100).toFixed(1) + "%");
    }

    $('#nextRound').click(function() {
        if (round > rounds) {
            endGame();
        } else {
            player1.active = true;
            $('.menu').toggleClass('hidden');
            nextTurn();
        }
    });

    $('#newGame').click(function() {
        location.reload();
    })

    function updateHistory(self, opponent, winner) {
        let outcome;
        if (winner == self) {
            outcome = 1;
        } else if (winner == opponent) {
            outcome = -1;
        } else {
            outcome = 0;
        }

        self.history.push(
            {
                choice: self.choice,
                outcome: outcome
            }
        );

        self.updateStrategyScores();

    }

    function presentHands() {
        moveHand(player1.hand, player1.choice);
        moveHand(player2.hand, player2.choice);
        $(player1.hand).removeClass('shakePlayer1Hand');
        $(player2.hand).removeClass('shakePlayer2Hand');
    }

    function shakeHands() {
        $(player1.hand).addClass('shakePlayer1Hand');
        $(player2.hand).addClass('shakePlayer2Hand');
    }

    function moveHand(hand, choice) {
        switch(choice) {
            case 0: // rock
                $(hand + ' .finger-1').removeClass('finger-angled');
                $(hand + ' .finger').addClass('finger-closed');
                $(hand + ' .thumb').addClass('thumb-closed');
                break;

            case 1: // paper
                $(hand + ' .finger-1').removeClass('finger-angled');
                $(hand + ' .finger').removeClass('finger-closed');
                $(hand + ' .thumb').removeClass('thumb-closed');
                break;

            case 2: // scissors
                $(hand + ' .finger-1').addClass('finger-angled');
                $(hand + ' .finger-1').removeClass('finger-closed');
                $(hand + ' .finger-2').removeClass('finger-closed');
                $(hand + ' .finger-3').addClass('finger-closed');
                $(hand + ' .finger-4').addClass('finger-closed');
                $(hand + ' .thumb').addClass('thumb-closed');
                break;
            
            case 3: // thumbs up!
                $(hand + ' .finger-1').removeClass('finger-angled');
                $(hand + ' .finger').addClass('finger-closed');
                $(hand + ' .thumb').removeClass('thumb-closed');
                break;
                
        }
    }

    function updateScoreboard(winner) {
        let player1Class, player2Class;
        if (winner == player1) {
            player1Class = "winner";
            player2Class = "loser";
        } else if (winner == player2) {
            player2Class = "winner";
            player1Class = "loser";
        } else {
            player2Class = "draw";
            player1Class = "draw";
        }

        $(".player1Choice div").prepend('<p class="' + player1Class + ' ' + choices[player1.choice] + '">' + choices[player1.choice] + "</p>");
        $('.player2Choice div').prepend('<p class="' + player2Class + ' ' + choices[player2.choice] + '">' + choices[player2.choice] + "</p>");
        if (winner != "Draw") {
            winner = winner.name + " wins!";
        }
        $('#winner').html(winner);
        $('#player1Score').html(player1.score);
        $('#player2Score').html(player2.score);
    }

    function computerDecision(self, opponent) {
        
        if (opponent.history.length == 0) {
            return self.randomChoice(); // choose at random
        } else {
            return self.chooseStrategy();
        }

    }

    function probability(n) {
        return !!n && Math.random() <= n;
    }

    function getAllIndexes(arr, val) {
        let indexes = [];
        for (let i = 0; i < arr.length; i++) {
            if (arr[i].choice == val) {
                indexes.push(i);
            }
        }
        return indexes;
    }

    function findWinner() {
        if (player1.choice > player2.choice) {

            if (player1.choice == 2 && player2.choice == 0) {
                player2.score++;
                return player2;
            } else {
                player1.score++;
                return player1;
            }

        } else if (player2.choice > player1.choice) {

            if (player2.choice == 2 && player1.choice == 0) {
                player1.score++;
                return player1;
            } else {
                player2.score++;
                return player2;
            }

        } else {
            return "Draw";
        }
    }
});