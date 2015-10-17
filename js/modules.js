window.pagetitle = (function() {
  var title = document.getElementById("page-title");

  var getTitle = function() {
    switch (window.state.page) {
      case "book":
        return getBookAttribute(window.state.selectedbook, "shortname");
      case "bookchapter":
        return getBookAttribute(window.state.selectedbook, "shortname");
      default:
        return "Tidy Classics";
    }
  }

  var update = function() {
    updateDOMel(title, function() {
      document.title = getTitle();
      this.innerHTML = getTitle();
    });
  }

  return {
    update: update
  };

})();

window.booknav = (function() {
  var overlay = document.getElementById("book-nav-overlay");
  var navitem = document.getElementById("nav-center");
  var booknav = document.getElementById("book-nav");
  var booknavtoggle = document.getElementById("book-nav-toggle");
  return {
    update: function(id, idx) {
      idx = parseInt(idx);
      var list = [
        ["Table Of Contents", "#book/" + id]
      ];
      if (idx > 1) {
        list.push(["Previous Chapter", "#book/" + id + "/chapter/" + (idx - 1)]);
      }
      if (getBookAttribute(id, "toc").length > idx) {
        list.push(["Next Chapter", "#book/" + id + "/chapter/" + (idx + 1)]);
      }
      displaylist = [];
      for (var i = 0, l = list.length; i < l; i++) {
        displaylist.push("<li><a href='" + list[i][1] + "'>" + list[i][0] + "</a></li>");
      }
      displaylist.push("<li onclick='bookmark()'><span>Bookmark</span></li>");
      updateDOMel(booknav, function() {
        this.innerHTML = displaylist.join('');
      });
    },
    show: function() {
      updateDOMel(booknavtoggle, function() {
        this.checked = true;
      });
      updateDOMel(overlay, function() {
        addClass(this, "overlay-visible");
      });
      updateDOMel(navitem, function() {
        addClass(this, "nav-item-selected");
      });
      updateDOMel(booknav, function() {
        addClass(booknav, "slide-in");
      });
    },
    hide: function() {
      updateDOMel(booknavtoggle, function() {
        this.checked = false;
      });
      updateDOMel(overlay, function() {
        removeClass(this, "overlay-visible");
      });
      updateDOMel(navitem, function() {
        removeClass(navitem, "nav-item-selected");
      });
      updateDOMel(booknav, function() {
        removeClass(booknav, "slide-in");
      });
    },
    disable: function() {
      updateDOMel(booknavtoggle, function() {
        this.disabled = true;
      });
    },
    enable: function() {
      updateDOMel(booknavtoggle, function() {
        this.disabled = false;
      });
    }
  };
})();

window.player = (function() {

  var overlay = document.getElementById("player-overlay");
  var navitem = document.getElementById("nav-right");
  var playerContainer = document.getElementById("audio-player-container");
  var playertogglelabel = document.getElementById("player-toggle-label");
  var player = document.getElementById("audio-player");
  var autoplay = document.getElementById("autoplay-state");

  function updateAutoEl() {
    updateDOMel(autoplay, function() {
      if (window.state.autoplay) {
        this.innerHTML = "ON";
      } else {
        this.innerHTML = "OFF";
      }
    });
  }

  var update = function(bookid, idx) {

    idx = parseInt(idx);
    var toc = getBookAttribute(bookid, "toc");
    if (getSource() !== toc[idx].audio) {
      setSource(toc[idx].audio);
    }
    if (window.state.autoplay) {
      play();
    }
  };

  var show = function() {
    updateDOMel(overlay, function() {
      addClass(this, "overlay-visible");
    });
    updateDOMel(navitem, function() {
      addClass(this, "nav-item-selected");
    });
    updateDOMel(playerContainer, function() {
      addClass(playerContainer, "slide-in");
    });
  }

  var hide = function() {
    updateDOMel(overlay, function() {
      removeClass(this, "overlay-visible");
    });
    updateDOMel(navitem, function() {
      removeClass(navitem, "nav-item-selected");
    });
    updateDOMel(playerContainer, function() {
      removeClass(playerContainer, "slide-in");
    });
  }

  var disable = function() {
    updateDOMel(playertogglelabel, function() {
      addClass(this, "hidden");
    });
  }

  var enable = function() {
    updateDOMel(playertogglelabel, function() {
      removeClass(this, "hidden");
    });
  }

  var getSource = function() {
    return player.plyr.media.src;
  }

  var setSource = function(src) {
    player.plyr.source(src);
  }

  var isPlaying = function() {
    return player.plyr.media.currentTime !== 0;
  }

  var play = function() {
    player.plyr.play();
  }

  autoplay.addEventListener("click", function() {
    window.state.autoplay = !window.state.autoplay;
    updateAutoEl();
  });

  player.plyr.media.onended = function() {
    if (window.state.autoplay) {
      getTOC(window.state.selectedbook)
        .then(function(toc) {
          if (window.state.currentChapter < toc.length) {
            document.location.hash = "#book/" + window.state.selectedbook + "/chapter/" + (window.state.currentChapter + 1)
          }
        });
    }
  };

  updateAutoEl();
  return {
    update: update,
    show: show,
    hide: hide,
    disable: disable,
    enable: enable,
    getSource: getSource,
    setSource: setSource,
    isPlaying: isPlaying,
    play: play
  };
})();

