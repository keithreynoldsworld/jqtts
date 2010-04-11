/*!
   jQuery Text-to-Speech plugin
   --------------------------------------------
   http://code.google.com/p/jqtts/

   Copyright (c) 2010, Kevin Hoang Le. All rights reserved.
   Code provided under the MIT License:
   http://www.opensource.org/licenses/mit-license.html

   v0.1
*/

(function($) {
    $.fn.extend({
        jtts: function(options) {
            var defaults = {
                lang: 'en',
                msPerWord: 900
            };
            
            var options = $.extend(defaults, options);            
            //passed-in
            var sentences = [];
            var lang;
            var msPerWord;
            var elem;
            //internal
            var plugin;
            var ttsUrl = 'http://translate.google.com/translate_tts';          
            var inProgress = false;
            var currentPlaying = 0;            
            var total = 0;
            var isIE;            
            var jPlayer = null;            

            var talkNonIE = function() {
                var url = ttsUrl + '?tl=' + lang + '&q=' + sentences[currentPlaying++];
                jPlayer.jPlayer('setFile', url).jPlayer('play').jPlayer('onSoundComplete', onSoundComplete);
            };
        
            var talkIE = function() {
                if (currentPlaying < total) {
                    var re = /\w+/g;
                    var words = sentences[currentPlaying].match(re);        
                    
                    var url = ttsUrl + '?tl=' + lang + '&q=' + sentences[currentPlaying++];    
                    setTimeout(talkIE, words.length * msPerWord);
                    
                    if (jPlayer != null) {
                        jPlayer.remove();
                    }
                    
                    jPlayer = $('<embed>', {src: url, hidden: true}).appendTo($(elem));
                } else {
                    inProgress = false;
                    plugin.trigger('onComplete', []);
                }
            };
        
            var onSoundComplete = function() {
                if (currentPlaying < total) {
                    talkNonIE();                    
                } else {
                    inProgress = false;
                    plugin.trigger('onComplete', []);
                }
            };            

            return this.each(function() {
                plugin = $(this);
                elem = $(options.elem);

                if ($.browser.msie) {
                    isIE = true;                    
                } else {
                    isIE = false;
                    jPlayer = $(elem);                   
                    jPlayer.jPlayer(options.jPlayer);
                }                
                
                lang = options.lang;                
                msPerWord = options.msPerWord;
            }).bind('playing', function(e, lines) {
                currentPlaying = 0;
                sentences = lines;
                total = sentences.length;
                if (isIE) {
                    talkIE();
                } else {
                    talkNonIE();
                }                
            }).bind('pause', function() {
            }).bind('stop', function() {                
            }).bind('resume', function() {                
            });   
        },
        play: function(sentences) {
            return this.trigger('playing', [sentences]);
        },
        pause: function() {
            return this.trigger('pause');
        },
        abort: function() {
            return this.trigger('abort');
        },
        resume: function() {
            return this.trigger('resume');
        }
    });
})(jQuery);

