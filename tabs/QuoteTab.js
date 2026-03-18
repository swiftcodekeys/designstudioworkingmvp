import React from 'react';
import { FENCE_STYLES, ARCH_STYLES, POST_CAPS, FINIALS, ACCESSORIES } from '../configData';

var QuoteTab = function(props) {
    var config = props.config;
    var style = FENCE_STYLES.find(function(s) { return s.id === config.styleId; }) || FENCE_STYLES[0];
    var archObj = ARCH_STYLES.find(function(a) { return a.id === config.arch; });
    var archName = archObj ? archObj.name : 'Standard';

    var postCapObj = POST_CAPS.find(function(pc) { return pc.id === config.postCap; });
    var postCapName = postCapObj ? postCapObj.name : 'None';

    var finialObj = config.finial ? FINIALS.find(function(f) { return f.id === config.finial; }) : null;
    var finialName = finialObj ? finialObj.name : 'None';

    var colorName = config.color ? config.color.displayName : 'Black';
    var leafLabel = config.leaf === '1' ? 'Single' : 'Double';
    var mountLabel = config.mount === 'd' ? 'Direct Mount' : 'Post Mount';

    // Collect active accessories
    var accList = [];
    var acc = config.accessories || {};
    Object.keys(acc).forEach(function(key) {
        if (acc[key] && ACCESSORIES[key]) {
            accList.push(ACCESSORIES[key].name);
        }
    });
    var accDisplay = accList.length > 0 ? accList.join(', ') : 'None';

    return (
        <div className="quote-layout">
            <div className="quote-summary">
                <div className="quote-row">
                    <span className="ql">Style</span>
                    <span className="qv">{style.name} — {style.subtitle}</span>
                </div>
                <div className="quote-row">
                    <span className="ql">Color</span>
                    <span className="qv">{colorName} (ProCoat)</span>
                </div>
                <div className="quote-row">
                    <span className="ql">Size</span>
                    <span className="qv">{config.height}" {leafLabel} Gate · {mountLabel}</span>
                </div>
                <div className="quote-row">
                    <span className="ql">Arch</span>
                    <span className="qv">{archName}</span>
                </div>
                <div className="quote-row">
                    <span className="ql">Details</span>
                    <span className="qv">{postCapName} Cap · {finialName} Finials</span>
                </div>
                {accList.length > 0 && (
                    <div className="quote-row">
                        <span className="ql">Accessories</span>
                        <span className="qv">{accDisplay}</span>
                    </div>
                )}
            </div>
            <div className="quote-cta">
                <button className="btn-big-quote">Get Instant Quote &rarr;</button>
                <div className="quote-actions">
                    <button className="btn-secondary" onClick={function() { alert('PDF download coming soon'); }}>Download PDF</button>
                    <button className="btn-secondary">Share Design</button>
                </div>
                <div className="quote-contact">
                    or call <strong>(855)-Fence-30</strong><br />
                    sales@grandviewfence.com
                </div>
            </div>
        </div>
    );
};

export default QuoteTab;
