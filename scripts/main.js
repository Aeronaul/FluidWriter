const customDefaultImgForGradient = ""; // Set your default background image URL here
const defaultBgGradient =
  "background-image: linear-gradient(135deg, rgb(101, 158, 54) 0%, rgb(44, 55, 139) 75%); color: rgb(255, 255, 255);";
// "background-color: black";
// const defaultBg = "background-image: linear-gradient(135deg, rgb(131, 178, 204) 0%, rgb(124, 55, 39) 75%); color: rgb(255, 255, 255);";
let currentImage = -1;
let currentAudio = -1;
let saved = true;
let audioVolume = 0.1;
let isBold = false;
let isItalic = false;
let isMute = false;

let abbreviations = new Map();
let lastMouseX = 0;
let lastMouseY = 0;

const startQuote = '"';
const endQuote = '"';

localStorage.clear();

let quill = new Quill("#quillEditor", {
  modules: {
    toolbar: "#ql-toolbar",
  },
});

quill.root.setAttribute("spellcheck", false);
delete quill.getModule("keyboard").bindings["9"];

let imageIndex = 1;
let audioIndex = 1;
let audio;

const currentStory = sessionStorage.getItem("current-story");
clearImageMetadata();

document.getElementById("ql-container").classList.add("ql-container-left");

if (currentStory == null) {
  window.location.href = "index.html";
}

fetch("/routes/count.php")
  .then((res) => res.json())
  .then((data) => {
    // console.log(data);
    imageIndex = data.img + 1;
    audioIndex = data.aud + 1;
  });

fetch(`/routes/load.php?story=${currentStory}`)
  .then((res) => res.json())
  .then((data) => {
    // console.log(data);
    quill.pasteHTML(data);
    document.getElementById("save-btn").classList.add("btn-disabled");
  });

fetch("/routes/abbreviations.php")
  .then((res) => res.json())
  .then((data) => {
    const parsedData = JSON.parse(data);
    for (let abbr in parsedData) {
      abbreviations.set(abbr, parsedData[abbr]);
    }
  });

let latestUpload;
let editorEnabled = false;

let myDropzone = new Dropzone("#outer-layout", {
  url: `/routes/upload.php`,
  clickable: false,
  disablePreviews: true,
  paramName: "file", // The name that will be used to transfer the file
  maxFilesize: 50, // MB
  acceptedFiles: "image/*,audio/*,video/*",
  renameFile: (file) => {
    if (file.type.match("(audio|video)/.*")) {
      return `${audioIndex}.${file.name.split(".").slice(-1)}`;
    } else {
      return `${imageIndex}.${file.name.split(".").slice(-1)}`;
    }
  },
  accept: function (file, done) {
    // console.log(file);
    latestUpload = file;
    done();
  },
  init: function () {
    this.on("queuecomplete", function () {
      if (!latestUpload) return;
      if (latestUpload.type.match("image/.*")) {
        const docSelection = document.getSelection();
        const selection = quill.getSelection(true);
        if (docSelection.rangeCount == 0) {
          quill.insertText(quill.getSelection(true), `img:${imageIndex++}`);
          quill.insertText(quill.getSelection(true), "\n");
        } else {
          const node = docSelection.getRangeAt(0).startContainer;
          if (node.textContent)
            quill.insertText(quill.getSelection(true), "\n");
          quill.insertText(quill.getSelection(true), `img:${imageIndex++}`);
          quill.insertText(quill.getSelection(true), "\n");
        }
      } else if (latestUpload.type.match("(audio|video)/.*")) {
        const docSelection = document.getSelection();
        const selection = quill.getSelection(true);
        if (docSelection.rangeCount == 0) {
          quill.insertText(quill.getSelection(true), `aud:${audioIndex++}`);
          quill.insertText(quill.getSelection(true), "\n");
        } else {
          const node = docSelection.getRangeAt(0).startContainer;
          if (node.textContent)
            quill.insertText(quill.getSelection(true), "\n");
          quill.insertText(quill.getSelection(true), `aud:${audioIndex++}`);
          quill.insertText(quill.getSelection(true), "\n");
        }
      }
    });
  },
});

