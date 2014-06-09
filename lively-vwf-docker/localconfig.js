var c = lively.Config;
c.set('lively2livelyAutoStart', true);
c.set('lively2livelyEnableConnectionIndicator', true);
c.set('removeDOMContentBeforeWorldLoad', true);
c.set('manuallyCreateWorld', false);
c.set('changesetsExperiment', false);
c.set('computeCodeEditorCompletionsOnStartup', false);
c.addOption("loadVWF", true);

lively.whenLoaded(function() {

    (function() { lively.Config.get('loadVWF') && loadVWF(); }).delay(3);

    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

    function loadVWF() {
        var vwfBaseURL = URL.root;

        // Global.require = lively.require

        Global.require = undefined;

        var pBar = $world.addProgressBar(null, "loading VWF");

        var loadSteps = [
            // {url: "compatibilitycheck.js"},
            {url: "socket.io.js"},
            {url: "socket.io-sessionid-patch.js"},
            {url: "require.js"},
            {run: function() {
                // Global.require = requirejs.s.contexts._.require;
                Global.require = requirejs
                requirejs.config({
                    baseUrl: String(vwfBaseURL)
                });
            }},
            {url: "async.js"},

            // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
            // google libs
            {url: "closure/base.js"},
            // <script type="text/javascript" src="closure/base.js">
            // </script><script type="text/javascript" src="http://23.92.25.59:3006/KIE7cX6ArICLKVLv/closure/deps.js"></script>

            // <script type="text/javascript">goog.require('goog.vec.Mat4')</script>
            {url: "closure/vec/float32array.js"},
            {url: "closure/vec/float64array.js"},
            {url: "closure/vec/vec.js"},
            {url: "closure/vec/vec3.js"},
            {url: "closure/vec/vec4.js"},
            {url: "closure/vec/mat4.js"},

            // <script type="text/javascript">goog.require('goog.vec.Quaternion')</script>
            {url: "closure/vec/quaternion.js"},

            {url: "crypto.js"},
            {url: "md5.js"},
            {url: "alea.js"},
            {url: "mash.js"},
            {url: "Class.create.js"},
            // {url: "rAF.js"},
            // {url: "performance.now-polyfill.js"},
            {url: "vwf.js"},
            {run: function(next) {
                define("jquery", function() { return lively.$; });
                require(["jquery"], next)
            }}, {
                run: function(next) {
                    var userLibraries = {model:{}, view:{}};
                    var application = window.application = undefined;
                    vwf.loadConfiguration(application, userLibraries, next);

            }}
        ];

        loadSteps.doAndContinue(function(next, step, i) {

            if (pBar) pBar.setValue(loadSteps.length / i);

            if (step.url) {
                var url = String(vwfBaseURL.withFilename(step.url));
                JSLoader.removeAllScriptsThatLinkTo(url);
                JSLoader.loadedURLs.remove(url);
                JSLoader.loadJs(url, function() {
                    alertOK('Done loading ' + url);
                    next();
                });
            } else if (step.run) {
                var takesCallback = step.run.length > 0;
                try {
                    step.run(next);
                    alertOK('Done running %s', String(step.run).truncate(70));
                } catch (e) {
                    show('step.run error:\n%s', e.stack || e);
                }
                !takesCallback && next();
            } else {
                show('Cannot deal with step:\n%o', step);
                next();
            }

        }, function() { pBar && pBar.remove(); });

    }

});
