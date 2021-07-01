/*****************************

A miscellaneous collection of reuseable helper methods
that I couldn't be arsed to put into separate classes

*****************************/

import {publish, subscribe} from './minpubsub';

export var Loopy = {
  MODE_EDIT : 0,
  MODE_PLAY : 1,

  TOOL_INK : 0,
  TOOL_DRAG : 1,
  TOOL_ERASE : 2,
  TOOL_LABEL : 3,
  TOOL_PAN : 4,
  TOOL_LOOP : 5,
};

Math.TAU = Math.PI * 2;

window.HIGHLIGHT_COLOR = "rgba(193, 220, 255, 0.6)";

export var isMacLike =
    navigator.platform.match(/(Mac|iPhone|iPod|iPad)/i) ? true : false;

var _PADDING = 25;
var _PADDING_BOTTOM = 110;

var body_elem = document.getElementsByTagName("body")[0];

body_elem.ontransitionend = function() { publish("resize"); };

window.onresize = function() { publish("resize"); };

window.onbeforeunload = function(e) {
  if (loopy.dirty) {
    var dialogText =
        "Are you sure you want to leave without saving your changes?";
    e.returnValue = dialogText;
    return dialogText;
  }
};

export function _createCanvas() {

  var canvasses = document.getElementById("canvasses");
  var canvas = document.createElement("canvas");

  // Dimensions
  var _onResize = function() {
    var width = canvasses.clientWidth;
    var height = canvasses.clientHeight;
    canvas.width = width * 2; // retina
    canvas.style.width = width + "px";
    canvas.height = height * 2; // retina
    canvas.style.height = height + "px";
  };
  _onResize();

  // Add to body!
  canvasses.appendChild(canvas);

  // subscribe to RESIZE
  subscribe("resize", function() { _onResize(); });

  // Gimme
  return canvas;
}

export function _createLabel(message) {
  var label = document.createElement("div");
  label.innerHTML = message;
  label.setAttribute("class", "component_label");
  return label;
}

export function _createButton(label, onclick) {
  var button = document.createElement("div");
  button.innerHTML = label;
  button.onclick = onclick;
  button.setAttribute("class", "component_button");
  return button;
}

export function _createInput(className, textarea) {
  var input = textarea ? document.createElement("textarea")
                       : document.createElement("input");
  input.setAttribute("class", className);
  input.addEventListener("keydown", function(event) {
    event.stopPropagation ? event.stopPropagation()
                          : (event.cancelBubble = true);
  }, false); // STOP IT FROM TRIGGERING KEY.js
  return input;
}

export function _createPicker(className) {
  var input = document.createElement("input");

  input.setAttribute("class", className);
  input.setAttribute("type", "color");

  input.addEventListener("keydown", function(event) {
    event.stopPropagation ? event.stopPropagation()
                          : (event.cancelBubble = true);
  }, false); // STOP IT FROM TRIGGERING KEY.js

  return input;
}

export function _createNumberInput(onUpdate) {

  var self = {};

  // dom!
  self.dom = document.createElement("input");
  self.dom.style.border = "none";
  self.dom.style.width = "40px";
  self.dom.style.padding = "5px";

  self.dom.addEventListener("keydown", function(event) {
    event.stopPropagation ? event.stopPropagation()
                          : (event.cancelBubble = true);
  }, false); // STOP IT FROM TRIGGERING KEY.js

  // on update
  self.dom.onchange = function() {
    var value = parseInt(self.getValue());
    if (isNaN(value))
      value = 0;
    self.setValue(value);
    onUpdate(value);
  };

  // select on click, yo
  self.dom.onclick = function() { self.dom.select(); };

  // set & get value
  self.getValue = function() { return self.dom.value; };
  self.setValue = function(num) { self.dom.value = num; };

  // return an OBJECT.
  return self;
}

export function _blank() {
  // just a blank function to toss in.
}

export function _getTotalOffset(target) {
  var bounds = target.getBoundingClientRect();
  return {left : bounds.left, top : bounds.top};
}

