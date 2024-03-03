var prefixes = ['webkit'];

function Gradient(image) {
    this.gradientData = [];

    this.image = image
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.imageDimensions = {
        width: 0,
        height: 0
    };
    this.imageData = [];
    const s = this.readImage();
    return s;
}

function readImage() {
    this.imageDimensions.width = this.image.width * 0.1;
    this.imageDimensions.height = this.image.height * 0.1;
    const s = this.render();
    return s;
}

function render() {
    this.canvas.width = this.imageDimensions.width;
    this.canvas.height = this.imageDimensions.height;
    this.ctx.drawImage(this.image, 0, 0, this.imageDimensions.width, this.imageDimensions.height);
    this.getImageData();
    const s = this.renderGradient();
    return s;
}

function getImageData() {
    const imageData = this.ctx.getImageData(0, 0, this.imageDimensions.width, this.imageDimensions.height).data;
    this.imageData = Array.from(imageData);
}

function renderGradient() {
    var ls = window.localStorage;
    var item_name = 'grade-' + this.image.getAttribute('src');
    var top = null;

    if (ls && ls.getItem(item_name)) {
        top = JSON.parse(ls.getItem(item_name));
    } else {
        var chunked = this.getChunkedImageData();
        top = this.getTopValues(this.getUniqValues(chunked));

        if (ls) {
            ls.setItem(item_name, JSON.stringify(top));
        }
    }

    if (this.callback) {
        this.gradientData = top;
        return;
    }

    var gradientProperty = this.getCSSGradientProperty(top);

    var textProperty = this.getTextProperty(top);

    var style = gradientProperty + '; ' + textProperty;
    return style;
}

function getChunkedImageData() {
    var perChunk = 4;

    var chunked = this.imageData.reduce(function (ar, it, i) {
        var ix = Math.floor(i / perChunk);
        if (!ar[ix]) {
            ar[ix] = [];
        }
        ar[ix].push(it);
        return ar;
    }, []);

    var filtered = chunked.filter(function (rgba) {
        return rgba.slice(0, 2).every(function (val) {
            return val < 250;
        }) && rgba.slice(0, 2).every(function (val) {
            return val > 0;
        });
    });

    return filtered;
}

function getRGBAGradientValues(top) {
    return top.map(function (color, index) {
        return 'rgb(' + color.rgba.slice(0, 3).join(',') + ') ' + (index == 0 ? '0%' : '75%');
    }).join(',');
}

function getCSSGradientProperty(top) {
    if (top[0] == null && top[1] == null) {
        return
    }
    var val = this.getRGBAGradientValues(top);
    return prefixes.map(function (prefix) {
        return 'background-image: -' + prefix + '-linear-gradient(\n                        135deg,\n                        ' + val + '\n                    )';
    }).concat(['background-image: linear-gradient(\n                    135deg,\n                    ' + val + '\n                )']).join(';');
}

function getMiddleRGB(start, end) {
    var w = 0.5 * 2 - 1;
    var w1 = (w + 1) / 2.0;
    var w2 = 1 - w1;
    var rgb = [parseInt(start[0] * w1 + end[0] * w2), parseInt(start[1] * w1 + end[1] * w2), parseInt(start[2] * w1 + end[2] * w2)];
    return rgb;
}

function getSortedValues(uniq) {
    var occurs = Object.keys(uniq).map(function (key) {
        var rgbaKey = key;
        var components = key.split('|'),
            brightness = (components[0] * 299 + components[1] * 587 + components[2] * 114) / 1000;
        return {
            rgba: rgbaKey.split('|'),
            occurs: uniq[key],
            brightness: brightness
        };
    }).sort(function (a, b) {
        return a.occurs - b.occurs;
    }).reverse().slice(0, 10);
    return occurs.sort(function (a, b) {
        return a.brightness - b.brightness;
    }).reverse();
}

function getTextProperty(top) {
    if (top[0] == null) return;
    var rgb = this.getMiddleRGB(top[0].rgba.slice(0, 3), top[1].rgba.slice(0, 3));
    var o = Math.round((parseInt(rgb[0]) * 299 + parseInt(rgb[1]) * 587 + parseInt(rgb[2]) * 114) / 1000);
    if (o > 125) {
        return 'color: #000';
    } else {
        return 'color: #fff';
    }
}

function getTopValues(uniq) {
    var sorted = this.getSortedValues(uniq);
    return [sorted[0], sorted[sorted.length - 1]];
}

function getUniqValues(chunked) {
    return chunked.reduce(function (accum, current) {
        var key = current.join('|');
        if (!accum[key]) {
            accum[key] = 1;
            return accum;
        }
        accum[key] = ++accum[key];
        return accum;
    }, {});
}