import React from 'react';
import { FENCE_STYLES } from '../configData';

var STYLE_BADGES = {
    uaf_200: { label: 'Popular', cls: 'b-popular' },
    uaf_201: { label: 'Puppy Ready', cls: 'b-puppy' },
    uaf_250: { label: 'Popular', cls: 'b-popular' },
    uab_200: { label: 'Pool Safe', cls: 'b-pool' },
    uas_100: { label: 'Classic', cls: 'b-classic' },
    uas_101: { label: 'Puppy Ready', cls: 'b-puppy' },
    uas_150: { label: 'Classic', cls: 'b-classic' },
};

var STYLE_THUMBS = {
    uaf_200: 'gate_tool/th/th_st_uaf_200.jpg',
    uaf_201: 'gate_tool/th/th_st_uaf_201.jpg',
    uaf_250: 'gate_tool/th/th_st_uaf_250.jpg',
    uab_200: 'gate_tool/th/th_st_uab_200.jpg',
    uas_100: 'gate_tool/th/th_st_uas_100.jpg',
    uas_101: 'gate_tool/th/th_st_uas_101.jpg',
    uas_150: 'gate_tool/th/th_st_uas_150.jpg',
};

var StyleTab = function(props) {
    var config = props.config;
    var onConfigChange = props.onConfigChange;
    var styles3D = FENCE_STYLES.filter(function(s) { return s.supports3D; });

    var handleStyleChange = function(styleId) {
        var style = FENCE_STYLES.find(function(s) { return s.id === styleId; });
        onConfigChange({
            ...config,
            styleId: styleId,
            post: style.postDefault,
            leaf: style.leafDefault,
            finial: style.hasFinials ? 'fs' : null,
            accessories: {},
        });
    };

    return (
        <div className="style-grid">
            {styles3D.map(function(style) {
                var badge = STYLE_BADGES[style.id];
                var isActive = config.styleId === style.id;
                return (
                    <div
                        key={style.id}
                        className={'style-card' + (isActive ? ' active' : '')}
                        onClick={function() { handleStyleChange(style.id); }}
                    >
                        <div className="style-card-img">
                            <img src={STYLE_THUMBS[style.id]} alt={style.name} />
                        </div>
                        <div className="style-card-info">
                            <div className="style-card-name">{style.name}</div>
                            <div className="style-card-sub">{style.subtitle}</div>
                        </div>
                        {badge && (
                            <div className={'card-badge ' + badge.cls}>{badge.label}</div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default StyleTab;