export function _addMouseEvents(target, onmousedown, onmousemove, onmouseup) {

  // WRAP THEM CALLBACKS
  var _onmousedown = function(event) {
    var _fakeEvent = _onmousemove(event);
    onmousedown(_fakeEvent);
  };
  var _onmousemove = function(event) {
    // Mouse position
    var _fakeEvent = {};
    if (event.changedTouches) {
      // Touch
      var offset = _getTotalOffset(target);
      _fakeEvent.x = event.changedTouches[0].clientX - offset.left;
      _fakeEvent.y = event.changedTouches[0].clientY - offset.top;
      event.preventDefault();
    } else {
      // Not Touch
      _fakeEvent.x = event.offsetX;
      _fakeEvent.y = event.offsetY;
    }

    // Mousemove callback
    onmousemove(_fakeEvent);
    return _fakeEvent;
  };
  var _onmouseup = function(event) {
    var _fakeEvent = {};
    onmouseup(_fakeEvent);
  };

  // Add events!
  target.addEventListener("mousedown", _onmousedown);
  target.addEventListener("mousemove", _onmousemove);
  document.body.addEventListener("mouseup", _onmouseup);

  // TOUCH.
  target.addEventListener("touchstart", _onmousedown, false);
  target.addEventListener("touchmove", _onmousemove, false);
  document.body.addEventListener("touchend", _onmouseup, false);
}

export function _getBounds(points) {

  // Bounds
  var left = Infinity, top = Infinity, right = -Infinity, bottom = -Infinity;
  for (var i = 0; i < points.length; i++) {
    var point = points[i];
    if (point[0] < left)
      left = point[0];
    if (right < point[0])
      right = point[0];
    if (point[1] < top)
      top = point[1];
    if (bottom < point[1])
      bottom = point[1];
  }

  // Dimensions
  var width = (right - left);
  var height = (bottom - top);

  // Gimme
  return {
    left : left,
    right : right,
    top : top,
    bottom : bottom,
    width : width,
    height : height
  };
}

export function _translatePoints(points, dx, dy) {
  points = JSON.parse(JSON.stringify(points));
  for (var i = 0; i < points.length; i++) {
    var p = points[i];
    p[0] += dx;
    p[1] += dy;
  }
  return points;
}

export function _rotatePoints(points, angle) {
  points = JSON.parse(JSON.stringify(points));
  for (var i = 0; i < points.length; i++) {
    var p = points[i];
    var x = p[0];
    var y = p[1];
    p[0] = x * Math.cos(angle) - y * Math.sin(angle);
    p[1] = y * Math.cos(angle) + x * Math.sin(angle);
  }
  return points;
}

export function _configureProperties(self, config) {
  for (var propName in config) {
    // Transfer to "self".
    self[propName] = config[propName];
  }
}

export function _isPointInCircle(x, y, cx, cy, radius) {

  // Point distance
  var dx = cx - x;
  var dy = cy - y;
  var dist2 = dx * dx + dy * dy;

  // My radius
  var r2 = radius * radius;

  // Inside?
  return dist2 <= r2;
}

export function _isPointInBox(x, y, box) {

  if (x < box.x)
    return false;
  if (x > box.x + box.width)
    return false;
  if (y < box.y)
    return false;
  if (y > box.y + box.height)
    return false;

  return true;
}

// TODO: Make more use of this???
export function _makeErrorFunc(msg) {
  return function() { throw Error(msg); };
}

export function _getParameterByName(name) {
  var url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, " "));
};

export function _blendColors(hex1, hex2, blend) {

  var color = "#";
  for (var i = 0; i < 3; i++) {

    // Into numbers...
    var sub1 = hex1.substring(1 + 2 * i, 3 + 2 * i);
    var sub2 = hex2.substring(1 + 2 * i, 3 + 2 * i);
    var num1 = parseInt(sub1, 16);
    var num2 = parseInt(sub2, 16);

    // Blended number & sub
    var num = Math.floor(num1 * (1 - blend) + num2 * blend);
    var sub = num.toString(16).toUpperCase();
    var paddedSub = ('0' + sub).slice(-2); // in case it's only one digit long

    // Add that babe
    color += paddedSub;
  }

  return color;
}

export function _shiftArray(array, shiftIndex) {
  var moveThisAround = array.splice(-shiftIndex);
  var shifted = moveThisAround.concat(array);
  return shifted;
}
