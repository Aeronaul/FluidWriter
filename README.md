# Fluid Writer (Javascript)
A simple text editor with a clean interface for a distraction-free experience while writing.

## Screenshot
![FluidWriter screenshot](screenshot.jpg?raw=true)

## Features
- Supports image and audio uploads.
- Every story is contained in its own folder with its own media.
- The text file is saved as HTML to preserve formatting.
- Only supports bold and italic formatting.
- Simple and self-contained web app.

## Getting Started
To get a local copy of the project up and running on your machine, follow these steps:

### Prerequisites
- PHP 8
- Git

### Build & Run
1. Clone the repository:
```
git clone https://github.com/Aeronaul/FluidWriter_JS.git
```
2. On windows, double click ```run.bat```.
3. On linux, run the following commands:
```
cd FluidWriter_JS/src
```
```
./run.sh
```

## Usage
- Go to localhost:5500
- On this page, you can create a new story or open an existing story.
- Click on a story to open it and when done, click on the save button before closing.
- You can drag and drop images and audio files onto the browser window to create a reference to these files at specific points in the story.
- These files are renamed to a numeric index value, which you can find in the ```content/(your-story)/``` folder

## Acknowledgements
- Quill
- Grade.js
- TinyZoom.js

## Contact
For any questions or inquiries, please contact me at: aeronaul@proton.me.