const {app, BrowserWindow, globalShortcut, clipboard, ipcMain} = require('electron')
// const { apps, globalShortcut } = require('electron')
const request = require('request');
const fs = require('fs');
const clipboardy = require('clipboardy');
const Readable = require('stream').Readable ;
const path = require('path');
// const {K, U} = require('win32-api');
 
// const knl32 = K.load()
// const user32 = U.load()

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.

// var robot = require("robotjs");
//
// // Speed up the mouse.
// robot.setMouseDelay(2);
//
// var twoPI = Math.PI * 2.0;
// var screenSize = robot.getScreenSize();
// var height = (screenSize.height / 2) - 10;
// var width = screenSize.width;
//
// for (var x = 0; x < width; x++)
// {
//     y = height * Math.sin((twoPI * x) / width) + height;
//     robot.moveMouse(x, y);
// }

let localip = '';
let mainWindow

function createWindow () {
  // Create the browser window.
    
    request.get({url:"https://api.ipify.org/?format=json"}, function callback(err, httpResponse, body) {
        //callback
        console.log(body);
        var bd = JSON.parse(body);
        localip = bd.ip;
    });
    const ret = globalShortcut.register('CommandOrControl+Shift+U', () => {
        var cb = clipboard.readImage();
        if(cb.getSize().width == 0) {
            var eNotify = require('electron-notify');
            eNotify.setConfig({
                              color: '#FF0000',
                              displayTime: 3000
            });
            eNotify.notify({ title: '클립보드에 이미지가 없습니다.', text: ''});
            return;
        }
        console.log(cb.getSize());
        var bf = cb.toPNG();
        const formData={

            userfile: {
                value:  
                // fs.createReadStream(__dirname + '\\image.png'), 
                bf,
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
        // const url = 'https://pasteboard.co/upload';
        const url = 'http://127.0.0.1:3000/upload';
        request.post({url:url, formData: formData, headers: headers}, function callback(err, httpResponse, body) {
            //callback
            console.log(body);
            const bd = JSON.parse(body)
            console.dir(bd, {depth: null, colors: true})

            clipboardy.writeSync("http://" + localip + ":3000/uploads/" + bd.url);

            var eNotify = require('electron-notify');
            eNotify.setConfig({
                              color: '#FF0000',
                              displayTime: 3000
            });
            eNotify.notify({ title: '업로드 완료!', text: 'C-V 를 눌러서 친구에게 이미지를 전송하세요.' });
        });
        return true;
    })

  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
        preload: path.join(__dirname, 'preload.js'), 
        nodeIntegration: true
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

ipcMain.on('sendMsg',(event, args) =>{
    localip = args;
    console.log(args);
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.




var express = require('express');
var kapp = express();
var multer = require('multer'); // multer모듈 적용 (for 파일업로드)

function makeid(length) {
       var result           = '';
       var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
       var charactersLength = characters.length;
       for ( var i = 0; i < length; i++ ) {
                 result += characters.charAt(Math.floor(Math.random() * charactersLength));
              }
       return result;
}

var storage = multer.diskStorage({
                                   destination: function (req, file, cb) {
                                           cb(null, '') // cb 콜백함수를 통해 전송된 파일 저장 디렉토리 설정
                                         },
                                   filename: function (req, file, cb) {
                                           cb(null, makeid(5) + ".png") // cb 콜백함수를 통해 전송된 파일 이름 설정
                                         }
});
var upload = multer({ storage: storage });
kapp.use('/uploads', express.static('.'));


kapp.get('/', function (req, res) {
      res.send('Hello World!');
});

kapp.post('/upload', upload.single('userfile'), function(req, res){
    // res.send({url: "http://175.123.88.40:3000/" + req.file.path});
    res.send({url: req.file.path});
    console.log(req.file.path); // 콘솔(터미널)을 통해서 req.file Object 내용 확인 가능.
});


kapp.listen(3000, function () {
      console.log('Example kapp listening on port 3000!');
});

