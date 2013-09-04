/*global jQuery*/

var setupPhotos = (function ($) {
    function each (items, callback) {
        var i;
        for (i = 0; i < items.length; i += 1) {
            setTimeout(callback.bind(this, items[i]), 0);
        }
    }

    function flatten (items) {
        return items.reduce(function (a, b) {
            return a.concat(b);
        });
    }

    function loadPhotosByTag (tag, max, callback) {
        var photos = [];
        var callback_name = 'callback_' + Math.floor(Math.random() * 100000);

        window[callback_name] = function (data) {
            delete window[callback_name];
            var i;
            for (i = 0; i < max; i += 1) {
                photos.push(data.items[i].media.m);
            }
            callback(null, photos);
        };

        $.ajax({
            url: 'http://api.flickr.com/services/feeds/photos_public.gne',
            data: {
                tags: tag,
                lang: 'en-us',
                format: 'json',
                jsoncallback: callback_name
            },
            dataType: 'jsonp'
        });
    }

    function loadAllPhotos (tags, max, callback) {
        var results = [];
        function handleResult (err, photos) {
            if (err) { return callback(err); }

            results.push(photos);
            if (results.length === tags.length) {
                callback(null, flatten(results));
            }
        }

        each(tags, function (tag) {
            loadPhotosByTag(tag, max, handleResult);
        });
    }

    function renderPhoto (photo) {
        var img = new Image();
        img.src = photo;
        return img;
    }

    function imageAppender (id) {
        var holder = document.getElementById(id);
        return function (img) {
            var elm = document.createElement('div');
            var elmfav = document.createElement('div');
            elm.className = 'photo fav';
            var i;
            for (i = 0; i <= localStorage.length; i++) {

                if (img.src == localStorage.getItem(i)) {
                    elmfav.className = 'heart icon-heart';            
                    break;
                }
                else { 
                    elmfav.className = 'heart icon-heart-empty'; 
                }
            }
            elmfav.setAttribute('name',img.src);
            elmfav.setAttribute('onclick','favcheck("'+img.src+'")');
            elm.appendChild(img);
            elm.appendChild(elmfav);
            holder.appendChild(elm);
        
        };
        
    }

/*
            localStorage.setItem('imm','xx');
            alert(localStorage.getItem('imm'));*/


    // ----
    
    var max_per_tag = 5;
    return function setup (tags, callback) {
        loadAllPhotos(tags, max_per_tag, function (err, items) {
            if (err) { return callback(err); }

            each(items.map(renderPhoto), imageAppender('photos'));
            callback();
        });
    };



}(jQuery));

//window.localStorage.clear();


function favcheck(fav) {
    var x,max = localStorage.length;
    for (x = 0; x <= max; x++) {
        if (fav == localStorage.getItem(x)) {
            localStorage.removeItem(x);
            document.getElementsByName(fav)[0].className = "heart icon-heart-empty";
            break;                    
        }
        if ( (x == max) && (fav != localStorage.getItem(x)) ) {
            localStorage.setItem(max++,fav);
            document.getElementsByName(fav)[0].className = "heart icon-heart";
            break;
        }
    }
}