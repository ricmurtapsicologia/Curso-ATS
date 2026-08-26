from __future__ import annotations

import asyncio
import json
import re
from pathlib import Path

import edge_tts
from pydub import AudioSegment, effects

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "audio" / "manifest.json"
OUT = ROOT / "audio" / "n2"
TMP = ROOT / ".tmp_audio_n2"
SPEC = ROOT / "audio" / "audio-spec.json"

VOICE = "pt-BR-AntonioNeural"
RATE = "-4%"
PITCH = "-1Hz"
OPENING_SILENCE_MS = 130
ENDING_SILENCE_MS = 240
TARGET_DBFS = -18.0
MAX_PEAK_DBFS = -1.2
MAX_CHARS = 560
MAX_CONCURRENT = 5
TIMEOUT_SECONDS = 45


def chunks(text: str) -> list[str]:
    sentences = re.findall(r"[^.!?…]+[.!?…]+|[^.!?…]+$", text.strip())
    out, buf = [], ""
    for raw in sentences:
        sentence = re.sub(r"\s+", " ", raw).strip()
        if not sentence:
            continue
        candidate = f"{buf} {sentence}".strip()
        if len(candidate) <= MAX_CHARS:
            buf = candidate
            continue
        if buf:
            out.append(buf)
        if len(sentence) <= MAX_CHARS:
            buf = sentence
        else:
            words = sentence.split()
            buf = ""
            for word in words:
                candidate = f"{buf} {word}".strip()
                if len(candidate) <= MAX_CHARS:
                    buf = candidate
                else:
                    if buf:
                        out.append(buf)
                    buf = word
    if buf:
        out.append(buf)
    return out


def pause_for(text: str) -> int:
    text = text.rstrip()
    if text.endswith("?"):
        return 560
    if text.endswith("!"):
        return 500
    return 520


async def synth(text: str, target: Path, sem: asyncio.Semaphore) -> None:
    async with sem:
        for attempt in range(1, 4):
            try:
                communicate = edge_tts.Communicate(
                    text=text,
                    voice=VOICE,
                    rate=RATE,
                    pitch=PITCH,
                    volume="+0%",
                )
                await asyncio.wait_for(communicate.save(str(target)), timeout=TIMEOUT_SECONDS)
                return
            except Exception:
                if attempt == 3:
                    raise
                await asyncio.sleep(0.8 * attempt)


async def build_track(track: dict, sem: asyncio.Semaphore) -> dict:
    pieces = chunks(track["script"])
    work = TMP / track["id"]
    work.mkdir(parents=True, exist_ok=True)

    targets = [work / f"{i:03d}.mp3" for i in range(len(pieces))]
    await asyncio.gather(*(synth(text, target, sem) for text, target in zip(pieces, targets)))

    merged = AudioSegment.silent(duration=OPENING_SILENCE_MS)
    for i, (text, target) in enumerate(zip(pieces, targets)):
        merged += AudioSegment.from_file(target, format="mp3")
        if i < len(pieces) - 1:
            merged += AudioSegment.silent(duration=pause_for(text))
    merged += AudioSegment.silent(duration=ENDING_SILENCE_MS)

    merged = effects.compress_dynamic_range(
        merged,
        threshold=-20.0,
        ratio=2.0,
        attack=8.0,
        release=70.0,
    )
    if merged.dBFS != float("-inf"):
        merged = merged.apply_gain(TARGET_DBFS - merged.dBFS)
    if merged.max_dBFS > MAX_PEAK_DBFS:
        merged = merged.apply_gain(MAX_PEAK_DBFS - merged.max_dBFS)

    target = ROOT / track["file"]
    target.parent.mkdir(parents=True, exist_ok=True)
    merged.export(
        target,
        format="mp3",
        bitrate="128k",
        parameters=["-ac", "1", "-ar", "44100"],
    )

    seconds = len(merged) / 1000.0
    if not 40 <= seconds <= 150:
        raise RuntimeError(f"{track['id']}: duração fora do intervalo de microaula: {seconds:.1f}s")

    print(f"{track['id']}: {seconds:.1f}s | {target.relative_to(ROOT)}")
    return {
        "id": track["id"],
        "lesson": track["lesson"],
        "title": track["title"],
        "file": track["file"],
        "seconds": round(seconds, 1),
    }


async def main() -> None:
    data = json.loads(MANIFEST.read_text(encoding="utf-8"))
    tracks = data["tracks"]
    if len(tracks) != 24:
        raise RuntimeError(f"Esperados 24 microáudios; encontrados {len(tracks)}")

    TMP.mkdir(parents=True, exist_ok=True)
    OUT.mkdir(parents=True, exist_ok=True)
    sem = asyncio.Semaphore(MAX_CONCURRENT)

    results = []
    for lesson in range(1, 5):
        lesson_tracks = [t for t in tracks if int(t["lesson"]) == lesson]
        if len(lesson_tracks) != 6:
            raise RuntimeError(f"Encontro {lesson}: esperados 6 áudios; encontrados {len(lesson_tracks)}")
        for track in lesson_tracks:
            results.append(await build_track(track, sem))

    spec = {
        "profile": "Ampulheta N2",
        "voice": VOICE,
        "rate": RATE,
        "pitch": PITCH,
        "opening_silence_ms": OPENING_SILENCE_MS,
        "ending_silence_ms": ENDING_SILENCE_MS,
        "target_dbfs": TARGET_DBFS,
        "max_peak_dbfs": MAX_PEAK_DBFS,
        "compression": {
            "threshold_db": -20.0,
            "ratio": 2.0,
            "attack_ms": 8.0,
            "release_ms": 70.0,
        },
        "format": {"codec": "mp3", "bitrate": "128k", "channels": 1, "sample_rate_hz": 44100},
        "track_count": len(results),
        "tracks": results,
    }
    SPEC.write_text(json.dumps(spec, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    asyncio.run(main())
