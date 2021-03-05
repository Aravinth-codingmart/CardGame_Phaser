class MainScene extends Phaser.Scene {
    constructor() {
        super({ key: "MainScene" });
        this.options = {
            cardWidth: 334,
            cardHeight: 440,
            cardScale: 0.8
        };
    }
    preload() {
        for (var i = 0; i < 10; i++) {
            this.load.spritesheet("cards" + i, "assets/cards" + i + ".png", { frameWidth: this.options.cardWidth, frameHeight: this.options.cardHeight });
        }
        this.load.spritesheet("info", "assets/info.png", { frameWidth: 500, frameHeight: 184 });
        this.load.spritesheet("swipe", "assets/swipe.png", { frameWidth: 80, frameHeight: 130 });
    }
    create() {
        this.score = 0;
        this.scoreText = this.add.text(this.scale.width * 0.385, 10, "Score: " + this.score, { fontSize: '38px', fill: '#000' });
        this.descGroup = this.add.group();
        this.deck = Phaser.Utils.Array.NumberArray(0, 51);
        Phaser.Utils.Array.Shuffle(this.deck);
        console.log(this.deck);
        this.cardsIn = [this.generateCard(0), this.generateCard(1)];
        this.nextIndex = 2;
        var tween = this.tweens.add({
            targets: this.cardsIn[0],
            x: this.scale.width / 2,
            duration: 500
        });
        tween.on("complete", () => {
            this.descGroup.setVisible(true);
        }, this);

        var infoUp = this.add.sprite(this.scale.width / 2, this.scale.height / 6, "info");
        this.descGroup.add(infoUp);
        infoUp.setScale(0.5);
        var infoDown = this.add.sprite(this.scale.width / 2, this.scale.height * 5 / 6, "info");
        infoDown.setFrame(1);
        infoDown.setScale(0.5);
        this.descGroup.add(infoDown);
        var upSwipe = this.add.sprite(this.scale.width / 2, this.scale.height / 2 - this.options.cardHeight / 5, "swipe");
        upSwipe.setScale(0.5);
        this.tweens.add({
            targets: upSwipe,
            y: upSwipe.y - 60,
            duration: 1000,
            repeat: -1
        }, this);
        this.descGroup.add(upSwipe);
        var downSwipe = this.add.sprite(this.scale.width / 2, this.scale.height / 2 + this.options.cardHeight / 5, "swipe");
        downSwipe.setScale(0.5);
        this.tweens.add({
            targets: downSwipe,
            y: downSwipe.y + 60,
            duration: 1000,
            repeat: -1
        }, this);
        this.descGroup.add(downSwipe);
        this.descGroup.setVisible(false);
        this.input.on("pointerdown", this.startSwipe, this);
    }
    generateCard(index) {
        var card = this.add.sprite(this.options.cardWidth * this.options.cardScale / -2, this.scale.height / 2, "cards0");
        card.setScale(0.3);
        card.setTexture("cards" + this.getCardsTexture(this.deck[index]), this.getCardsFrame(this.deck[index]));
        return card;
    }
    getCardsTexture(cardVal) {
        var value = Math.floor((cardVal % 13) / 3) + 5 * Math.floor(cardVal / 26);
        return value;
    }
    getCardsFrame(cardVal) {
        var value = (cardVal % 13) % 3 + 3 * (Math.floor(cardVal / 13) % 2)
        return value;
    }
    startSwipe() {
        this.descGroup.setVisible(false);
        this.input.on("pointerdown", () => { }).removeAllListeners();
        this.input.on("pointerup", this.endSwipe, this);
    }
    endSwipe(e) {
        this.input.on("pointerup", () => { }).removeAllListeners();
        console.log("end");
        if (e.downY > e.upY) {
            console.log(-1);
            this.swipeHandler(-1);
        }
        else if (e.downY < e.upY) {
            console.log(1);
            this.swipeHandler(1);
        }
        this.input.on("pointerdown", this.startSwipe, this);
    }
    swipeHandler(direction) {
        var movecard = (this.nextIndex + 1) % 2;
        this.cardsIn[movecard].y += direction * this.options.cardHeight * 0.4;
        var tween = this.tweens.add({
            targets: this.cardsIn[movecard],
            x: this.scale.width / 2,
            duration: 500
        });
        tween.on("complete", () => {
            var newCard = this.deck[this.nextIndex - 1];
            var oldCard = this.deck[this.nextIndex - 2];
            console.log("newcard " + newCard);
            console.log("oldcard " + oldCard);
            if (((direction == -1) && ((newCard % 13 > oldCard % 13) || (newCard % 13 == oldCard % 13))) || ((direction == 1) && (newCard % 13 < oldCard % 13) || ((newCard % 13 == oldCard % 13)))) {
                this.nextStep();
            }
            else {
                this.gameEnd();
            }
        }, this);
    }
    nextStep() {
        this.score += 10;
        this.scoreText.text = "Score: " + this.score;
        var moveCard = this.nextIndex % 2;
        this.tweens.add({
            targets: this.cardsIn[moveCard],
            x: this.scale.width + this.options.cardWidth * this.options.cardScale,
            duration: 500
        }, this);
        moveCard = (this.nextIndex + 1) % 2;
        var moveCentreTween = this.tweens.add({
            targets: this.cardsIn[moveCard],
            y: this.scale.height / 2,
            duration: 500
        }, this);
        moveCentreTween.on("complete", () => {
            var moveCard = this.nextIndex % 2;
            this.cardsIn[moveCard].setTexture("cards" + this.getCardsTexture(this.deck[this.nextIndex]), this.getCardsFrame(this.deck[this.nextIndex]));
            this.nextIndex = (this.nextIndex + 1) % 52;
            this.cardsIn[moveCard].x = this.options.cardWidth * this.options.cardScale / -2;
            this.descGroup.setVisible(true);
        }, this);
    }
    gameEnd() {
        for (var i = 0; i < 2; i++) {
            this.tweens.add({
                targets: this.cardsIn[i],
                alpha: 0,
                duration: 500,
            }, this);
        }
        this.tweens.add({
            targets: this.scoreText,
            y: this.scale.height * 0.385,
            x: this.scale.height * 0.385,
            scale: 2,
            duration: 1000,
            onComplete: () => {
                this.time.addEvent({
                    delay: 1000,
                    callback: () => {
                        this.scene.start("MainScene");
                    }
                }, this);
            }
        })
    }
}
