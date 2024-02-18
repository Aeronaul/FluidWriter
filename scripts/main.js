const customDefaultImgForGradient = ""; // Set your default background image URL here
const defaultBgGradient = "background-image: linear-gradient(135deg, rgb(101, 158, 54) 0%, rgb(44, 55, 139) 75%); color: rgb(255, 255, 255);";
// const defaultBg = "background-image: linear-gradient(135deg, rgb(131, 178, 204) 0%, rgb(124, 55, 39) 75%); color: rgb(255, 255, 255);";
let currentImageIndex = -1;
let currentAudioIndex = -1;
let saved = true;
let audioVolume = 0.1;

localStorage.clear();

let quill = new Quill("#quillEditor", {
  modules: {
    toolbar: "#ql-toolbar",
  },
});

quill.root.setAttribute('spellcheck', false)

let imageIndex = 1;
let audioIndex = 1;
let audio;

const currentStory = sessionStorage.getItem("current-story");

if (currentStory == null) {
  window.location.href = "index.html";
}

fetch("/count.php")
  .then((res) => res.json())
  .then((data) => {
    // console.log(data);
    imageIndex = data.img + 1;
    audioIndex = data.aud + 1;
  });

fetch(`/load.php?story=${currentStory}`)
  .then((res) => res.json())
  .then((data) => {
    // console.log(data);
    quill.pasteHTML(data);
    document.getElementById("save-btn").classList.add("save-btn-disabled");
  });

let latestUpload;
let editorEnabled = false;

