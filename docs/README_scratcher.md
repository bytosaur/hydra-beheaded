# hydra video scratcher

Overrides `initVideo()` function of [hydra-synth](https://github.com/hydra-synth/hydra-synth) to control the video source's playhead.

### Added functions

- `play()`: Starts playback.
- `pause()`: Pauses playback.
- `retrigger()`: Jumps to loop start (`start + 0.001`) and plays.
- `setRate(r = 1)`: Sets playback speed from 0 to 16.
- `setLoopRange(start, end)`: Replaces loop bounds with start and end in seconds.
