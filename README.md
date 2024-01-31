# FluidWriter (Javascript)
A simple text editor with a clean interface for a distraction-free experience while writing.

## Screenshot
![FluidWriter screenshot](screenshot.png?raw=true)

## Features
- Supports image and audio uploads.
- Generates a gradient from the uploaded image in the background.
- Every story is contained in its own folder with its own media.
- The text is saved as HTML to preserve formatting.
- Supports bold and italic formatting.
- Simple and self-contained web app.

## Getting Started
To get a local copy of the project up and running on your machine, follow these steps:

### Prerequisites
- PHP 8
- Git

### Build & Run
1. Clone the repository:
```
git clone https://github.com/Aeronaul/FluidWriter.git
```
2. On Windows, double click ```run.bat```.
3. On Linux/MacOS, run the following commands:
```
cd FluidWriter/src
```
```
php -S localhost:5500 -c .
```
Alternatively, you can also run the shell script:
```
./run.sh
```

## Usage
- Go to ```http://localhost:5500```.
- On this page, you can create a new story or open an existing story.
- Click on a story to open it and when done, click on the save button before closing.
- You can drag and drop images and audio files onto the browser window to create a reference to these files at specific points in the story.
- These files are renamed to a numeric index value, which you can find in the ```content/(your-story)/``` folder
- Scroll on the image in the left pane to zoom on it.
- Double click on the text editor on the right to enter read-only mode, which also emphasises the text under the cursor, fading the rest.
- The image, which is directly above your text cursor in edit mode, or above your mouse cursor in read-only mode, will be displayed.
- Audio playback works in a similar fashion.

## Acknowledgements
Following libraries were used in the making of this web app. The latter two were modified as per requirement.
- Quill
- Grade.js
- TinyZoom.js

## Contact
For any questions or inquiries, please contact me at: aeronaul@proton.me.
