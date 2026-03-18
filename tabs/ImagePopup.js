import React from 'react';

var ImagePopup = function(props) {
    var src = props.src;
    var alt = props.alt || '';
    var position = props.position; // { top, left }

    if (!src || !position) return null;

    return (
        <div className="img-popup" style={{ top: position.top, left: position.left }}>
            <img src={src} alt={alt} />
            {alt && <div className="img-popup-label">{alt}</div>}
        </div>
    );
};

export default ImagePopup;