const image = new Image();
function loadCg(url) {
  if (image && image.src.includes(url)) return;
  image.src = url;
  image.onload = () => {
    ctx.drawImage(
      image,
      0,
      0,
      document.getElementById("cg-canvas").width,
      document.getElementById("cg-canvas").height
    );
    resetSize(false);
    restorePosition();
    document.getElementById("cg-background").style = Gradient(image);

    dragResetThreshold = Math.min(image.height, image.width) * dpRatio;
    if (currentImage === -1) {
      document.getElementById("cg-canvas").classList.add("hide");
    } else {
      document.getElementById("cg-canvas").classList.remove("hide");
    }
  };
}

function loadCgIndex(index) {
  loadCg(`routes/media.php?type=img&name=${index}`);
}

function loadCgShared(name) {
  loadCg(`routes/media.php?type=cimg&name=${name}`);
}

function refreshGradient() {
  const i = image.src.indexOf("routes");
  const imgKey = image.src.slice(i);
  localStorage.removeItem(`grade-${image.src}`);
  const url = image.src;
  image.src = "";
  loadCg(url);
}

let dragStartX, dragStartY, dragged;
const dpRatio = window.devicePixelRatio || 1;
let scaleFactor = dpRatio;
let dragResetThreshold = 200 * dpRatio;

const initialCursorThreshold = 200;
let cursorThreshold = initialCursorThreshold;

const ctx = document.getElementById("cg-canvas").getContext("2d");
let sentences = [];
let currentSentenceIndex = 0;

const inputBox = document.getElementById("input-box");

var overscaleWidth =
  image.width * 1.1 >
  document.getElementById("image-section").getBoundingClientRect().width
    ? (document.getElementById("image-section").getBoundingClientRect().width /
        image.width) *
      0.9
    : 1;
var overscaleHeight =
  image.height * 1.1 >
  document.getElementById("image-section").getBoundingClientRect().height
    ? (document.getElementById("image-section").getBoundingClientRect().height /
        image.height) *
      0.9
    : 1;

document.getElementById("cg-canvas").style.position = "fixed";

document.getElementById("cg-canvas").addEventListener("wheel", (event) => {
  event.preventDefault();
  const scale = event.deltaY > 0 ? 0.9 : 1.1;
  zoom(scale);
});

document.getElementById("cg-background").addEventListener("wheel", (event) => {
  event.preventDefault();
  const scale = event.deltaY > 0 ? 0.9 : 1.1;
  zoom(scale);
});

customDefaultImgForGradient
  ? loadCg(customDefaultImgForGradient)
  : setDefaultBg();

function setDefaultBg() {
  image.src = "";
  redraw();
  document.getElementById("cg-background").style = defaultBgGradient;
}

function resetSize(resetZoom = true) {
  document.getElementById("cg-canvas").width = image.width;
  document.getElementById("cg-canvas").height = image.height;
  if (isCenterModeActive()) {
    if (
      image.height >=
        image.width
    ) {
      scaleFactor =
        document.getElementById("outer-layout").getBoundingClientRect().height /
        image.height;
    } else {
      scaleFactor =
        document.getElementById("outer-layout").getBoundingClientRect().width /
        image.width;
    }
  } else {
    if (
      image.height >
        image.width
    ) {
      scaleFactor =
        document.getElementById("image-section").getBoundingClientRect()
          .height / image.height;
    } else {
      scaleFactor =
        document.getElementById("image-section").getBoundingClientRect().width /
        image.width;
    }
  }
  zoom(resetZoom ? 1 : -1);
}

