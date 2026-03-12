import React, { useEffect, useRef } from 'react';

// ============================================================
// ABSOLUTE GROUND TRUTH — Matrix4 world transforms extracted
// from the running 2017 Ultra configurator's Three.js memory.
// 60-inch double gate. Column-major float[16] arrays.
// NO algorithmic calculations. Snap-to-Matrix only.
// ============================================================

function snap(mesh, m) {
    mesh.matrixAutoUpdate = false;
    mesh.matrix.fromArray(m);
}

var BG_ASPECT = 1960 / 1096;

function fitContainBox(cw, ch) {
    var w, h;
    if (cw / ch > BG_ASPECT) {
        h = ch; w = Math.round(ch * BG_ASPECT);
    } else {
        w = cw; h = Math.round(cw / BG_ASPECT);
    }
    return { w: w, h: h, left: Math.round((cw - w) / 2), top: ch - h };
}

// ---- GROUND TRUTH MATRICES (from matrixWorld.elements) ----

var M_HINGE = [
    [2.220446049250313e-16,0,1,0, 0,1,0,0, -1,0,2.220446049250313e-16,0, -1.778,1.374,0,1],
    [2.220446049250313e-16,0,-1,0, 0,1,0,0, 1,0,2.220446049250313e-16,0, 1.778,1.374,0,1],
    [2.220446049250313e-16,0,1,0, 0,1,0,0, -1,0,2.220446049250313e-16,0, -1.778,0.225,0,1],
    [2.220446049250313e-16,0,-1,0, 0,1,0,0, 1,0,2.220446049250313e-16,0, 1.778,0.225,0,1],
];

var M_IDENTITY = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];

var M_CAPS = [
    [1.545,0,0,0, 0,1.545,0,0, 0,0,1.545,0, -1.829,1.5725000000000002,0,1],
    [1.545,0,0,0, 0,1.545,0,0, 0,0,1.545,0, 1.829,1.5725000000000002,0,1],
    [1,0,0,0, 0,1,0,0, 0,0,1,0, -1.645,1.5725000000000002,0,1],
    [1,0,0,0, 0,1,0,0, 0,0,1,0, 1.645,1.5725000000000002,0,1],
    [1,0,0,0, 0,1,0,0, 0,0,1,0, -0.044,1.8773,0,1],
    [1,0,0,0, 0,1,0,0, 0,0,1,0, 0.044,1.8773,0,1],
];

var M_RAIL_T0 = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,1.489,0,1];
var M_RAIL_T1 = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,1.2985,0,1];
var M_RAIL_B0 = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0.727,0,1];
var M_RAIL_B1 = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0.34550000000000003,0,1];
var M_RAIL_B2 = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0.155,0,1];

var M_PICKET_TOP = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,-0.30519999999999997,0,1];

// ---- CLIPPING CONSTANTS (from extracted clippingPlanes) ----
// Post:          normal (0,-1,0), constant 1.5875  → clips above y=1.5875
// Picket tops:   normal (0, 1,0), constant -0.735  → shows only above y=0.735
// Picket bottoms: normal (0,-1,0), constant 0.735  → shows only below y=0.735
// Top & bottom pickets MEET at y=0.735

var CLIP_POST = 1.5875;
var CLIP_PT   = -0.735;
var CLIP_PB   = 0.735;


