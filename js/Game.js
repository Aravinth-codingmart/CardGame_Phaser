/** @type {import("../typings/phaser")}*/

var config={
    width:750,
    height:1334,
    scale: {
        mode: Phaser.Scale.FIT,
        parent: 'cardGame',
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 800,
        height: 600
    },
    backgroundColor:"#4488AA",
    scene:[MainScene],
}

var game = new Phaser.Game(config);