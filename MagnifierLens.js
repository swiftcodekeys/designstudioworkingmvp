import React, { useEffect, useRef } from 'react';

var ZOOM = 3;
var SIZE = 80;

var MagnifierLens = function() {
    var magRef = useRef(null);

    useEffect(function() {
        var mag = magRef.current;
        if (!mag) return;

        var viewport = mag.parentElement; // viewport-wrap
        if (!viewport) return;

        function onMouseMove(e) {
            var rect = viewport.getBoundingClientRect();
            var x = e.clientX - rect.left;
            var y = e.clientY - rect.top;

            mag.style.display = 'block';
            mag.style.left = (x - SIZE / 2) + 'px';
            mag.style.top = (y - SIZE / 2) + 'px';

            // Find the background image in the viewport (gate_tool bg)
            var bgImg = viewport.querySelector('img');
            if (bgImg) {
                var br = bgImg.getBoundingClientRect();
                var bx = e.clientX - br.left;
                var by = e.clientY - br.top;
                mag.style.backgroundImage = 'url(' + bgImg.src + ')';
                mag.style.backgroundSize = (br.width * ZOOM) + 'px ' + (br.height * ZOOM) + 'px';
                mag.style.backgroundPosition = -(bx * ZOOM - SIZE / 2) + 'px ' + -(by * ZOOM - SIZE / 2) + 'px';
            }

            viewport.style.cursor = 'none';
        }

        function onMouseLeave() {
            mag.style.display = 'none';
            viewport.style.cursor = '';
        }

        viewport.addEventListener('mousemove', onMouseMove);
        viewport.addEventListener('mouseleave', onMouseLeave);

        return function() {
            viewport.removeEventListener('mousemove', onMouseMove);
            viewport.removeEventListener('mouseleave', onMouseLeave);
            viewport.style.cursor = '';
        };
    }, []);

    return React.createElement('div', {
        ref: magRef,
        className: 'mag'
    });
};

export default MagnifierLens;
