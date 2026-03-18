import React from 'react';
import { COLORS } from '../configData';

var ColorTab = function(props) {
    var config = props.config;
    var onConfigChange = props.onConfigChange;

    var handleColorChange = function(color) {
        onConfigChange({ ...config, color: color });
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
                        >
                            <div
                                className={'swatch' + (isActive ? ' active' : '')}
                                style={{
                                    background: color.hex,
                                    borderColor: isLight && !isActive ? 'rgba(255,255,255,0.15)' : undefined,
                                }}
                            />
                            <div className="swatch-name">{color.displayName}</div>
                        </div>
                    );
                })}
            </div>
            <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '12px', color: 'rgba(240,242,245,0.4)', fontWeight: 500 }}>
                Every component individually coated before assembly for complete coverage. Limited Lifetime Warranty.
            </div>
        </div>
    );
};

export default ColorTab;
