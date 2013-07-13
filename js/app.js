"use strict";

(function(win, doc, nav) {
    var canvas, context, width, height, num, size, resolution;
    var Spiral = function() {
        var radius = resolution || 6;
        //init is -1,-1
        var point = {
            x : 0,
            y : 0
        };
        //0:right;1:up,2:left,3:down
        var direction = {
            0 : {
                "x" : 1,
                "y" : 0
            },
            1 : {
                "x" : 0,
                "y" : 1
            },
            2 : {
                "x" : -1,
                "y" : 0
            },
            3 : {
                "x" : 0,
                "y" : -1
            }
        }
        var drawPoint = function(opt) {
            opt = opt || {};
            opt.x = opt.x || 0;
            opt.y = opt.y || 0;
            opt.radius = opt.radius || radius / 2;
            opt.color = opt.color || 'red';
            if (opt.x > width || opt.y > height) {
                return false;
            }
            context.beginPath();
            var coord = {
                x : (width / 2) + (opt.x * radius * 2),
                y : (height / 2) + (-1 * opt.y * radius * 2)
            };
            context.arc(coord.x, coord.y, opt.radius, 0, 2 * Math.PI, false);
            context.fillStyle = opt.color;
            context.fill();
            return true;
        };
        var setDirection = function(point, dirIndex) {
            if ((dirIndex >= 0 || dirIndex < 4)) {
                point.x += direction[dirIndex].x;
                point.y += direction[dirIndex].y;
            }
            return point;
        }
        var nextDirection = function(dir) {
            dir += 1;
            if (dir > 3) {
                dir = 0;
            }
            return dir;
        };
        var generate = function() {
            var directionSteps = 1;
            var directionIndex = 0;
            //var i = 1;
            var i = num;
            drawPoint({
                x : point.x,
                y : point.y,
                color : '#f00',
                radius : radius
            });
            var cont = true;
            if (window.Worker) {
                //creates a worker
                var primeWorker = new Worker("js/worker.prime.js");
                primeWorker.onmessage = function(oEvent) {
                    var data = JSON.parse(oEvent.data);
                    var pointToDraw = data;
                    drawPoint(pointToDraw);
                };
            }
            do {
                for (var k = 0; k < 2; k++) {
                    for (var ds = 0; ds < directionSteps; ds += 1) {
                        i += 1;
                        //increment number
                        point = setDirection(point, directionIndex);

                        if (window.Worker) {
                            //post to worker
                            primeWorker.postMessage(JSON.stringify({
                                point : point,
                                number : i,
                                radius : radius
                            }));
                        } else {
                            //no web worker :()
                            var pointToDraw = {};
                            if (isPrime(i)) {
                                pointToDraw = {
                                    x : point.x,
                                    y : point.y,
                                    color : '#000',
                                    radius : radius / 2
                                };
                            } else {
                                pointToDraw = {
                                    x : point.x,
                                    y : point.y,
                                    color : '#ddd',
                                    radius : 1
                                };
                            }
                            drawPoint(pointToDraw);
                        }

                        if (i > ((width / radius) * (width / radius) - 1)) {
                            cont = false;
                            return;
                        }
                    }
                    directionIndex = nextDirection(directionIndex);
                }
                directionSteps += 1;
            } while (cont) ;
        }
        return {
            generate : generate
        }
    };
    //is prime number?
    var isPrime = function(num) {
        if (num < 2)
            return false;
        for (var i = 2; i < num; i++) {
            if (num % i == 0)
                return false;
        }
        return true;
    }
    //generate
    var generate = function() {
        try {
            $('#canvas').hide();
            $('#error').hide();
            num = parseInt($('#startNum').val(), 10);
            if (num < 1) {
                throw 'Starting number must be > 0'
            }
            var canvasSize = parseInt($('#canvasSize').val(), 10);
            if (canvasSize < 1) {
                throw 'Size of spiral must be > 0'
            }
            resolution = 6;
            canvas = doc.getElementById("canvas");
            canvas.width = (canvasSize * resolution * 2);
            if (canvas.width != canvas.height) {
                canvas.height = canvas.width;
            }
            width = parseInt(canvas.width, 10);
            height = parseInt(canvas.height, 10)
            context = canvas.getContext("2d");
            context.rect(0, 0, width, height);
            context.fillStyle = '#fff';
            context.fill();
            var spiral = new Spiral();
            spiral.generate();
            $('#canvas').css('width', '100%');
            $('#canvas').show();
        } catch(e) {
            console.log(e);
            $('#error').html('<strong>Hmm...</strong>&nbsp;' + e);
            $('#error').fadeIn();
        }

    }
    addEventListener("DOMContentLoaded", function() {
        $('#generateButton').click(function() {
            generate();
        });
        $('#canvas').click(function(elm) {
            var url = canvas.toDataURL("image/png");
            window.open(url, 'Ulam spiral');

        });
        generate();
    });

})(window, document, navigator);
