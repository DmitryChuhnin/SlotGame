let money = 10000;

const app = new PIXI.Application({ backgroundAlpha: 0 });
document.getElementById('game').appendChild(app.view);

PIXI.Assets.load([
    '/src/img/1.png',
    '/src/img/2.png',
    '/src/img/3.png',
    '/src/img/4.png',
    '/src/img/5.png',
    '/src/img/6.png',
    '/src/img/7.png',
    '/src/img/8.png',
    '/src/img/9.png',
    '/src/img/10.png',
    '/src/img/11.png',
    '/src/img/12.png',   
]).then(onAssetsLoaded);

const REEL_WIDTH = 170;
const SYMBOL_SIZE = 100;

function onAssetsLoaded() {
    const slotTextures = [
        PIXI.Texture.from('/src/img/1.png'),
        PIXI.Texture.from('/src/img/2.png'),
        PIXI.Texture.from('/src/img/3.png'),
        PIXI.Texture.from('/src/img/4.png'),
        PIXI.Texture.from('/src/img/5.png'),
        PIXI.Texture.from('/src/img/6.png'),
        PIXI.Texture.from('/src/img/7.png'),
        PIXI.Texture.from('/src/img/8.png'),
        PIXI.Texture.from('/src/img/9.png'),
        PIXI.Texture.from('/src/img/10.png'),
        PIXI.Texture.from('/src/img/11.png'),
        PIXI.Texture.from('/src/img/12.png'),
    ];

    // Build the reels
    const reels = [];
    const reelContainer = new PIXI.Container();
    for (let i = 0; i < 5; i++) {
        const rc = new PIXI.Container();
        rc.x = i * REEL_WIDTH;
        reelContainer.addChild(rc);

        const reel = {
            container: rc,
            symbols: [],
            position: 0,
            previousPosition: 0,
            blur: new PIXI.filters.BlurFilter(),
        };
        reel.blur.blurX = 0;
        reel.blur.blurY = 0;
        rc.filters = [reel.blur];

        // Build the symbols
        for (let j = 0; j < 3; j++) {
            const symbol = new PIXI.Sprite(slotTextures[Math.floor(Math.random() * slotTextures.length)]);
            // Scale the symbol to fit symbol area.
            symbol.y = j * SYMBOL_SIZE;
            symbol.scale.x = symbol.scale.y = Math.min(SYMBOL_SIZE / symbol.width, SYMBOL_SIZE / symbol.height);
            symbol.x = Math.round((SYMBOL_SIZE - symbol.width) / 2);
            reel.symbols.push(symbol);
            rc.addChild(symbol);
        }
        reels.push(reel);
    }
    app.stage.addChild(reelContainer);

    // Build top & bottom covers and position reelContainer
    const margin = (app.screen.height - SYMBOL_SIZE * 3) / 2;
    reelContainer.y = margin*1.7;
    reelContainer.x = Math.round(app.screen.width - REEL_WIDTH * 5)+65;
    const top = new PIXI.Graphics();
    top.beginFill(0, 0.5);
    top.drawRoundedRect(0, 100, app.screen.width, margin/5, 20);
    const bottom = new PIXI.Graphics();
    bottom.beginFill(0, 0);
    bottom.lineStyle(3, 0xFF00FF, 3);
    bottom.beginFill(0x650A5A, 0.75);
    bottom.drawRoundedRect(10, SYMBOL_SIZE * 3 + margin+30, app.screen.width-10, margin-60, 20);

    let g = new PIXI.Graphics();
    g.beginFill(0,1);
    g.drawRect(0,-100, app.screen.width, 320);
    g.endFill();
    reelContainer.addChild(g);
    reelContainer.mask = g;

    // Add play text
    const style = new PIXI.TextStyle({
        fontFamily: 'Arial',
        fontSize: 36,
        fontWeight: 'bold',
        fill: ['#ED8A2C', '#F5D549'], // gradient
        stroke: '#4a1850',
        strokeThickness: 5,
        dropShadow: true,
        dropShadowColor: '#000000',
        dropShadowBlur: 4,
        dropShadowAngle: Math.PI / 6,
        dropShadowDistance: 6,
        wordWrap: true,
        wordWrapWidth: 440,
    });

    const playText = new PIXI.Text('Spin the wheels!', style);
    playText.x = Math.round((bottom.width - playText.width) / 2);
    playText.y = app.screen.height - margin + Math.round((margin - playText.height) / 2);
    bottom.addChild(playText);

    // Add header text
    let headerText = new PIXI.Text(money+' $', style);
    headerText.x = Math.round((top.width - headerText.width) / 2);
    headerText.y = Math.round((margin - headerText.height) / 2);
    top.addChild(headerText);

    app.stage.addChild(top);
    app.stage.addChild(bottom);

    // Set the interactivity.
    bottom.interactive = true;
    bottom.cursor = 'pointer';
    bottom.addListener('pointerdown', () => {
        startPlay();
    });

    let running = false;

    // Function to start playing.
    function startPlay() {
        if (running) return;
        running = true;

        for (let i = 0; i < reels.length; i++) {
            const r = reels[i];
            const extra = Math.floor(Math.random() * 3);
            //random speen from api 
            //http://www.randomnumberapi.com/api/v1.0/random?min=100&max=1000&count=5
            //fetch('https://api.github.com/repos/javascript-tutorial/en.javascript.info/commits')
            //.then(response => response.json())
            //.then(commits => alert(commits[0].author.login));
            const target = r.position + 10 + i * 5 + extra;
            const time = 2500 + i * 600 + extra * 600;
            tweenTo(r, 'position', target, time, backout(0.5), null, i === reels.length - 1 ? reelsComplete : null);
        }
    }

    // Reels done handler.
    function reelsComplete() {
        running = false;
    }

    // Listen for animate update.
    app.ticker.add((delta) => {
    // Update the slots.
        for (let i = 0; i < reels.length; i++) {
            const r = reels[i];
            // Update blur filter y amount based on speed.
            // This would be better if calculated with time in mind also. Now blur depends on frame rate.
            r.blur.blurY = (r.position - r.previousPosition) * 100;
            r.previousPosition = r.position;

            // Update symbol positions on reel.
            for (let j = 0; j < r.symbols.length; j++) {
                const s = r.symbols[j];
                const prevy = s.y;
                s.y = ((r.position + j) % r.symbols.length) * SYMBOL_SIZE - SYMBOL_SIZE;
                if (s.y < 0 && prevy > SYMBOL_SIZE) {
                    // Detect going over and swap a texture.
                    // This should in proper product be determined from some logical reel.
                    s.texture = slotTextures[Math.floor(Math.random() * slotTextures.length)];
                    s.scale.x = s.scale.y = Math.min(SYMBOL_SIZE / s.texture.width, SYMBOL_SIZE / s.texture.height);
                    s.x = Math.round((SYMBOL_SIZE - s.width) / 2);
                }
            }
        }
    });
}

const tweening = [];
function tweenTo(object, property, target, time, easing, onchange, oncomplete) {
    const tween = {
        object,
        property,
        propertyBeginValue: object[property],
        target,
        easing,
        time,
        change: onchange,
        complete: oncomplete,
        start: Date.now(),
    };

    tweening.push(tween);
    return tween;
}
// Listen for animate update.
app.ticker.add((delta) => {
    const now = Date.now();
    const remove = [];
    for (let i = 0; i < tweening.length; i++) {
        const t = tweening[i];
        const phase = Math.min(1, (now - t.start) / t.time);

        t.object[t.property] = lerp(t.propertyBeginValue, t.target, t.easing(phase));
        if (t.change) t.change(t);
        if (phase === 1) {
            t.object[t.property] = t.target;
            if (t.complete) t.complete(t);
            remove.push(t);
        }
    }
    for (let i = 0; i < remove.length; i++) {
        tweening.splice(tweening.indexOf(remove[i]), 1);
    }
});

function lerp(a1, a2, t) {
    return a1 * (1 - t) + a2 * t;
}

function backout(amount) {
    return (t) => (--t * t * ((amount + 1) * t + amount) + 1);
}