window.booklist = (function() {

  var bookListTemplate = document.getElementById("book-list-template").innerHTML;
  Mustache.parse(bookListTemplate);
  var booklist = document.getElementById("book-list");
  return {
    display: function(ids) {
      var data = [];
      for (var i = 0, l = ids.length; i < l; i++) {
        data.push(window.state.booklist[ids[i]]);
      }
      updateDOMel(booklist, function() {
        this.innerHTML = Mustache.render(bookListTemplate, {
          list: data
        });
      });
    }

  };

})();

window.booktoc = (function() {

  var tocTemplate = document.getElementById("toc-template").innerHTML;
  Mustache.parse(tocTemplate);
  var booktoc = document.getElementById("book-toc");
  return {
    display: function(id) {
      var data = getBookAttribute(id, "toc");
      var tempdata = [];
      var hash = location.hash;
      for (var i = 0, l = data.length; i < l; i++) {
        tempdata.push(data[i]);
        tempdata[i].href = hash + "/chapter/" + data[i].idx;
      }
      updateDOMel(booktoc, function() {
        this.innerHTML = Mustache.render(tocTemplate, {
          list: tempdata
        });
      });
    }

  };

})();

window.bookchapter = (function() {

  var bookinner = document.getElementById("book-inner");
  var pagetotal = document.getElementById("page-total");

  var converter = new showdown.Converter();

  var showPageTotal = function() {
    updateDOMel(pagetotal, function() {
      removeClass(this, "hidden");
    });
  }

  var hidePageTotal = function() {
    updateDOMel(pagetotal, function() {
      addClass(this, "hidden");
    });
  }

  var updatePageTotal = function(num) {
    updateDOMel(pagetotal, function() {
      this.innerHTML = num + " pages";
    });
  }

  var update = function(data, pos, idx) {
    updatePageTotal(Math.round(data.length / (40 * 65)));
    if (isSmallScreen()) {
      data = data.replace(/([a-zA-Z0-9]+).jpg/g, "$1-sm.jpg");
    } else {
      data = data.replace(/([a-zA-Z0-9]+).jpg/g, "$1-md.jpg");
    }
    var temp = converter.makeHtml(data).split("<p>");
    var dfont = getBookAttribute(window.state.selectedbook, "dropcapclass");
    var i = 1;
    while (i < temp.length) {
      if (temp[i][0] !== "<") {
        if (temp[i][0] == '"') {
          temp[i] = "<span style='float:left;'>&quot;</span>" + "<span class='dropcap " + dfont + "'>" + temp[i][1] + "</span>" + temp[i].slice(2);
        } else {
          temp[i] = "<span class='dropcap " + dfont + "'>" + temp[i][0] + "</span>" + temp[i].slice(1);
        }
        i = temp.length;
      }
      i++;
    }
    temp = temp.join("<p>");
    temp = temp.replace(/<blockquote>/g, "<blockquote><pre>");
    temp = temp.replace(/<\/blockquote>/g, "</pre></blockquote>");
    if (getBookAttribute(window.state.selectedbook, "captions")) {
      temp = temp.replace(/(<img .* alt="(.*?)".*\/>)/g, "<figure>$1<figcaption>$2</figcaption></figure>");
    }

    var toc = getBookAttribute(window.state.selectedbook, "toc");
    if (window.state.currentChapter < toc.length) {
      temp = temp + "<a class='next-chapter-link' href='#book/" + window.state.selectedbook + "/chapter/" + (idx + 1).toString() + "'>Next Chapter</a>";
    }

    updateDOMel(bookinner, function() {
      this.innerHTML = temp;
      if (pos) {
        var elements = this.getElementsByTagName("p");
        elements[pos].scrollIntoView(true);
      }
    });
  };

  var updateScrollPos = function(pos) {
    updateDOMel(bookinner, function() {
      this.scrollTop = pos;
    });
  }

  var getCurrentPos = function() {
    var elements = bookinner.getElementsByTagName("p");
    for (var i = 0, l = elements.length; i < l; i++) {
      el = elements[i];
      if (isElementInViewport(el)) {
        break;
      }
    }
    return i;
  }

  return {
    showPageTotal: showPageTotal,
    hidePageTotal: hidePageTotal,
    update: update,
    updateScrollPos: updateScrollPos,
    getCurrentPos: getCurrentPos
  };

})();
