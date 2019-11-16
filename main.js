// Modules to control application life and create native browser window
const {app, BrowserWindow, globalShortcut, clipboard} = require('electron')
// const { apps, globalShortcut } = require('electron')
const request = require('request');
const fs = require('fs');
const clipboardy = require('clipboardy');
const Readable = require('stream').Readable ;
const path = require('path');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
  // Create the browser window.
    const ret = globalShortcut.register('CommandOrControl+Q', () => {
        console.log('CommandOrControl+X is pressed')
        // const formData = {
        //     attachments: [
        //         fs.createReadStream(__dirname + '/dpfgc3.jpg'),
        //         fs.createReadStream(__dirname + '/attachment2.jpg')
        //     ],
        // };
        //컨텐츠 타입 명시하여 전송하기
        var cb = clipboard.readImage();
        var bf = cb.toPNG();
        // var wstream = fs.createWriteStream('image.png');
        // wstream.write(bf);
        // wstream.end();
        // const readable = new Readable();
        // readable.push(bf); 
        const formData={

            file: {
                value:  
                // fs.createReadStream(__dirname + '\\image.png'), 
                bf,
                // readable,
                options: {
                    filename: 'image.png',
                    contentType: 'image/png'
                }

            },
            // auth_token: '98b7e2cdf3ce51c3871b095ff98c40a72233ea23',
            // action: 'upload',
            // type: 'file'
        };

        const headers = {
        };
        
        // const url = 'https://ko.imgbb.com/json';
        const url = 'https://pasteboard.co/upload';
        request.post({url:url, formData: formData, headers: headers}, function callback(err, httpResponse, body) {
            //callback
            // console.log(httpResponse);
            // console.log(body);
            const bd = JSON.parse(body)

            console.dir(bd, {depth: null, colors: true})

            // console.log(bd.image);
            // console.log(bd.image.title);
            clipboardy.writeSync(bd.url);
            const options = {
                    message: "type Ctrl + v in chat room"};
            const { dialog } = require('electron'); 
            const response = dialog.showMessageBox(null, options);

            // clipboardy.writeSync('🦄');

            // console.log("----------------------");
            //
            // console.log(object.image.image);
        });
        console.log('CommandOrControl+X is pressed }}}}}}}}}}}}}}}')
    })

  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
