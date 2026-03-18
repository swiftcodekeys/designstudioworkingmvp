import React, { useState } from 'react';
import { STYLE_FEATURE_GATE, FENCE_STYLES } from '../configData';
import ImagePopup from './ImagePopup';

var POST_CAP_ITEMS = [
    { id: 'pcf', name: 'Flat', thumb: 'gate_tool/th/th_pstcp_flat.jpg' },
    { id: 'pcb', name: 'Ball', thumb: 'gate_tool/th/th_pstcp_ball.jpg' },
];

var FINIAL_ITEMS = [
    { id: 'fs', name: 'Spear',   thumb: 'gate_tool/th/th_pc_spe.jpg' },
    { id: 'ft', name: 'Trident', thumb: 'gate_tool/th/th_pc_tri.jpg' },
    { id: 'fq', name: 'Quad',    thumb: 'gate_tool/th/th_pc_qua.jpg' },
    { id: 'fp', name: 'Plug',    thumb: 'gate_tool/th/th_pc_plg.jpg' },
];

var ACCENT_ITEMS = [
    { id: 'tcr', name: 'Circle',    thumb: 'gate_tool/th/th_acc_cir.jpg' },
    { id: 'tbu', name: 'Butterfly', thumb: 'gate_tool/th/th_acc_but.jpg' },
    { id: 'scr', name: 'Scroll',    thumb: 'gate_tool/th/th_acc_scr.jpg' },
];

var DetailsTab = function(props) {
    var config = props.config;
    var onConfigChange = props.onConfigChange;
    var gate = STYLE_FEATURE_GATE[config.styleId] || {};
    var style = FENCE_STYLES.find(function(s) { return s.id === config.styleId; }) || FENCE_STYLES[0];

    var hoverState = useState(null);
    var popup = hoverState[0];
    var setPopup = hoverState[1];

    var availablePostCaps = (gate.postCaps || []);
    var availableFinials = (gate.finials || []);
    var availableAccessories = (gate.accessories || []);

    var filteredPostCaps = POST_CAP_ITEMS.filter(function(pc) {
        return availablePostCaps.indexOf(pc.id) !== -1;
    });

    var filteredFinials = FINIAL_ITEMS.filter(function(f) {
        return availableFinials.indexOf(f.id) !== -1;
    });

    var filteredAccents = ACCENT_ITEMS.filter(function(a) {
        return availableAccessories.indexOf(a.id) !== -1;
    });

    var handlePostCapChange = function(pcId) {
        onConfigChange({ ...config, postCap: pcId });
    };

    var handleFinialChange = function(finId) {
        if (config.finial === finId) {
            onConfigChange({ ...config, finial: null });
        } else {
            onConfigChange({ ...config, finial: finId });
        }
    };

    var toggleAccent = function(accId) {
        var current = config.accessories || {};
        onConfigChange({
            ...config,
            accessories: { ...current, [accId]: !current[accId] },
        });
    };

    var handleMouseEnter = function(src, alt, event) {
        var rect = event.currentTarget.getBoundingClientRect();
        setPopup({
            src: src,
            alt: alt,
            position: {
                top: rect.top - 10,
                left: rect.left - 290,
            }
        });
    };

    var handleMouseLeave = function() {
        setPopup(null);
    };

    return (
        <div className="sections-row">
            {filteredPostCaps.length > 0 && (
                <div className="section-group">
                    <div className="section-title">Post Caps</div>
                    <div className="option-row">
                        {filteredPostCaps.map(function(pc) {
                            var isActive = (config.postCap || 'pcf') === pc.id;
                            return (
                                <div
                                    key={pc.id}
                                    className={'opt-card' + (isActive ? ' active' : '')}
                                    onClick={function() { handlePostCapChange(pc.id); }}
                                    onMouseEnter={function(e) { handleMouseEnter(pc.thumb, pc.name, e); }}
                                    onMouseLeave={handleMouseLeave}
                                >
                                    <div className="opt-card-img">
                                        <img src={pc.thumb} alt={pc.name} />
                                    </div>
                                    <div className="opt-card-label">{pc.name}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
            {style.hasFinials && filteredFinials.length > 0 && (
                <div className="section-group">
                    <div className="section-title">Finials</div>
                    <div className="option-row">
                        <div
                            className={'opt-card' + (config.finial === null ? ' active' : '')}
                            onClick={function() { handleFinialChange(null); }}
                        >
                            <div className="opt-card-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span style={{ color: '#8e95a0', fontSize: '20px' }}>-</span>
                            </div>
                            <div className="opt-card-label">None</div>
                        </div>
                        {filteredFinials.map(function(f) {
                            var isActive = config.finial === f.id;
                            return (
                                <div
                                    key={f.id}
                                    className={'opt-card' + (isActive ? ' active' : '')}
                                    onClick={function() { handleFinialChange(f.id); }}
                                    onMouseEnter={function(e) { handleMouseEnter(f.thumb, f.name, e); }}
                                    onMouseLeave={handleMouseLeave}
                                >
                                    <div className="opt-card-img">
                                        <img src={f.thumb} alt={f.name} />
                                    </div>
                                    <div className="opt-card-label">{f.name}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
            {filteredAccents.length > 0 && (
                <div className="section-group">
                    <div className="section-title">Accents</div>
                    <div className="option-row">
                        {filteredAccents.map(function(acc) {
                            var isActive = config.accessories && config.accessories[acc.id];
                            return (
                                <div
                                    key={acc.id}
                                    className={'opt-card' + (isActive ? ' active' : '')}
                                    onClick={function() { toggleAccent(acc.id); }}
                                    onMouseEnter={function(e) { handleMouseEnter(acc.thumb, acc.name, e); }}
                                    onMouseLeave={handleMouseLeave}
                                >
                                    <div className="opt-card-img">
                                        <img src={acc.thumb} alt={acc.name} />
                                    </div>
                                    <div className="opt-card-label">{acc.name}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
            {popup && <ImagePopup src={popup.src} alt={popup.alt} position={popup.position} />}
        </div>
    );
};

export default DetailsTab;
