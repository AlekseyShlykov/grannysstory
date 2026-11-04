#!/usr/bin/env bash
set -euo pipefail

project_root="$(cd "$(dirname "$0")/../.." && pwd)"
audio_root="$project_root/public/assets/music"
output_root="$(mktemp -d)"
trap 'rm -rf "$output_root"' EXIT
ffmpeg_bin="${GRANNY_FFMPEG_BIN:-ffmpeg}"
ffprobe_bin="${GRANNY_FFPROBE_BIN:-ffprobe}"

inputs=(
  chair.wav countryside.m4a cup.wav fluorecent_light.mp3 fridge.m4a keys.mp3
  kitchen_sounds.mp3 oil_lamp.mp3 old_car.wav old_tram.wav papers.wav plate.wav
  rain_window.wav tea.wav tea2.wav waredrobe.aiff water_sink.wav window_close.wav writing.wav
)
outputs=(
  chair.mp3 countryside.mp3 cup.mp3 fluorescent_light.mp3 fridge.mp3 keys.mp3
  kitchen_sounds.mp3 oil_lamp.mp3 old_car.mp3 old_tram.mp3 papers.mp3 plate.mp3
  rain_window.mp3 tea.mp3 tea2.mp3 wardrobe.mp3 water_sink.mp3 window_close.mp3 writing.mp3
)

for index in "${!inputs[@]}"; do
  input="$audio_root/${inputs[$index]}"
  output="$output_root/${outputs[$index]}"
  normalized="$output_root/normalized-$index.wav"
  stats="$output_root/stats-$index.txt"
  duration="$("$ffprobe_bin" -v error -show_entries format=duration -of default=nw=1:nk=1 "$input")"
  limited="$(awk -v d="$duration" 'BEGIN { if (d < 8) print d; else print 8 }')"
  fade_duration="$(awk -v d="$limited" 'BEGIN { if (d < 1) print 0.16; else print 0.45 }')"
  fade_start="$(awk -v d="$limited" -v fade="$fade_duration" 'BEGIN { start=d-fade; if (start > 0) print start; else print 0 }')"
  "$ffmpeg_bin" -v error -y -i "$input" -t "$limited" -ac 1 -ar 44100 \
    -af "loudnorm=I=-24:LRA=7:TP=-3,afade=t=out:st=$fade_start:d=$fade_duration" \
    -codec:a pcm_s16le -map_metadata -1 -map_chapters -1 "$normalized"
  "$ffmpeg_bin" -hide_banner -i "$normalized" -af "loudnorm=I=-18:LRA=7:TP=-2:print_format=summary" \
    -f null /dev/null 2> "$stats"
  integrated="$(awk '/Input Integrated:/ { print $3 }' "$stats")"
  gain="$(awk -v current="$integrated" 'BEGIN { print -26-current }')"
  "$ffmpeg_bin" -v error -y -i "$normalized" -af "volume=${gain}dB,alimiter=limit=0.75:level=false" \
    -codec:a libmp3lame -b:a 64k -map_metadata -1 -map_chapters -1 "$output"
  test "$("$ffprobe_bin" -v error -select_streams a:0 -show_entries stream=channels -of default=nw=1:nk=1 "$output")" = "1"
done

for output in "${outputs[@]}"; do
  mv "$output_root/$output" "$audio_root/$output"
done
