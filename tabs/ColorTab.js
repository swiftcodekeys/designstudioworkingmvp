import React, { useState } from 'react';
import { COLORS } from '../configData';

var ColorPopup = function(props) {
    var hex = props.hex;
    var name = props.name;
    var position = props.position;

    if (!hex || !position) return null;

    return (
        <div className="img-popup" style={{ top: position.top, left: position.left, padding: '16px', textAlign: 'center' }}>
            <div style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: hex,
                margin: '0 auto 8px',
                border: '2px solid rgba(0,0,0,0.1)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
            }} />
            <div className="img-popup-label">{name}</div>
        </div>
    );
};

var ColorTab = function(props) {
    var config = props.config;
    var onConfigChange = props.onConfigChange;

    var hoverState = useState(null);
    var popup = hoverState[0];
    var setPopup = hoverState[1];

    var handleColorChange = function(color) {
        onConfigChange({ ...config, color: color });
    };

    var handleMouseEnter = function(hex, name, event) {
        var rect = event.currentTarget.getBoundingClientRect();
        setPopup({
            hex: hex,
            name: name,
            position: {
                top: rect.top - 10,
                left: rect.left - 160,
            }
        });
    };

    var handleMouseLeave = function() {
        setPopup(null);
    };

    return (
        <div>
            <div className="swatch-row">
                {COLORS.map(function(color) {
                    var isActive = config.color && config.color.id === color.id;
                    var isLight = color.hex === '#f4f4f4' || color.hex === '#f2f2f2' || color.hex === '#e8e8e8';
                    return (
                        <div
                            key={color.id}
                            className="swatch-group"
                            onClick={function() { handleColorChange(color); }}
                            onMouseEnter={function(e) { handleMouseEnter(color.hex, color.displayName, e); }}
                            onMouseLeave={handleMouseLeave}
                        >
                            <div
                                className={'swatch' + (isActive ? ' active' : '')}
                                style={{
                                    background: color.hex,
                                    borderColor: isLight && !isActive ? 'rgba(0,0,0,0.1)' : undefined,
                                }}
                            />
                            <div className="swatch-name">{color.displayName}</div>
                        </div>
                    );
                })}
            </div>
            <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '12px', color: '#8e95a0', fontWeight: 500 }}>
                Every component individually coated before assembly for complete coverage. Limited Lifetime Warranty.
            </div>
            {popup && <ColorPopup hex={popup.hex} name={popup.name} position={popup.position} />}
        </div>
    );
};

export default ColorTab;
