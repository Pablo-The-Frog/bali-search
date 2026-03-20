function changeSubtitles(subtitleSrc) {
    var subtitleTrack = document.getElementById('subtitles');
    subtitleTrack.src = subtitleSrc;
    var videoElement = document.getElementById('videoElement');
    videoElement.textTracks[0].mode = 'showing';
    videoElement.load();
}

function playVideo(src) {
    var videoPlayer = document.getElementById('videoPlayer');
    var videoElement = document.getElementById('videoElement');
    var videoSource = document.getElementById('videoSource');

    videoSource.src = src;
    videoElement.load();
    videoPlayer.style.display = 'block';
}

function closeVideo() {
    var videoPlayer = document.getElementById('videoPlayer');
    var videoElement = document.getElementById('videoElement');

    videoElement.pause();
    videoPlayer.style.display = 'none';
}