var UnifiedCanvas = function(props) {
    var config = props.config;
    var outerRef = useRef(null);
    var wrapperRef = useRef(null);
    var mountRef = useRef(null);
    var sceneRef = useRef(null);
    var cameraRef = useRef(null);
    var rendererRef = useRef(null);
    var gateRef = useRef(null);
    var clipsRef = useRef(null);

    // ============================================================
    // SCENE INIT — runs once
    // ============================================================
    useEffect(function() {
        var THREE = window.THREE;
        if (!THREE) return;

        var outer = outerRef.current;
        var wrapper = wrapperRef.current;
        var mount = mountRef.current;

        var box = fitContainBox(outer.clientWidth, outer.clientHeight);
        wrapper.style.width = box.w + 'px';
        wrapper.style.height = box.h + 'px';
        wrapper.style.left = box.left + 'px';
        wrapper.style.top = box.top + 'px';

        var scene = new THREE.Scene();
        sceneRef.current = scene;

        // Camera — exact legacy values (verified against extracted matrixWorld)
        var camera = new THREE.PerspectiveCamera(40, box.w / box.h, 0.1, 100);
        camera.zoom = 1.788;
        camera.position.set(0.82, 1.27, 7.2);
        camera.rotation.order = 'YXZ';
        camera.rotation.set(0, (6 * Math.PI) / 180, 0);
        camera.updateProjectionMatrix();
        cameraRef.current = camera;

        var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(box.w, box.h);
        renderer.setClearColor(0x000000, 0);
        renderer.domElement.style.display = 'block';
        renderer.localClippingEnabled = true;
        rendererRef.current = renderer;
        mount.appendChild(renderer.domElement);

        // Lighting
        scene.add(new THREE.AmbientLight(0xffffff, 0.6));
        var dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(0, 3, 5);
        scene.add(dirLight);

        // Clipping planes (persistent across config changes)
        clipsRef.current = {
            post: new THREE.Plane(new THREE.Vector3(0, -1, 0), CLIP_POST),
            pt:   new THREE.Plane(new THREE.Vector3(0,  1, 0), CLIP_PT),
            pb:   new THREE.Plane(new THREE.Vector3(0, -1, 0), CLIP_PB),
        };

        // Single group for all gate meshes
        var gate = new THREE.Object3D();
        scene.add(gate);
        gateRef.current = gate;

        (function animate() {
            requestAnimationFrame(animate);
            renderer.render(scene, camera);
        })();

        var handleResize = function() {
            var b = fitContainBox(outer.clientWidth, outer.clientHeight);
            wrapper.style.width = b.w + 'px';
            wrapper.style.height = b.h + 'px';
            wrapper.style.left = b.left + 'px';
            wrapper.style.top = b.top + 'px';
            camera.aspect = b.w / b.h;
            camera.zoom = 1.788;
            camera.updateProjectionMatrix();
            renderer.setSize(b.w, b.h);
        };
        window.addEventListener('resize', handleResize);

        return function() {
            window.removeEventListener('resize', handleResize);
            if (mount && renderer.domElement) mount.removeChild(renderer.domElement);
        };
    }, []);

    // ============================================================
    // GATE ASSEMBLY — Snap-to-Matrix architecture
    // Every mesh: matrixAutoUpdate=false, matrix.fromArray(elements)
    // Zero .setY(), zero .setX(), zero math.
    // ============================================================
    useEffect(function() {
        var THREE = window.THREE;
        var gate = gateRef.current;
        var clips = clipsRef.current;
        if (!THREE || !gate || !clips) return;

        // Clear
        while (gate.children.length > 0) gate.remove(gate.children[0]);
        if (!config) return;

        var color = config.color || { threeHex: 0x080808 };

        var makeMat = function() {
            return new THREE.MeshStandardMaterial({
                color: color.threeHex,
                roughness: 0.2,
                metalness: 0.7,
                shading: THREE.FlatShading,
                side: THREE.DoubleSide,
            });
        };

        var makeClipMat = function(plane) {
            return new THREE.MeshStandardMaterial({
                color: color.threeHex,
                roughness: 0.2,
                metalness: 0.7,
                shading: THREE.FlatShading,
                side: THREE.DoubleSide,
                clippingPlanes: [plane],
            });
        };

        var loader = new THREE.JSONLoader();
        var base = 'gate_tool/m/';
        var leafNum = config.leaf || '2';
        var archId = config.arch || 'e';

        // ===========================================================
        // HINGES — 4 instances, exact rotation+position matrices
        // ===========================================================
        loader.load(base + '3/hng.json', function(geo) {
            M_HINGE.forEach(function(m) {
                var mesh = new THREE.Mesh(geo, makeMat());
                snap(mesh, m);
                gate.add(mesh);
            });
        });

        // ===========================================================
        // POST — identity matrix, clipped at y=1.5875
        // Confirmed loading (red skyscraper test passed).
        // ===========================================================
        var postId = config.post || 'po14';
        loader.load(base + '0/' + postId + '.json', function(geo) {
            var mesh = new THREE.Mesh(geo, makeClipMat(clips.post));
            snap(mesh, M_IDENTITY);
            gate.add(mesh);
        });

        // ===========================================================
        // POST CAPS — 6 instances at exact position+scale matrices
        // ===========================================================
        if (config.postCap) {
            loader.load(base + '3/' + config.postCap + '.json', function(geo) {
                M_CAPS.forEach(function(m) {
                    var mesh = new THREE.Mesh(geo, makeMat());
                    snap(mesh, m);
                    gate.add(mesh);
                });
            });
        }

        // ===========================================================
        // TOP RAILS — 2 instances from rt model
        // ===========================================================
        var rtId = 'rt' + leafNum + archId;
        loader.load(base + '1/' + rtId + '.json', function(geo) {
            [M_RAIL_T0, M_RAIL_T1].forEach(function(m) {
                var mesh = new THREE.Mesh(geo, makeMat());
                snap(mesh, m);
                gate.add(mesh);
            });
        });

        // ===========================================================
        // BOTTOM RAILS — 3 instances from rb model
        // ===========================================================
        var rbId = 'rb' + leafNum;
        loader.load(base + '1/' + rbId + '.json', function(geo) {
            [M_RAIL_B0, M_RAIL_B1, M_RAIL_B2].forEach(function(m) {
                var mesh = new THREE.Mesh(geo, makeMat());
                snap(mesh, m);
                gate.add(mesh);
            });
        });

        // ===========================================================
        // PICKETS — ONLY 'e' (even) variant. No 'o', no 'x'.
        // Clip tops: normal (0,1,0) constant -0.735 → above y=0.735
        // Clip bottoms: normal (0,-1,0) constant 0.735 → below y=0.735
        // ===========================================================
        var ptE = 'pt' + leafNum + archId + 'e';
        var pbE = 'pb' + leafNum + 'e';

        loader.load(base + '2/' + ptE + '.json', function(geo) {
            var mesh = new THREE.Mesh(geo, makeClipMat(clips.pt));
            snap(mesh, M_PICKET_TOP);
            gate.add(mesh);
        });
        loader.load(base + '2/' + pbE + '.json', function(geo) {
            var mesh = new THREE.Mesh(geo, makeClipMat(clips.pb));
            snap(mesh, M_IDENTITY);
            gate.add(mesh);
        });

        // ===========================================================
        // STILE DIAGNOSTIC — 'x' variant in RED to test visibility
        // These should be the thick frame bars at x: ±0.044, ±1.645
        // If red bars appear → these are the inner stiles
        // ===========================================================
        var ptX = 'pt' + leafNum + archId + 'x';
        var pbX = 'pb' + leafNum + 'x';
        var redMat = function(plane) {
            return new THREE.MeshStandardMaterial({
                color: 0xff0000,
                roughness: 0.3,
                metalness: 0.5,
                shading: THREE.FlatShading,
                side: THREE.DoubleSide,
                clippingPlanes: [plane],
            });
        };

        loader.load(base + '2/' + ptX + '.json', function(geo) {
            var mesh = new THREE.Mesh(geo, redMat(clips.pt));
            snap(mesh, M_PICKET_TOP);
            gate.add(mesh);
        });
        loader.load(base + '2/' + pbX + '.json', function(geo) {
            var mesh = new THREE.Mesh(geo, redMat(clips.pb));
            snap(mesh, M_IDENTITY);
            gate.add(mesh);
        });

        // ===========================================================
        // UPPER FILLER RAIL (optional accessory)
        // ===========================================================
        if (config.accessories && config.accessories.ufr) {
            loader.load(base + '3/ufr' + leafNum + '.json', function(geo) {
                var mesh = new THREE.Mesh(geo, makeMat());
                snap(mesh, M_IDENTITY);
                gate.add(mesh);
            });
        }

        // ===========================================================
        // FINIALS (optional)
        // ===========================================================
        if (config.finial) {
            loader.load(base + '3/' + config.finial + '.json', function(geo) {
                var mesh = new THREE.Mesh(geo, makeMat());
                snap(mesh, [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,1.584,0,1]);
                gate.add(mesh);
            });
        }

        // ===========================================================
        // ACCESSORIES (scrolls, butterflies)
        // ===========================================================
        if (config.accessories) {
            if (config.accessories.tcr || config.accessories.scr || config.accessories.bcr) {
                loader.load(base + '3/acs.json', function(geo) {
                    var mesh = new THREE.Mesh(geo, makeMat());
                    var y = config.accessories.tcr ? 1.397 : (config.accessories.bcr ? 0.19 : 0);
                    snap(mesh, [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,y,0,1]);
                    gate.add(mesh);
                });
            }
            if (config.accessories.tbu || config.accessories.bbu) {
                loader.load(base + '3/acb.json', function(geo) {
                    var mesh = new THREE.Mesh(geo, makeMat());
                    var y = config.accessories.tbu ? 1.397 : 0.19;
                    snap(mesh, [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,y,0,1]);
                    gate.add(mesh);
                });
            }
        }

    }, [config]);

    // ================================================================
    // LAYOUT
    // ================================================================
    return (
        <div ref={outerRef} style={{
            width: '100%', height: '100%',
            position: 'relative', backgroundColor: '#0b1220',
        }}>
            <div ref={wrapperRef} style={{ position: 'absolute' }}>
                <img
                    src="assets/backgrounds/tool-background-gate_1960x1096.png"
                    alt=""
                    style={{ width: '100%', height: '100%', display: 'block' }}
                />
                <div ref={mountRef} style={{
                    width: '100%', height: '100%',
                    position: 'absolute', top: 0, left: 0,
                }} />
            </div>
        </div>
    );
};

export default UnifiedCanvas;
