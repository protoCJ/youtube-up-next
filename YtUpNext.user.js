// ==UserScript==
// @name         YtUpNext
// @namespace    http://tampermonkey.net/
// @version      0.1.2
// @description  Add up next button to Youtube videos
// @author       protoCJ
// @match        https://www.youtube.com/*
// @grant        none
// @downloadURL  https://github.com/protoCJ/youtube-up-next/raw/master/YtUpNext.user.js
// ==/UserScript==



(function() {
    'use strict';

    var upNextVideoList = [];
    var upNextVideos = [];

    function readFromWindowName() {
        if (window.name !== "") {
            var videosObject = JSON.parse(window.name);
            upNextVideoList = videosObject.links;
            upNextVideos = videosObject.videos;
        }
    }

    readFromWindowName();

    var isSetUp = false;

    function getHref(video) {
        return video.getElementsByTagName('a')[0].getAttribute('href');
    }

    function setupVideos() {
        if (!isSetUp) {
            upNextVideos.forEach(function(video) {
                document.querySelector('ytd-compact-autoplay-renderer').append(htmlToElement(video));
            });

            var videos = document.querySelectorAll('ytd-compact-video-renderer');
            videos.forEach(addUpNextButton);
            isSetUp = true;
        }
    }

    function htmlToElement(html) {
        var template = document.createElement('template');
        template.innerHTML = html;
        return template.content.firstChild;
    }

    setInterval(setupVideos, 1000);

    function addUpNextButton(video) {
        var upNextLink = getHref(video);
        var upNextButton = document.createElement('div');
        upNextButton.setAttribute('class', 'yt-up-next');
        if (upNextVideoList.indexOf(upNextLink) !== -1) {
            upNextButton.innerHTML = (upNextVideoList.indexOf(upNextLink) + 1) + ' in queue.';
        }
        else {
            upNextButton.innerHTML = '<a href="#" onClick="return false;">Add to Up Next</a>';
            upNextButton.addEventListener('click',function() {
                upNextVideoList.push(upNextLink);
                upNextVideos.push(video.cloneNode(true).outerHTML);
                document.querySelector('ytd-compact-autoplay-renderer').append(video);
                upNextButton.innerHTML = 'Added! ' + upNextVideoList.length + ' in queue.';
            });
        }
        video.append(upNextButton);
    }

    document.querySelector('video').addEventListener('ended',function() {
        if (upNextVideoList.length > 0) {
            var link = upNextVideoList.shift();
            var video = upNextVideos.shift();
            isSetUp = false;
            window.name = JSON.stringify({
                links: upNextVideoList,
                videos: upNextVideos
            });
            window.location.href = link;
        }
    });


    (document.body || document.documentElement).addEventListener('transitionend',
                                                                 function(/*TransitionEvent*/ event) {
        if (event.propertyName === 'width' && event.target.id === 'progress') {
            isSetUp = false;
            setupVideos();
        }
    }, true);
})();
