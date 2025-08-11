/* BOOMBOXSWAP - Feature Flags (Lot 0) */
(function () {
  const Flags = { swap_v2_enabled: true };

  if (!window.BoomboxFeatureFlags) {
    window.BoomboxFeatureFlags = {
      isEnabled(name) {
        try { return !!Flags[name]; } catch (_) { return false; }
      },
      get(name, defVal) {
        try { return (name in Flags) ? Flags[name] : defVal; } catch (_) { return defVal; }
      },
      _all() { return Object.assign({}, Flags); }
    };
  }
})();


