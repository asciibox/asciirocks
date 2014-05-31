/* The MIT License (MIT)
 *
 * Copyright (c) 2014 Oliver Bachmann, Karlsruhe, Germany
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
/*jslint browser: true, devel: true, plusplus: true */
 var xStart = 0;
 var yStart = 0;
 

function Codepage(codepageUrl, callback) {
        var COLORS, img, codepageImg;

        function createCanvas(width, height) {
            var newCanvas;
            newCanvas = document.createElement("canvas");
            newCanvas.setAttribute("width", width);
            newCanvas.setAttribute("height", height);
            canvasCharacterWidth=Math.floor(width/getDisplayWidth());
            canvasCharacterHeight=Math.floor(height/getDisplayHeight());
            return newCanvas;
        }

        function copyCanvas(source, color, preserveAlpha) {
            var canvas, ctx, imageData, i;
            canvas = createCanvas(source.width, source.height);
            ctx = canvas.getContext("2d");
            ctx.drawImage(source, 0, 0);
            imageData = ctx.getImageData(0, 0, source.width, source.height);
            for (i = 0; i < imageData.data.length; ++i) {
                imageData.data[i++] = COLORS[color][0];
                imageData.data[i++] = COLORS[color][1];
                imageData.data[i++] = COLORS[color][2];
                if (!preserveAlpha) { imageData.data[i] = 255; }
            }
            ctx.putImageData(imageData, 0, 0);
            return canvas;
        }
        
        

        img = new Image();
        img.onload = function () {
            //var i, background;
            characterWidth = 256/32; //img.width / 32;
            characterHeight = 128/8; // img.height / 8;
            
            /*codepageImgs = [];
            backgroundImgs = [];
            background = createCanvas(characterWidth, characterHeight);
            for (i = 0; i < COLORS.length; i++) {
                codepageImg = copyCanvas(img, i, true);
                backgroundImg = colorCanvas(background, i, false);
            }*/
            codepageImg=img;
            
            callback();
        };
        img.src = codepageUrl;
       

        function drawChar(ctx, asciiCode, foreground, background, x, y, transparent) {
           
            //console.log(" drawChar:"+ctx+" asciiCode:"+asciiCode+" foreground:"+foreground+" background:"+background+" x:"+x+" y:"+y+" characterWidth:"+characterWidth+" characterHeight: "+characterHeight);
            if (x>xStart) {
                if (y>yStart) {
                        if ( (typeof(transparent)=="undefined") || (transparent==false) ) {
                         
                         var charArray = Array();
                         charArray[0]=asciiCode;
                         charArray[1]=foreground;
                         charArray[2]=background;
                        
                         screenCharacterArray[y][x]=charArray;
                        }
                        
                        x=x-xStart;
                        y=y-yStart;
                        x = (x - 1) * canvasCharacterWidth;
                        y = (y - 1) * canvasCharacterHeight;
                        if ( (typeof(transparent)=="undefined") || (transparent==false) ) {
                            var xpos=background;
                            while (xpos >= 16) xpos=xpos-16;
                            var ypos = Math.floor(background/16);
                        
                        
                            var myasciiCode=219;
                            
                            var myx = (myasciiCode % 32) * characterWidth+(xpos*256);
                            var myy = Math.floor(myasciiCode / 32) * characterHeight + (ypos*128);
                        
                            ctx.drawImage(codepageImg, myx, myy, characterWidth, characterHeight, x, y, canvasCharacterWidth, canvasCharacterHeight);
                        }
                        
                        var xpos=foreground;
                        while (xpos >= 16) xpos=xpos-16;
                        var ypos = Math.floor(foreground/16);
                        
                        
                        var myx = (asciiCode % 32) * characterWidth+(xpos*256);
                        var myy = Math.floor(asciiCode / 32) * characterHeight + (ypos*128);
                        //console.log("xpos*256="+xpos*256+" myx:"+myx);
                        //console.log("ypos*128="+ypos*128+" myy:"+myy);
                        ctx.drawImage(codepageImg, myx, myy, characterWidth, characterHeight, x, y, canvasCharacterWidth, canvasCharacterHeight);
            }
            }
        }

        function generateDisplay(width, height) {
            //alert("new canvas x: "+(width*characterWidth)+" y: "+(height*characterHeight));
            return createCanvas(width * characterWidth, height * characterHeight);
        }

        function scrollDisplay(ctx, canvas) {
            ctx.drawImage(canvas, 0, characterHeight, canvas.width, canvas.height - characterHeight * 2, 0, 0, canvas.width, canvas.height - characterHeight * 2);
            ctx.fillStyle = "black";
            ctx.fillRect(0, canvas.height - characterHeight * 2, canvas.width, characterHeight);
        }

        return { "drawChar": drawChar, "generateDisplay": generateDisplay, "scrollDisplay": scrollDisplay };
    };
    
    
    function Display() {
        var canvas, ctx, x, y, savedX, savedY, foreground, background, bold, inverse;

     
        width=getDisplayWidth();
        height=getDisplayHeight();
        canvas = codepage.generateDisplay(width, height);
        ctx = canvas.getContext("2d");

        function homeCursor() {
            x = 1;
            y = 1;
        }

        function resetAttributes() {
            foreground = 7;
            background = 0;
            bold = false;
            inverse = false;
        }

        function setBold(value) {
            bold = value;
        }

        function setInverse(value) {
            inverse = value;
        }

        function setPos(newX, newY) {
            x = Math.min(width, Math.max(1, newX));
            y = Math.min(height, Math.max(1, newY));
        }

        function setForeground(value) {
            foreground = value;
        }

        function setBackground(value) {
            background = value;
        }

        function clearToEndOfLine() {
            var i;
            for (i = x; i < width; ++i) {
                codepage.drawChar(ctx, 0, 0, 0, i, y);
            }
        }

        function clearScreen() {
            homeCursor();
            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        function up(num) {
            y = Math.max(1, y - num);
        }

        function down(num) {
            y = Math.min(height - 1, y + num);
        }

        function newLine() {
            x = 1;
            if (y === height - 1) {
                codepage.scrollDisplay(ctx, canvas);
                return true;
            }
            ++y;
            return false;
        }

        function back(num) {
            x = Math.max(1, x - num);
        }

        function forward(num) {
            if (x === width) { newLine(); }
            x = Math.min(width, x + num);
        }

        function drawChar(asciiCode) {
            switch (asciiCode) {
            case 26:
                break;
            default:
                if (!inverse) {
                    codepage.drawChar(ctx, asciiCode, bold ? foreground + 8 : foreground, background, x++, y);
                } else {
                    codepage.drawChar(ctx, asciiCode, bold ? background + 8 : background, foreground, x++, y);
                }
                if (x === width + 1) { return newLine(); }
            }
            return false;
        }

        function savePosition() {
            savedX = x;
            savedY = y;
        }

        function restorePosition() {
            x = savedX;
            y = savedY;
        }

        homeCursor();
        resetAttributes();
       
        return {
            "resetAttributes": resetAttributes,
            "setBold": setBold,
            "setInverse": setInverse,
            "setPos": setPos,
            "up": up,
            "down": down,
            "newLine": newLine,
            "back": back,
            "forward": forward,
            "setForeground": setForeground,
            "setBackground": setBackground,
            "clearToEndOfLine": clearToEndOfLine,
            "clearScreen": clearScreen,
            "canvas": canvas,
            "drawChar": drawChar,
            "savePosition": savePosition,
            "restorePosition": restorePosition
        };
    }

function Interpreter(url, callback) {
        var http, buffer, pos, escaped, escapeCode;

        function reset() {
            pos = 0;
            escapeCode = "";
            escaped = false;
        }

        http = new XMLHttpRequest();
        http.open("GET", url, true);

        http.onreadystatechange = function () {
            
            if (http.readyState === 4) {
                if (http.status === 200) {
                    buffer = new Uint8Array(http.response);
                    reset();
                    callback();
                } else {
                    throw ("Could not retrieve: " + url);
                }
            }
        };

        http.setRequestHeader("Content-Type", "application/octet-stream");
        http.responseType = "arraybuffer";
        http.send();

        function read(mycharactersatonce, display) {
            var i, j, code, values;

            function getValues() {
                return escapeCode.substr(1, escapeCode.length - 2).split(";").map(function (value) {
                    var parsedValue;
                    parsedValue = parseInt(value, 10);
                    return isNaN(parsedValue) ? 1 : parsedValue;
                });
            }

            for (i = 0; i < mycharactersatonce; ++i) {

                if (pos === buffer.length || buffer[pos] === 26) { return i; }
                code = buffer[pos++];
                if (escaped) {
                    escapeCode += String.fromCharCode(code);
                    if ((code >= 65 && code <= 90) || (code >= 97 && code <= 122)) {
                        escaped = false;
                        values = getValues();
                        if (escapeCode.charAt(0) === "[") {
                            switch (escapeCode.charAt(escapeCode.length - 1)) {
                            case "A":
                                display.up(values[0]);
                                break;
                            case "B":
                                display.down(values[0]);
                                break;
                            case "C":
                                display.forward(values[0]);
                                break;
                            case "D":
                                display.back(values[0]);
                                break;
                            case "H":
                                if (values.length === 1) {
                                    display.setPos(1, Math.min(values[0]));
                                } else {
                                    display.setPos(values[1], values[0]);
                                }
                                break;
                            case "J":
                                if (values[0] === 2) {
                                    display.clearScreen();
                                }
                                break;
                            case "K":
                                display.clearToEndOfLine();
                                break;
                            case "m":
                                for (j = 0; j < values.length; ++j) {
                                    if (values[j] >= 30 && values[j] <= 37) {
                                        display.setForeground(values[j] - 30);
                                    } else if (values[j] >= 40 && values[j] <= 47) {
                                        display.setBackground(values[j] - 40);
                                    } else {
                                        switch (values[j]) {
                                        case 0:
                                            display.resetAttributes();
                                            break;
                                        case 1:
                                            display.setBold(true);
                                            break;
                                        case 5:
                                            break;
                                        case 7:
                                            display.setInverse(true);
                                            break;
                                        case 22:
                                            display.setBold(false);
                                            break;
                                        case 27:
                                            display.setInverse(false);
                                            break;
                                        case 39:
                                            break;
                                        default:
                                            break;
                                        }
                                    }
                                }
                                break;
                            case "s":
                                display.savePosition();
                                break;
                            case "u":
                                display.restorePosition();
                                break;
                            default:
                                break;
                            }
                        }
                        escapeCode = "";
                    }
                } else {
                    if (code === 27 && buffer[pos] === 0x5B) {
                        escaped = true;
                    } else if (code === 13 && buffer[pos] === 10) {
                        ++pos;
                        if (display.newLine()) {
                            return i + 1;
                        }
                    } else {
                        if (display.drawChar(code)) {
                            return i + 1;
                        }
                    }
                }
            }
            return i + 1;
        }

        return { "read": read, "reset": reset };
    }