function resetPosition() {
  sessionStorage.removeItem(`image-pos-${currentImage}`);
  if (isCenterModeActive()) {
    document.getElementById("cg-canvas").style.left =
      document.getElementById("outer-layout").getBoundingClientRect().width /
        2 -
      document.getElementById("cg-canvas").width / 2 +
      "px";
    document.getElementById("cg-canvas").style.top =
      document.getElementById("outer-layout").getBoundingClientRect().height /
        2 -
      document.getElementById("cg-canvas").height / 2 +
      "px";
  } else {
    document.getElementById("cg-canvas").style.left =
      document.getElementById("image-section").getBoundingClientRect().width /
        2 -
      document.getElementById("cg-canvas").width / 2 +
      "px";
    document.getElementById("cg-canvas").style.top =
      document.getElementById("image-section").getBoundingClientRect().height /
        2 -
      document.getElementById("cg-canvas").height / 2 +
      "px";
  }
}

function restorePosition() {
  const positionData = JSON.parse(
    sessionStorage.getItem(`image-pos-${currentImage}`)
  );
  if (positionData) {
    document.getElementById("cg-canvas").style.left = positionData.left + "px";
    document.getElementById("cg-canvas").style.top = positionData.top + "px";
  } else {
    resetPosition();
  }
}

function isCenterModeActive() {
  return document
    .getElementById("center-btn")
    .classList.contains("btn-activated");
}

function zoom(scale = -1) {
  if (scale === -1) {
    if (sessionStorage.getItem("image-scale-" + currentImage))
      scaleFactor = sessionStorage.getItem("image-scale-" + currentImage);
  } else {
    scaleFactor *= scale;
    sessionStorage.setItem("image-scale-" + currentImage, scaleFactor);
  }
  document.getElementById(
    "cg-canvas"
  ).style.transform = `scale(${scaleFactor})`;
  redraw();
}

function redraw() {
  ctx.clearRect(
    0,
    0,
    document.getElementById("cg-canvas").width,
    document.getElementById("cg-canvas").height
  );
  ctx.drawImage(
    image,
    0,
    0,
    document.getElementById("cg-canvas").width,
    document.getElementById("cg-canvas").height
  );
}

document.getElementById("cg-canvas").addEventListener("mousedown", (event) => {
  dragStartX = event.pageX - document.getElementById("cg-canvas").offsetLeft;
  dragStartY = event.pageY - document.getElementById("cg-canvas").offsetTop;
  dragged = true;
});

document.getElementById("cg-canvas").addEventListener("mousemove", (event) => {
  if (dragged) {
    // Calculate the new position of the element
    const x = event.pageX - dragStartX;
    const y = event.pageY - dragStartY;

    // Set the position of the element
    document.getElementById("cg-canvas").style.left = `${x}px`;
    document.getElementById("cg-canvas").style.top = `${y}px`;
    const positionData = { left: x, top: y };
    sessionStorage.setItem(
      `image-pos-${currentImage}`,
      JSON.stringify(positionData)
    );
  }
});

document.getElementById("cg-canvas").addEventListener("mouseup", () => {
  dragged = false;
  const canvasBox = document
    .getElementById("cg-canvas")
    .getBoundingClientRect();
  if (scaleFactor == dpRatio) {
    resetPosition();
  }
});

document.getElementById("image-section").addEventListener("dblclick", () => {
  resetPosition();
  dragStartX = 0;
  dragStartY = 0;
  // scaleFactor =
  //   (document.getElementById("image-section").getBoundingClientRect().width -
  //     200) /
  //   image.width;
  // zoom(1);
  resetSize();
});

document.getElementById("text-section").addEventListener("mouseup", () => {
  dragged = false;
  if (scaleFactor == dpRatio) resetPosition();
});

let disableResize = false;
window.onresize = () => {
  disableResize = true;
  setTimeout(() => {
    disableResize = false;
    if (!disableResize) {
      resetSize();
      redraw();
      resetPosition();
    }
  }, 200);
};

