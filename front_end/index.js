const source = new EventSource('/events');
let TTSArray = [];
let ID = 0;
responsiveVoice.OnVoiceReady = function () {
    console.log("speech time?");
    setInterval(() => {
        if (TTSArray.length > 0) {
            document.querySelector('#PopupContainer').style.opacity = 1;
            let a = TTSArray.shift();
            let phrase = a.username + " said " + a.msg;
            document.querySelector('#content').innerHTML = a.username + "Speaks";
            responsiveVoice.speak(phrase);
            //var msg = new SpeechSynthesisUtterance(phrase);
            //window.speechSynthesis.speak(msg);
            setTimeout(() => {
                document.querySelector('#PopupContainer').style.opacity = 0;
            }, 5000)
        }
    }, 5000);
};



source.addEventListener('message', message => {
    console.log('Got', message);
    let arr = JSON.parse(event.data);
    console.log(ID + ":" + arr.length);
    for (ID; ID < arr.length; ID++) {
        TTSArray.push(arr[ID]);
    }
    console.log("New ID - " + ID);
});

function fixAudio() {
    document.getElementById('PopupContainer').style.display = 'flex';
    document.getElementById('audiofix').style.display = 'none';
}