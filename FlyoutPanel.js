import React from 'react';
import { FENCE_STYLES, COLORS, ARCH_STYLES } from './configData';
import StyleTab from './tabs/StyleTab';
import ColorTab from './tabs/ColorTab';
import SizeTab from './tabs/SizeTab';
import OptionsTab from './tabs/OptionsTab';
import PuppyPicketsTab from './tabs/PuppyPicketsTab';
import DetailsTab from './tabs/DetailsTab';
import QuoteTab from './tabs/QuoteTab';

var STYLE_URLS = {
    uaf_200: 'https://grandviewfence.com/fencing/horizon',
    uaf_201: 'https://grandviewfence.com/fencing/horizon-pro',
    uaf_250: 'https://grandviewfence.com/fencing/vanguard',
    uab_200: 'https://grandviewfence.com/fencing/haven',
    uas_100: 'https://grandviewfence.com/fencing/charleston',
    uas_101: 'https://grandviewfence.com/fencing/charleston-pro',
    uas_150: 'https://grandviewfence.com/fencing/savannah',
};

function getHeader(activeTab, config) {
    var style = FENCE_STYLES.find(function(s) { return s.id === config.styleId; }) || FENCE_STYLES[0];
    var colorName = config.color ? config.color.displayName : 'Black';
    var archObj = ARCH_STYLES.find(function(a) { return a.id === config.arch; });
    var archName = archObj ? archObj.name : 'Estate';
    var leafLabel = config.leaf === '1' ? 'Single Gate' : 'Double Gate';

    switch (activeTab) {
        case 'style':
            return {
                title: 'Choose Your Gate Style',
                selected: style.name,
                selectedSpan: style.subtitle,
                showProductLink: true,
                linkLabel: 'View ' + style.name + ' Page',
                linkUrl: STYLE_URLS[style.id] || 'https://grandviewfence.com/fencing',
            };
        case 'color':
            return {
                title: 'ProCoat Powder Coat Finish',
                selected: colorName,
                selectedSpan: 'Premium Finish',
                showProductLink: true,
                linkLabel: 'All Finishes',
                linkUrl: 'https://grandviewfence.com/accessories',
            };
        case 'size':
            return {
                title: 'Gate Dimensions',
                selected: config.height + '" Height',
                selectedSpan: leafLabel,
            };
        case 'options':
            return {
                title: 'Gate Options',
                selected: 'Customize',
                selectedSpan: 'Arch, Rails & More',
            };
        case 'puppyPickets':
            return {
                title: 'Puppy Picket Styles',
                selected: 'Keep Pets Safe',
                selectedSpan: '10 Styles Available',
                showProductLink: true,
                linkLabel: 'Pet-Safe Fencing',
                linkUrl: 'https://grandviewfence.com/pet-aluminum-fence',
            };
        case 'details':
            return {
                title: 'Fine Details',
                selected: 'Post Caps, Finials &',
                selectedSpan: 'Accents',
            };
        case 'quote':
            return {
                title: 'Your Configuration',
                selected: 'Ready to Order?',
                selectedSpan: 'Get your instant quote',
            };
        default:
            return {
                title: 'Choose Your Gate Style',
                selected: style.name,
                selectedSpan: style.subtitle,
            };
    }
}

function renderTabContent(activeTab, config, onConfigChange) {
    switch (activeTab) {
        case 'style':
            return <StyleTab config={config} onConfigChange={onConfigChange} />;
        case 'color':
            return <ColorTab config={config} onConfigChange={onConfigChange} />;
        case 'size':
            return <SizeTab config={config} onConfigChange={onConfigChange} />;
        case 'options':
            return <OptionsTab config={config} onConfigChange={onConfigChange} />;
        case 'puppyPickets':
            return <PuppyPicketsTab config={config} onConfigChange={onConfigChange} />;
        case 'details':
            return <DetailsTab config={config} onConfigChange={onConfigChange} />;
        case 'quote':
            return <QuoteTab config={config} onConfigChange={onConfigChange} />;
        default:
            return <StyleTab config={config} onConfigChange={onConfigChange} />;
    }
}

var FlyoutPanel = function(props) {
    var activeTab = props.activeTab;
    var config = props.config;
    var onConfigChange = props.onConfigChange;
    var header = getHeader(activeTab, config);

    return (
        <div className="flyout">
            <div className="flyout-header">
                <div>
                    <div className="flyout-title">{header.title}</div>
                    <div className="flyout-selected">
                        {header.selected}
                        {header.selectedSpan && (
                            <span> — <span>{header.selectedSpan}</span></span>
                        )}
                    </div>
                </div>
                {header.showProductLink && header.linkUrl && (
                    <a
                        href={header.linkUrl}
                        className="btn-product"
                        target="_blank"
                        rel="noopener"
                    >
                        {header.linkLabel} &rarr;
                    </a>
                )}
            </div>
            <div className="flyout-body">
                <div className="flyout-content" key={activeTab}>
                    {renderTabContent(activeTab, config, onConfigChange)}
                </div>
            </div>
        </div>
    );
};

export default FlyoutPanel;