document.getElementById("quillEditor").onkeydown = (e) => {
  if (e.key === "Escape") {
    window.getSelection().empty();
    document.getElementById("quillEditor").classList.add("hide-cursor");
    editorEnabled = false;
    quill.enable(false);
    document
      .getElementById("ql-container")
      .classList.remove("ql-container-active");
    document
      .getElementById("ql-container")
      .classList.add("ql-container-inactive");
  } else if (e.ctrlKey && e.key === "s") {
    e.preventDefault();
    document.getElementById("save-btn").click();
  } else if (e.ctrlKey && e.key === "b") {
    e.preventDefault();
    isBold = !isBold;
    quill.format("bold", isBold);
  } else if (e.ctrlKey && e.key === "i") {
    e.preventDefault();
    isItalic = !isItalic;
    quill.format("italic", isItalic);
  } else if (e.key === "Tab") {
    e.preventDefault();
    toggleQuotes();
  }
};

document.onkeydown = (e) => {
  if (e.key === "Enter" && !editorEnabled) {
    document.getElementById("text-section").classList.toggle("hide");
  }
};

document.getElementById("quillEditor").onmousedown = (e) => {
  editorEnabled = true;
  quill.enable();
  document.getElementById("quillEditor").classList.remove("hide-cursor");
  document
    .getElementById("ql-container")
    .classList.remove("ql-container-inactive");
  document.getElementById("ql-container").classList.add("ql-container-active");
};

document.querySelector(".ql-editor").onscroll = (e) => {
  const item = getLastVisibleElementContents();
  if (item.startsWith("img:")) {
    const imgUrl = `content/${currentStory}/img/${item.substring("4")}`;
    if (currentImage !== imgUrl) {
      currentImage = imgUrl;
      loadCgIndex(currentImage);
    }
  }
};

document.querySelector(".ql-editor").onmousemove = (e) => {
  if (!editorEnabled) {
    const lastImageInfo = getLastImageMouse(e.clientY);
    // console.log(lastImageInfo);
    const lastAudioInfo = getLastAudioMouse(e.clientY);
    // console.log(lastAudioInfo);
    if (lastImageInfo.length > 0 && lastImageInfo != currentImage) {
      currentImage = lastImageInfo[1];
      if (lastImageInfo[0] === "img") loadCgIndex(currentImage);
      else if (lastImageInfo[0] === "cimg") loadCgShared(currentImage);
    } else if (lastImageInfo.length === 0) {
      currentImage = lastImageInfo;
      customDefaultImgForGradient
        ? loadCg(customDefaultImgForGradient)
        : setDefaultBg();
    }

    if (
      lastAudioInfo.length > 2 &&
      lastAudioInfo[2] &&
      audioVolume != (parseFloat(lastAudioInfo[2]) % 100) / 100
    ) {
      audioVolume = (parseFloat(lastAudioInfo[2]) % 100) / 100;
      audio.volume = audioVolume;
    }
    if (lastAudioInfo[1] == currentAudio) return;
    if (lastAudioInfo.length > 0 && lastAudioInfo[1] != currentAudio) {
      if (audio) audio.pause();
      currentAudio = lastAudioInfo[1];
      audio = new Audio(
        `routes/media.php?type=${lastAudioInfo[0]}&name=${lastAudioInfo[1]}`
      );
      audio.loop = true;
      audio.volume = isMute ? 0 : audioVolume;
      audio.play();
    } else if (lastAudioInfo === -1) {
      currentAudio = lastAudioInfo[1];
      audio.pause();
    }
  }
};

quill.on("editor-change", (range) => {
  saved = false;
  document.getElementById("save-btn").classList.remove("btn-disabled");
  getLastImageKeyboard();
  replaceAbbrieviations();
  fixLastLine();
  const data = quill.container.firstChild.innerText;
  document.getElementById("word-count").innerHTML =
    (data?.trim().split(/\S+/).length ?? 0) - 1;
});

