# FluidWriter
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
- These files are renamed to a numeric index value, which you can find in the ```content/(your-story)/``` folder.
- Scroll on the image in the left pane to zoom on it.
- Double click on the image canvas to reset image size and position.
- Press ```Escape``` in the text editor to enter read-only mode, which also emphasises the text under the cursor, fading the rest.
- ```Ctrl-S``` for save, ```Ctrl-I``` for italic, ```Ctrl-B``` for bold.
- Press ```Enter``` key in read-only mode to toggle the text editor.
- The image, which is directly above your text cursor in edit mode, or above your mouse cursor in read-only mode, will be displayed.
- Audio playback works in a similar fashion, with an additional setting for volume (0-100).
- Example: ```aud:filename:15```.
- User can also store media files as common in the shared directory. To refer to them in the editor, simply prepend with "c".
- Example: ```cimg:filename```.
- User can set abbreviations in json file, and invoke them in the editor by prepending with a colon.
- Example: ```:gtg``` turns into ```Gotta go```
- Sentences automatically get adjusted when you enter a new line, capitalising first letter of the first word of every sentence and adding space after certain punctuation marks.
- Opacity slider can be used to alter the opacity of the text editor window.
- User can also make the text editor shift to the center of the screen (by default it resides on the right.)
- Stories can be hidden from the index page by prepending their folders with an underscore.
- User can toggle display of the background via a button in the toolbar.

## Acknowledgements
Following libraries were used in the making of this web app.
- Quill
- Grade.js
- TinyZoom.js
- Dropzone.js
- CtxMenu by nils-soderman

Note: Grade and TinyZoom were modified as per requirement.

## Contact
For any questions or inquiries, please contact me at: aeronaul@proton.me.
