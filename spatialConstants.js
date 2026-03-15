// ============================================================
// spatialConstants.js — Spatial math, transforms, and clipping
// Extracted from UnifiedCanvas.js (Split 2)
//
// ABSOLUTE GROUND TRUTH — Matrix4 world transforms extracted
// from the running 2017 Ultra configurator's Three.js memory.
// 60-inch double gate. Column-major float[16] arrays.
// NO algorithmic calculations. Snap-to-Matrix only.
// ============================================================

export function snap(mesh, m) {
    mesh.matrixAutoUpdate = false;
    mesh.matrix.fromArray(m);
}

export var BG_ASPECT = 1960 / 1096;

export function fitContainBox(cw, ch) {
    var w, h;
    if (cw / ch > BG_ASPECT) {
        h = ch; w = Math.round(ch * BG_ASPECT);
    } else {
        w = cw; h = Math.round(cw / BG_ASPECT);
    }
    return { w: w, h: h, left: Math.round((cw - w) / 2), top: ch - h };
}

// ---- GROUND TRUTH MATRICES (from matrixWorld.elements) ----

export var M_HINGE = [
    [2.220446049250313e-16,0,1,0, 0,1,0,0, -1,0,2.220446049250313e-16,0, -1.778,1.374,0,1],
    [2.220446049250313e-16,0,-1,0, 0,1,0,0, 1,0,2.220446049250313e-16,0, 1.778,1.374,0,1],
    [2.220446049250313e-16,0,1,0, 0,1,0,0, -1,0,2.220446049250313e-16,0, -1.778,0.225,0,1],
    [2.220446049250313e-16,0,-1,0, 0,1,0,0, 1,0,2.220446049250313e-16,0, 1.778,0.225,0,1],
];

export var M_IDENTITY = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];

export var M_CAPS = [
    [1.545,0,0,0, 0,1.545,0,0, 0,0,1.545,0, -1.829,1.5725000000000002,0,1],
    [1.545,0,0,0, 0,1.545,0,0, 0,0,1.545,0, 1.829,1.5725000000000002,0,1],
    [1,0,0,0, 0,1,0,0, 0,0,1,0, -1.645,1.5725000000000002,0,1],
    [1,0,0,0, 0,1,0,0, 0,0,1,0, 1.645,1.5725000000000002,0,1],
    [1,0,0,0, 0,1,0,0, 0,0,1,0, -0.044,1.5725,0,1],
    [1,0,0,0, 0,1,0,0, 0,0,1,0, 0.044,1.5725,0,1],
];

// ---- PER-LEAF TRANSFORMS (from live Ultra scene extraction) ----
// Leaf=2 (flat family: Horizon, Vanguard, Haven) — original constants
// Leaf=1 (spear family: Charleston, Savannah) — different rail/picket Y positions
export var LEAF_TRANSFORMS = {
    '2': {
        railT0:    [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,1.489,0,1],
        railT1:    [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,1.2985,0,1],
        railB0:    [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0.727,0,1],     // mid rail
        railB1:    [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0.3455,0,1],    // extra rail
        railB2:    [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0.155,0,1],     // bottom rail
        picketTop: [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,-0.3052,0,1],   // even/res
        picketTopOddStagger: [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,-0.5102,0,1], // Vanguard odd
    },
    '1': {
        railT0:    [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,1.337,0,1],
        railT1:    [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,1.1465,0,1],
        railB0:    [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0.651,0,1],     // mid rail
        railB1:    [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0.3455,0,1],    // extra rail (same)
        railB2:    [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0.155,0,1],     // bottom rail (same)
        picketTop: [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,-0.4572,0,1],   // all pickets
        picketTopOddStagger: null, // leaf=1 has no stagger
    },
};

// Legacy aliases — kept for any code that still references them directly
export var M_RAIL_T0 = LEAF_TRANSFORMS['2'].railT0;
export var M_RAIL_T1 = LEAF_TRANSFORMS['2'].railT1;
export var M_RAIL_B0 = LEAF_TRANSFORMS['2'].railB0;
export var M_RAIL_B1 = LEAF_TRANSFORMS['2'].railB1;
export var M_RAIL_B2 = LEAF_TRANSFORMS['2'].railB2;
export var M_PICKET_TOP = LEAF_TRANSFORMS['2'].picketTop;

// Center gap: Phase 3 extraction (center_gap_baseline_60in.json,
// center_gap_baseline_72in.json) proves Ultra's edge-to-edge gap is 0.018.
// The widening logic applies to both sides, so per-side offset = 0.009.
export var CENTER_GAP = 0.009;

// Per-arch inner cap Y positions (M_CAPS indices 4,5 only).
// Extracted from Phase 3 scene dumps:
//   spatial_baseline_uaf200.json        → Standard  y=1.5725
//   arch_positions_arched.json          → Arched    y=1.8775
//   arch_positions_estate.json          → Estate    y=1.8775
//   arch_positions_reverse_arched.json  → Royal     y=1.2675
export var CAP_INNER_Y = {
    s: 1.5725,
    a: 1.8775,
    e: 1.8775,
    r: 1.2675,
};