function getLastLine(includeLast = false) {
  let ch = document.querySelectorAll(".ql-editor>*");
  let lastLine;
  if (document.getSelection().rangeCount === 0) return;
  const node = document.getSelection().getRangeAt(0).startContainer;
  if (node == null) return;
  const currentLineCoord = (
    node.getBoundingClientRect
      ? node.getBoundingClientRect()
      : node.parentElement.getBoundingClientRect()
  ).bottom;
  // console.log(currentLineCoord)
  for (var el of ch) {
    if (
      el.innerText.includes("img:") ||
      el.innerText.includes("aud:") ||
      el.innerText.includes("cimg:") ||
      el.innerText.includes("caud:")
    )
      continue;
    if (includeLast) {
      if (el.getBoundingClientRect().bottom <= currentLineCoord) lastLine = el;
    } else {
      if (el.getBoundingClientRect().bottom < currentLineCoord) lastLine = el;
    }
  }
  return lastLine;
}

function replaceAbbrieviations() {
  const lastLine = getLastLine();
  if (lastLine) {
    const regex = /:\w+/;
    const matches = regex.exec(lastLine.innerText);
    if (!matches) return;
    for (let match of matches) {
      const replaceString = abbreviations.get(match.slice(1));
      lastLine.innerText = lastLine.innerText.replace(
        match,
        replaceString ?? match.slice(1)
      );
    }
  }
}

function fixLastLine() {
  const lastLine = getLastLine();
  if (lastLine) {
    if ((matches = /\w{1}(\.|\?|~|!|,)\w{1}/.exec(lastLine.innerText))) {
      matches.splice(1);
      for (let match of matches) {
        const replaceString = match.slice(0, 2) + " " + match.slice(2);
        lastLine.innerText = lastLine.innerText.replace(match, replaceString);
      }
    }

    if ((matches = /(\.|\?|\!) [a-z]{1}/.exec(lastLine.innerText))) {
      // matches.splice(1);
      for (let match of matches) {
        const replaceString = match.slice(0, 2) + match.slice(2).toUpperCase();
        lastLine.innerText = lastLine.innerText.replace(
          match,
          replaceString ?? match
        );
      }
    }

    if ((matches = /^[a-z]{1}/.exec(lastLine.innerText))) {
      for (let match of matches) {
        const replaceString = match.slice(0, 1).toUpperCase() + match.slice(1);
        lastLine.innerText = lastLine.innerText.replace(match, replaceString);
      }
    }

    if ((matches = /\w$/.exec(lastLine.innerText))) {
      lastLine.innerText = lastLine.innerText + ".";
    }
  }
}

function decorateMediaHolders() {
  let ch = document.querySelectorAll(".ql-editor>*");
  for (var el of ch) {
    if (
      el.innerHTML.startsWith("img:") ||
      el.innerHTML.startsWith("cimg:") ||
      el.innerHTML.startsWith("aud:") ||
      el.innerHTML.startsWith("caud:")
    ) {
      el.classList.add("media-marker");
    } else {
      el.classList.remove("media-marker");
    }
  }
}

function getLastImageMouse(mouseY) {
  let ch = document.querySelectorAll(".ql-editor>*");
  let imgElement;
  for (var el of ch) {
    if (
      el.getBoundingClientRect().bottom < mouseY &&
      (el.innerHTML.startsWith("img:") || el.innerHTML.startsWith("cimg:"))
    )
      imgElement = el;
  }
  if (imgElement) return imgElement.innerHTML.split(":");
  else return [];
}

function getLastAudioMouse(mouseY) {
  let ch = document.querySelectorAll(".ql-editor>*");
  let audElement;
  for (var el of ch) {
    if (
      el.getBoundingClientRect().bottom < mouseY &&
      (el.innerHTML.startsWith("aud:") || el.innerHTML.startsWith("caud:"))
    )
      audElement = el;
  }
  if (audElement) {
    const audioInfo = audElement.innerHTML.split(":");
    // if (audioInfo.length > 2)
    // audioVolume = (parseFloat(audioInfo[2])%10)/10;
    return audioInfo;
  } else return [];
}

