import React from 'react';
import { STYLE_FEATURE_GATE } from '../configData';

var PUPPY_VARIANTS = [
    { id: 'std', name: 'Standard', thumb: 'gate_tool/th/th_pup_std.jpg' },
    { id: 'fls', name: 'Flush',    thumb: 'gate_tool/th/th_pup_fls.jpg' },
    { id: 'plg', name: 'Plug',     thumb: 'gate_tool/th/th_pup_plg.jpg' },
    { id: 'pls', name: 'Plug Spear', thumb: 'gate_tool/th/th_pup_pls.jpg' },
    { id: 'qua', name: 'Quad',     thumb: 'gate_tool/th/th_pup_qua.jpg' },
    { id: 'qus', name: 'Quad Spear', thumb: 'gate_tool/th/th_pup_qus.jpg' },
    { id: 'spe', name: 'Spear',    thumb: 'gate_tool/th/th_pup_spe.jpg' },
    { id: 'sps', name: 'Spear Spear', thumb: 'gate_tool/th/th_pup_sps.jpg' },
    { id: 'tri', name: 'Trident',  thumb: 'gate_tool/th/th_pup_tri.jpg' },
    { id: 'trs', name: 'Trident Spear', thumb: 'gate_tool/th/th_pup_trs.jpg' },
];

var PuppyPicketsTab = function(props) {
    var config = props.config;
    var onConfigChange = props.onConfigChange;
    var gate = STYLE_FEATURE_GATE[config.styleId] || {};
    var supportsPuppy = (gate.options || []).indexOf('pup') !== -1;

    if (!supportsPuppy) {
        return (
            <div style={{ textAlign: 'center', color: 'rgba(240,242,245,0.5)', fontSize: '15px', fontWeight: 500 }}>
                Puppy pickets are not available for this style. Try Horizon, Vanguard, Haven, Charleston, or Savannah.
            </div>
        );
    }

    var currentPup = config.accessories && config.accessories.pup;

    var handlePuppyClick = function(variantId) {
        var current = config.accessories || {};
        if (currentPup === variantId) {
            // Toggle off
            var updated = { ...current };
            delete updated.pup;
            onConfigChange({ ...config, accessories: updated });
        } else {
            onConfigChange({
                ...config,
                accessories: { ...current, pup: variantId },
            });
        }
    };

    return (
        <div className="option-row">
            {PUPPY_VARIANTS.map(function(variant) {
                var isActive = currentPup === variant.id;
                return (
                    <div
                        key={variant.id}
                        className={'opt-card' + (isActive ? ' active' : '')}
                        onClick={function() { handlePuppyClick(variant.id); }}
                    >
                        <div className="opt-card-img">
                            <img src={variant.thumb} alt={variant.name} />
                        </div>
                        <div className="opt-card-label">{variant.name}</div>
                    </div>
                );
            })}
        </div>
    );
};

export default PuppyPicketsTab;