// ---- CLIPPING CONSTANTS (from extracted clippingPlanes) ----
// Derived from legacy formula: htY + _2_5 where _2_5 = 0.0635
// For 60" height: htY = 1.524, so post clip = 1.5875
//
// Post clip (po40d, po14): ALWAYS 1.5875 regardless of arch style
// Inner stile clip (po23): varies by arch style
//   Estate/Arched: htY + _12 + _2_5 = 1.524 + 0.3048 + 0.0635 = 1.8923
//   Standard:      htY + _2_5       = 1.524 + 0.0635            = 1.5875
//   Royal:         htY - _12 + _2_5 = 1.524 - 0.3048 + 0.0635  = 1.2827
//
// Picket split plane at y=0.735: top half above, bottom half below

export var CLIP_POST = 1.5875;       // Main posts — all arch styles
export var CLIP_PT   = -0.735;       // Picket tops: shows above y=0.735
export var CLIP_PB   = 0.735;        // Picket bottoms: shows below y=0.735

// Inner stile (po23) clip per arch style
export var CLIP_PO23 = {
    e: 1.8923,   // Estate
    a: 1.8923,   // Arched
    s: 1.5875,   // Standard (same as main posts)
    r: 1.2827,   // Royal
};

// ---- PUPPY PANEL (from puppy_positions_standard.json, puppy_truth_manifest.json) ----
// Puppy Standard: repositions a rail to Y=0.4598, tightens res picket bottom clip
// Puppy Classic Plugged: same + adds 28 finial meshes + even tighter clip
export var M_RAIL_PUPPY = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0.4598,0,1];
export var CLIP_PB_PUPPY_STD = 0.6598;   // Puppy Standard res picket bottom clip
export var CLIP_PB_PUPPY_CLP = 0.477;    // Puppy Classic Plugged res picket bottom clip

// ---- PER-PICKET ACCENT POSITIONS (from accent_positions_circle.json, accent_positions_butterfly.json) ----
// Circle: 14 per side at 0.111 spacing starting at 0.122, Y=1.397
// Butterfly/Scroll: 13 per side at 0.111 spacing starting at 0.177, Y=1.363
// Both verified consistent across all positions in extraction data

export var ACCENT_CIRCLE_Y = 1.397;
export var ACCENT_BUTTERFLY_Y = 1.363;
export var ACCENT_CIRCLE_BOTTOM_Y = 0.19;
export var ACCENT_BUTTERFLY_BOTTOM_Y = 0.2185;

// Circle accent X positions (14 per side = 28 total)
export var ACCENT_CIRCLE_X = (function() {
    var pos = [];
    for (var i = 0; i < 14; i++) {
        var x = +(0.122 + i * 0.111).toFixed(3);
        pos.push(-x, x);
    }
    return pos;
})();

// Butterfly/Scroll accent X positions (13 per side = 26 total)
export var ACCENT_BUTTERFLY_X = (function() {
    var pos = [];
    for (var i = 0; i < 13; i++) {
        var x = +(0.177 + i * 0.111).toFixed(3);
        pos.push(-x, x);
    }
    return pos;
})();

// ---- PER-PICKET FINIAL POSITIONS (from live Ultra scene extraction) ----
// Finial X positions differ by leaf type:
//   Leaf=1 (spear family): 13 per side at 0.111 spacing from 0.177 (every picket)
//   Leaf=2 w/ spears (Vanguard): 7 per side at 0.222 spacing from 0.177 (every other picket)

// Leaf=1 finial X: same positions as butterfly accents (13/side = 26 total)
export var FINIAL_X_LEAF1 = (function() {
    var pos = [];
    for (var i = 0; i < 13; i++) {
        var x = +(0.177 + i * 0.111).toFixed(3);
        pos.push(x);  // positive only; renderer mirrors to ±
    }
    return pos;
})();

// Leaf=2 finial X: every other picket (7/side = 14 total)
export var FINIAL_X_LEAF2 = (function() {
    var pos = [];
    for (var i = 0; i < 7; i++) {
        var x = +(0.177 + i * 0.222).toFixed(3);
        pos.push(x);
    }
    return pos;
})();

// Finial base Y (Standard arch = flat, no curve)
export var FINIAL_BASE_Y = {
    '1': 1.412,   // leaf=1 (Charleston, Savannah)
    '2': 1.359,   // leaf=2 (Vanguard)
};

// Per-arch finial Y offsets at each of the 13 X positions (from 0.177 to 1.511).
// Extracted from live Ultra Charleston (UAS-100) on each arch style.
// Standard = flat baseline (no offsets). Estate/Arched/Royal follow arch curves.
// For leaf=2 styles (Vanguard), use every other offset (indices 0,2,4,...,12).
export var FINIAL_ARCH_OFFSETS = {
    s: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    e: [0.298, 0.286, 0.270, 0.248, 0.220, 0.185, 0.146, 0.107, 0.073, 0.047, 0.026, 0.012, 0.004],
    a: [0.301, 0.297, 0.290, 0.280, 0.268, 0.253, 0.235, 0.214, 0.189, 0.160, 0.127, 0.089, 0.045],
    r: [-0.296, -0.292, -0.285, -0.275, -0.263, -0.248, -0.230, -0.209, -0.184, -0.155, -0.122, -0.084, -0.040],
};