function getLastImageKeyboard() {
  const selection = document.getSelection();
  if (selection.rangeCount === 0) return;
  const node = selection.getRangeAt(0).startContainer;
  let ch = document.querySelectorAll(".ql-editor>*");
  if (node.parentElement.classList.contains("ql-editor")) {
    // node
  }
  let imgElement;
  let cimgElement;
  let audElement;
  let caudElement;
  for (var el of ch) {
    if (
      el.getBoundingClientRect().bottom <=
      (node.getBoundingClientRect
        ? node.getBoundingClientRect()
        : node.parentElement.getBoundingClientRect()
      ).bottom
    ) {
      if (el.innerHTML.startsWith("img:")) {
        imgElement = el;
        cimgElement = null;
      } else if (el.innerHTML.startsWith("cimg:")) {
        cimgElement = el;
        imgElement = null;
      } else if (el.innerHTML.startsWith("aud:")) {
        audElement = el;
        caudElement = null;
      } else if (el.innerHTML.startsWith("caud:")) {
        caudElement = el;
        audElement = null;
      }
    }
  }
  if (imgElement) {
    const i = imgElement.innerHTML.substring("4");
    if (currentImage != i) {
      currentImage = i;
      loadCgIndex(i);
    }
  } else if (cimgElement) {
    const i = cimgElement.innerHTML.substring("5");
    if (currentImage != i) {
      currentImage = i;
      loadCgShared(i);
    }
  } else {
    currentImage = -1;
    customDefaultImgForGradient
      ? loadCg(customDefaultImgForGradient)
      : setDefaultBg();
  }

  decorateMediaHolders();

  if (audElement) {
    const audioInfo = audElement.innerHTML.split(":");
    const aIndex = audioInfo[1];
    if (aIndex == currentAudio) {
      if (
        audioInfo.length > 2 &&
        audioInfo[2] &&
        audioVolume != (parseFloat(audioInfo[2]) % 100) / 100
      ) {
        audioVolume = (parseFloat(audioInfo[2]) % 100) / 100;
        audio.volume = isMute ? 0 : audioVolume;
      }
      return;
    }
    if (audioInfo.length > 2)
      audioVolume = (parseFloat(audioInfo[2]) % 100) / 100;
    currentAudio = aIndex;
    if (audio) audio.pause();
    audio = new Audio(`routes/media.php?type=aud&name=${aIndex}`);
    audio.volume = isMute ? 0 : audioVolume;
    audio.loop = true;
    audio.play();
  } else if (caudElement) {
    const audioInfo = caudElement.innerHTML.split(":");
    const aFilename = audioInfo[1];
    if (aFilename == currentAudio) {
      if (
        audioInfo.length > 2 &&
        audioInfo[2] &&
        audioVolume != (parseFloat(audioInfo[2]) % 100) / 100
      ) {
        audioVolume = (parseFloat(audioInfo[2]) % 100) / 100;
        audio.volume = isMute ? 0 : audioVolume;
      }
      return;
    }
    if (audioInfo.length > 2)
      audioVolume = (parseFloat(audioInfo[2]) % 100) / 100;
    currentAudio = aFilename;
    if (audio) audio.pause();
    audio = new Audio(`routes/media.php?type=caud&name=${aFilename}`);
    audio.volume = isMute ? 0 : audioVolume;
    audio.loop = true;
    audio.play();
  } else {
    currentAudio = -1;
    if (audio) audio.pause();
  }
}

function getLastVisibleElementContents() {
  let ch = document.querySelectorAll(".ql-editor>*");
  let element;
  for (var el of ch) {
    if (
      el.getBoundingClientRect().bottom <
      document.querySelector(".ql-editor").getBoundingClientRect().bottom
    )
      element = el;
  }
  return element.innerHTML;
}

function toggleQuotes() {
  const lastLine = getLastLine();
  if (!lastLine) return;
  if (
    lastLine.innerText.charAt(0) === startQuote &&
    lastLine.innerText.charAt(lastLine.innerText.length - 1) === endQuote
  ) {
    lastLine.innerText = lastLine.innerText.slice(1, -1);
  } else if (
    lastLine.innerText.charAt(0) !== startQuote &&
    lastLine.innerText.charAt(lastLine.innerText.length - 1) !== endQuote
  ) {
    lastLine.innerText = startQuote + lastLine.innerText + endQuote;
  }
}