let myDropzone = new Dropzone("#outer-layout", {
  url: `/upload.php`,
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
      // console.log(latestUpload);
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
  image.src = url;
  image.onload = () => {
    resetSize();
    ctx.drawImage(
      image,
      0,
      0,
      document.getElementById("cg-canvas").width,
      document.getElementById("cg-canvas").height
    );
    resetPosition();
    document.getElementById("cg-background").style = Gradient(image);

    dragResetThreshold = Math.min(image.height, image.width) * dpRatio;
    if (currentImageIndex === -1) {
      document.getElementById("cg-canvas").classList.add("hide");
    } else {
      document.getElementById("cg-canvas").classList.remove("hide");
    }
  };
}

function loadCgIndex(index) {
  loadCg(`media.php?type=img&name=${index}`);
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

customDefaultImgForGradient ? loadCg(customDefaultImgForGradient) : setDefaultBg();

function setDefaultBg() {
  image.src = '';
  redraw()
  document.getElementById("cg-background").style = defaultBgGradient;
}

function resetSize() {
  document.getElementById("cg-canvas").width = image.width;
  document.getElementById("cg-canvas").height = image.height;
  scaleFactor =
    (document.getElementById("image-section").getBoundingClientRect().width -
      200) /
    image.width;
  zoom(1);
}

function resetPosition() {
  document.getElementById("cg-canvas").style.left =
    document.getElementById("image-section").getBoundingClientRect().width / 2 -
    document.getElementById("cg-canvas").width / 2 +
    "px";
  document.getElementById("cg-canvas").style.top =
    document.getElementById("image-section").getBoundingClientRect().height /
      2 -
    document.getElementById("cg-canvas").height / 2 +
    "px";
}

function zoom(scale) {
  scaleFactor *= scale;
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
  scaleFactor =
    (document.getElementById("image-section").getBoundingClientRect().width -
      200) /
    image.width;
  zoom(1);
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
  if(e.key === "Escape") { 
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
    if (currentImageIndex !== imgUrl) {
      currentImageIndex = imgUrl;
      loadCgIndex(currentImageIndex);
    }
  }
};

document.querySelector(".ql-editor").onmousemove = (e) => {
  if (!editorEnabled) {
    const lastImageIndex = getLastImageMouse(e.clientY);
    const lastAudioInfo = getLastAudioMouse(e.clientY);
    if (lastImageIndex > 0 && lastImageIndex != currentImageIndex) {
      currentImageIndex = lastImageIndex;
      loadCgIndex(currentImageIndex);
    } else if (lastImageIndex === -1) {
      currentImageIndex = lastImageIndex;
      customDefaultImgForGradient ? loadCg(customDefaultImgForGradient) : setDefaultBg();
    }

    if (lastAudioInfo.length > 2 && lastAudioInfo[2] && audioVolume != (parseFloat(lastAudioInfo[2])%100)/100) {
      audioVolume = (parseFloat(lastAudioInfo[2])%100)/100
      audio.volume = audioVolume; 
    }
    if (lastAudioInfo[1] == currentAudioIndex) return;
    if (lastAudioInfo.length > 0 && lastAudioInfo[1] != currentAudioIndex) {
      if (audio) audio.pause();
      currentAudioIndex = lastAudioInfo[1];
      audio = new Audio(`media.php?type=aud&name=${lastAudioInfo[1]}`);
      audio.loop = true;
      audio.volume = audioVolume;
      audio.play();
    } else if (lastAudioInfo === -1) {
      currentAudioIndex = lastAudioInfo[1];
      audio.pause();
    }
  }
};

quill.on("editor-change", (range) => {
  saved = false;
  document.getElementById("save-btn").classList.remove("save-btn-disabled");
  getLastImageKeyboard();
});

function decorateMediaHolders() {
  let ch = document.querySelectorAll(".ql-editor>*");
  let element;
  for (var el of ch) {
    if (el.innerHTML.startsWith("img:") || el.innerHTML.startsWith("aud:")) {
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
      el.innerHTML.startsWith("img:")
    )
      imgElement = el;
  }
  if (imgElement) return imgElement.innerHTML.substring("4");
  else return -1;
}

function getLastAudioMouse(mouseY) {
  let ch = document.querySelectorAll(".ql-editor>*");
  let audElement;
  for (var el of ch) {
    if (
      el.getBoundingClientRect().bottom < mouseY &&
      el.innerHTML.startsWith("aud:")
    )
      audElement = el;
  }
  if (audElement) {
    const audioInfo = audElement.innerHTML.split(":")
    // if (audioInfo.length > 2)
      // audioVolume = (parseFloat(audioInfo[2])%10)/10;
    return audioInfo;
  }
  else return [];
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
  let audElement;
  for (var el of ch) {
    if (
      el.getBoundingClientRect().bottom <=
      (node.getBoundingClientRect
        ? node.getBoundingClientRect()
        : node.parentElement.getBoundingClientRect()
      ).bottom
    ) {
      if (el.innerHTML.startsWith("img:")) imgElement = el;
      else if (el.innerHTML.startsWith("aud:")) audElement = el;
    }
  }

  if (imgElement) {
    const i = imgElement.innerHTML.substring("4");
    if (currentImageIndex != i) {
      currentImageIndex = i;
      loadCgIndex(i);
    }
  } else {
    currentImageIndex = -1;
    customDefaultImgForGradient ? loadCg(customDefaultImgForGradient) : setDefaultBg();
  }

  decorateMediaHolders();

  if (audElement) {
    const audioInfo = audElement.innerHTML.split(":")
    const aIndex = audioInfo[1];
    if (aIndex == currentAudioIndex) {
      if (audioInfo.length > 2 && audioInfo[2] && audioVolume != (parseFloat(audioInfo[2])%100)/100) {
        audioVolume = (parseFloat(audioInfo[2])%100)/100
        audio.volume = audioVolume;
      }
      return;
    }
    if (audioInfo.length > 2)
      audioVolume = (parseFloat(audioInfo[2])%100)/100;
    currentAudioIndex = aIndex;
    if (audio) audio.pause();
    audio = new Audio(`media.php?type=aud&name=${aIndex}`);
    audio.volume = audioVolume;
    audio.loop = true;
    audio.play();
  } else {
    currentAudioIndex = -1;
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

document.getElementById("save-btn").onclick = () => {
  const data = quill.container.firstChild.innerHTML;
  document.getElementById("quillEditor").classList.add("hide-cursor");
  fetch(`/save.php?file=${sessionStorage.getItem("current-story")}`, {
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
    document.getElementById("save-btn").classList.add("save-btn-disabled");
  });
};

document.getElementById("close-btn").onclick = () => {
  sessionStorage.removeItem("current-story");
  window.location.href = "index.html";
};
