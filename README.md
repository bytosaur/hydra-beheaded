# Hydra beheaded
_"WILL YOU FORGET THE HEAD-SLICING THING?!"_ - Hercules (1997, animated movie)


## Head 1: video playhead

Overrides `initVideo()` function to control the video source's playhead.

### Added functions

- `play()`: Starts spinning playhead.
- `pause()`: Pauses playback.
- `retrigger()`: Jumps to loop start (`start + 0.001`) and plays.
- `setRate(r = 1)`: Sets playhead speed from 0 to 16.
- `setLoopStart(start)`: Sets playhead's position in seconds.
- `setLoopRange(start, end)`: Replaces loop bounds with start and end in seconds.
- `setLoopDelta(start, delta)`: Replaces loop bounds with start and (start + delta) in seconds.
- `mute()`: mutes the video
- `unmute()`: unmutes the video

