// The sim reports a unit spec path with the army's spec tag appended when a mod
// applies per-army spec changes, as Galactic War does:
// /pa/units/commanders/exiles_maxim/exiles_maxim.json.player. The paths listed
// in this mod are untagged, so anything comparing against them, or reading a
// map the sim keyed by spec path, normalises the reported path first. An
// untagged path is returned unchanged.
function exilesSpecPath(path) {
    return _.isString(path) ? path.replace(/\.json\..*$/, ".json") : path;
}
