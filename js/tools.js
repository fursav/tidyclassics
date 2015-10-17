//-----------------
// TOOLS
//-----------------

function ready(fn) {
  if (document.readyState != 'loading') {
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

function getJSON(url) {
  return new Promise(function(resolve, reject) {
    var request = new XMLHttpRequest();
    request.open('GET', url, true);

    request.onload = function() {
      if (request.status >= 200 && request.status < 400) {
        // Success!
        var data = JSON.parse(request.responseText);
        resolve(data);
      } else {
        // We reached our target server, but it returned an error
        reject();
      }
    };

    request.onerror = function() {
      // There was a connection error of some sort
      reject();
    };

    request.send();

  });
}

function ajax(url) {

  return new Promise(function(resolve, reject) {
    var request = new XMLHttpRequest();
    request.open('GET', url, true);

    request.onload = function() {
      if (request.status >= 200 && request.status < 400) {
        // Success!
        var resp = request.responseText;
        resolve(resp);
      } else {
        // We reached our target server, but it returned an error
        reject();
      }
    };

    request.onerror = function() {
      // There was a connection error of some sort
    };

    request.send();
  });
}

function addClass(el, className) {
  if (className == "") {
    return
  }
  if (el.classList)
    el.classList.add(className);
  else
    el.className += ' ' + className;
}

function removeClass(el, className) {
  if (className == "") {
    return
  }
  if (el.classList)
    el.classList.remove(className);
  else
    el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');

}

function hasClass(el, className) {
  if (className == "") {
    return
  }
  if (el.classList)
    return el.classList.contains(className);
  else
    return new RegExp('(^| )' + className + '( |$)', 'gi').test(el.className);
}

function readDOM(ref, fn) {
  fastdom.read(fn, window.ui[ref]);
}

function readDOMel(el, fn) {
  fastdom.read(fn, el);
}

function updateDOM(ref, fn) {
  fastdom.write(fn, window.ui[ref]);
}

function updateDOMel(el, fn) {
  fastdom.write(fn, el);
}

function addToHash(str) {
  location.hash = location.hash + str;
}

function animate(ref, cls, a) {
  window.animating.push([ref, cls, a]);
  if (window.animating.length === 1) {
    checkAnimQueue();
  }
}

function checkAnimQueue() {
  var anim = window.animating[0];
  if (anim === null || anim === undefined) {} else {
    actualAnimate(anim[0], anim[1], anim[2]).then(function() {
      window.animating.shift();
    }).then(checkAnimQueue);
  }
}

function actualAnimate(ref, cls, a) {
  var el = window.ui[ref];
  /* From Modernizr */
  function whichTransitionEvent() {
    var t;
    var transitions = {
      'transtion': 'transitionend',
      'OTransition': 'oTransitionEnd',
      'MozTransition': 'transitionend',
      'WebkitTransition': 'webkitTransitionEnd'
    };

    for (t in transitions) {
      if (el.style[t] !== undefined) {
        return transitions[t];
      }
    }
  }

  function whichAnimationEvent() {
    var t;
    var transitions = {
      'animation': 'animationend',
      'OAnimation': 'oAnimationEnd',
      'MozAnimation': 'animationend',
      'WebkitAnimation': 'webkitAnimationEnd'
    };

    for (t in transitions) {
      if (el.style[t] !== undefined) {
        return transitions[t];
      }
    }
  }

  return new Promise(function(resolve, reject) {
    /* Listen for a transition! */
    fastdom.read(function() {
      var transitionEvent = whichTransitionEvent();
      fastdom.write(function() {
        if (a === "a") {
          if (hasClass(el, cls)) {
            resolve();
          } else {
            addClass(el, cls);
          }
        } else {
          if (hasClass(el, cls)) {
            removeClass(el, cls);
          } else {
            resolve();
          }
        }
      });
      transitionEvent && el.addEventListener(transitionEvent, function() {
        resolve();
      });
    });
  });

}

function isSmallScreen() {
  return window.viewport < 520;
}

function isElementInViewport(el) {

  var rect = el.getBoundingClientRect();

  return rect.top >= 0;
}

function convertVH(elem) {
  var compStyle = parseInt((window.getComputedStyle ?
    getComputedStyle(elem, null) :
    elem.currentStyle)['height'], 10);
  if (window.viewportHeight !== compStyle) {
    elem.style.height = window.viewportHeight + "px";
  }
}