document.getElementById("save-btn").onclick = () => {
  const data = quill.container.firstChild.innerHTML;
  document.getElementById("quillEditor").classList.add("hide-cursor");
  fetch(`/routes/save.php?file=${sessionStorage.getItem("current-story")}`, {
    method: "POST",
    body: data,
  }).then(() => {
    saved = true;
    editorEnabled = false;
    quill.enable(false);
    document
      .getElementById("ql-container")
      .classList.remove("ql-container-active");
    document
      .getElementById("ql-container")
      .classList.add("ql-container-inactive");
    document.getElementById("save-btn").classList.add("btn-disabled");
  });
};

document.getElementById("close-btn").onclick = () => {
  // sessionStorage.removeItem("current-story");
  sessionStorage.clear();
  window.location.href = "index.html";
};

document.getElementById("mute-btn").onclick = () => {
  isMute = !isMute;
  document.getElementById("mute-btn").innerHTML = isMute
    ? '<path d="M301.1 34.8C312.6 40 320 51.4 320 64V448c0 12.6-7.4 24-18.9 29.2s-25 3.1-34.4-5.3L131.8 352H64c-35.3 0-64-28.7-64-64V224c0-35.3 28.7-64 64-64h67.8L266.7 40.1c9.4-8.4 22.9-10.4 34.4-5.3zM425 167l55 55 55-55c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-55 55 55 55c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-55-55-55 55c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l55-55-55-55c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0z"/>'
    : '<path d="M533.6 32.5C598.5 85.2 640 165.8 640 256s-41.5 170.7-106.4 223.5c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C557.5 398.2 592 331.2 592 256s-34.5-142.2-88.7-186.3c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zM473.1 107c43.2 35.2 70.9 88.9 70.9 149s-27.7 113.8-70.9 149c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C475.3 341.3 496 301.1 496 256s-20.7-85.3-53.2-111.8c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zm-60.5 74.5C434.1 199.1 448 225.9 448 256s-13.9 56.9-35.4 74.5c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C393.1 284.4 400 271 400 256s-6.9-28.4-17.7-37.3c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zM301.1 34.8C312.6 40 320 51.4 320 64V448c0 12.6-7.4 24-18.9 29.2s-25 3.1-34.4-5.3L131.8 352H64c-35.3 0-64-28.7-64-64V224c0-35.3 28.7-64 64-64h67.8L266.7 40.1c9.4-8.4 22.9-10.4 34.4-5.3z"/>';
  if (audio) {
    audio.volume = isMute ? 0 : audioVolume;
  }
};

// document.getElementById("gradient-btn").onclick = () => {
//   refreshGradient();
// };

document.getElementById("center-btn").onclick = () => {
  document.getElementById("center-btn").classList.toggle("btn-activated");
  document
    .getElementById("text-section")
    .classList.toggle("text-section-centered");
  document.getElementById("ql-container").classList.toggle("ql-container-centered");
  resetPosition();
  resetSize();
  clearImageMetadata();
};

function clearImageMetadata() {
  sessionStorage.clear();
  sessionStorage.setItem("current-story", currentStory);
}

document.getElementById("hide-bg-icon").onclick = () => {
  document.getElementById("hide-bg-icon").classList.toggle("btn-activated");
  document.getElementById("dark-bg").classList.toggle("hide");
  if (isHideBackground()) {
    document.getElementById("text-section").style.opacity = "67%";
    document.getElementById("opacity-slider").value = "67";
  }
};

function isHideBackground() {
  return !document.getElementById("dark-bg").classList.contains("hide");
}

document.getElementById("opacity-slider").onmousemove = (e) => {
  document.getElementById("text-section").style.opacity = `${e.target.value}%`;
};
