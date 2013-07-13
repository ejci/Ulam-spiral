/**
 * On message check for prime and send to parent for drawing
 * @param {Object} oEvent
 */
onmessage = function(oEvent) {
    var data = JSON.parse(oEvent.data);
    var point = data.point;
    var i = data.number;
    var pointToDraw = {};
    if (isPrime(i)) {
        pointToDraw = {
            x : point.x,
            y : point.y,
            color : '#000',
            radius : data.radius / 2
        };
    } else {
        pointToDraw = {
            x : point.x,
            y : point.y,
            color : '#ddd',
            radius : 1
        };
    }
    postMessage(JSON.stringify(pointToDraw));
};
var isPrime = function(num) {
    if (num < 2)
        return false;
    for (var i = 2; i < num; i++) {
        if (num % i == 0)
            return false;
    }
    return true;
}
