# Gate Renderer Bug Fix Session

## MANDATORY PRE-FLIGHT — READ BEFORE TOUCHING ANY CODE

You are fixing exactly 3 bugs in `GateRenderer.js`. Before writing a single line of code you must:

1. Read `SPATIAL_TRUTH.json` in full — this is the verified source of truth extracted from `gate_tool/js/ultra_dsg_min.js`
2. Read `GateRenderer.js` in full
3. Read `spatialConstants.js` in full
4. For each bug, find the relevant value in `SPATIAL_TRUTH.json`, confirm it matches `ultra_dsg_min.js`, then and only then propose the change

**NEVER** make a change based on visual intuition or "seems right" reasoning. Every number must trace back to `SPATIAL_TRUTH.json` which traces back to `ultra_dsg_min.js`.

**ONE BUG = ONE COMMIT.** Do not batch changes. Fix one bug, verify it, commit it, then move to the next.

---

## WORKING REPO

```
C:\Users\sarah\Desktop\App Repos\Testing-VS code\designstudio\designstudio\designstudioworkingmvp
```

Also on GitHub at: https://github.com/swiftcodekeys/march

Do NOT work in any other directory. Do NOT clone the GitHub repo — work in the local directory above.

---

## THE THREE BUGS TO FIX

### BUG-1: Charleston / Charleston Pro — No center gap between gate leaves

**What you see:** Two gate leaves with no visible gap at the center seam. Looks like one solid gate.

**What should happen:** A visible gap between the two leaves at the center, matching Ultra's live tool.

**Root cause (verified from SPATIAL_TRUTH.json → po23_center_stile):**
The current `GateRenderer.js` has code that vertex-shifts the `po23` geometry to CREATE a gap. This is wrong. The `po23.json` model file for double leaf already has the gap baked into the geometry. The vertex manipulation code is actually breaking it by distorting the model.

**The fix:**
In `buildGate()`, find the `po23` loader block. It currently does something like this:
```javascript
loader.load(getModelPath('po23', config), function(geo) {
    var geoToUse = geo;
    if (isDoubleLeaf && CENTER_GAP > 0) {
        geoToUse = geo.clone();
        for (var i = 0; i < geoToUse.vertices.length; i++) {
            var v = geoToUse.vertices[i];
            if (v.x < 0) v.x -= CENTER_GAP;
            else if (v.x > 0) v.x += CENTER_GAP;
        }
        geoToUse.verticesNeedUpdate = true;
    }
    ...
```

Remove the entire `if (isDoubleLeaf && CENTER_GAP > 0)` block. Load the geometry as-is:
```javascript
loader.load(getModelPath('po23', config), function(geo) {
    var mesh = new THREE.Mesh(geo, makeClipMat(clips.post23));
    snap(mesh, M_IDENTITY);
    gate.add(mesh);
});
```

**Verify before committing:** Load Charleston double leaf, Estate arch in the browser. The center seam should show a gap matching https://www.ultrafence.com/design-studio/gates/index.html

---

### BUG-2: Horizon inner post caps slightly off center

**What you see:** The two center seam post caps (sitting above the center gap) appear slightly off-center.

**Root cause (verified from SPATIAL_TRUTH.json → post_cap_positions):**
Center seam caps pc4 and pc5 should be at exactly `x = ±0.044`. The current code may be applying `CENTER_GAP` to push them further apart, or the arch-aware Y adjustment may be applying the wrong value.

**The fix:**
In the `M_CAPS` loop in `buildGate()`, find the block handling `idx >= 4`. Confirm:
- The X position is set directly from the Matrix4 `m` array — it should be `±0.044` from `spatialConstants.js` `M_CAPS`
- `CENTER_GAP` must NOT be added to pc4/pc5 X positions
- The arch-aware Y from `CAP_INNER_Y[archId]` IS correct and should stay

Cross-check `M_CAPS[4]` and `M_CAPS[5]` in `spatialConstants.js` — the X values (column 12 of the 4x4 matrix, index [12]) must be `-0.044` and `+0.044` respectively. If they are not, correct them to match `SPATIAL_TRUTH.json → post_cap_positions → double_leaf_xD → pc4/pc5`.

**Verify before committing:** Horizon double leaf, any arch — center seam caps should sit directly over the gate seam, symmetric.

---

### BUG-3: Pro spacing appears between top two rails (should only appear below second rail)

**What you see:** On Horizon Pro (UAF-201) or Charleston Pro (UAS-101), the tight 1.5" picket spacing appears in the upper section of the gate between the two top rails. It should only appear in the lower section.

**Root cause (verified from SPATIAL_TRUTH.json → picket_y_positions):**
Ultra places `grptx` (the extra/pro spacing pickets) at different Y positions depending on style. For UAF-201 (gN==3) without accents: `tY + _12 + fsv - _7_5`. For UAS-101 (gN==8) without accents: `tY + _12 + fsv`. 

In `GateRenderer.js`, `ptRes` is the equivalent of `grptx`. Its `snap()` call uses `lt.picketTop` which is the SAME transform as the regular pickets. That's wrong — the pro spacing pickets need their own Y offset that places them lower.

**The fix:**
The `ptRes` (pro extra pickets top) should NOT use `lt.picketTop`. They need a Y-adjusted transform. Look up the correct Y in `SPATIAL_TRUTH.json → picket_y_positions → grptx_y_by_style`.

For UAF-201, no tcr: Y = `tY + 0.3048 + fsv - 0.1905`
For UAS-101, no accent: Y = `tY + 0.3048 + fsv`

Add a `ptResTransform` variable that resolves the correct Y per style, similar to how `ptOddTransform` handles Vanguard stagger. Apply it in the `ptRes` snap call.

**Verify before committing:** Horizon Pro double leaf — tight spacing should only appear in the lower zone. Charleston Pro double leaf — same. Compare against Ultra live tool for both styles.

---

## COMMIT FORMAT

After each bug fix:
```
git add GateRenderer.js spatialConstants.js  (only files you actually changed)
git commit -m "fix(BUG-1): remove incorrect CENTER_GAP vertex shift from po23 — gap is baked into model geometry"
git commit -m "fix(BUG-2): correct center seam post cap X to ±0.044, remove CENTER_GAP from pc4/pc5"  
git commit -m "fix(BUG-3): fix pro spacing ptRes Y position to match Ultra grptx placement per style"
git push
```

---

## WHAT NOT TO DO

- Do NOT change camera parameters
- Do NOT change clipping plane normals or constants unless a specific bug requires it and SPATIAL_TRUTH.json confirms the correct value
- Do NOT modify `gate_tool/js/ultra_dsg_min.js` or `gate_tool/js/ultra_dsg_minbak.js`
- Do NOT make "while I'm in here" improvements to unrelated code
- Do NOT change anything in the React components (app.js, Sidebar.js, UnifiedCanvas.js, etc.)
- If you find yourself thinking "I'll just also fix..." — stop. One bug, one commit.

---

## IF SOMETHING LOOKS WRONG

Before changing anything, run this check:
1. What does `SPATIAL_TRUTH.json` say the value should be?
2. What does `ultra_dsg_min.js` actually have?
3. What does the current `GateRenderer.js` have?
4. What does the Ultra live tool show?

If steps 1-3 don't all agree, stop and report the discrepancy. Do not guess.