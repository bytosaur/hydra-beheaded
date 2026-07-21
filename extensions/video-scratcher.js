{
    const getHydra = function () {
        const whereami = window.location?.href?.includes("hydra.ojack.xyz")
            ? "editor"
            : window.atom?.packages
            ? "atom"
            : "idk";
        if (whereami === "editor") {
            return window.hydraSynth;
        }
        if (whereami === "atom") {
            return global.atom.packages.loadedPackages["atom-hydra"]
                .mainModule.main.hydra;
        }
        let _h = [
            window.hydraSynth,
            window._hydra,
            window.hydra,
            window.h,
            window.H,
            window.hy
        ].find(h => h?.regl);
        return _h;
    };
    window._hydra = getHydra();
    window._hydraScope = _hydra.sandbox.makeGlobal ? window : _hydra.synth;
}

const hsource = _hydra.s[0].constructor.prototype;

// override the initVideo function to add dynamic loop range support
hsource.initVideo = function (url = '', getStart, getEnd, params) {

    const vid = document.createElement('video');
    vid.crossOrigin = 'anonymous';
    vid.autoplay = true;
    vid.loop = false;           // disable native full-video loop
    vid.muted = true;
    const epsilon = 0.001;

    // Store dynamic getters on the instance so they can be replaced later
    this.getLoopStart = ()=>(getStart);
    this.getLoopEnd = ()=>(getEnd);

    this.play = () => {
      const p = vid.play();
      // avoid uncaught (in promise) if autoplay is blocked
      if (p && typeof p.catch === 'function') p.catch(() => {});
      return p;
    };
    
    this.pause = () => vid.pause();

    this.retrigger = () => {
      vid.currentTime = Math.max(0, getStartVal()) + epsilon;
      return this.play(); 
    };

    this.setRate = (r = 1) => { vid.playbackRate = r; };

    this.setLoopStart = (start) => {
      this.setLoopFns({
        start: () => start,
        end: () => getEndVal()
      });
    }

    this.setLoopRange = (start, end) => {
      if (end === undefined) end = vid.duration;
      this.setLoopFns({
        start: () => start,
        end: () => end
      });
    };

    this.setLoopDelta = (start, delta) => {
      if (delta === undefined) delta = vid.duration - start;
      this.setLoopFns({
        start: () => start,
        end: () => (start+delta)
      });
    };

    const ensureInRange = () => {
      const s = getStartVal();
      const e = getEndVal();
      if (vid.currentTime < s || vid.currentTime >= e) {
        vid.currentTime = s + epsilon;
      }
    };

    this.setLoopFns = ({ start, end } = {}) => {
      if (typeof start === 'function') this.getLoopStart = start;
      if (typeof end === 'function') this.getLoopEnd = end;
      ensureInRange(); // optional: snap if range changed around current time
    };

    const getStartVal = () => {
      try { return Math.max(0, Number(this.getLoopStart ? this.getLoopStart() : 0) || 0); }
      catch { return 0; }
    };

    const getEndVal = () => {
      const dur = isFinite(vid.duration) ? vid.duration : Infinity;
      try {
        const v = Number(this.getLoopEnd ? this.getLoopEnd() : dur);
        return isFinite(v) && v > 0 ? v : dur;
      } catch {
        return dur;
      }
    };

    // replace tick with this version
    const tick = (now, metadata) => {
      const t = (metadata && typeof metadata.mediaTime === 'number') ? metadata.mediaTime : vid.currentTime;
      const end = getEndVal();
      if (t >= end - epsilon) {
      vid.currentTime = getStartVal() + epsilon;
      if (vid.paused || vid.ended) vid.play();
      }
      vid.requestVideoFrameCallback(tick);
    };

    // add this listener (e.g., after other addEventListener calls)
    vid.addEventListener('ended', () => {
      vid.currentTime = getStartVal() + epsilon;
      vid.play();
    });

    vid.addEventListener('loadedmetadata', () => {
      vid.currentTime = getStartVal();
      vid.play().catch(() => {});
      if (vid.requestVideoFrameCallback) {
        vid.requestVideoFrameCallback(tick);
      } else {
        vid.addEventListener('timeupdate', () => {
          if (vid.currentTime >= getEndVal()) {
            vid.currentTime = getStartVal() + epsilon;
            if (vid.paused) vid.play();
          }
        });
      }
    });

    vid.addEventListener('loadeddata', () => {
      this.src = vid;
      this.tex = this.regl.texture({
        data: this.src,
        ...params
      });
      this.dynamic = true;
    });
    vid.src = url;
}
    