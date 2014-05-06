var c = lively.Config;
c.set('lively2livelyAutoStart', false);
c.set('lively2livelyEnableConnectionIndicator', false);
c.set('removeDOMContentBeforeWorldLoad', false);
c.set('manuallyCreateWorld', true);
c.set('changesetsExperiment', false);

// FIXME, for compatibility with requirejs
lively.whenLoaded(function() {
    setTimeout(function() {
	// hmm with fixes from patch not needed anymore...
        Global.require = Global.requirejs.s.contexts._.require;
    }, 300);
});
